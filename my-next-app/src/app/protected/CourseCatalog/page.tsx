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
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="bg-white border border-gray-300 rounded mb-6 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Catalog</h1>
            <p className="text-sm text-gray-600">
              Browse available courses for the current semester. Select a course to view details or register.
            </p>
          </div>

          {/* Course List */}
          <div className="space-y-4">
            {courses.map((course) => (
                <div
                    key={course.id}
                    className="bg-white border border-gray-300 rounded overflow-hidden hover:border-gray-400 transition-colors"
                >
                  {/* Course Header */}
                  <div className="border-b border-gray-300 bg-gray-50 px-6 py-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{course.Name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {course.CourseID} | CRN: {course.CRN} | Instructor: {course.Instructor}
                        </p>
                      </div>
                      <div>
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
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                      {/* Left Section - Course Information */}
                      <div className="md:col-span-7">
                        <table className="w-full text-sm">
                          <tbody>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 pr-4 text-gray-600 font-semibold w-32">Schedule:</td>
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

                      {/* Right Section - Enrollment Status */}
                      <div className="md:col-span-5 border-l border-gray-200 md:pl-6">
                        <div className="space-y-4">
                          {/* Capacity */}
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600 font-semibold">Enrollment Capacity:</span>
                              <span className="font-bold text-gray-900">
                            {course.CapacityCurrent} / {course.CapacityMax}
                          </span>
                            </div>
                            <div className="w-full bg-gray-200 h-3 border border-gray-300">
                              <div
                                  className={`h-full ${
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
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600 font-semibold">Waitlist:</span>
                              <span className="font-bold text-gray-900">
                            {course.WaitlistCurrent} / {course.WaitlistMax}
                          </span>
                            </div>
                            <div className="w-full bg-gray-200 h-3 border border-gray-300">
                              <div
                                  className="h-full bg-orange-500"
                                  style={{
                                    width: `${(course.WaitlistCurrent / course.WaitlistMax) * 100}%`
                                  }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {course.WaitlistMax - course.WaitlistCurrent} waitlist spots remaining
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-4 space-y-2">
                            {!isFull(course.CapacityCurrent, course.CapacityMax) ? (
                                <button
                                    onClick={() => handleRegister(course.id, course.Name)}
                                    className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 border border-blue-900 transition-colors text-sm"
                                >
                                  REGISTER FOR COURSE
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleWaitlist(course.id, course.Name)}
                                    disabled={isFull(course.WaitlistCurrent, course.WaitlistMax)}
                                    className={`w-full font-semibold py-2 px-4 border transition-colors text-sm ${
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

                            <button className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 border border-gray-400 transition-colors text-sm">
                              VIEW COURSE DETAILS
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            ))}
          </div>

          {courses.length === 0 && !loading && !error && (
              <div className="bg-white border border-gray-300 rounded p-12 text-center">
                <p className="text-gray-500 text-lg">No courses available at this time.</p>
              </div>
          )}
        </div>
      </div>
  )
}