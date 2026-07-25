# AI-Powered Applicant Tracking System (ATS)

An intelligent recruitment platform that streamlines the hiring lifecycle — from job posting to candidate ranking — using AI-driven resume analysis.

## 🎯 Overview

Recruiters can post job openings, manage applications through a structured pipeline, and let AI automatically parse resumes, extract skills, and rank candidates against job requirements. Applicants can browse jobs, apply directly, and track their application status in real time.

## ✨ Features

### For Recruiters
- Post, edit, and archive job listings
- Manage applications through a hiring pipeline (Applied → Screening → Interview → Offered → Rejected)
- AI-powered resume analysis with match scoring, skill extraction, and hire recommendations
- Bulk AI analysis for all applications on a job
- Candidate ranking dashboard sorted by AI match score
- Automated email notifications on status changes

### For Applicants
- Browse and search job listings by keyword, location, and job type
- Apply with resume upload (PDF/DOCX)
- Track application status across all applied jobs

### Platform
- JWT-based authentication with role-based access control (Recruiter / Applicant)
- Secure password hashing (bcrypt)
- Rate limiting and security headers (Helmet)
- Resume storage via Cloudinary
- Email notifications via Nodemailer
- Fully responsive dark-themed UI

## 🛠️ Tech Stack

**Frontend**
- React 18, React Router v6, TanStack React Query
- Material-UI (MUI) with custom dark theme
- Axios with JWT interceptors
- Vite

**Backend**
- Node.js, Express.js
- MongoDB + Mongoose
- JWT authentication, Bcrypt
- Groq AI API (resume analysis & scoring)
- Cloudinary (resume file storage)
- Multer (file upload handling)
- Nodemailer (email notifications)
- Helmet + express-rate-limit (security)

## 📂 Project Structure

```
├── client/                    # React frontend
│   └── src/
│       ├── api/               # API service layer (axios instances)
│       ├── context/           # Auth & Snackbar global state
│       ├── components/        # Reusable UI components
│       └── pages/              # Route-level pages (auth, public, recruiter, applicant)
│
└── server/                    # Node.js backend
    ├── config/                # Database & Cloudinary configuration
    ├── controllers/           # Route handler logic
    ├── middleware/            # Auth, error handling, file upload
    ├── models/                # Mongoose schemas (User, Job, Application)
    ├── routes/                # API route definitions
    └── utils/                 # AI service, email service, PDF parsing, file storage
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)
- Groq API key (free)

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
```

Fill in `.env` with your credentials:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
GROQ_API_KEY=your_groq_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_USER=your_email
SMTP_PASS=your_app_password
```

```bash
npm run dev
```
Server runs on `http://localhost:5000`

### Frontend Setup
```bash
cd client
npm install
cp .env.example .env
```

Set in `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```
App runs on `http://localhost:3000`

## 📡 API Overview

| Module | Endpoints |
|--------|-----------|
| Auth | Register, Login, Get Profile, Update Profile |
| Jobs | Create, List, Search, Update, Archive |
| Applications | Apply (with resume), Track, Update Status, Recruiter Notes |
| AI | Single Analyze, Bulk Analyze, Candidate Rankings |

Full endpoint documentation available in `server/README.md`.

## 🧠 How the AI Analysis Works

1. Applicant uploads a resume (PDF/DOCX)
2. Backend extracts raw text using `pdf-parse` / `mammoth`
3. Extracted text + job description sent to Groq AI with a structured prompt
4. AI returns a JSON response: match score, extracted skills, strengths, gaps, and hire recommendation
5. Results are stored and surfaced in the recruiter's ranking dashboard

Includes automatic retry logic (up to 3 attempts) and response validation to handle malformed AI outputs gracefully.

## 🔒 Security

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens with configurable expiry
- Rate limiting on all routes (stricter limits on auth endpoints)
- Helmet for secure HTTP headers
- File upload restrictions (type + 5MB size limit)
- Environment variables never committed to version control

## 📸 Screenshots

*(Add screenshots here: Job Board, Application Pipeline, AI Candidate Rankings, Recruiter Dashboard)*

## 👤 Author

**Jaisurya P**
GitHub: [@Jaisurya2823](https://github.com/Jaisurya2823)

## 📄 License

This project is available for educational and portfolio purposes.