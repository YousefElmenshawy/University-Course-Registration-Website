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

  // Fetch courses from Supabase
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        
        // Fetch all courses from your Supabase table
        const { data, error } = await supabase
          .from('Courses') 
          .select('*') // Select all columns
        
        if (error) {
          throw error
        }
        
        // Set the fetched data to state
        setCourses(data || [])
        
      } catch (err) { 
        console.error('Error fetching courses:', err)
        // Handle different error types
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Failed to load courses')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // COURSE REG TO BE IMPLEMENTED
  const handleRegister = (courseId: number, courseName: string) => {
    console.log(`Registering for course: ${courseName} (ID: ${courseId})`)
    // Add your registration logic here
  }

  // WAITLIST TO BE IMPLEMENTED
  const handleWaitlist = (courseId: number, courseName: string) => {
    console.log(`Adding to waitlist for course: ${courseName} (ID: ${courseId})`)
    // Add your waitlist logic here
  }

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



  
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Catalog</h1>
        <p className="text-gray-600">Browse and register for available courses</p>
      </div>

      {/* Course Grid */}
      <div className="space-y-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Course Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">{course.Name}</h3>
                  <p className="text-blue-100 font-medium">{course.CourseID} • CRN: {course.CRN}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isFull(course.CapacityCurrent, course.CapacityMax) 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {isFull(course.CapacityCurrent, course.CapacityMax) ? 'FULL' : 'AVAILABLE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Course Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {course.Instructor}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {course.Room}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Column - Schedule */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Schedule</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {course.Time}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {course.TimeOfWeek}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Capacity & Actions */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Enrollment</h4>
                    
                    {/* Capacity Bar */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Capacity</span>
                          <span className="font-medium">{course.CapacityCurrent}/{course.CapacityMax}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              isFull(course.CapacityCurrent, course.CapacityMax) 
                                ? 'bg-red-500' 
                                : 'bg-blue-500'
                            }`}
                            style={{ 
                              width: `${(course.CapacityCurrent / course.CapacityMax) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Waitlist</span>
                          <span className="font-medium">{course.WaitlistCurrent}/{course.WaitlistMax}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-orange-400"
                            style={{ 
                              width: `${(course.WaitlistCurrent / course.WaitlistMax) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    {!isFull(course.CapacityCurrent, course.CapacityMax) ? (
                      <button
                        onClick={() => handleRegister(course.id, course.Name)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Register</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleWaitlist(course.id, course.Name)}
                        disabled={isFull(course.WaitlistCurrent, course.WaitlistMax)}
                        className={`w-full font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${
                          isFull(course.WaitlistCurrent, course.WaitlistMax)
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {isFull(course.WaitlistCurrent, course.WaitlistMax) 
                            ? 'Waitlist Full' 
                            : 'Join Waitlist'
                          }
                        </span>
                      </button>
                    )}
                    
                    <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">No courses found</div>
        </div>
      )}
    </div>
  )
}