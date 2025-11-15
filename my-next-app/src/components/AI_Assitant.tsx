"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface Course {
    id: number;
    Name?: string;
    Code?: string;
    CourseID?: string;
    CRN?: number;
}

interface AI_AssitantProps {
    isOpen: boolean;
    onClose: () => void;
    studentData?: {
        name: string;
        enrolledCourses: string[];
        gpa?: number;
        credits?: number;
        pastCourses?: Course[];
    };
}

export default function AI_Assitant({ isOpen, onClose, studentData }: AI_AssitantProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hello! I'm your RegIx assistant. How can I help you with course registration today?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Call our API route which handles Gemini
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: input,
                    studentData: studentData
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("API Error:", response.status, errorData);
                throw new Error(errorData.details || `API error: ${response.status}`);
            }

            type AIContent = { type: string; text?: string };
            type AIResponse = { content: AIContent[] };

            const data = await response.json() as AIResponse;
            const assistantContent = data.content
                .filter((item: AIContent) => item.type === "text")
                .map((item: AIContent) => item.text || "")
                .join("\n");

            const assistantMessage: Message = {
                role: "assistant",
                content: assistantContent,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error calling AI:", error);
            const errorMessage: Message = {
                role: "assistant",
                content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 w-96 h-[600px] bg-white border-2 border-gray-300 rounded-lg shadow-2xl flex flex-col">
            {/* Header */}
            <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center border-b-2 border-gray-300">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        AI
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">RegIx Assistant</h3>
                        <p className="text-xs text-gray-300">Online</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-300 hover:text-white transition-colors"
                    aria-label="Close chat"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                message.role === "user"
                                    ? "bg-blue-700 text-white"
                                    : "bg-white border border-gray-300 text-gray-900"
                            }`}
                        >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p
                                className={`text-xs mt-1 ${
                                    message.role === "user" ? "text-blue-200" : "text-gray-500"
                                }`}
                            >
                                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-300 rounded-lg px-4 py-2">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t-2 border-gray-300 p-4 bg-white">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your question..."
                        disabled={isLoading}
                        className="text-black flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-700 text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="bg-blue-700 text-white px-4 py-2 hover:bg-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-sm"
                    >
                        Send
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send • Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}

// Chat Button  (to open the AI assistant)
export function ChatButton({ onClickAction }: { onClickAction: () => void }) {
    return (
        <button
            onClick={onClickAction}
            className="fixed bottom-4 right-4 z-40 w-14 h-14 bg-blue-700 hover:bg-blue-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
            aria-label="Open chat assistant"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
            </svg>
        </button>
    );
}