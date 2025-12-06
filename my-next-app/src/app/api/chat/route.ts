import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from "@/lib/databaseClient";

interface Course {
    id: number;
    Name?: string;
    CourseID?: string;
    CRN?: number;
    Instructor?: string;
    Time?: string;
    TimeOfWeek?: string;
    Credits?: number;
    Room?: string;
    CapacityMax?: number;
    CapacityCurrent?: number;
}

export async function POST(request: Request) {

    let message = "";
    let studentData: {
        name?: string;
        gpa?: number;
        credits?: number;
        enrolledCourses?: Course[];
        pastCourses?: Course[];
        waitlistedCourses?: Course[];
    } | null = null;
    let allCourses: Course[] = [];

    try {
        const body = await request.json();
        message = body.message;
        const authToken = body.token; // Get auth token from client

        console.log("=== Chat API Request ===");
        console.log("Message:", message);
        console.log("Token provided:", !!authToken);

        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "Invalid message" }, { status: 400 });
        }

        // Fetch real student data from database if token is provided
        const supabaseServer = createServerClient(authToken);  //using Modifed database Client 

        if (authToken) {
            try {

                // Get authenticated user
                const { data: userData, error: userError } = await supabaseServer.auth.getUser();
                if (userError || !userData?.user) {
                    console.warn("Could not authenticate user, using fallback data");
                } else {
                    const userId = userData.user.id;
                    console.log("Fetching profile for user:", userId);

                    // Fetch student profile (note: User table has composite key: id + Role)
                    const { data: profileData, error: profileError } = await supabaseServer
                        .from("User")
                        .select("name, gpa, credits_earned, enrolled_courses, past_courses, waitlisted_courses, Role")
                        .eq("id", userId)
                        .eq("Role", "Student")
                        .single();

                    if (profileError) {
                        console.warn("Could not fetch profile:", profileError.message);
                    } else {
                        console.log("📋 Profile Data Retrieved:", {
                            name: profileData?.name,
                            gpa: profileData?.gpa,
                            credits_earned: profileData?.credits_earned,
                            enrolled_courses: profileData?.enrolled_courses,
                            past_courses: profileData?.past_courses,
                            waitlisted_courses: profileData?.waitlisted_courses,
                        });

                        // Convert to arrays - User table stores course.id as text arrays
                        const toNumberArray = (arr: any) => {
                            if (!Array.isArray(arr)) return [];
                            
                            // Log raw values to debug
                           // console.log("Raw array values:", arr);  not needed now
                            
                            return arr
                                .map((v) => {
                                    // Handle both string and number types just to be safe
                                    const num = typeof v === "number" ? v : Number(v);
                                    return Number.isFinite(num) ? num : null;
                                })
                                .filter((v): v is number => v !== null);
                        };

                        const enrolledIds = toNumberArray(profileData?.enrolled_courses);
                        const pastIds = toNumberArray(profileData?.past_courses);
                        const waitlistIds = toNumberArray(profileData?.waitlisted_courses);

                        /*console.log("🔍 Converted IDs:", { 
                            enrolledIds, 
                            pastIds, 
                            waitlistIds,
                            enrolledRaw: profileData?.enrolled_courses,
                            pastRaw: profileData?.past_courses,
                            waitlistRaw: profileData?.waitlisted_courses
                        });*/ // used for deubgging 

                        // Reusable select query for course details
                        const courseSelectFields = "id, Name, CourseID, CRN, Instructor, Time, TimeOfWeek, Credits, Room, CapacityMax, CapacityCurrent";

                        // ENROLLED COURSES: Fetch currently enrolled courses with full details
                        let enrolledCourseDetails: Course[] = [];
                        if (enrolledIds.length > 0) {
                           // console.log("Fetching enrolled courses with IDs:", enrolledIds);
                            const { data: enrolledData, error: enrolledError } = await supabaseServer
                                .from("Courses")
                                .select(courseSelectFields)
                                .in("id", enrolledIds);

                            if (enrolledError) {
                                console.error("Error fetching enrolled courses:", enrolledError);
                            } else {
                                //console.log("✅ Enrolled courses fetched:", enrolledData?.length);
                                enrolledCourseDetails = enrolledData || [];
                            }
                        } else {
                            //console.log("ℹ️ No enrolled courses");
                        }

                        // PAST COURSES: Fetch already completed courses with full details
                        let pastCourseDetails: Course[] = [];
                        if (pastIds.length > 0) {
                            console.log("Fetching past courses with IDs:", pastIds);
                            const { data: pastData, error: pastError } = await supabaseServer
                                .from("Courses")
                                .select(courseSelectFields)
                                .in("id", pastIds);

                            if (pastError) {
                                console.error("Error fetching past courses:", pastError);
                            } else {
                                console.log("✅ Past courses fetched:", pastData?.length);
                                pastCourseDetails = pastData || [];
                            }
                        } else {
                            console.log("ℹ️ No past courses");
                        }

                        // WAITLISTED COURSES: Fetch waitlisted courses with full details
                        let waitlistedCourseDetails: Course[] = [];
                        if (waitlistIds.length > 0) {
                            console.log("Fetching waitlisted courses with IDs:", waitlistIds);
                            const { data: waitlistData, error: waitlistError } = await supabaseServer
                                .from("Courses")
                                .select(courseSelectFields)
                                .in("id", waitlistIds);

                            if (waitlistError) {
                                console.error("Error fetching waitlisted courses:", waitlistError);
                            } else {
                                console.log("✅ Waitlisted courses fetched:", waitlistData?.length);
                                waitlistedCourseDetails = waitlistData || [];
                            }
                        } else {
                            console.log("ℹ️ No waitlisted courses");
                        }

                        studentData = {
                            name: profileData?.name || "Student",
                            gpa: profileData?.gpa || undefined,
                            credits: profileData?.credits_earned || 0,
                            enrolledCourses: enrolledCourseDetails, // Full course details
                            pastCourses: pastCourseDetails, // Full course details
                            waitlistedCourses: waitlistedCourseDetails, // Full course details
                        };

                        console.log("✅ Fetched real student data from database");
                        console.log("Student:", studentData.name);
                        console.log("Currently Enrolled:", enrolledCourseDetails.map((c) => `${c.CourseID} - ${c.Name} (${c.Instructor})`));
                        console.log("Past/Completed Courses:", pastCourseDetails.map((c) => `${c.CourseID} - ${c.Name}`));
                        console.log("Waitlisted Courses:", waitlistedCourseDetails.map((c) => `${c.CourseID} - ${c.Name}`));
                        console.log("GPA:", studentData.gpa);
                        console.log("Credits Earned:", studentData.credits);
                    }
                }
            } catch (dbError) {
                console.error("Database fetch error:", dbError);
                console.log("Continuing with fallback data");
            }
        }

        // Fetch ALL courses from database for AI context (full course catalog)
        try {
            console.log("Fetching all available courses from catalog...");
            const courseSelectFields = "id, Name, CourseID, CRN, Instructor, Time, TimeOfWeek, Credits, Room, CapacityMax, CapacityCurrent";
            const { data: coursesData, error: coursesError } = await supabaseServer
                .from("Courses")
                .select(courseSelectFields);

            if (coursesError) {
                console.error("Error fetching all courses:", coursesError);
            } else {
                allCourses = coursesData || [];
                console.log("✅ Total courses in catalog:", allCourses.length);
            }
        } catch (catalogError) {
            console.error("Error fetching course catalog:", catalogError);
        }

        const apiKey = process.env.GEMINI_API_KEY;

        console.log("API Key exists:", !!apiKey);
        console.log("API Key length:", apiKey?.length || 0); // prefer to keep it becuase it is crucial for AI_assitant

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

        // Gemini Model - using latest available model
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash"
        });

        const name = studentData?.name || "Student";
        const gpa = studentData?.gpa || "N/A";
        const credits = studentData?.credits || 0;
        const enrolledCourses = studentData?.enrolledCourses || [];
        const pastCourses = studentData?.pastCourses || [];
        const waitlistedCourses = studentData?.waitlistedCourses || [];

        // fetch the enrolled courses List using ids fetched from Users Table
        const enrolledCoursesList = enrolledCourses
            .map((c: Course) => `${c.CourseID} (${c.Name}) - Instructor: ${c.Instructor}, Time: ${c.Time}`)
            .join("\n  • ");

        // fetch the past courses
        const pastCoursesList = pastCourses
            .map((c: Course) => `${c.CourseID} (${c.Name})`)
            .join(", ");

        // fetch the waitlisted courses
        const waitlistedCoursesList = waitlistedCourses
            .map((c: Course) => `${c.CourseID} (${c.Name}) - Instructor: ${c.Instructor}`)
            .join("\n  • ");

        // fetch the available courses catalog for AI context (sample in case courses>50 or all otherwise)
        const availableCoursesInfo = allCourses.length > 0 
            ? `\n\nAvailable Courses in Catalog (${allCourses.length} total):\n${allCourses.slice(0, 50).map(c => 
                `• ${c.CourseID} - ${c.Name} (Instructor: ${c.Instructor}, ${c.Credits} credits, ${c.TimeOfWeek} ${c.Time})`
              ).join("\n")}${allCourses.length > 50 ? '\n... and more courses available' : ''}`
            : '';

        // Create the prompt
        const prompt = `You are a helpful university registration assistant for the RegIx course registration system.

Student Information:
- Name: ${name}
- Current GPA: ${gpa}
- Credits Earned: ${credits}

Currently Enrolled Courses:
${enrolledCourses.length > 0 ? `  • ${enrolledCoursesList}` : "  None"}

Past Completed Courses:
${pastCourses.length > 0 ? `  ${pastCoursesList}` : "  None (new student)"}

Waitlisted Courses:
${waitlistedCourses.length > 0 ? `  • ${waitlistedCoursesList}` : "  None"}
${availableCoursesInfo}

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

        // offline Mode: Return dummy  response when Gemini API fails
        console.log("⚠️ Gemini API error, using fallback mock response");
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error details:", errorMessage);

        const msg = (message || "").toLowerCase();

        let mockResponse = "";

        if (msg.includes("gpa") || msg.includes("grade")) {
            const gpa = studentData?.gpa || 4.0; // Use dummy data
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
                ? pastCourses.map((c: Course) => c.CourseID || c.Name).join(", ")
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
            const enrolled = studentData?.enrolledCourses || [];
            const enrolledText = enrolled.map((c: Course) => c.CourseID || c.Name).join(", ") || "No courses";

            mockResponse = `Hello ${name}! 👋 I'm your RegIx registration assistant.

Your current status:
📊 GPA: ${gpa}
📚 Credits: ${credits}
✅ Enrolled: ${enrolledText}

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
                { id: 1, CourseID: "CSCE1010", Name: "Introduction to Programming", CRN: 10001 },
                { id: 2, CourseID: "CSCE2010", Name: "Data Structures", CRN: 10002 },
                { id: 3, CourseID: "MATH1401", Name: "Calculus I", CRN: 10003 }
            ];

            const courseList = pastCourses.map((c, i) =>
                `${i + 1}. ${c.CourseID} - ${c.Name}`
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
            ],
            offline: true // Flag to indicate AI assisntant is Currently offline
        });
    }
}

