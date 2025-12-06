'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/databaseClient'

interface Course {
  id: number  //this is database id not course id 
  Instructor: string
  TimeOfWeek: string
  Name: string
  Code: string
  Time: string
  Room: string
  CapacityMax: number
  CapacityCurrent: number
  WaitlistMax: number
  WaitlistCurrent: number
  CourseID: string   //this is like CSCE3304
  CRN: number
}

export default function CourseCatalog() {
  // State to hold fetched courses
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)


  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTimeOfWeek, setSelectedTimeOfWeek] = useState('')
    const [selectedTime, setSelectedTime] = useState('')

  const [selectedMajor, setSelectedMajor] = useState('')
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)


  const diffTimesOfWeek = ["UW", "MR", "T"]

  const diffTimes= ["8:30 AM", "10:00 AM", "11:30 AM", "2:00 PM", "3:30 PM", "5:00 PM"]

  const diffMajors = [...new Set(courses.map(course => course.CourseID.substring(0, 4)))].sort()



  const filteredCourses = courses.filter(course => {
    // Search filter - check if search term matches course name, code, or Instructor
    const matchesSearch = searchTerm === '' || 
      course.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.CourseID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.Instructor.toLowerCase().includes(searchTerm.toLowerCase()) 

    // Major filter
const matchesMajor = selectedMajor === '' || course.CourseID.substring(0, 4) === selectedMajor     //Extracting MACT from MACT2313


    // Time filter
    const matchesTimeOfWeek = selectedTimeOfWeek === '' || course.TimeOfWeek === selectedTimeOfWeek

    const matchesTime= selectedTime=== '' || course.Time === selectedTime




    // Availability filter
    const matchesAvailability = !showOnlyAvailable || course.CapacityCurrent < course.CapacityMax

    return matchesSearch && matchesMajor && matchesTimeOfWeek && matchesTime && matchesAvailability
  })

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedTimeOfWeek('')
    setSelectedTime('')
    setSelectedMajor('')
    setShowOnlyAvailable(false)
  }

    const fetchCourses = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('Courses') 
        .select('*')
      
      if (error) {
        throw error
      }
      
      setCourses(data || [])
      
    } catch (err) { 
      console.error('Error fetching courses:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to load courses')
      }
    } finally {
      setLoading(false)
    }
  }

  // Now use it in useEffect
  useEffect(() => {
    fetchCourses()
  }, [])
// Checking Conflicts
  const checkTimeConflict = (newCourse: Course, enrolledCourses: Course[]): Course | null => {
    const newDays = parseDays(newCourse.TimeOfWeek);
    const newTime = newCourse.Time;

    for (const enrolled of enrolledCourses) {
      const enrolledDays = parseDays(enrolled.TimeOfWeek);

      // Check if any days overlap
      const hasOverlappingDays = newDays.some(day => enrolledDays.includes(day));

      // Check if times are the same
      if (hasOverlappingDays && enrolled.Time === newTime) {
        return enrolled;
      }
    }

    return null; // No conflict
  };

// AUC days encoder decoder
  const parseDays = (timeOfWeek: string): string[] => {
    const dayMap: { [key: string]: string } = {
      'U': 'Sunday',
      'M': 'Monday',
      'T': 'Tuesday',
      'W': 'Wednesday',
      'R': 'Thursday',
      'F': 'Friday',
      'S': 'Saturday'
    };

    const days: string[] = [];
    for (let i = 0; i < timeOfWeek.length; i++) {
      const day = dayMap[timeOfWeek[i]];
      if (day) days.push(day);
    }
    return days;
  };

  // Handle course registration
 const handleRegister = async (courseId: number, courseName: string) => {
    console.log(`Registering for course: ${courseName} (ID: ${courseId})`);

    const course = courses.find(c => c.id === courseId);
    const { data: { user } } = await supabase.auth.getUser();
    const studentId = user?.id;

    if (course && course.CapacityCurrent < course.CapacityMax && course.WaitlistCurrent<=0) {
       // First, get the current enrolled_courses array
        const { data: studentData, error: fetchError } = await supabase
          .from('User')
          .select('enrolled_courses')
          .eq('id', studentId)
          .single();

        if (fetchError) throw fetchError;

         // stop execution if already enrolled
        
        if (studentData.enrolled_courses?.includes(String(courseId))) {
        setErrorMessage(`You are already enrolled in : ${courseName}`);
        setSuccessMessage(null);
        return; // Stop execution if already enrolled
      }
      try {
        // Fetch the latest course capacity to avoid race conditions
        const { data: latestCourse, error: fetchError } = await supabase
          .from('Courses')
          .select('CapacityCurrent, CapacityMax')
          .eq('id', courseId)
          .single();

        if (fetchError) throw fetchError;

        // Check if course is still available after fetching latest data
        if (latestCourse.CapacityCurrent >= latestCourse.CapacityMax) {
          setErrorMessage('Course is now full. Please try again or join the waitlist.');
          setSuccessMessage(null);
          return;
        }
        // cheking Time Conflict

        if(studentData.enrolled_courses && studentData.enrolled_courses.length > 0){
          // Fetching  details of currently enrolled courses from database
          const { data: enrolledCoursesData, error: enrolledCoursesError } = await supabase
            .from('Courses')
            .select('*')
            .in('id', studentData.enrolled_courses);
            if (enrolledCoursesError) throw enrolledCoursesError;

          const conflictCourse = checkTimeConflict(course, enrolledCoursesData || []);
          if (conflictCourse) {
            setErrorMessage(`Time conflict detected with your enrolled course: ${conflictCourse.Name} (${conflictCourse.TimeOfWeek} | ${conflictCourse.Time})`);
            setSuccessMessage(null);
            return;
          }
        }

        // Update course capacity with latest current capacity
        const { error: courseError } = await supabase
          .from('Courses')
          .update({
            CapacityCurrent: latestCourse.CapacityCurrent + 1,
          })
          .eq('id', courseId);

        if (courseError) throw courseError;

       


        // Add the new courseId to the array
        const updatedCourses = [...(studentData.enrolled_courses || []), courseId];

        // Update the student's enrolled_courses
        const { error: studentError } = await supabase
          .from('User')
          .update({
            enrolled_courses: updatedCourses
          })
          .eq('id', studentId);

        if (studentError) throw studentError;

        setSuccessMessage(`Successfully registered : ${courseName}`);
        setErrorMessage(null);

        // Re-fetch courses to update UI
        fetchCourses();

      } catch (err) {
        console.error('Error registering for course:', err);
        setErrorMessage('Failed to register for the course. Please try again.');
        setSuccessMessage(null);
      }
    } 
    else {
      setErrorMessage('No available spots for this course');
      setSuccessMessage(null);
    }
  };



  // Waitlist handler
const handleWaitlist = async (courseId: number, courseName: string) => {
  console.log(`Adding to waitlist for course: ${courseName} (ID: ${courseId})`);
  
  

  const course = courses.find(c => c.id === courseId);
  const { data: { user } } = await supabase.auth.getUser();
  const studentId = user?.id;

  if (!studentId) {
    console.error("Student not logged in");
    setErrorMessage("You must be logged in to join the waitlist.");
    return;
  }

  if (course && course.WaitlistCurrent < course.WaitlistMax) {
    //Fetch student's current waitlisted courses and enrolled courses
      const { data: studentData, error: fetchError } = await supabase
        .from('User')
        .select('waitlisted_courses, enrolled_courses')
        .eq('id', studentId)
        .single();

      if (fetchError) throw fetchError;

      console.log("Current waitlisted_courses: ", studentData.waitlisted_courses);

      // Check if the student is already on the waitlist
      if (studentData.waitlisted_courses?.includes(String(courseId))) {
        setErrorMessage(`You are already on the waitlist for: ${courseName}`);
        setSuccessMessage(null);
        return; // Stop execution if already on the waitlist
      }
      //checking Time Conflicts

    if (studentData.enrolled_courses && studentData.enrolled_courses.length > 0) {
      // Fetch details of currently enrolled courses from database
      const { data: enrolledCoursesData, error: enrolledCoursesError } = await supabase
          .from('Courses')
          .select('*')
          .in('id', studentData.enrolled_courses);

      if (enrolledCoursesError) throw enrolledCoursesError;

      const conflictCourse = checkTimeConflict(course, enrolledCoursesData || []);
      if (conflictCourse) {
        setErrorMessage(
            `Time conflict detected with your enrolled course: ${conflictCourse.Name} (${conflictCourse.TimeOfWeek} | ${conflictCourse.Time})`
        );
        setSuccessMessage(null);
        return;
      }
    }


    try {
      // Update course waitlist count
      const { error: courseError } = await supabase
        .from('Courses')
        .update({
          WaitlistCurrent: course.WaitlistCurrent + 1, // Increment waitlist
        })
        .eq('id', courseId);

      if (courseError) throw courseError;

      

      // Add the new courseId to the waitlisted_courses array
      const updatedWaitlist = [...(studentData.waitlisted_courses || []), String(courseId)];

      console.log("Updated waitlisted_courses: ", updatedWaitlist);

      // Step 5: Update the student's waitlisted_courses in the database
      const { error: studentError } = await supabase
        .from('User')
        .update({
          waitlisted_courses: updatedWaitlist, 
        })
        .eq('id', studentId);

      if (studentError) throw studentError;

      setSuccessMessage(`Successfully added to the waitlist for: ${courseName}`);
      setErrorMessage(null);

      // Re-fetch courses to update UI
      fetchCourses(); 

    } catch (err) {
      console.error('Error adding to waitlist for course:', err);
      setErrorMessage('Failed to add to waitlist. Please try again.');
      setSuccessMessage(null);
    }
  } else {
    setErrorMessage('No available waitlist spots for this course');
    setSuccessMessage(null);
  }
};


   

  

  // Check if course is full
  const isFull = (current: number, max: number) => current >= max

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading courses...</div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }



   return(
    <div className="min-h-screen bg-gray-100">
    <div className="max-w-7xl mx-auto px-6 py-8">
      
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between items-center">
            <span className="mr-4">{successMessage}</span> {/* Added margin-right to create space */}
            <button 
              onClick={() => setSuccessMessage(null)}
              className="text-green-700 hover:text-green-900 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between items-center">
            <span className="mr-4">{errorMessage}</span> {/* Added margin-right to create space */}
            <button 
              onClick={() => setErrorMessage(null)}
              className="text-red-700 hover:text-red-900 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

        {/* Header */}
        <div className="bg-white border border-gray-300 rounded mb-6 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Catalog</h1>
          <p className="text-sm text-gray-600">
            Browse available courses for the current semester. Select a course to view details or register.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white border border-gray-300 rounded mb-6 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter Courses</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Courses
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, code, or instructor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <svg 
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </div>
            </div>

            {/* Major Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">All Subjects</option>
                {diffMajors.map(major => (
                  <option key={major} value={major}>
                    {major}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days
              </label>
              <select
                value={selectedTimeOfWeek}
                onChange={(e) => setSelectedTimeOfWeek(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">All Days</option>
                {diffTimesOfWeek.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Slot Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">All Times</option>
                {diffTimes.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <label className="flex items-center mt-3">
                <input
                  type="checkbox"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Show only available courses</span>
              </label>
            </div>
          </div>

          {/* Results Summary and Clear Filters */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredCourses.length} of {courses.length} courses
            </p>
            
            {(searchTerm || selectedMajor || selectedTimeOfWeek || selectedTime || showOnlyAvailable) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded border border-gray-400 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-gray-300 rounded overflow-hidden hover:border-gray-400 transition-colors flex flex-col h-full"
            >
              {/* Course Header */}
              <div className="border-b border-gray-300 bg-gray-50 px-6 py-4 h-20">
                <div className="flex justify-between items-start h-full">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{course.Name}</h3>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {course.CourseID} | CRN: {course.CRN} 
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <span className={`px-3 py-1 text-xs font-bold uppercase ${
                      isFull(course.CapacityCurrent, course.CapacityMax)
                        ? 'bg-red-600 text-white'
                        : 'bg-green-600 text-white'
                    }`}>
                      {isFull(course.CapacityCurrent, course.CapacityMax) ? 'FULL' : 'OPEN'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Course Details */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex-1 space-y-4">
                  {/* Course Information */}
                  <div className="min-h-[120px]">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 pr-4 text-gray-600 font-semibold w-20">Schedule:</td>
                          <td className="py-2 text-gray-900">{course.TimeOfWeek} | {course.Time}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 pr-4 text-gray-600 font-semibold">Location:</td>
                          <td className="py-2 text-gray-900">{course.Room}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 pr-4 text-gray-600 font-semibold">Instructor:</td>
                          <td className="py-2 text-gray-900">{course.Instructor}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Enrollment Status */}
                  <div className="space-y-4 flex-1">
                    {/* Capacity */}
                    <div className="h-16">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 font-semibold">Enrollment:</span>
                        <span className="font-bold text-gray-900">
                          {course.CapacityCurrent} / {course.CapacityMax}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 border border-gray-300 rounded">
                        <div
                          className={`h-full rounded ${
                            isFull(course.CapacityCurrent, course.CapacityMax)
                              ? 'bg-red-600'
                              : 'bg-blue-600'
                          }`}
                          style={{
                            width: `${(course.CapacityCurrent / course.CapacityMax) * 100}%`
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {course.CapacityMax - course.CapacityCurrent} seats available
                      </p>
                    </div>

                    {/* Waitlist */}
                    <div className="h-16">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 font-semibold">Waitlist:</span>
                        <span className="font-bold text-gray-900">
                          {course.WaitlistCurrent} / {course.WaitlistMax}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 border border-gray-300 rounded">
                        <div
                          className="h-full bg-orange-500 rounded"
                          style={{
                            width: `${(course.WaitlistCurrent / course.WaitlistMax) * 100}%`
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {course.WaitlistMax - course.WaitlistCurrent} waitlist spots remaining
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 space-y-2 mt-auto">
                  {!isFull(course.CapacityCurrent, course.CapacityMax) ? (
                    <button
                      onClick={() => handleRegister(course.id, course.Name)}
                      className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 border border-blue-900 transition-colors text-sm rounded"
                    >
                      REGISTER FOR COURSE
                    </button>
                  ) : (
                    <button
                      onClick={() => handleWaitlist(course.id, course.Name)}
                      disabled={isFull(course.WaitlistCurrent, course.WaitlistMax)}
                      className={`w-full font-semibold py-2 px-4 border transition-colors text-sm rounded ${
                        isFull(course.WaitlistCurrent, course.WaitlistMax)
                          ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                          : 'bg-orange-600 hover:bg-orange-700 text-white border-orange-800'
                      }`}
                    >
                      {isFull(course.WaitlistCurrent, course.WaitlistMax)
                        ? 'WAITLIST FULL'
                        : 'JOIN WAITLIST'
                      }
                    </button>
                  )}

                  <button className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 border border-gray-400 transition-colors text-sm rounded">
                    VIEW COURSE DETAILS
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredCourses.length === 0 && !loading && !error && (
          <div className="bg-white border border-gray-300 rounded p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No courses found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Original No Courses Message */}
        {courses.length === 0 && !loading && !error && (
          <div className="bg-white border border-gray-300 rounded p-12 text-center">
            <p className="text-gray-500 text-lg">No courses available at this time.</p>
          </div>
        )}
      </div>
    </div>
  )
}