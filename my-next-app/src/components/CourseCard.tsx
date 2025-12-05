import React from 'react'

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

interface CourseCardProps {
  course: Course
  onEdit: (course: Course) => void
  onDelete: (courseId: number) => void
  onAdmitWaitlist: (courseId: number) => void
}

export default function CourseCard({ 
  course, 
  onEdit, 
  onDelete, 
  onAdmitWaitlist 
}: CourseCardProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative">
      <button
        onClick={() => onDelete(course.id)}
        className="absolute top-3 right-3 text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors"
        title="Delete course"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
      <button
        onClick={() => onEdit(course)}
        className="absolute top-3 right-12 text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded transition-colors"
        title="Edit course"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </button>
      <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-8">
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
      <div className="mt-3 flex items-center justify-between">
        <span
          className={`px-2 py-1 text-xs font-semibold rounded ${
            course.CapacityCurrent >= course.CapacityMax
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {course.CapacityCurrent >= course.CapacityMax ? 'Full' : 'Available'}
        </span>
        {course.WaitlistCurrent > 0 && (
          <button
            onClick={() => onAdmitWaitlist(course.id)}
            className="px-3 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            title="Admit students from waitlist"
          >
            Admit Waitlist
          </button>
        )}
      </div>
    </div>
  )
}
