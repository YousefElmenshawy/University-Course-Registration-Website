// to be used in any imput UI form later ...
"use client";
import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    id: string;
    error?: string | null;
};

export default function FormInput({ label, id, error, ...rest }: Props) {
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-black mb-1">
                {label}
            </label>
            <input
                id={id}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? `${id}-error` : undefined}
                {...rest}
                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 text-black ${
                    error ? "border-red-500" : "border-gray-200"
                }`}
            />
            {error ? (
                <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-600">
                    {error}
                </p>
            ) : null}
        </div>
    );
}
