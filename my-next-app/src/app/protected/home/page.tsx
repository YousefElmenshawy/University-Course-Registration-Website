"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/databaseClient"; // existing client
import Schedule from "@/components/SharedSchedule"

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [studentName, setStudentName] = useState("Student"); // fetch from auth/database
  const [loading, setLoading] = useState(true);
  const[gpa,setGpa] = useState<number|null>(null);  // added those to reflect these values in homepage in real time
  const [credits_earned, setCreditsEarned] = useState<number|null>(null); //null to avoid v
  const [enrolledCoursesCount, setCount] = useState<number|null>(null);
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

        type ProfileResponse = { 
          data?: { 
            name?: string;
            gpa?: number;
            credits_earned?: number;
            enrolled_courses?: string[];
          };  error?: string };

        if (!res.ok) {
          console.error(`Failed to load profile (status: ${res.status})`);
        
          return;
        }

        const result: ProfileResponse = await res.json();

        if (result.data?.name) {
          setStudentName(result.data.name);
          setGpa(result.data.gpa||0);
          setCount(result.data.enrolled_courses?.length||0);
          setCreditsEarned(result.data.credits_earned||0);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false); // here in case of an error or not we will set Loading at the end to false
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

  const announcements = [
    { 
      title: "Spring 2026 Registration Opens", 
      date: "2 hours ago",
      description: "Registration for Spring 2026 semester begins December 15th. Check your enrollment time in Banner."
    },
    { 
      title: "Final Exam Schedule Released", 
      date: "5 hours ago",
      description: "Final exam schedule for Fall 2025 is now available. Review your exam times and locations."
    },
    { 
      title: "Add/Drop Deadline Approaching", 
      date: "1 day ago",
      description: "Last day to add or drop courses without academic penalty is December 10th."
    },
    { 
      title: "Career Fair - Engineering Students", 
      date: "2 days ago",
      description: "Join us December 12th at the Student Center for networking with top tech companies."
    },
    { 
      title: "Academic Advising Week", 
      date: "3 days ago",
      description: "Schedule your advising appointment for Spring registration. Walk-ins available Dec 8-12."
    },
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
                  <p className="text-3xl font-bold text-gray-900 mt-1">{loading? "Loading...":enrolledCoursesCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Current Semester</p>
                </div>
                <div className="border-l-4 border-green-600 pl-4">
                  <p className="text-sm text-gray-600 uppercase tracking-wide">Cumulative GPA</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{loading ? "Loading..." :gpa}</p>
                  <p className="text-xs text-gray-500 mt-1">Out of 4.0</p>
                </div>
                <div className="border-l-4 border-purple-600 pl-4">
                  <p className="text-sm text-gray-600 uppercase tracking-wide">Credits Earned</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{loading?"loading...":credits_earned}</p>
                  <p className="text-xs text-gray-500 mt-1">Total Credits</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Schedule */}
           <div className="bg-white border border-gray-300 rounded">
              <div className="border-b border-gray-300 bg-gray-50 px-6 py-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Today&apos;s Schedule</h2>
                <Link
                  href="/protected/Schedule"
                  className="text-sm text-blue-700 hover:text-blue-800 font-medium hover:underline"
                >
                  View Full Schedule →
                </Link>
              </div>
              <div className="p-6">
                <Schedule 
                  compact={true} 
                  showTodayOnly={true} 
                  showHeader={false}
                />
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white border border-gray-300 rounded">
              <div className="border-b border-gray-300 bg-gray-50 px-6 py-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Announcements</h2>
                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded">
                  5 NEW
                </span>
              </div>
              <div className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {announcements.map((announcement, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-200 pb-4 last:border-0 last:pb-0 hover:bg-gray-50 p-3 -m-3 rounded transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {announcement.title}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {announcement.date}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {announcement.description}
                      </p>
                    </div>
                  ))}
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
                <Link href="/protected/CourseCatalog" className="border border-gray-300 rounded p-4 hover:bg-gray-50 hover:border-gray-400 transition-colors text-center">
                  <div className="text-2xl mb-2">📝</div>
                  <p className="text-sm font-semibold text-gray-900">Course Registration</p>
                </Link>
                <Link href="/protected/home" className="border border-gray-300 rounded p-4 hover:bg-gray-50 hover:border-gray-400 transition-colors text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="text-sm font-semibold text-gray-900">View Grades</p>
                </Link>
                <Link href="/protected/home" className="border border-gray-300 rounded p-4 hover:bg-gray-50 hover:border-gray-400 transition-colors text-center">
                  <div className="text-2xl mb-2">📄</div>
                  <p className="text-sm font-semibold text-gray-900">Transcript</p>
                </Link>
                <Link href="/protected/home" className="border border-gray-300 rounded p-4 hover:bg-gray-50 hover:border-gray-400 transition-colors text-center">
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