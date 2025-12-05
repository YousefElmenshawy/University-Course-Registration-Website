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

interface CourseFormProps {
  course: Partial<Course>
  onSubmit: (e: React.FormEvent) => void
  onChange: (course: Partial<Course>) => void
  onCancel: () => void
  isEdit?: boolean
}

export default function CourseForm({ 
  course, 
  onSubmit, 
  onChange, 
  onCancel, 
  isEdit = false 
}: CourseFormProps) {
  return (
    <div className={`mb-6 border rounded-lg p-6 ${
      isEdit ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300'
    }`}>
      <h3 className="text-md font-semibold text-gray-900 mb-4">
        {isEdit ? 'Edit Course' : 'Add New Course'}
      </h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Name *
            </label>
            <input
              type="text"
              required
              value={course.Name || ''}
              onChange={(e) => onChange({ ...course, Name: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
              placeholder="e.g., Introduction to Computer Science"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course ID *
            </label>
            <input
              type="text"
              required
              value={course.CourseID || ''}
              onChange={(e) => onChange({ ...course, CourseID: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
              placeholder="e.g., CSCE1010"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CRN *
            </label>
            <input
              type="number"
              required
              value={course.CRN || ''}
              onChange={(e) => onChange({ ...course, CRN: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
              placeholder="e.g., 12345"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructor *
            </label>
            <input
              type="text"
              required
              value={course.Instructor || ''}
              onChange={(e) => onChange({ ...course, Instructor: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
              placeholder="e.g., Dr. Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Days of Week *
            </label>
            <input
              type="text"
              required
              value={course.TimeOfWeek || ''}
              onChange={(e) => onChange({ ...course, TimeOfWeek: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
              placeholder="e.g., MR"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time *
            </label>
            <input
              type="text"
              required
              value={course.Time || ''}
              onChange={(e) => onChange({ ...course, Time: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
              placeholder="e.g., 10:00 AM"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room *
            </label>
            <input
              type="text"
              required
              value={course.Room || ''}
              onChange={(e) => onChange({ ...course, Room: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
              placeholder="e.g., CP10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Capacity *
            </label>
            <input
              type="number"
              required
              value={course.CapacityMax || ''}
              onChange={(e) => onChange({ ...course, CapacityMax: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
              placeholder="e.g., 30"
            />
          </div>
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Capacity
              </label>
              <input
                type="number"
                value={course.CapacityCurrent || ''}
                onChange={(e) => onChange({ ...course, CapacityCurrent: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
                placeholder="e.g., 15"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Waitlist Max *
            </label>
            <input
              type="number"
              required
              value={course.WaitlistMax || ''}
              onChange={(e) => onChange({ ...course, WaitlistMax: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
              placeholder="e.g., 10"
            />
          </div>
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Waitlist Current
              </label>
              <input
                type="number"
                value={course.WaitlistCurrent || ''}
                onChange={(e) => onChange({ ...course, WaitlistCurrent: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900"
                placeholder="e.g., 5"
              />
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            {isEdit ? 'Update Course' : 'Add Course'}
          </button>
        </div>
      </form>
    </div>
  )
}
