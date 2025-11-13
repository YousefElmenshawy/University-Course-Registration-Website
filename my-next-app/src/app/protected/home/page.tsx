"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/databaseClient"; // existing client


/*
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);// to retrieve authentication token

*/
  //this was reduntant since we have a shared client in lib
export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [studentName, setStudentName] = useState("Student"); // fetch from auth/database
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProfile = async () => {

      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) {
        console.error("No access token, user not authenticated");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        type ProfileResponse = { data?: { name?: string }; error?: string };

        if (!res.ok) {
          console.error(`Failed to load profile (status: ${res.status})`);
          return;
        }

        const result: ProfileResponse = await res.json();

        if (result.data?.name) {
          setStudentName(result.data.name);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // also update time every second
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
      <div className="min-h-screen bg-gray-100">


        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Academic Summary */}
          <div className="bg-white border border-gray-300 rounded mb-6">
            <div className="border-b border-gray-300 bg-gray-50 px-6 py-3">
              <h2 className="text-lg font-bold text-gray-900">Academic Summary</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border-l-4 border-blue-600 pl-4">
                  <p className="text-sm text-gray-600 uppercase tracking-wide">Enrolled Courses</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">5</p>
                  <p className="text-xs text-gray-500 mt-1">Current Semester</p>
                </div>
                <div className="border-l-4 border-green-600 pl-4">
                  <p className="text-sm text-gray-600 uppercase tracking-wide">Cumulative GPA</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">3.8</p>
                  <p className="text-xs text-gray-500 mt-1">Out of 4.0</p>
                </div>
                <div className="border-l-4 border-purple-600 pl-4">
                  <p className="text-sm text-gray-600 uppercase tracking-wide">Credits Earned</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">45</p>
                  <p className="text-xs text-gray-500 mt-1">Total Credits</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Schedule */}
            <div className="bg-white border border-gray-300 rounded">
              <div className="border-b border-gray-300 bg-gray-50 px-6 py-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Today's Schedule</h2>
                <Link
                    href="/protected/Schedule"
                    className="text-sm text-blue-700 hover:text-blue-800 font-medium hover:underline"
                >
                  View Full Schedule →
                </Link>
              </div>
              <div className="p-6">
                <table className="w-full">
                  <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-700 uppercase tracking-wider pb-3">Course</th>
                    <th className="text-left text-xs font-semibold text-gray-700 uppercase tracking-wider pb-3">Time</th>
                    <th className="text-left text-xs font-semibold text-gray-700 uppercase tracking-wider pb-3">Location</th>
                  </tr>
                  </thead>
                  <tbody>
                  {upcomingClasses.map((classItem, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 text-sm font-medium text-gray-900">{classItem.name}</td>
                        <td className="py-4 text-sm text-gray-700">{classItem.time}</td>
                        <td className="py-4 text-sm text-gray-600">{classItem.room}</td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white border border-gray-300 rounded">
              <div className="border-b border-gray-300 bg-gray-50 px-6 py-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Announcements</h2>
                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded">
                3 NEW
              </span>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {announcements.map((announcement, index) => (
                      <div
                          key={index}
                          className="border-b border-gray-200 pb-4 last:border-0 last:pb-0 hover:bg-gray-50 p-3 -m-3 rounded cursor-pointer"
                      >
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                          {announcement.title}
                        </h3>
                        <p className="text-xs text-gray-500">{announcement.date}</p>
                      </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Link
                      href="/announcements"
                      className="text-sm text-blue-700 hover:text-blue-800 font-medium hover:underline"
                  >
                    View All Announcements →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white border border-gray-300 rounded mt-6">
            <div className="border-b border-gray-300 bg-gray-50 px-6 py-3">
              <h2 className="text-lg font-bold text-gray-900">Quick Links</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/registration" className="border border-gray-300 rounded p-4 hover:bg-gray-50 hover:border-gray-400 transition-colors text-center">
                  <div className="text-2xl mb-2">📝</div>
                  <p className="text-sm font-semibold text-gray-900">Course Registration</p>
                </Link>
                <Link href="/grades" className="border border-gray-300 rounded p-4 hover:bg-gray-50 hover:border-gray-400 transition-colors text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="text-sm font-semibold text-gray-900">View Grades</p>
                </Link>
                <Link href="/transcript" className="border border-gray-300 rounded p-4 hover:bg-gray-50 hover:border-gray-400 transition-colors text-center">
                  <div className="text-2xl mb-2">📄</div>
                  <p className="text-sm font-semibold text-gray-900">Transcript</p>
                </Link>
                <Link href="/account" className="border border-gray-300 rounded p-4 hover:bg-gray-50 hover:border-gray-400 transition-colors text-center">
                  <div className="text-2xl mb-2">💳</div>
                  <p className="text-sm font-semibold text-gray-900">Student Account</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}