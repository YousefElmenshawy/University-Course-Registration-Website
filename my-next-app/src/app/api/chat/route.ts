import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
// This is currently Under Development and working as a Chat bot with no Current AI responses
interface Course {
    id: number;
    Name?: string;
    Code?: string;
    CourseID?: string;
    CRN?: number;
}

export async function POST(request: Request) {

    let message = "";
    let studentData: {
        name?: string;
        gpa?: number;
        credits?: number;
        enrolledCourses?: string[];
        pastCourses?: Course[];
    } | null = null;

    try {
        const body = await request.json();
        message = body.message;
        studentData = body.studentData;

        console.log("=== Chat API Request ===");
        console.log("Message:", message);
        console.log("Student Data:", studentData ? "Present" : "Missing");

        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "Invalid message" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        console.log("API Key exists:", !!apiKey);
        console.log("API Key length:", apiKey?.length || 0);

        if (!apiKey) {
            console.error("GEMINI_API_KEY not configured in environment");
            return NextResponse.json(
                { error: "AI service not configured", details: "Missing API key" },
                { status: 500 }
            );
        }

        console.log("Initializing Gemini with API key...");

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);

        console.log("Getting generative model...");

        // Gemni Model
        const model = genAI.getGenerativeModel({
            model: "gemini-pro"
        });


        const name = studentData?.name || "Student";
        const gpa = studentData?.gpa || "N/A";
        const credits = studentData?.credits || 0;
        const enrolledCourses = studentData?.enrolledCourses || [];
        const pastCourses = studentData?.pastCourses || [];

        const pastCoursesList = pastCourses
            .map((c: Course) => c.CourseID || c.Code || c.Name)
            .filter(Boolean)
            .join(", ");

        // Create the prompt
        const prompt = `You are a helpful university registration assistant for the RegIx course registration system.

Student Information:
- Name: ${name}
- Current GPA: ${gpa}
- Credits Earned: ${credits}
- Currently Enrolled Courses: ${enrolledCourses.length > 0 ? enrolledCourses.join(", ") : "None"}
- Past Completed Courses: ${pastCoursesList || "None (new student)"}

Your role is to help students with:
1. Course selection and personalized recommendations based on their academic history
2. Schedule planning and avoiding time conflicts
3. Registration procedures and deadlines
4. Understanding prerequisites and course sequences
5. Academic progress tracking (GPA, credits, graduation requirements)
6. General university and academic advice

Guidelines:
- Be friendly, encouraging, and concise
- Use the student's actual data to give personalized advice
- Reference their completed courses when making recommendations
- If they've taken CS courses, suggest advanced CS courses
- If they've taken Math courses, suggest related Math or technical courses
- Provide practical, actionable advice
- Use emojis occasionally to be friendly (📚 🎓 💡 ✅)

Student's Question: "${message}"

Provide a helpful, personalized response:`;

        console.log("Sending request to Gemini...");

        // Generate response
        const result = await model.generateContent(prompt);

        console.log("Gemini responded, extracting text...");

        const response = await result.response;
        const text = response.text();

        console.log("Response text length:", text.length);


        return NextResponse.json({
            content: [
                {
                    type: "text",
                    text: text
                }
            ]
        });

    } catch (error) {
        console.error("=== ERROR in Chat API ===");
        console.error("Error type:", error?.constructor?.name || typeof error);
        console.error("Error message:", error instanceof Error ? error.message : String(error));

        if (error instanceof Error && error.stack) {
            console.error("Stack trace:", error.stack);
        }

        // In Case AI is Down:  Return a helpful mock response
        console.log("Returning fallback mock response due to Gemini API error");

        const msg = (message || "").toLowerCase();

        let mockResponse = "";

        if (msg.includes("gpa") || msg.includes("grade")) {
            const gpa = studentData?.gpa || 3.8; // Use dummy data
            mockResponse = `Your current GPA is ${gpa}. ${
                gpa >= 3.5 ? "Excellent work! 🌟" : 
                gpa >= 3.0 ? "Great job! 👍" : 
                "Keep it up! 💪"
            }

To maintain or improve your GPA:
• Focus on courses that align with your strengths
• Don't overload your schedule
• Utilize office hours and study groups

⚠️ Note: AI assistant is temporarily unavailable. Using basic responses.`;
        } else if (msg.includes("recommend") || msg.includes("suggest") || msg.includes("course")) {
            const pastCourses = studentData?.pastCourses || [];
            const completedList = pastCourses.length > 0
                ? pastCourses.map((c: Course) => c.CourseID || c.Code).join(", ")
                : "CSCE1010, CSCE2010, MATH1401";

            mockResponse = `Based on your completed courses (${completedList}), I recommend:

🖥️ **Computer Science Track:**
• Advanced Programming (Data Structures & Algorithms)
• Database Systems
• Software Engineering
• Web Development

📐 **Mathematics Track:**
• Linear Algebra
• Differential Equations
• Statistics

💡 **Tip:** Balance difficult technical courses with lighter electives!

⚠️ Note: AI assistant is temporarily unavailable. Using basic responses.`;
        } else if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
            const name = studentData?.name || "Student";
            const gpa = studentData?.gpa || 3.8;
            const credits = studentData?.credits || 45;
            const enrolled = studentData?.enrolledCourses || ["CSCE3304", "MATH2313", "ENGL1301"];

            mockResponse = `Hello ${name}! 👋 I'm your RegIx registration assistant.

Your current status:
📊 GPA: ${gpa}
📚 Credits: ${credits}
✅ Enrolled: ${enrolled.join(", ")}

I can help you with:
• Course recommendations
• Schedule planning
• Registration guidance
• GPA tracking

What would you like help with today?

⚠️ Note: AI assistant is temporarily unavailable. Using basic responses.`;
        } else if (msg.includes("schedule") || msg.includes("time")) {
            mockResponse = `📅 **Schedule Planning Tips:**

1. **Check Time Conflicts:**
   • Go to the Course Catalog page
   • Use filters to see courses by time slots

2. **Balance Your Week:**
   • Mix morning and afternoon classes
   • Leave breaks for lunch and study time

3. **Course Load:**
   • 12 credits = Full-time (minimum)
   • 15 credits = Typical load
   • 18 credits = Heavy load

Visit the **Schedule** page to see your weekly calendar!

⚠️ Note: AI assistant is temporarily unavailable. Using basic responses.`;
        } else if (msg.includes("completed") || msg.includes("past") || msg.includes("taken")) {
            const pastCourses = studentData?.pastCourses || [
                { id: 1, CourseID: "CSCE1010", Name: "Introduction to Programming", Code: "CS101", CRN: 10001 },
                { id: 2, CourseID: "CSCE2010", Name: "Data Structures", Code: "CS201", CRN: 10002 },
                { id: 3, CourseID: "MATH1401", Name: "Calculus I", Code: "MATH101", CRN: 10003 }
            ];

            const courseList = pastCourses.map((c, i) =>
                `${i + 1}. ${c.CourseID || c.Code} - ${c.Name}`
            ).join("\n");

            mockResponse = `📚 **Your Completed Courses:**

${courseList}

These courses form the foundation of your degree! Based on what you've completed, I can recommend next steps.

⚠️ Note: AI assistant is temporarily unavailable. Using basic responses.`;
        } else {
            // Default response for any other question
            const gpa = studentData?.gpa || 3.8;
            const credits = studentData?.credits || 45;
            const enrolledCount = studentData?.enrolledCourses?.length || 3;

            mockResponse = `You asked: "${message}"

Your current status:
📊 GPA: ${gpa}
📚 Credits: ${credits}
✅ Enrolled: ${enrolledCount} courses

I can help with:
• **"recommend courses"** - Get course suggestions
• **"what's my gpa"** - See your GPA status
• **"help with schedule"** - Schedule planning tips
• **"completed courses"** - View past courses

⚠️ Note: AI assistant is temporarily unavailable. Using basic responses.`;
        }

        return NextResponse.json({
            content: [
                {
                    type: "text",
                    text: mockResponse
                }
            ]
        });
    }
}

