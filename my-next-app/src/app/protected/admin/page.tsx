'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/databaseClient'
import CourseForm from '../../../components/CourseForm'
import CourseCard from '../../../components/CourseCard'
import UserTable from '../../../components/UserTable'

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
  const [showAddCourseForm, setShowAddCourseForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    Name: '',
    CourseID: '',
    CRN: 0,
    Instructor: '',
    TimeOfWeek: '',
    Time: '',
    Room: '',
    CapacityMax: 0,
    CapacityCurrent: 0,
    WaitlistMax: 0,
    WaitlistCurrent: 0,
  })

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

  const deleteCourse = async (courseId: number) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('Courses')
        .delete()
        .eq('id', courseId)

      if (error) throw error

      // Update local state
      setCourses(courses.filter(course => course.id !== courseId))
    } catch (err) {
      console.error('Error deleting course:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete course')
    }
  }

  const addCourse = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data, error } = await supabase
        .from('Courses')
        .insert([{
          Name: newCourse.Name,
          CourseID: newCourse.CourseID,
          CRN: newCourse.CRN,
          Instructor: newCourse.Instructor,
          TimeOfWeek: newCourse.TimeOfWeek,
          Time: newCourse.Time,
          Room: newCourse.Room,
          CapacityMax: newCourse.CapacityMax,
          CapacityCurrent: newCourse.CapacityCurrent || 0,
          WaitlistMax: newCourse.WaitlistMax,
          WaitlistCurrent: newCourse.WaitlistCurrent || 0,
        }])
        .select()

      if (error) throw error

      // Add to local state
      if (data && data.length > 0) {
        setCourses([...courses, data[0]])
      }

      // Reset form and close
      setNewCourse({
        Name: '',
        CourseID: '',
        CRN: 0,
        Instructor: '',
        TimeOfWeek: '',
        Time: '',
        Room: '',
        CapacityMax: 0,
        CapacityCurrent: 0,
        WaitlistMax: 0,
        WaitlistCurrent: 0,
      })
      setShowAddCourseForm(false)
    } catch (err) {
      console.error('Error adding course:', err)
      setError(err instanceof Error ? err.message : 'Failed to add course')
    }
  }

  const admitFromWaitlist = async (courseId: number) => {
    // TODO: Implement logic to admit people from waitlist
    // This will:
    // 1. Find users on the waitlist for this course
    // 2. Move them to enrolled_courses
    // 3. Update CapacityCurrent and WaitlistCurrent
    console.log('Admitting from waitlist for course:', courseId)
    alert('Waitlist admission logic will be implemented soon!')
  }

  const startEditCourse = (course: Course) => {
    setEditingCourse(course)
    setShowAddCourseForm(false)
  }

  const cancelEdit = () => {
    setEditingCourse(null)
  }

  const updateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCourse) return

    try {
      const { error } = await supabase
        .from('Courses')
        .update({
          Name: editingCourse.Name,
          CourseID: editingCourse.CourseID,
          CRN: editingCourse.CRN,
          Instructor: editingCourse.Instructor,
          TimeOfWeek: editingCourse.TimeOfWeek,
          Time: editingCourse.Time,
          Room: editingCourse.Room,
          CapacityMax: editingCourse.CapacityMax,
          CapacityCurrent: editingCourse.CapacityCurrent,
          WaitlistMax: editingCourse.WaitlistMax,
          WaitlistCurrent: editingCourse.WaitlistCurrent,
        })
        .eq('id', editingCourse.id)

      if (error) throw error

      // Update local state
      setCourses(courses.map(course => 
        course.id === editingCourse.id ? editingCourse : course
      ))

      setEditingCourse(null)
    } catch (err) {
      console.error('Error updating course:', err)
      setError(err instanceof Error ? err.message : 'Failed to update course')
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
              <UserTable users={users} onRoleChange={changeUserRole} />
            )}

            {activeTab === 'courses' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Course Management</h2>
                  <button
                    onClick={() => setShowAddCourseForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    + Add Course
                  </button>
                </div>

                {/* Add Course Form */}
                {showAddCourseForm && (
                  <CourseForm
                    course={newCourse}
                    onSubmit={addCourse}
                    onChange={setNewCourse}
                    onCancel={() => {
                      setShowAddCourseForm(false)
                      setNewCourse({
                        Name: '',
                        CourseID: '',
                        CRN: 0,
                        Instructor: '',
                        TimeOfWeek: '',
                        Time: '',
                        Room: '',
                        CapacityMax: 0,
                        CapacityCurrent: 0,
                        WaitlistMax: 0,
                        WaitlistCurrent: 0,
                      })
                    }}
                  />
                )}

                {/* Edit Course Form */}
                {editingCourse && (
                  <CourseForm
                    course={editingCourse}
                    onSubmit={updateCourse}
                    onChange={(updatedCourse) => setEditingCourse(updatedCourse as Course)}
                    onCancel={cancelEdit}
                    isEdit
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onEdit={startEditCourse}
                      onDelete={deleteCourse}
                      onAdmitWaitlist={admitFromWaitlist}
                    />
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
