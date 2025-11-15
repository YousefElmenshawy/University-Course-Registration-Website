# RegIx — University Course Registration System

A comprehensive Next.js (App Router) application for university course registration built with TypeScript, React, Supabase, and AI integration. Features real-time course management, schedule visualization, conflict detection, waitlist handling, and an AI-powered student assistant.

**🌐 Live Demo:** [https://regix-auc.vercel.app/](https://regix-auc.vercel.app/)

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd my-next-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open the app**
   
   Navigate to [http://localhost:3000](http://localhost:3000) or visit the live demo at [https://regix-auc.vercel.app/](https://regix-auc.vercel.app/)

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production with Turbopack |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- **Secure Login/Signup** using Supabase Auth
- **Protected Routes** with session management
- **User Profile Management** with real-time data sync
- Password validation and secure credential handling

### 📚 Course Management
- **Course Catalog** with advanced filtering:
  - Search by course name, code, or instructor
  - Filter by major, time slots, and days of week
  - View only available courses option
- **Real-time Availability** tracking:
  - Current capacity and maximum capacity
  - Waitlist status and availability
  - Dynamic enrollment updates

### 📝 Registration System
- **Course Enrollment** with validation:
  - Capacity checking
  - Conflict detection (time overlaps)
  - Prerequisite validation (ready for implementation)
- **Waitlist Management**:
  - Automatic waitlist enrollment when course is full
  - Conflict checking for waitlisted courses
  - Waitlist position tracking
- **Drop Courses** functionality with confirmation
- **Success/Error Messages** with auto-dismiss

### 📅 Schedule Visualization
- **Weekly Schedule Grid** (Sunday-Saturday)
- **Time Slot Display** (8:00 AM - 6:00 PM)
- **Color-coded Course Blocks**:
  - Visual representation of enrolled courses
  - Course details on hover
  - Time conflict highlighting
- **Responsive Layout** adapting to different screen sizes

### 🤖 AI Assistant (Gemini Integration)
- **Intelligent Chatbot** powered by Google Gemini
- **Context-Aware Responses**:
  - Student profile data (GPA, credits, enrolled courses)
  - Past course history
  - Current enrollment status
- **Course Recommendations** based on student data
- **Schedule Planning Assistance**
- **Registration Guidance**
- **Fallback Mode** when API is unavailable
- **Floating Chat Interface** accessible from all protected pages

### 🎨 UI/UX Features
- **Responsive Navigation Bar** with:
  - Student name display
  - Active route highlighting
  - Logout functionality
  - AI Assistant toggle button
- **Modern Design** with Tailwind CSS
- **Loading States** and skeleton screens
- **Error Handling** with user-friendly messages
- **Toast Notifications** for actions
- **Accessibility** considerations

---

## 📁 Project Structure

```
University-Course-Registration-Website/
├── my-next-app/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                    # Landing/Login page
│   │   │   ├── layout.tsx                  # Root layout
│   │   │   ├── globals.css                 # Global styles
│   │   │   ├── api/
│   │   │   │   ├── chat/
│   │   │   │   │   └── route.ts           # AI chatbot API endpoint
│   │   │   │   └── profile/
│   │   │   │       └── route.ts           # User profile API endpoint
│   │   │   └── protected/
│   │   │       ├── layout.tsx             # Protected routes layout
│   │   │       ├── home/
│   │   │       │   └── page.tsx          # Student dashboard/home
│   │   │       ├── CourseCatalog/
│   │   │       │   └── page.tsx          # Browse all courses
│   │   │       ├── Register/
│   │   │       │   └── page.tsx          # Enroll/drop/waitlist
│   │   │       └── Schedule/
│   │   │           └── page.tsx          # Weekly schedule view
│   │   ├── components/
│   │   │   ├── Auth.tsx                   # Authentication form
│   │   │   ├── Navbar.tsx                 # Navigation bar
│   │   │   ├── AI_Assitant.tsx           # AI chatbot component
│   │   │   ├── Button.tsx                 # Reusable button component
│   │   │   ├── InputForm.tsx              # Form input component
│   │   │   ├── passowordInput.tsx         # Password input with toggle
│   │   │   └── logo.tsx                   # Logo component
│   │   └── lib/
│   │       └── databaseClient.ts          # Supabase client configuration
│   ├── public/
│   │   ├── logo.svg                       # Application logo
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   ├── package.json                       # Dependencies and scripts
│   ├── tsconfig.json                      # TypeScript configuration
│   ├── next.config.ts                     # Next.js configuration
│   ├── eslint.config.mjs                  # ESLint configuration
│   ├── postcss.config.mjs                 # PostCSS configuration
│   └── README.md
├── README.md                              # This file                          
```

---

## 🎯 User Workflows

### 1. **Student Registration Flow**
1. Sign up / Log in
2. View dashboard with profile information
3. Browse course catalog with filters
4. Enroll in desired courses (or join waitlist)
5. View schedule to check for conflicts
6. Drop courses if needed

### 2. **AI Assistant Usage**
1. Click AI Assistant icon in navbar
2. Ask questions about:
   - GPA and academic standing
   - Course recommendations
   - Schedule planning
   - Registration guidance
3. Receive context-aware responses based on profile

### 3. **Schedule Management**
1. Navigate to Schedule page
2. View enrolled courses in weekly grid
3. Identify time conflicts visually
4. Plan future course registrations

---

## 🚧 Future Enhancements

- [ ] **Prerequisite Checking** - Validate prerequisites before enrollment
- [ ] **Automatic Waitlist Promotion** - Move students from waitlist to enrolled when spots open
- [ ] **Email Notifications** - Notify students of enrollment status changes
- [ ] **Course Reviews** - Student ratings and reviews for courses
- [ ] **Degree Planning** - Multi-semester course planning tool
- [ ] **Mobile App** - Native mobile application
- [ ] **Admin Dashboard** - Course management for administrators
- [ ] **Real-time Updates** - WebSocket integration for live availability
- [ ] **Advanced Filters** - Filter by credits, difficulty level, course type
- [ ] **Export Schedule** - Download schedule as PDF or iCal

---

## 🐛 Known Issues

- AI Assistant may show fallback responses if Gemini API is unavailable
- Schedule grid spacing may vary with very long course names
- Timezone handling needs improvement for international students

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is for educational purposes. 

---

## 📧 Contact

For questions or issues, please open an issue on GitHub or contact the development team.

---

## 🙏 Acknowledgments

- Next.js team for the excellent framework
- Supabase for backend infrastructure
- Google for Gemini AI API
- Tailwind CSS for styling utilities

---

**Happy Course Registration! 🎓**

