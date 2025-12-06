"use client";
import { supabase } from "@/lib/databaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./logo";
import {useEffect, useState} from "react";
import AI_Assistant, { ChatButton } from "./AI_Assitant";
export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { name: "Home", href: "/protected/home" },
        { name: "Course Catalog", href: "/protected/CourseCatalog" },
        { name: "My Courses", href: "/protected/Register" },
        { name: "Schedule", href: "/protected/Schedule" },
    ];

    const [currentTime, setCurrentTime] = useState(new Date());
    const [studentName, setStudentName] = useState("Student"); // fetch from auth/database
    const [userRole, setUserRole] = useState<"Student" | "Admin" | "Professor" | null>(null); // track user role - null until loaded
    const [loading, setLoading] = useState(true);

    // Add admin link only if user is admin 
    const allLinks = (userRole===null)?[]:(userRole === "Admin") 
        ? [ { name: "Admin Panel", href: "/protected/admin" }]  // no need to show other stuff for an admin
        : links;
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

                type ProfileResponse = { data?: { name?: string; Role?: "Student" | "Admin" | "Professor" }; error?: string };

                if (!res.ok) {
                    console.error(`Failed to load profile (status: ${res.status})`);
                    return;
                }

                const result: ProfileResponse = await res.json();

                if (result.data?.name) {
                    setStudentName(result.data.name);
                }
                if (result.data?.Role) {
                    setUserRole(result.data.Role);
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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };
    return (
        <nav className="bg-white border-b-2 border-gray-300 sticky top-0 z-50">
            {/* Top Bar with University Branding */}
            <div className="bg-gray-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-12 text-sm">
                        <div className="flex items-center space-x-3">
                            <Logo size={32} className="flex-shrink-0" />
                            <span className="font-bold text-base tracking-wide">RegIx</span>
                        </div>
                        <div className="hidden sm:flex items-center space-x-4">
                            <span>
                                {currentTime.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                                {" | "}
                                {currentTime.toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                            <span className="text-blue-300">|</span>
                            <button
                                onClick={handleLogout}
                                className="hover:text-blue-200 font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                        {/* Mobile: Show only logout */}
                        <div className="sm:hidden">
                            <button
                                onClick={handleLogout}
                                className="hover:text-blue-200 font-medium text-xs transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-14">
                        {/* Welcome Message */}
                        <div>
                            <p className="text-base">
                                <span className="text-gray-600 font-normal">Welcome, </span>
                                <span className="font-semibold text-gray-900">
                                    {loading ? "Loading..." : studentName}
                                </span>
                            </p>
                            <p className="text-xs text-gray-500">Student Portal</p>
                        </div>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex items-center">
                            {allLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                        pathname === link.href
                                            ? "text-blue-900 border-blue-900 bg-blue-50"
                                            : "text-gray-700 border-transparent hover:text-blue-900 hover:border-gray-300"
                                    }`}
                                >
                                    {link.name}
                                </Link>

                            ))}

                            <AI_Assistant
                                isOpen={isOpen}
                                onClose={() => setIsOpen(false)}
                                /* Backend will fetch real data via token; this is just a minimal fallback */
                                studentData={{
                                    name: studentName,
                                    enrolledCourses: [],
                                    gpa: undefined,
                                    credits: 0,
                                    pastCourses: []
                                }}
                            />
                            {!isOpen && <ChatButton onClickAction={() => setIsOpen(true)} />}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 border border-gray-300 rounded"
                            aria-label="Toggle menu"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {isOpen && (
                        <div className="md:hidden border-t border-gray-200 py-2">
                            <div className="flex flex-col">
                                {/* Show date/time on mobile */}
                                <div className="px-4 py-2 text-xs text-gray-600 border-b border-gray-200 mb-2">
                                    {currentTime.toLocaleDateString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                    {" | "}
                                    {currentTime.toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                   
                                </div>
                             
                                {allLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`px-4 py-3 text-sm font-medium border-l-4 ${
                                            pathname === link.href
                                                ? "text-blue-900 bg-blue-50 border-blue-900"
                                                : "text-gray-700 border-transparent hover:bg-gray-50 hover:border-gray-300"
                                        }`}
                                    >
                                        {link.name}
                                    </Link>
                                ))}

                           
                            </div>
                             
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}