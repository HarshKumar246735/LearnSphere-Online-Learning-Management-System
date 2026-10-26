# LearnSphere — Online Learning Management System
<img width="1917" height="918" alt="image" src="https://github.com/user-attachments/assets/69dc5a40-ca31-4c58-ac2a-625edb20e010" />


LearnSphere is a full-stack MERN Learning Management System (LMS) where students can learn through video lessons, take quizzes, track their learning progress, and earn certificates.

The platform includes three roles: **Student, Instructor, and Admin**. It also supports real-time messaging, notifications, course discussions, and study rooms using Socket.IO.

> **Important:** The project has not yet been installed, tested, or built in its original development environment. Follow the verification steps before deploying it.

---

## 1. Features

### Student Features

* Register, log in, and manage your profile.
* Browse, search, filter, and sort courses.
* Watch video lessons embedded from YouTube.
* Resume learning and track course progress.
* Mark lessons as completed.
* Take quizzes and view results.
* Earn certificates after completing course requirements.
* Download certificates as PDFs.
* Verify certificates using a public verification page.
* Send messages and receive notifications.
* Participate in course discussions and study rooms.
* Review and rate courses.

### Instructor Features

* Create and manage courses.
* Add, edit, and reorder sections and lessons.
* Manage course curriculum.
* View students and course analytics.
* Access instructor dashboards.

Instructor access requires administrator approval.

### Admin Features

* Manage users and roles.
* Promote users to instructors.
* Moderate reports and content.
* Manage platform activity through the admin dashboard.

### Additional Features

* Secure authentication using JWT and HTTP-only cookies.
* Password reset through email.
* Real-time messaging using Socket.IO.
* Server-side quiz scoring.
* Progress tracking.
* PDF certificate generation.
* Responsive landing page and course catalog.

**Note:** Payment gateway integration is not implemented. Paid courses cannot currently be purchased.

---

## 2. Project Architecture

The following diagram shows how the main parts of LearnSphere communicate.

```text
                  LEARNSPHERE
                       |
           +-----------+-----------+
           |           |           |
        Student     Instructor    Admin
           |           |           |
           +-----------+-----------+
                       |
              React + Vite Frontend
                       |
              HTTP API / Socket.IO
                       |
              Node.js + Express
                       |
          +------------+------------+
          |            |            |
       MongoDB      Email Service   PDFKit
       Database     (SMTP)          Certificates
          |
     Users, Courses,
     Progress, Quizzes,
     Messages, Notifications
```

### How It Works

1. Users interact with the React frontend.
2. Axios sends HTTP requests to the Express backend.
3. The backend validates requests and checks permissions.
4. Mongoose communicates with MongoDB.
5. Socket.IO handles real-time features.
6. Nodemailer sends password-reset emails when SMTP is configured.
7. PDFKit generates downloadable certificates.

---

## 3. Technology Stack

### Frontend

* React 18
* Vite
* React Router
* Axios
* Pure CSS
* Socket.IO Client
* Recharts
* React Hook Form
* Zod
* Lucide React

### Backend

* Node.js 20+
* Express 4
* MongoDB
* Mongoose 8
* JWT Authentication
* bcryptjs
* Zod
* Helmet
* express-rate-limit
* Socket.IO
* PDFKit
* Nodemailer

### Database

MongoDB stores application data, including users, courses, lessons, quizzes, enrollments, progress, certificates, messages, and notifications.

---

## 4. Project Folder Structure

```text
LearnSphere/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── landing/
│   │   │   ├── courses/
│   │   │   ├── lessons/
│   │   │   ├── quizzes/
│   │   │   ├── chat/
│   │   │   ├── notifications/
│   │   │   └── dashboard/
│   │   │
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   ├── auth/
│   │   │   ├── student/
│   │   │   ├── instructor/
│   │   │   ├── admin/
│   │   │   └── shared/
│   │   │
│   │   ├── layouts/
│   │   ├── routes/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   └── css/
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── sockets/
│   │   └── utils/
│   │
│   ├── tests/
│   ├── scripts/
│   │   └── seed.js
│   └── package.json
│
└── README.md
```

### Folder Explanation

| Folder         | Purpose                                 |
| -------------- | --------------------------------------- |
| `components/`  | Reusable UI components                  |
| `pages/`       | Application pages                       |
| `layouts/`     | Shared page layouts                     |
| `routes/`      | Frontend and backend routing            |
| `context/`     | Shared React state                      |
| `hooks/`       | Custom React hooks                      |
| `services/`    | API communication and business services |
| `css/`         | Stylesheets                             |
| `models/`      | MongoDB data models                     |
| `controllers/` | API request handlers                    |
| `middleware/`  | Authentication and authorization        |
| `validators/`  | Request validation                      |
| `sockets/`     | Socket.IO event handlers                |
| `tests/`       | Backend automated tests                 |
| `scripts/`     | Database seeding scripts                |

---

## 5. Requirements

Before starting, install:

* Node.js 20 or newer
* npm
* MongoDB locally or a MongoDB Atlas cluster
* Git (optional, for version control)

Check your installed versions:

```bash
node -v
npm -v
```

---

## 6. Installation and Local Setup

### Step 1: Configure the Backend

Open PowerShell in your project directory.

```powershell
cd server
Copy-Item .env.example .env
```

Open `server/.env` and configure the required environment variables.

Example:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/learnsphere
JWT_SECRET=replace_with_a_random_secret_of_at_least_32_characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
COOKIE_SAME_SITE=lax
COOKIE_SECURE=false
```

Use the actual variable names and formats from your project's `.env.example`. Additional settings may be required.

Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the generated value into `JWT_SECRET`.

Install backend dependencies:

```bash
npm install
```

Optionally create demo data:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

The backend is expected to run at:

`http://localhost:5000`

Health check:

`http://localhost:5000/health`

### Step 2: Configure the Frontend

Open a second terminal.

```powershell
cd client
Copy-Item .env.example .env
```

Configure `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_CURRENCY=INR
```

Use the exact variable names expected by the project. If the application uses a different currency setting, follow its existing configuration.

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

The frontend is expected to run at:

`http://localhost:5173`

### Step 3: Open the Application

1. Ensure MongoDB is running or your Atlas database is accessible.
2. Start the backend.
3. Start the frontend in a second terminal.
4. Open `http://localhost:5173` in your browser.
5. Test registration, login, courses, lessons, and quizzes.

---

## 7. Demo Accounts

After running the development seed script, the project documentation specifies these demo accounts.

| Role       | Email                        | Password     |
| ---------- | ---------------------------- | ------------ |
| Admin      | `admin@learnsphere.dev`      | `Demo@12345` |
| Instructor | `instructor@learnsphere.dev` | `Demo@12345` |
| Student    | `student@learnsphere.dev`    | `Demo@12345` |

These credentials are intended for local development only. Do not use demo credentials for a public production deployment.

### Seeding Notes

The seed script creates sample categories, accounts, courses, sections, lessons, and quizzes.

It is designed to be idempotent and refuses to run in production unless `ALLOW_SEED=true` is configured.

The sample YouTube videos have not been independently verified. If a lesson does not play, replace its video URL through:

**Instructor → Courses → Curriculum**

---

## 8. Authentication and Security

LearnSphere uses several security measures.

### JWT Authentication

* Authentication tokens are stored in an HTTP-only cookie named `ls_token`.
* JavaScript running in the browser cannot directly read the HTTP-only cookie.
* The server checks the current user on protected requests.

### Role-Based Authorization

* Students, instructors, and admins have different permissions.
* Users cannot assign themselves an instructor or admin role.
* The server checks permissions for protected API routes and Socket.IO events.

### Quiz Security

* Correct answers remain on the server before quiz submission.
* The server calculates quiz scores.
* Attempt limits and time limits are enforced on the backend.

### Certificate Security

* Certificates are issued only after the server verifies the required course completion conditions.
* Certificates can be downloaded as PDFs.
* Public verification allows certificate validity to be checked.

### CSRF Protection

State-changing browser requests must follow the backend's CSRF-related request requirements. Axios is configured to send the required `X-Requested-With` header.

---

## 9. How Course Completion Works

```text
Student enrolls in a course
           |
           v
     Opens a lesson
           |
           v
      Watches video
           |
           v
   Confirms completion
           |
           v
    Progress is saved
           |
           v
  Completes required lessons
           |
           v
  Passes required quizzes
           |
           v
 Server checks eligibility
           |
           v
 Certificate is issued
           |
           v
 Download PDF / Verify online
```

Opening a lesson alone does not mark it as completed.

The video player detects when a video reaches its end and highlights the completion action. The learner must confirm completion, and the server stores the result.

This is a learning-progress signal, not proof that someone watched every second of a video.

---

## 10. Real-Time Features

Socket.IO powers the real-time features.

```text
             Socket.IO
                 |
       +---------+---------+
       |         |         |
   Messaging  Notifications Discussions
       |
   Read receipts
   Unread counts
   Online presence

       Study Rooms
           |
     Text messages
     Participant lists
```

Features include:

* Private messaging
* Message read receipts
* Unread message counts
* Online presence
* Real-time notifications
* Course discussions
* Text-based study rooms

**Limitation:** Study-room messages and participant lists are stored in server memory and are not persisted. The application should run a single backend instance unless presence storage and Socket.IO coordination are upgraded.

---

## 11. Password Reset Email

Password-reset emails require SMTP configuration in `server/.env`.

Configure the relevant variables:

```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
```

Use the values supplied by your email provider.

Without SMTP configuration, password-reset emails will not be delivered.

Reset tokens are not supposed to be written to server logs.

---

## 12. Testing and Verification

**Important:** The project has not yet been executed or verified in its original environment. Run these checks before deployment.

### Backend Tests

```bash
cd server
npm install
npm test
```

The documented backend tests use Jest, Supertest, and an in-memory MongoDB package. The first run may need to download a MongoDB binary.

The tests cover authentication, authorization, enrollment, course ownership, lesson progress, quiz scoring, certificates, reviews, notifications, and Socket.IO security.

### Frontend Build

Open a separate terminal:

```bash
cd client
npm install
npm run build
```

Resolve any errors before deploying.

The project documentation does not describe automated frontend tests.

---

## 13. Deployment

The application can be deployed using MongoDB Atlas, Render, and Vercel.

### Architecture

```text
       User's Browser
              |
              v
        Vercel Frontend
              |
       HTTPS API Requests
        + Socket.IO
              |
              v
        Render Backend
              |
              v
        MongoDB Atlas
```

### MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Configure Network Access for the backend.
4. Copy the connection string.
5. Set it as `MONGODB_URI` in Render.

### Render Backend

Recommended configuration:

| Setting           | Value         |
| ----------------- | ------------- |
| Root directory    | `server`      |
| Build command     | `npm install` |
| Start command     | `npm start`   |
| Health check path | `/health`     |

Configure the production environment variables:

```env
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret
CLIENT_URL=https://your-app.vercel.app
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
```

Also configure SMTP variables if password-reset emails are required.

Use your actual deployed frontend origin for `CLIENT_URL`.

### Vercel Frontend

Recommended configuration:

| Setting          | Value           |
| ---------------- | --------------- |
| Root directory   | `client`        |
| Framework preset | Vite            |
| Build command    | `npm run build` |
| Output directory | `dist`          |

Configure frontend environment variables:

```env
VITE_API_URL=https://your-api.onrender.com/api/v1
VITE_SOCKET_URL=https://your-api.onrender.com
```

Replace the example domains with your actual deployed URLs.

### Important Cookie Note

When Vercel and Render use different domains, authentication cookies may be blocked by browser privacy restrictions.

This can cause login to appear successful while the current-user API request returns `401 Unauthorized`.

For better compatibility, consider using custom frontend and backend domains under the same parent domain, and configure cookie settings appropriately for that deployment.

The frontend origin in `CLIENT_URL` must exactly match the deployed frontend origin.

---

## 14. API Overview

The backend API uses the `/api/v1` prefix.

| API area               | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `auth/*`               | Registration, login, logout, and password reset      |
| `users/me`             | Current user profile                                 |
| `courses`              | Course listing and management                        |
| `categories`           | Course categories                                    |
| `enrollments/me`       | Student enrollments                                  |
| `lessons/*`            | Lesson management and completion                     |
| `quizzes/*`            | Quiz attempts and results                            |
| `certificates/*`       | Certificate listing, verification, and PDF downloads |
| `reviews/*`            | Course reviews                                       |
| `notifications`        | User notifications                                   |
| `conversations`        | Private messaging                                    |
| `study-rooms`          | Study-room features                                  |
| `student/dashboard`    | Student dashboard                                    |
| `instructor/dashboard` | Instructor dashboard                                 |
| `admin/*`              | Administrator features                               |
| `contact`              | Contact requests                                     |
| `settings/public`      | Public settings                                      |

API responses generally use this format:

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Error description"
}
```

Actual response fields can vary by endpoint.

---

## 15. Known Limitations

* The project has not yet been installed, tested, or built.
* Sample YouTube video links are unverified.
* Payment gateway integration is not implemented.
* Paid courses cannot currently be purchased.
* Password-reset emails require SMTP configuration.
* Study-room messages are not saved permanently.
* Real-time presence is stored in server memory.
* Horizontal scaling requires shared presence storage and Socket.IO coordination.
* Automated frontend tests are not included in the project documentation.

---

## 16. Recommended Next Steps

1. Install backend dependencies.
2. Configure MongoDB and backend environment variables.
3. Run the database seed script in development.
4. Start the backend and verify `/health`.
5. Install frontend dependencies.
6. Configure the frontend API and Socket.IO URLs.
7. Start the frontend.
8. Run backend tests.
9. Build the frontend.
10. Fix any errors before deployment.
11. Test authentication, course enrollment, lessons, quizzes, and certificates.
12. Deploy only after verification.

---

## Project Summary

**LearnSphere** is a MERN-stack learning platform designed to provide course management, video-based learning, quizzes, progress tracking, certificates, and real-time collaboration.

It uses React and Vite for the frontend, Node.js and Express for the backend, MongoDB for data storage, and Socket.IO for real-time communication.

The immediate priority is to **install, test, build, and verify the existing project before adding new features or deploying it**.
