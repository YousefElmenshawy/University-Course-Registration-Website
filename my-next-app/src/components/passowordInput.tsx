// to be used in forms for password inputs forms
"use client";
import React, { useState } from "react";
import FormInput from "./InputForm";

type Props = {
    value: string;
    onChange: (v: string) => void;
    id: string;
    error?: string | null;
};

export default function PasswordInput({ value, onChange, id, error }: Props) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="mb-4 relative">
            <label htmlFor={id} className="block text-sm font-medium text-black mb-1">Password</label>
            <input
                id={id}
                type={visible ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? `${id}-error` : undefined}
                className={`w-full rounded-md border px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-300 text-black ${
                    error ? "border-red-500" : "border-gray-200"
                }`}
            />
            <button
                type="button"
                aria-label={visible ? "Hide password" : "Show password"}     //show or hash the pass.
                onClick={() => setVisible((s) => !s)}
                className="absolute right-2 top-8 text-sm text-black"
            >
                {visible ? "Hide" : "Show"}
            </button>
            {error ? <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-600">{error}</p> : null}
        </div>
    );
}
