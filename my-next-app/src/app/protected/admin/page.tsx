'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/databaseClient'

interface User {
  id: string
  name: string
  Role: "Student" | "Admin" | "Professor"
  enrolled_courses: number[] | null
  waitlisted_courses: string[] | null
}

interface Course {
  id: number
  Name: string
  CourseID: string
  CRN: number
  Instructor: string
  TimeOfWeek: string
  Time: string
  Room: string
  CapacityMax: number
  CapacityCurrent: number
  WaitlistMax: number
  WaitlistCurrent: number
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'users' | 'courses'>('users')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('User')
        .select('id, name, Role, enrolled_courses, waitlisted_courses')

      if (usersError) throw usersError

      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('Courses')
        .select('*')

      if (coursesError) throw coursesError

      setUsers(usersData || [])
      setCourses(coursesData || [])
    } catch (err) {
      console.error('Error fetching admin data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const changeUserRole = async (userId: string, newRole: "Student" | "Admin" | "Professor") => {
    try {
      const { error } = await supabase
        .from('User')
        .update({ Role: newRole })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, Role: newRole }
          : user
      ))
    } catch (err) {
      console.error('Error updating user role:', err)
      setError(err instanceof Error ? err.message : 'Failed to update user')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-lg">Loading admin panel...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white border border-gray-300 rounded mb-6 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-sm text-gray-600">
            Manage users and courses in the system.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-300 rounded mb-6">
          <div className="border-b border-gray-300">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Users ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'courses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Courses ({courses.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'users' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">User Management</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                       
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Enrolled Courses
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.Role === 'Admin'
                                  ? 'bg-red-100 text-red-800'
                                  : user.Role === 'Professor'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {user.Role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.enrolled_courses?.length || 0} courses
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <select
                              value={user.Role}
                              onChange={(e) => changeUserRole(user.id, e.target.value as "Student" | "Admin" | "Professor")}
                              className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-900"
                            >
                              <option value="Student">Student</option>
                              <option value="Professor">Professor</option>
                              <option value="Admin">Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {course.Name}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div><strong>Course ID:</strong> {course.CourseID}</div>
                        <div><strong>CRN:</strong> {course.CRN}</div>
                        <div><strong>Instructor:</strong> {course.Instructor}</div>
                        <div><strong>Schedule:</strong> {course.TimeOfWeek} | {course.Time}</div>
                        <div><strong>Room:</strong> {course.Room}</div>
                        <div>
                          <strong>Enrollment:</strong> {course.CapacityCurrent} / {course.CapacityMax}
                        </div>
                        <div>
                          <strong>Waitlist:</strong> {course.WaitlistCurrent} / {course.WaitlistMax}
                        </div>
                      </div>
                      <div className="mt-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            course.CapacityCurrent >= course.CapacityMax
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {course.CapacityCurrent >= course.CapacityMax ? 'Full' : 'Available'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
