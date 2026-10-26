yha p ek running video lgani h

Bilkul! Ab hum YouTube iframe use nahi karenge. Hum download ki hui MP4 video ko LearnSphere ke homepage par lagayenge, jo video card ke andar chalegi aur sound bhi support karegi. 🎬

Step 1: Video file project mein rakho

VS Code mein apne project ke client folder ke andar public/videos folder banao.

Folder structure:

LearnSphere/
└── client/
    ├── public/
    │   └── videos/
    │       └── learnsphere-intro.mp4
    └── src/
        └── components/
            └── landing/
                └── Hero.jsx

Apni downloaded video ko rename karke learnsphere-intro.mp4 rakho aur public/videos folder mein paste kar do.

Note: Video ko download aur website par use karne ka adhikar hona chahiye.

Step 2: Hero.jsx ka complete code replace karo

File path: client/src/components/landing/Hero.jsx

Hero.jsx — Downloaded MP4 Video
import { Link } from 'react-router-dom';
import {
  Award,
  BadgeCheck,
  MonitorSmartphone,
  Tags,
} from 'lucide-react';

const trust = [
  { icon: Tags, text: 'Free and paid courses' },
  { icon: BadgeCheck, text: 'Certificates you can verify' },
  { icon: MonitorSmartphone, text: 'Works on phone and laptop' },
];

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">

        {/* Left side: Hero content */}
        <div className="hero-copy">
          <h1>Learn a new skill, one lesson at a time</h1>

          <p>
            Watch video lessons, test yourself with quizzes, track your
            progress and earn a certificate you can share and verify online.
          </p>

          <div className="hero-actions">
            <Link to="/courses" className="btn btn-primary btn-lg">
              Explore courses
            </Link>

            <Link to="/register" className="btn btn-ghost btn-lg">
              Start learning
            </Link>
          </div>

          <ul className="trust-list">
            {trust.map(({ icon: Icon, text }) => (
              <li key={text}>
                <Icon size={18} aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Right side: Downloaded video player */}
        <div className="hero-visual">
          <div className="player-mock hero-video-card">

            <div className="hero-video-screen">
              <video
                className="hero-running-video"
                autoPlay
                loop
                muted
                controls
                playsInline
                preload="metadata"
              >
                <source
                  src="/videos/learnsphere-intro.mp4"
                  type="video/mp4"
                />

                Your browser does not support HTML video.
              </video>
            </div>

            <div className="player-bar">
              <span />
            </div>

            <ul className="player-lessons">
              <li className="done">
                <span className="lesson-check">✓</span>
                Introduction
              </li>

              <li className="done">
                <span className="lesson-check">✓</span>
                Core concepts
              </li>

              <li className="now">
                <span className="lesson-play">▶</span>
                Build your first project
              </li>

              <li>Quiz and review</li>
            </ul>
          </div>

          <div className="cert-chip">
            <Award size={20} />
            Certificate ready
          </div>
        </div>

      </div>
    </section>
  );
}
Step 3: CSS add karo

Apni landing page ki existing CSS file mein ye styles add karo:

Downloaded Video CSS
.hero-video-screen {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 20px;
  background: #111827;
}

.hero-running-video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 0;
  border-radius: inherit;
}

.hero-video-card {
  overflow: hidden;
}

.hero-video-card .player-bar {
  margin-top: 16px;
}

.hero-video-card .player-lessons {
  margin-bottom: 0;
}

.hero-video-card .lesson-check {
  color: #10bfa5;
  font-weight: 700;
  margin-right: 8px;
}

.hero-video-card .lesson-play {
  margin-right: 8px;
}

@media (max-width: 768px) {
  .hero-video-screen {
    border-radius: 14px;
  }
}
Step 4: Video check karo

Frontend terminal mein:

npm run dev

Browser mein ye address open karke check karo:

http://localhost:5173/videos/learnsphere-intro.mp4

Agar video browser mein play ho jaati hai, toh homepage par bhi load honi chahiye.

🔊 Sound ke baare mein

Code mein muted laga hai, kyunki browsers sound ke saath autoplay ko aam taur par block karte hain. Visitor video ke controls se sound on kar sakta hai.

Agar aap chahte ho ki video automatically sound ke saath chale, toh autoplay ko user ke Play button click karne tak rokna behtar hai.

Ab batao: Kya aapke paas MP4 video already downloaded hai? Agar haan, toh uska exact filename bata do; main code mein wahi filename set karwa dunga.

Pasted markdown(5).md
File
 simple with diagram explanation 

Chalo, LearnSphere mein downloaded video lagane ka process simple diagram ke saath samajhte hain. 😊

1. Video project mein kahan rakhni hai?

Apne React project ke client folder mein video rakho.

LearnSphere/
│
└── client/
    │
    ├── public/
    │   └── videos/
    │       └── intro.mp4       ← Your downloaded video
    │
    └── src/
        └── components/
            └── landing/
                └── Hero.jsx    ← Homepage video code

Samjho: intro.mp4 tumhari actual video hai aur Hero.jsx decide karta hai ki homepage par video kaise dikhegi.

2. Video kaise homepage tak pahunchegi?
      Downloaded video
          intro.mp4
              │
              ▼
    client/public/videos/
              │
              ▼
          Hero.jsx
       ┌──────────────┐
       │  Video Player│
       │              │
       │   ▶ Video    │
       │  🔊 Sound    │
       └──────────────┘
              │
              ▼
       LearnSphere
        Homepage
3. Code mein kya likhna hai?

Apni Hero.jsx file mein YouTube wale <iframe> ko hata kar ye code lagao:

<div className="hero-video-screen">
  <video
    className="hero-running-video"
    autoPlay
    loop
    muted
    controls
    playsInline
  >
    <source src="/videos/intro.mp4" type="video/mp4" />
    Your browser does not support video playback.
  </video>
</div>
Har property ka matlab
Property	Kaam
autoPlay	Video automatically chalane ki koshish karega
loop	Video khatam hone par dobara chalegi
muted	Shuru mein sound band rahega
controls	Play, pause aur volume ke controls dikhenge
playsInline	Mobile par video page ke andar play ho sakti hai

Sound ke liye: Video ke volume control se sound on kar sakte ho. Browser aam taur par sound ke saath autoplay allow nahi karta.

4. CSS se video ko card mein fit karo

Apni CSS file mein add karo:

.hero-video-screen {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 20px;
  background: #111827;
}

.hero-running-video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
5. Video test kaise karni hai?

Terminal mein frontend folder ke andar run karo:

npm run dev

Phir browser mein ye URL kholo:

http://localhost:5173/videos/intro.mp4

Agar video yahan play hoti hai, toh file ka path sahi hai.

Ek baat batao

Kya tumhare computer mein video pehle se downloaded hai?

YES — main tumhe us video ko project mein add karna bataunga.
NO — main tumhe legally reusable video download karne aur project mein lagane ka process bataunga.

# LearnSphere

A MERN learning management system: video lessons (YouTube played inside the app), quizzes, progress tracking,

certificates with public verification, and real-time messaging, notifications, course discussions and study rooms

over Socket.IO. Roles: student, instructor, admin.

> **Verification status, read first.** This project was written in an environment with no network access, so

> `npm install` could not run and **none of the code, tests or builds have been executed**. Server files pass

> `node --check` (syntax only); client files passed a bracket-balance check only. Expect to fix a few small errors on

> first run. The first thing to do is `npm install`, `npm test`, `npm run build`, and fix anything that fails

> (see [Verify it yourself](#verify-it-yourself)).

## Features

- Premium landing page (all sections), course search, filters, sorting and pagination, category pages, course details

- Registration, login, logout, forgot/reset password (emailed, expiring, hashed token), profile and password change

- HTTP-only cookie JWT, role-based access control, ownership checks on every instructor operation

- Course, section and lesson management with reordering; YouTube links validated and embedded via `youtube-nocookie.com`

- Lesson player (YouTube IFrame API) with previous/next, mark-as-completed, resume, and server-persisted progress

- Quizzes scored on the server (answers never sent before submission), attempt limits, time limits, results and explanations

- Certificates issued only after the server verifies completion; PDF download and public verification page

- Socket.IO: private messaging (read receipts, unread counts, presence), persisted notifications, course discussions, live study rooms (text)

- Reviews and ratings (real data only), reporting and admin moderation, instructor and admin dashboards with charts

## Stack

React 18, Vite, React Router, pure CSS (no framework), Axios, Socket.IO client, Recharts, React Hook Form + Zod, Lucide.

Node 20+, Express 4, Mongoose 8, JWT, bcryptjs, Zod, Helmet, express-rate-limit, Socket.IO, PDFKit, Nodemailer.

## Folder structure

```text

client/src/

  components/ common, layout, landing, courses, lessons, quizzes, chat, notifications, dashboard, auth

  pages/      public, auth, student, instructor, admin, shared

  layouts/ routes/ context/ hooks/ services/ utils/

  css/        one stylesheet per page area + variables.css, global.css, common.css, responsive.css

server/src/

  config/ models/ controllers/ services/ routes/ middleware/ validators/ sockets/ utils/

server/tests/ scripts/seed.js

```

## Prerequisites

Node.js 20 or newer and a MongoDB database (local, or a free MongoDB Atlas cluster).

## Local development

```bash

# 1. API

cd server

cp .env.example .env          # PowerShell: Copy-Item .env.example .env

# edit .env: set MONGODB_URI and a JWT_SECRET of 32+ random characters

npm install

npm run seed                  # optional demo data (see "Seeding")

npm run dev                   # http://localhost:5000  (health: /health)

# 2. Web app, in a second terminal

cd client

cp .env.example .env          # PowerShell: Copy-Item .env.example .env

npm install

npm run dev                   # http://localhost:5173

```

Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

### Password-reset email

Reset links are sent by email, so configure SMTP in `server/.env` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`,

`MAIL_FROM`). Mailtrap, Brevo or a Gmail app password all work. Without SMTP the API still answers normally, but no

email is sent. **Reset links and tokens are never written to logs**, so there is no console shortcut for local testing.

## Environment variables

Server (`server/.env.example`): `NODE_ENV`, `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`,

`COOKIE_SAME_SITE`, `COOKIE_SECURE`, `PASSWORD_RESET_EXPIRES_MIN`, `SMTP_*`, `MAIL_FROM`.

Client (`client/.env.example`): `VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_CURRENCY`.

The server validates its variables at startup and exits with a clear message if any are missing or invalid.

Never put secrets in `VITE_*` variables: they are public.

## Seeding

`npm run seed` (in `server/`) creates the default categories, three demo accounts and three sample courses with

sections, lessons and quizzes. It is idempotent and refuses to run when `NODE_ENV=production` unless `ALLOW_SEED=true`.

| Role | Email | Password (development only) |

|---|---|---|

| Admin | admin@learnsphere.dev | Demo@12345 |

| Instructor | instructor@learnsphere.dev | Demo@12345 |

| Student | student@learnsphere.dev | Demo@12345 |

**Sample videos:** the seed uses three public freeCodeCamp.org videos that we believe allow embedding, but they could not

be re-checked from the build environment. Open each lesson, confirm it plays, and replace the link from

*Instructor > Courses > Curriculum* if it does not. The seed also does not invent reviews, ratings, enrollments or

testimonials.

## Verify it yourself

```bash

cd server && npm install && npm test      # Jest + Supertest + in-memory MongoDB (downloads a MongoDB binary the first time)

cd client && npm install && npm run build

```

Server tests cover: registration/login/duplicate email, role-injection attempts, CSRF checks, password reset,

role-based access, course creation permissions, ownership, enrollment (and duplicates), YouTube URL parsing, lesson

completion, progress, quiz scoring (and answer secrecy), certificate eligibility, verification and PDF access, review

authorization, notification access control, and Socket.IO authentication and authorization (cookie required, forged

cookies rejected, private rooms and conversations enforced, duplicate-message handling, presence cleanup).

There are no automated client tests.

## Architecture notes

- **Auth:** JWT in an HTTP-only cookie (`ls_token`). The server re-reads the user on every request, so deactivating an

  account or changing a role takes effect immediately.

- **Authorization** happens on the server for every route and every socket event. UI hiding is only a convenience.

- **CSRF:** because the cookie is sent cross-origin, state-changing requests must (1) come from `CLIENT_URL` when an

  `Origin` header is present and (2) carry `X-Requested-With: XMLHttpRequest` (Axios adds it). Browsers cannot attach that

  header on cross-site form or image requests, and CORS only allows the exact frontend origin.

- **Quizzes:** the answer key never leaves the server before submission; scoring, attempt limits and the time limit

  (30 s grace) are enforced server-side, and an attempt can be submitted only once.

- **Progress and completion:** opening a lesson does not count as watching it. The player uses the YouTube IFrame API

  only to detect that a video reached its end, which highlights the *Mark as completed* button. The learner confirms

  completion and the server stores it. This is an honest signal, not proof of viewing, and the app does not claim otherwise.

- **Certificates:** issued by the server when all lessons are complete and all required quizzes are passed; one per

  student and course (unique index). IDs look like `LS-` plus 12 hex characters.

- **Payments:** not implemented. Paid courses can be created but cannot be bought: the API returns 402 and the UI shows

  "Checkout unavailable". No card data is handled anywhere.

- **YouTube limits:** private, removed, age-restricted or embedding-disabled videos cannot play. The app shows an error

  state and never tries to bypass this.

- **Study rooms:** room messages and participant lists are in memory only and are not saved. Room records (name, host) are.

## Deployment

### MongoDB Atlas

1. Create a free cluster, a database user, and under *Network Access* allow your Render service (or `0.0.0.0/0` to start).

2. Copy the connection string into `MONGODB_URI` (add the database name, for example `.../learnsphere`).

### Backend on Render (Web Service)

- Root directory `server`, build command `npm install`, start command `npm start`, health check path `/health`.

- Environment: `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL=https://your-app.vercel.app` (no trailing path),

  `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=none`, plus `SMTP_*`/`MAIL_FROM`.

- Render supports WebSockets, so Socket.IO works without extra settings. Free instances sleep when idle.

### Frontend on Vercel

- Root directory `client`, framework preset Vite, build `npm run build`, output `dist`. `vercel.json` rewrites all paths to `index.html`.

- Environment: `VITE_API_URL=https://your-api.onrender.com/api/v1`, `VITE_SOCKET_URL=https://your-api.onrender.com`.

### Cross-site cookies: important

Vercel and Render use different registrable domains, so the auth cookie is a *third-party* cookie

(`SameSite=None; Secure`). Chrome currently allows this, but **Safari, Brave and some privacy settings block it**, which

makes login appear to succeed and then fail. For a reliable production setup, serve both from one parent domain, for

example `app.example.com` (Vercel) and `api.example.com` (Render custom domain), then use `COOKIE_SAME_SITE=lax`.

### Scaling Socket.IO

Presence (who is online, who is in a study room) is held in server memory, so run **one instance**. To scale

horizontally, add `@socket.io/redis-adapter` with a Redis instance, enable sticky sessions at the load balancer, and move

the presence maps in `services/realtime.js` and `sockets/studyRoomHandlers.js` into Redis.

## API overview (`/api/v1`)

Auth `auth/*` · Users `users/me` · Courses `courses`, `courses/featured`, `courses/:slug`, `courses/mine`, `courses/manage/:id`,

`courses/:id/publish` · Curriculum `courses/:id/sections`, `sections/:id/lessons`, `lessons/:id` (+ `reorder`) ·

Learning `courses/:id/enroll`, `enrollments/me`, `courses/:id/progress`, `lessons/:id/complete`, `courses/:slug/learn` ·

Quizzes `courses/:id/quizzes`, `quizzes/:id`, `quizzes/:id/start`, `quizzes/:id/attempts`, `quizzes/mine|enrolled` ·

Certificates `certificates/me`, `certificates/verify/:id`, `certificates/:id/pdf` · Reviews `courses/:id/reviews`, `reviews/:id` ·

Social `notifications`, `conversations`, `courses/:id/discussions`, `study-rooms`, `reports`, `courses/:id/announcements` ·

Dashboards `student/dashboard`, `instructor/dashboard|students|analytics` · Admin `admin/*` · Public `categories`, `stats`, `testimonials`, `contact`, `settings/public`.

Responses are `{ success, data, meta? }`; errors are `{ success: false, message, details? }`.

Socket events: `message:send`, `messages:read`, `message:new`, `presence`, `notification:new`, `discussion:join|send|new`, `room:join|leave|message|participants|closed`.

## Instructor access

Nobody can choose their own role. Visitors use *Become an instructor* (a contact request); an admin then promotes the

account in *Admin > Users*.

## Troubleshooting

- **Server exits immediately:** read the message; a variable in `.env` is missing or invalid.

- **CORS or cookie problems:** `CLIENT_URL` must exactly match the browser origin (scheme, host, port). See the cross-site cookie note above.

- **Login works then `/auth/me` returns 401 in production:** third-party cookie blocking, see above.

- **Video shows "cannot be played here":** the owner disabled embedding or removed it. Use another video.

- **No reset email:** configure SMTP; check the server log for "Password reset email failed" (the token is never logged).

- **403 "Missing required request header":** a non-browser client must send `X-Requested-With: XMLHttpRequest`.

## Known gaps

No payment gateway; reset emails need SMTP; study-room chat is not saved; single-instance presence; seed video links unverified;

no automated client tests; the code has not been executed (see the note at the top). simple readme file with proper explantion with diagram

Analysis paused

Maine aapke LearnSphere project ke liye simple README file bana di hai. Isme easy English, proper explanation, diagrams aur setup instructions hain.

📄 Download README

Download LearnSphere_README.md

README mein kya hai?
Project Introduction — LearnSphere kya hai.
Features — Students, instructors aur admins kya kar sakte hain.
Architecture Diagram — Frontend, backend aur database kaise connect hote hain.
Project Structure — Har folder ka purpose.
Technology Stack — React, Node.js, Express, MongoDB aur Socket.IO.
Installation Guide — PowerShell commands ke saath local setup.
Demo Accounts — Development ke liye sample login credentials.
Security — Authentication, authorization aur quiz security.
Testing — Backend tests aur frontend build commands.
Deployment — MongoDB Atlas, Render aur Vercel.
Known Limitations — Payment gateway, email configuration aur other pending work.
System architecture diagram
          ┌─────────────────────────┐
          │        LEARNSPHERE      │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │    React + Vite         │
          │       Frontend          │
          └────────────┬────────────┘
                       │
             HTTP API + Socket.IO
                       │
          ┌────────────▼────────────┐
          │   Node.js + Express     │
          │        Backend          │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │        MongoDB          │
          │     Database            │
          └─────────────────────────┘

Important: README mein project ki current limitations bhi explain ki hain. Project ko deploy karne se pehle dependencies install karke tests aur build run karna zaroori hai, kyunki original project abhi execute karke verify nahi kiya gaya hai.

LearnSphere_README.md
Document

LearnSphere_README.md
LearnSphere --- Online Learning Platform

LearnSphere is a MERN-stack Learning Management System (LMS).
Students can learn from video lessons, take quizzes, track their
progress, and earn certificates. Instructors can manage courses, while
administrators manage users and moderate content.

Important: The project has not yet been installed, tested, or
built in its original development environment. Run the installation
and verification steps below before relying on it.

1. What can you do with LearnSphere?
Students
Create an account, log in, and manage their profile.
Browse, search, filter, and sort courses.
Watch embedded YouTube lessons and continue from saved progress.
Mark lessons complete and take quizzes.
View quiz results and explanations.
Earn a certificate after meeting the course completion requirements.
Message other users, receive notifications, join course discussions,
and participate in text-based study rooms.
Instructors
Create and manage courses, sections, and lessons.
Reorder course content.
View instructor dashboards, students, and analytics.
Receive instructor access only after an administrator promotes their
account.
Administrators
Manage users and roles.
Moderate reports and content.
Manage platform activity through the admin dashboard.
Other features
Public certificate verification and PDF certificate downloads.
Course reviews and ratings based on real user data.
Password reset by email when SMTP is configured.
Real-time messaging and notifications powered by Socket.IO.

Not included: A payment gateway. Paid courses cannot currently be
purchased.

2. How the system works
                 LEARNSPHERE
                      |
          +-----------+-----------+
          |           |           |
       Student     Instructor    Admin
          |           |           |
     Browse and    Manage       Manage users
     learn courses courses      and moderation
          |
    +-----+------+------------------+
    |            |                  |
 Video lessons  Quizzes         Progress tracking
    |            |                  |
    +------------+------------------+
                      |
              Completion checks
                      |
               Course certificate
                      |
           Public verification + PDF
Main technology flow
User's browser
 React + Vite
      |
      | HTTP requests (Axios)
      | Real-time events (Socket.IO)
      v
 Node.js + Express API
      |
      +------ MongoDB (users, courses, progress, etc.)
      |
      +------ Email service (password-reset emails, if configured)
      |
      +------ PDF generation (certificates)
React + Vite builds the user interface.
Express provides API routes.
MongoDB + Mongoose store application data.
JWT in an HTTP-only cookie keeps the user signed in.
Socket.IO handles real-time messaging, notifications,
discussions, and study-room chat.
PDFKit generates downloadable certificates.
Nodemailer sends password-reset emails when SMTP settings are
configured.
3. User roles and permissions

Role Main responsibilities

Student Learn courses, take quizzes, track
progress, earn certificates, and
use social features

Instructor Create and manage courses and view
teaching analytics

Users cannot select their own role during registration. A visitor
requests instructor access, and an administrator can promote the
account.

4. Project structure
LearnSphere/
├── client/
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Public, auth, student, instructor, admin pages
│       ├── layouts/      # Shared page layouts
│       ├── routes/       # Application routes
│       ├── context/      # Shared React state
│       ├── hooks/        # Custom React hooks
│       ├── services/     # API and service calls
│       ├── utils/        # Helper functions
│       └── css/          # Page and component styles
└── server/
    ├── src/
    │   ├── config/       # Configuration
    │   ├── models/       # MongoDB models
    │   ├── controllers/  # Request handlers
    │   ├── services/     # Business logic
    │   ├── routes/       # API routes
    │   ├── middleware/   # Authentication and access checks
    │   ├── validators/   # Input validation
    │   ├── sockets/      # Socket.IO event handlers
    │   └── utils/        # Server helpers
    ├── tests/            # Backend tests
    └── scripts/seed.js   # Demo data seeding
5. Requirements

Install these before starting:

Node.js 20 or newer
MongoDB, either locally or through MongoDB Atlas
A terminal such as PowerShell, Command Prompt, or a Unix shell
6. Run locally
Step A --- Configure the backend

Open a terminal in the project folder:

cd server
Copy-Item .env.example .env

Edit server/.env and set at least: - MONGODB_URI --- your MongoDB
connection string - JWT_SECRET --- a random secret of at least 32
characters

Generate a strong secret with:

node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

Then install dependencies and start the API:

npm install
npm run seed
npm run dev

Seeding is optional and creates demo categories, accounts, and sample
courses. The seed command refuses to run in production unless explicitly
allowed. The API is expected at http://localhost:5000; health check:
http://localhost:5000/health.

Step B --- Configure the frontend

Open a second terminal:

cd client
Copy-Item .env.example .env
npm install
npm run dev

The frontend is expected at http://localhost:5173.

Set the frontend environment values in client/.env as needed: -
VITE_API_URL --- API base URL, normally ending in /api/v1 -
VITE_SOCKET_URL --- backend origin used by Socket.IO - VITE_CURRENCY
--- currency display setting

Never put passwords, JWT secrets, or other private values in VITE_
variables. Frontend variables are exposed to the browser.

7. Demo accounts

After running the development seed script, the README specifies these
development-only accounts:

Role Email Password

Admin admin@learnsphere.dev Demo@12345
Instructor instructor@learnsphere.dev Demo@12345
Student student@learnsphere.dev Demo@12345

Use these only in a local development environment. Do not use demo
credentials for a public production deployment.

The seed includes three sample freeCodeCamp.org YouTube videos. Their
availability and embedding permissions have not been re-verified. If a
lesson does not play, replace its URL through Instructor → Courses →
Curriculum.

8. Important security and learning rules
Authentication uses a JWT stored in an HTTP-only cookie named
ls_token.
The server checks the current user and permissions for protected
routes and Socket.IO events.
Quiz answers are kept on the server until the learner submits an
attempt; the server calculates the score.
Opening a lesson alone does not mark it complete. The learner
confirms completion after the video ends.
Certificates are issued only when the server verifies that the
required lessons and quizzes are complete.
Password-reset emails require SMTP configuration. Without it, reset
email delivery will not work.
Cross-site cookies can be blocked by some browsers when the frontend
is on Vercel and the API is on Render. A shared parent domain is
recommended for a more reliable production setup.
Study-room messages and participant lists are currently stored in
server memory and are not persisted. Run a single backend instance
unless presence is moved to shared storage.
Paid-course checkout is not implemented.
9. Verify the project

The original project has not been executed or tested. Once
dependencies and environment variables are configured, run the checks:

# Backend
cd server
npm install
npm test

# Frontend — open another terminal
cd client
npm install
npm run build

The backend tests use Jest, Supertest, and an in-memory MongoDB package.
The first test run may need to download a MongoDB binary. There are no
automated frontend tests described in the project notes.

Fix any failing installation, test, or build errors before deploying.

10. Deployment overview
Frontend (Vercel)
      |
      | HTTPS API + Socket.IO
      v
Backend (Render)
      |
      v
MongoDB Atlas
MongoDB Atlas
Create a cluster and database user.
Configure Network Access so the backend can connect.
Put the connection string in the backend's MONGODB_URI.
Render backend
Root directory: server
Build command: npm install
Start command: npm start
Health check: /health
Configure NODE_ENV=production, MONGODB_URI, JWT_SECRET,
CLIENT_URL, COOKIE_SECURE=true, and COOKIE_SAME_SITE=none.
Configure SMTP variables if password-reset emails are needed.
Vercel frontend
Root directory: client
Build command: npm run build
Output directory: dist
Configure VITE_API_URL to the backend API URL ending in /api/v1
and VITE_SOCKET_URL to the backend origin.

For production, make sure CLIENT_URL exactly matches the frontend
origin. Cross-site cookie restrictions may cause a successful login to
be followed by a 401 response from the current-user endpoint. Using
frontend and backend custom domains under the same parent domain can
improve cookie compatibility.

11. Known limitations
The project has not yet been run, tested, or built.
Sample YouTube links are unverified.
No payment gateway or paid-course checkout.
Password-reset email requires SMTP.
Study-room messages are not saved.
Real-time presence is held in memory; horizontal scaling needs
shared presence storage and Socket.IO coordination.
No automated frontend tests.

Recommended first step: configure server/.env and client/.env,
install dependencies in both folders, run the backend tests, build the
frontend, and fix any errors before adding new features.