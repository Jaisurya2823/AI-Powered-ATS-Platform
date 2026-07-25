# ATS Backend — Setup Guide

## 1. Install Dependencies
```bash
npm install
```

## 2. Create your .env file
```bash
cp .env.example .env
```
Then fill in these values in `.env`:

| Key | What to put |
|-----|-------------|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Any random long string (min 32 chars) |
| `GROQ_API_KEY` | From https://console.groq.com |
| `AWS_ACCESS_KEY_ID` | From AWS IAM |
| `AWS_SECRET_ACCESS_KEY` | From AWS IAM |
| `AWS_REGION` | e.g. `ap-south-1` |
| `AWS_S3_BUCKET` | Your bucket name |
| `SMTP_USER` | Gmail address |
| `SMTP_PASS` | Gmail App Password (not normal password) |

## 3. Run
```bash
# Development
npm run dev

# Production
npm start
```

## 4. Test health check
```
GET http://localhost:5000/health
```

---

## API Endpoints

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register` | Public | Register recruiter or applicant |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Private | Get logged in user |
| PUT | `/api/auth/profile` | Private | Update profile |

### Jobs
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/jobs` | Public | Get all active jobs |
| GET | `/api/jobs/:id` | Public | Get single job |
| POST | `/api/jobs` | Recruiter | Create job |
| GET | `/api/jobs/recruiter/my-jobs` | Recruiter | My job listings |
| PUT | `/api/jobs/:id` | Recruiter | Update job |
| DELETE | `/api/jobs/:id` | Recruiter | Archive job |

### Applications
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/applications/:jobId` | Applicant | Apply with resume upload |
| GET | `/api/applications/my` | Applicant | My applications |
| GET | `/api/applications/job/:jobId` | Recruiter | All apps for a job |
| PUT | `/api/applications/:id/status` | Recruiter | Update status (pipeline) |
| PUT | `/api/applications/:id/notes` | Recruiter | Add notes |
| GET | `/api/applications/:id` | Both | Single application |

### AI
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/ai/analyze/:applicationId` | Recruiter | Analyze one resume |
| POST | `/api/ai/bulk-analyze/:jobId` | Recruiter | Analyze all unanalyzed |
| GET | `/api/ai/rankings/:jobId` | Recruiter | Ranked candidates |

---

## Register Request Body Examples

**Recruiter:**
```json
{
  "name": "John HR",
  "email": "john@company.com",
  "password": "pass1234",
  "role": "recruiter",
  "company": "Zaalima Dev",
  "designation": "HR Manager"
}
```

**Applicant:**
```json
{
  "name": "Jane Dev",
  "email": "jane@gmail.com",
  "password": "pass1234",
  "role": "applicant",
  "phone": "9876543210"
}
```

## Apply to Job (multipart/form-data)
```
POST /api/applications/:jobId
Authorization: Bearer <token>
Content-Type: multipart/form-data

Fields:
  - resume: [PDF or DOCX file, max 5MB]
  - coverLetter: "Optional cover letter text"
```

---

## Daily Git Workflow (Zaalima requirement)
```bash
git add .
git commit -m "feat: <what you built today>"
git push origin dev
```