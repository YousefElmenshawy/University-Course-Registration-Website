"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [studentName, setStudentName] = useState("Student"); // You can fetch from auth/database

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const quickLinks = [
    {
      title: "Course Catalog",
      description: "Browse available courses",
      href: "/protected/CourseCatalog",
      icon: "📚",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Register",
      description: "Add or drop courses",
      href: "/protected/Register",
      icon: "✏️",
      color: "from-green-500 to-green-600",
    },
    {
      title: "My Schedule",
      description: "View your class schedule",
      href: "/protected/Schedule",
      icon: "📅",
      color: "from-purple-500 to-purple-600",
    }
  ];

  const upcomingClasses = [
    { name: "Computer Science 101", time: "10:00 AM", room: "Room 305" },
    { name: "Mathematics 202", time: "2:00 PM", room: "Room 112" },
    { name: "Physics Lab", time: "4:30 PM", room: "Lab 2B" },
  ];

  const announcements = [
    { title: "Registration Period Extended", date: "2 hours ago" },
    { title: "Final Exam Schedule Released", date: "1 day ago" },
    { title: "Campus Event: Employment Fair", date: "2 days ago" },
  ];

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/*  Greeting Section for Students */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  {getGreeting()}, {studentName}! 👋
                </h1>
                <p className="text-gray-600 text-lg">
                  {currentTime.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-2xl font-semibold text-blue-600 mt-2">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>



          {/*  Today's Classes & Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Today's Classes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Today's Classes</h2>
                <Link href="/protected/Schedule" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {upcomingClasses.map((classItem, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-shadow"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900">{classItem.name}</h3>
                        <p className="text-sm text-gray-600">{classItem.room}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{classItem.time}</p>
                      </div>
                    </div>
                ))}
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
                <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                3 New
              </span>
              </div>
              <div className="space-y-4">
                {announcements.map((announcement, index) => (
                    <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {announcement.title}
                      </h3>
                      <p className="text-sm text-gray-500">{announcement.date}</p>
                    </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Cards (dummy for now atleast) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Enrolled Courses</p>
                  <p className="text-4xl font-bold mt-2">5</p>
                </div>
                <div className="text-5xl opacity-50">📖</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Current GPA</p>
                  <p className="text-4xl font-bold mt-2">3.8</p>
                </div>
                <div className="text-5xl opacity-50">🎯</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Credits Earned</p>
                  <p className="text-4xl font-bold mt-2">45</p>
                </div>
                <div className="text-5xl opacity-50">⭐</div>
              </div>
            </div>
          </div>

        </div>
      </div>
  );
}