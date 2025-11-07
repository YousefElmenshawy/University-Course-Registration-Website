"use client";
import { supabase } from "@/lib/databaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./logo";
import { useState } from "react";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { name: "Home", href: "/protected/home" },
        { name: "Course Catalog", href: "/protected/CourseCatalog" },
        { name: "Register (Add/Drop)", href: "/protected/Register" },
        { name: "Schedule", href: "/protected/Schedule" },
    ];

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-lg bg-white/95">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo */}
                    <Link href="/protected/home" className="flex items-center space-x-3 group">
                        <div className="transition-transform group-hover:scale-105">
                            <Logo />
                        </div>
                        <span className="font-bold text-xl bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              University System
            </span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center space-x-1">
                        {links.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                    pathname === link.href
                                        ? "text-blue-900 bg-blue-50"
                                        : "text-gray-600 hover:text-blue-900 hover:bg-gray-50"
                                }`}
                            >
                                {link.name}
                                {pathname === link.href && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-blue-900 rounded-full" />
                                )}
                            </Link>
                        ))}

                        <div className="ml-4 pl-4 border-l border-gray-300">
                            <button
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    router.push("/");
                                }}
                                className="group relative px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-red-500/30 hover:scale-105 active:scale-95"
                            >
                                <span className="relative z-10">Logout</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-6 h-6"
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

                {/* in Case of Mobile  */}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
                    }`}
                >
                    <div className="flex flex-col space-y-2 pt-2">
                        {links.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                                    pathname === link.href
                                        ? "text-blue-900 bg-blue-50 border-l-4 border-blue-900"
                                        : "text-gray-600 hover:text-blue-900 hover:bg-gray-50"
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        <button
                            onClick={async () => {
                                await supabase.auth.signOut();
                                router.push("/");
                            }}
                            className="mt-4 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-red-500/30 transition-all"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}