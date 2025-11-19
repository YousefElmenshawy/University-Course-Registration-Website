'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/databaseClient'

interface Course {
  id: number
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
  CourseID: string
  CRN: number
}

export default function Schedule() {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Time slots and Days
  const timeSlots = ["8:30 AM", "10:00 AM", "11:30 AM", "2:00 PM", "3:30 PM", "5:00 PM"]

  // AUC Day mapping
  const dayMapping: { [key: string]: string[] } = {
    'U': ['Sunday'],
    'M': ['Monday'],
    'T': ['Tuesday'],
    'W': ['Wednesday'],
    'R': ['Thursday'],
    'UW': ['Sunday', 'Wednesday'],
    'MR': ['Monday', 'Thursday'],
    'MW': ['Monday', 'Wednesday'],
    'TR': ['Tuesday', 'Thursday'],
    'WF': ['Wednesday', 'Friday'],
  }

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user?.id) {
          setError('Please sign in to view your schedule.')
          return
        }

        // Fetch student profile to get enrolled course IDs
        const { data: profile, error: profErr } = await supabase
          .from('User')
          .select('enrolled_courses')
          .eq('id', user.id)
          .single()

        if (profErr) throw profErr

        const enrolledIds = (profile?.enrolled_courses as string[]) || []

        if (enrolledIds.length === 0) {
          setEnrolledCourses([])
          return
        }

        // Fetch course details
        const { data: coursesData, error: coursesErr } = await supabase
          .from('Courses')
          .select('*')
          .in('id', enrolledIds)

        if (coursesErr) throw coursesErr

        setEnrolledCourses(coursesData || [])
      } catch (e: unknown) {
        console.error(e)
        if (e instanceof Error) {
          setError(e.message)
        } else {
          setError('Failed to load schedule.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchEnrolledCourses()
  }, [])

  // Get courses for a specific day and time
  const getCoursesForDayAndTime = (day: string, time: string): Course[] => {
    return enrolledCourses.filter(course => {
      const courseDays = dayMapping[course.TimeOfWeek] || []
      return courseDays.includes(day) && course.Time === time
    })
  }

  // Get total credits
  const totalCredits = enrolledCourses.length * 3 // Assuming ALL courses have 3 credits (No labs)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-600">Loading your schedule...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Schedule</h1>
          <p className="text-gray-600">
            Fall 2025 • {enrolledCourses.length} {enrolledCourses.length === 1 ? 'Course' : 'Courses'} • {totalCredits} Credits
          </p>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Enrolled</h3>
            <p className="text-gray-600 mb-4">You haven&apos;t enrolled in any courses yet.</p>
            <a
              href="/protected/CourseCatalog"
              className="inline-block bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition-colors font-semibold"
            >
              Browse Course Catalog
            </a>
          </div>
        ) : (
          <>
            {/* Weekly Calendar View */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="border border-gray-600 px-4 py-3 text-left font-semibold w-32">Time</th>
                      {daysOfWeek.map(day => (
                        <th key={day} className="border border-gray-600 px-4 py-3 text-center font-semibold">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map(time => (
                      <tr key={time} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3 font-medium text-gray-700 bg-gray-50">
                          {time}
                        </td>
                        {daysOfWeek.map(day => {
                          const coursesAtThisTime = getCoursesForDayAndTime(day, time)
                          return (
                            <td key={`${day}-${time}`} className="border border-gray-200 px-2 py-2 align-top">
                              {coursesAtThisTime.length > 0 ? (
                                <div className="space-y-2">
                                  {coursesAtThisTime.map(course => (
                                    <div
                                      key={course.id}
                                      className="bg-blue-50 border-l-4 border-blue-700 p-3 rounded hover:bg-blue-100 transition-colors"
                                    >
                                      <div className="font-bold text-blue-900 text-sm mb-1">
                                        {course.CourseID}
                                      </div>
                                      <div className="text-xs text-gray-700 mb-1">{course.Name}</div>
                                      <div className="text-xs text-gray-600">
                                        <div>👤 {course.Instructor}</div>
                                        <div>📍 {course.Room}</div>
                                        <div>🔢 CRN: {course.CRN}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-gray-300 text-center text-xs py-4">-</div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}