'use client'
import { useEffect, useMemo, useState } from 'react'
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

export default function RegisterPage() {
  // data
  const [courses, setCourses] = useState<Course[]>([])
  const [enrolledIds, setEnrolledIds] = useState<string[]>([])
  const [waitlistedIds, setWaitlistedIds] = useState<string[]>([])

  // ui
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchAll = async () => {
    try {
      setLoading(true)

      const [{ data: { user } }, coursesRes] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('Courses').select('*')
      ])

      if (!user?.id) {
        setError('Please sign in to view your courses.')
        return
      }

      const { data: profile, error: profErr } = await supabase
        .from('User')
        .select('enrolled_courses, waitlisted_courses')
        .eq('id', user.id)
        .single()

      if (profErr) throw profErr
      if (coursesRes.error) throw coursesRes.error

      setCourses(coursesRes.data || [])
      setEnrolledIds((profile?.enrolled_courses as string[]) || [])
      setWaitlistedIds((profile?.waitlisted_courses as string[]) || [])
    } catch (e: unknown) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Failed to load data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // map ids -> rows
  const enrolledCourses = useMemo(
    () => courses.filter(c => enrolledIds.includes(String(c.id))),
    [courses, enrolledIds]
  )
  const waitlistedCourses = useMemo(
    () => courses.filter(c => waitlistedIds.includes(String(c.id))),
    [courses, waitlistedIds]
  )

  const isFull = (current: number, max: number) => current >= max

  // actions
  const dropCourse = async (courseId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) throw new Error('Not signed in')

      const nextEnrolled = enrolledIds.filter(id => id !== String(courseId))
      const { error: stuErr } = await supabase
        .from('User')
        .update({ enrolled_courses: nextEnrolled })
        .eq('id', user.id)
      if (stuErr) throw stuErr

      const course = courses.find(c => c.id === courseId)
      if (course) {
        const newCurr = Math.max(0, course.CapacityCurrent - 1)
        const { error: cErr } = await supabase
          .from('Courses')
          .update({ CapacityCurrent: newCurr })
          .eq('id', courseId)
        if (cErr) throw cErr
      }

      setEnrolledIds(nextEnrolled)
      setSuccessMessage('Course dropped.')
      setErrorMessage(null)
    } catch (e) {
      console.error(e)
      setErrorMessage('Could not drop course.')
      setSuccessMessage(null)
    }
  }

  const removeFromWaitlist = async (courseId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) throw new Error('Not signed in')

      const nextWait = waitlistedIds.filter(id => id !== String(courseId))
      const { error: stuErr } = await supabase
        .from('User')
        .update({ waitlisted_courses: nextWait })
        .eq('id', user.id)
      if (stuErr) throw stuErr

      const course = courses.find(c => c.id === courseId)
      if (course) {
        const newW = Math.max(0, course.WaitlistCurrent - 1)
        const { error: cErr } = await supabase
          .from('Courses')
          .update({ WaitlistCurrent: newW })
          .eq('id', courseId)
        if (cErr) throw cErr
      }

      setWaitlistedIds(nextWait)
      setSuccessMessage('Removed from waitlist.')
      setErrorMessage(null)
    } catch (e) {
      console.error(e)
      setErrorMessage('Could not remove from waitlist.')
      setSuccessMessage(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading…</div>
      </div>
    )
  }

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

        {/* Floating Messages (same style as your catalog) */}
        {successMessage && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <span className="mr-4">{successMessage}</span>
              <button onClick={() => setSuccessMessage(null)} className="font-bold">×</button>
            </div>
          </div>
        )}
        {errorMessage && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <span className="mr-4">{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="font-bold">×</button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white border border-gray-300 rounded mb-6 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Courses (Add / Drop)</h1>
          <p className="text-sm text-gray-600">Manage your enrolled and waitlisted courses.</p>
        </div>

        {/* Enrolled */}
        <div className="bg-white border border-gray-300 rounded mb-6 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Enrolled Courses</h2>

          {enrolledCourses.length === 0 ? (
            <div className="text-gray-600">You are not enrolled in any courses.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map(course => (
                <div key={course.id} className="bg-white border border-gray-300 rounded overflow-hidden flex flex-col">
                  <div className="border-b border-gray-300 bg-gray-50 px-6 py-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 truncate">{course.Name}</h3>
                        <p className="text-sm text-gray-600 mt-1 truncate">{course.CourseID} | CRN: {course.CRN}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold uppercase ${isFull(course.CapacityCurrent, course.CapacityMax) ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                        {isFull(course.CapacityCurrent, course.CapacityMax) ? 'FULL' : 'OPEN'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3 flex-1">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 pr-4 text-gray-600 font-semibold w-24">Schedule:</td>
                          <td className="py-2 text-gray-900">{course.TimeOfWeek} | {course.Time}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 pr-4 text-gray-600 font-semibold">Location:</td>
                          <td className="py-2 text-gray-900">{course.Room}</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 text-gray-600 font-semibold">Instructor:</td>
                          <td className="py-2 text-gray-900">{course.Instructor}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-semibold">Enrollment:</span>
                      <span className="font-bold text-gray-900">{course.CapacityCurrent} / {course.CapacityMax}</span>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      onClick={() => dropCourse(course.id)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 border border-red-800 transition-colors text-sm rounded"
                    >
                      DROP COURSE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Waitlisted */}
        <div className="bg-white border border-gray-300 rounded mb-6 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Waitlisted Courses</h2>

          {waitlistedCourses.length === 0 ? (
            <div className="text-gray-600">You are not on any waitlists.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {waitlistedCourses.map(course => (
                <div key={course.id} className="bg-white border border-gray-300 rounded overflow-hidden flex flex-col">
                  <div className="border-b border-gray-300 bg-gray-50 px-6 py-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 truncate">{course.Name}</h3>
                        <p className="text-sm text-gray-600 mt-1 truncate">{course.CourseID} | CRN: {course.CRN}</p>
                      </div>
                      <span className="px-3 py-1 text-xs font-bold uppercase bg-orange-600 text-white">WAITLIST</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3 flex-1">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 pr-4 text-gray-600 font-semibold w-24">Schedule:</td>
                          <td className="py-2 text-gray-900">{course.TimeOfWeek} | {course.Time}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 pr-4 text-gray-600 font-semibold">Location:</td>
                          <td className="py-2 text-gray-900">{course.Room}</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 text-gray-600 font-semibold">Instructor:</td>
                          <td className="py-2 text-gray-900">{course.Instructor}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-semibold">Waitlist:</span>
                      <span className="font-bold text-gray-900">{course.WaitlistCurrent} / {course.WaitlistMax}</span>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      onClick={() => removeFromWaitlist(course.id)}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 border border-gray-400 transition-colors text-sm rounded"
                    >
                      REMOVE FROM WAITLIST
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
