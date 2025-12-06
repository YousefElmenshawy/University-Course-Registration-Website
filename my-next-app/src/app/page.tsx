"use client";
import {useRouter} from "next/navigation"; // for redirection after login
import Image from "next/image";
import {useState} from "react";
import Logo from "@/components/logo";
import AuthCard from "@/components/Auth";
import "./globals.css";
import Button from "@/components/Button";
import PasswordInput from "@/components/passowordInput";
import InputForm from "@/components/InputForm";
import {supabase} from "@/lib/databaseClient";




export default function LoginPage() {
    const router = useRouter(); // for redirection

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!email.trim()) return setErrors({ email: "Email is required" });
        if (!password.trim()) return setErrors({ password: "Password is required" });

        const { data, error } = await supabase.auth.signInWithPassword({   //authentication using supabase
            email,
            password,
        });

        if (error) {
            console.error("Login error:", error.message);
            setErrors({ email: "Invalid email or password" });
            return;
        }

        console.log("User logged in:", data.user);
        // redirect to home page
       router.push("/protected/home");

    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <AuthCard>
                <Logo />

                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                    Sign in to your account
                </h2>

                <form onSubmit={handleLogin} noValidate >
                    <InputForm
                        id="email"
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email ?? null}
                    />

                    <PasswordInput
                        id="password"
                        value={password}
                        onChange={setPassword}
                        error={errors.password ?? null}
                    />

                    <div className="mt-6">
                        <Button label="Sign In" type="submit" />
                    </div>
                </form>

            </AuthCard>
        </div>
    );
}