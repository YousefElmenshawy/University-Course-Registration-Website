'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/databaseClient'

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

interface ScheduleProps {
  compact?: boolean // Compact view for home page
  limit?: number // Limit courses shown
  showTodayOnly?: boolean // Show only today's schedule
  showHeader?: boolean // Show/hide header
}

export default function Schedule({ 
  compact = false, 
  limit, 
  showTodayOnly = false,
  showHeader = true 
}: ScheduleProps) {
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

  // Get today's day name
  const today = daysOfWeek[new Date().getDay()]

  // Filter days based on props
  const displayDays = showTodayOnly ? [today] : daysOfWeek

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

        // Apply limit if specified
        const limitedCourses = limit ? (coursesData || []).slice(0, limit) : coursesData
        setEnrolledCourses(limitedCourses || [])
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
  }, [limit])

  // Get courses for a specific day and time
  const getCoursesForDayAndTime = (day: string, time: string): Course[] => {
    return enrolledCourses.filter(course => {
      const courseDays = dayMapping[course.TimeOfWeek] || []
      return courseDays.includes(day) && course.Time === time
    })
  }

  // Get total credits
  const totalCredits = enrolledCourses.length * 3

  if (loading) {
    return (
      <div className={compact ? "text-center text-gray-500 py-4" : "min-h-screen bg-gray-50 p-8"}>
        <div className={compact ? "" : "max-w-7xl mx-auto"}>
          <div className="text-center text-gray-600">Loading your schedule...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={compact ? "text-center text-red-600 py-4" : "min-h-screen bg-gray-50 p-8"}>
        <div className={compact ? "" : "max-w-7xl mx-auto"}>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={compact ? "" : "min-h-screen bg-gray-50 p-8"}>
      <div className={compact ? "" : "max-w-7xl mx-auto"}>
        {/* Header */}
        {showHeader && (
          <div className="mb-8">
            <h1 className={`font-bold text-gray-900 mb-2 ${compact ? 'text-xl' : 'text-3xl'}`}>
              {showTodayOnly ? "Today's Schedule" : "My Schedule"}
            </h1>
            <p className="text-gray-600">
              Fall 2025 • {enrolledCourses.length} {enrolledCourses.length === 1 ? 'Course' : 'Courses'} • {totalCredits} Credits
            </p>
          </div>
        )}

        {enrolledCourses.length === 0 ? (
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 text-center ${compact ? 'p-6' : 'p-12'}`}>
            {!compact && (
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <h3 className={`font-semibold text-gray-900 mb-2 ${compact ? 'text-sm' : 'text-lg'}`}>
              No Courses Enrolled
            </h3>
            <p className={`text-gray-600 ${compact ? 'text-xs mb-2' : 'mb-4'}`}>
              You haven&apos;t enrolled in any courses yet.
            </p>
            {!compact && (
              <a
                href="/protected/CourseCatalog"
                className="inline-block bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition-colors font-semibold"
              >
                Browse Course Catalog
              </a>
            )}
          </div>
        ) : (
          <>
            {/* Weekly Calendar View */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className={compact ? "bg-gray-700 text-white" : "bg-gray-800 text-white"}>
                      <th className={`border border-gray-600 px-2 py-2 text-left font-semibold ${compact ? 'w-20 text-xs' : 'w-32'}`}>
                        Time
                      </th>
                      {displayDays.map(day => (
                        <th key={day} className={`border border-gray-600 px-2 py-2 text-center font-semibold ${compact ? 'text-xs' : ''}`}>
                          {compact ? day.substring(0, 3) : day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map(time => (
                      <tr key={time} className="hover:bg-gray-50">
                        <td className={`border border-gray-200 px-2 py-2 font-medium text-gray-700 bg-gray-50 ${compact ? 'text-xs' : ''}`}>
                          {compact ? time.replace(' ', '\n') : time}
                        </td>
                        {displayDays.map(day => {
                          const coursesAtThisTime = getCoursesForDayAndTime(day, time)
                          return (
                            <td key={`${day}-${time}`} className="border border-gray-200 px-2 py-2 align-top">
                              {coursesAtThisTime.length > 0 ? (
                                <div className="space-y-2">
                                  {coursesAtThisTime.map(course => (
                                    <div
                                      key={course.id}
                                      className={`bg-blue-50 border-l-4 border-blue-700 rounded hover:bg-blue-100 transition-colors ${compact ? 'p-2' : 'p-3'}`}
                                    >
                                      <div className={`font-bold text-blue-900 mb-1 ${compact ? 'text-xs' : 'text-sm'}`}>
                                        {course.CourseID}
                                      </div>
                                      {!compact && (
                                        <>
                                          <div className="text-xs text-gray-700 mb-1">{course.Name}</div>
                                          <div className="text-xs text-gray-600">
                                            <div>👤 {course.Instructor}</div>
                                            <div>📍 {course.Room}</div>
                                            <div>🔢 CRN: {course.CRN}</div>
                                          </div>
                                        </>
                                      )}
                                      {compact && (
                                        <div className="text-xs text-gray-600">
                                          📍 {course.Room}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className={`text-gray-300 text-center ${compact ? 'text-xs py-2' : 'text-xs py-4'}`}>-</div>
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