import React from 'react'

interface User {
  id: string
  name: string
  Role: "Student" | "Admin" | "Professor"
  enrolled_courses: number[] | null
  waitlisted_courses: string[] | null
}

interface UserTableProps {
  users: User[]
  onRoleChange: (userId: string, newRole: "Student" | "Admin" | "Professor") => void
}

export default function UserTable({ users, onRoleChange }: UserTableProps) {
  return (
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
                    onChange={(e) => onRoleChange(user.id, e.target.value as "Student" | "Admin" | "Professor")}
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
  )
}
