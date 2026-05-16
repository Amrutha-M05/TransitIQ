# 🚌 TransitIQ — Smart Public Transport Feedback & Delay Analysis Portal

A full-stack final-year project built with **React 18 (Vite)** + **Node.js (Express)** + **MongoDB** — featuring an **AI-powered Commute Companion** driven by OpenAI GPT-4o-mini.

---

## ✨ Key Features

- 📝 **Feedback System** — Passengers submit route-level feedback with ratings, categories, and photo attachments
- ⏱️ **Delay Reporting** — Real-time delay reports with crowd-level tagging and community upvotes
- 📊 **Admin Analytics** — Visual dashboards with summary stats, delay trends (Recharts), and moderation tools
- 🤖 **AI Commute Companion** — Personalized, GPT-powered chat assistant that analyzes each user's travel history to provide pattern insights, travel tips, and smart suggestions
- 📋 **Live Delay Board** — Public, real-time delay board viewable without login
- 🔐 **Role-Based Access** — JWT authentication with `passenger` and `admin` roles

---

## 🗂 Folder Structure

```
transport-portal/
├── README.md
├── backend/
│   ├── middleware/        auth.js (JWT + adminOnly)
│   ├── models/            User, Route, Stop, Bus, Feedback, DelayReport
│   ├── routes/            auth, feedback, delay, routes, stops, buses,
│   │                      analytics, users, aiCompanion
│   ├── uploads/           (Multer image storage)
│   ├── server.js
│   ├── seed.js
│   └── .env.example
└── frontend/
    └── src/
        ├── components/
        │   ├── Layout.jsx        (Passenger layout)
        │   ├── AdminLayout.jsx   (Admin sidebar layout)
        │   └── ui/CrudTable.jsx  (Reusable CRUD table)
        ├── context/       AuthContext.jsx
        ├── pages/
        │   ├── public/    Landing, DelayBoard
        │   ├── auth/      Login, Signup
        │   ├── passenger/ Dashboard, SubmitFeedback, ReportDelay,
        │   │              MySubmissions, Profile, AICompanion
        │   └── admin/     Dashboard, ManageRoutes, ManageStops,
        │                  ManageBuses, ManageFeedback, ManageDelays,
        │                  ManageUsers
        └── utils/         api.js
```

---

## ⚙️ Setup Instructions

### Prerequisites

- **Node.js** v18+
- **MongoDB** running locally (or a MongoDB Atlas URI)
- **OpenAI API key** (for the AI Companion feature)

---

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGO_URI, JWT_SECRET, and OpenAI keys
npm run dev
```

The backend runs on: `http://localhost:5000`

#### Seed Sample Data

```bash
npm run seed
```

This creates:

- **Admin:** admin@transit.com / admin123
- **Passenger:** riya@example.com / user123
- 5 routes, 8 stops, 5 buses, sample feedback & delay reports

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev -- --host
npm run build
```

The frontend runs on: `http://localhost:5173`

> The Vite proxy is pre-configured to forward `/api` and `/uploads` to `http://localhost:5000`.

---

## 🔑 Environment Variables (backend/.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/transport_portal
JWT_SECRET=your_super_secret_jwt_key_change_this
NODE_ENV=development

# OpenAI API Keys (required for AI Companion)
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_ORG_ID=org-your-organization-id-here
OPENAI_PROJECT_ID=proj_your-project-id-here
```

> Copy `.env.example` to `.env` and fill in your actual keys.

---

## 📌 API Reference

### Auth

| Method | Endpoint           | Auth     | Description      |
| ------ | ------------------ | -------- | ---------------- |
| POST   | /api/auth/signup   | ❌       | Register user    |
| POST   | /api/auth/login    | ❌       | Login            |
| GET    | /api/auth/me       | ✅       | Get current user |
| PATCH  | /api/auth/me       | ✅       | Update profile   |

### Feedback

| Method | Endpoint                    | Auth     | Description              |
| ------ | --------------------------- | -------- | ------------------------ |
| POST   | /api/feedback               | ✅       | Submit feedback (multipart) |
| GET    | /api/feedback/my            | ✅       | My submissions           |
| GET    | /api/feedback               | ✅ Admin | All feedback             |
| PATCH  | /api/feedback/:id/status    | ✅ Admin | Approve/hide             |

### Delay Reports

| Method | Endpoint                    | Auth     | Description          |
| ------ | --------------------------- | -------- | -------------------- |
| POST   | /api/delay                  | ✅       | Submit delay report  |
| GET    | /api/delay/my               | ✅       | My reports           |
| GET    | /api/delay/public           | ❌       | Public delay board   |
| GET    | /api/delay                  | ✅ Admin | All reports          |
| POST   | /api/delay/:id/upvote       | ✅       | Toggle upvote        |
| PATCH  | /api/delay/:id/status       | ✅ Admin | Update status        |

### AI Companion

| Method | Endpoint                    | Auth | Description                           |
| ------ | --------------------------- | ---- | ------------------------------------- |
| POST   | /api/ai-companion/chat      | ✅   | Send message (uses user history as context) |
| POST   | /api/ai-companion/clear     | ✅   | Clear conversation session            |
| GET    | /api/ai-companion/insights  | ✅   | Get AI-generated commute insights     |

### CRUD (Admin)

- `/api/routes` — GET, POST, PUT/:id, DELETE/:id
- `/api/stops` — GET, POST, PUT/:id, DELETE/:id
- `/api/buses` — GET, POST, PUT/:id, DELETE/:id
- `/api/users` — GET, PATCH/:id/role

### Analytics (Admin)

- GET `/api/analytics/summary` — Totals + avg rating
- GET `/api/analytics/delay-trends` — Charts data

---

## 🎨 Tech Stack

| Layer       | Technology                                  |
| ----------- | ------------------------------------------- |
| Frontend    | React 18, Vite, React Router v6             |
| Styling     | Tailwind CSS 3 (Apple-style UI)             |
| Charts      | Recharts                                    |
| Markdown    | react-markdown + remark-gfm                 |
| Icons       | Lucide React                                |
| Backend     | Node.js, Express                            |
| Database    | MongoDB, Mongoose                           |
| Auth        | JWT + bcryptjs                              |
| AI          | OpenAI GPT-4o-mini (chat + insights)        |
| File Upload | Multer (local disk)                         |
| Dev Tools   | Nodemon, Vite HMR                           |

---

## 🤖 AI Commute Companion

The AI Companion is a standout feature that sets TransitIQ apart from generic transit apps:

- **Personalized Chat** — Uses each passenger's submitted feedback and delay reports as context for GPT-4o-mini conversations
- **Pattern Analysis** — Detects recurring issues (e.g., "Route 15 is always delayed on weekdays")
- **Smart Suggestions** — Recommends better departure windows based on historical delay data
- **Auto Insights** — Generates weekly AI-powered commute insight cards (pattern, warning, tip, positive)
- **Formatted Responses** — AI replies rendered with full markdown support (bold, lists, tables, code blocks)

---

## 👥 Roles & Permissions

| Feature                   | Passenger   | Admin |
| ------------------------- | ----------- | ----- |
| Submit feedback           | ✅          | ✅    |
| Report delays             | ✅          | ✅    |
| Upvote delays             | ✅          | ✅    |
| View live delay board     | ✅ (public) | ✅    |
| AI Commute Companion      | ✅          | ✅    |
| Analytics dashboard       | ❌          | ✅    |
| Manage routes/stops/buses | ❌          | ✅    |
| Moderate feedback         | ❌          | ✅    |
| Manage users & roles      | ❌          | ✅    |

---

## 📜 MongoDB Commands

// List all databases
show dbs

// Use your project's database
use transport_portal

// List collections
show collections

// View all documents in a collection
db.users.find().pretty()
db.feedbacks.find().pretty()
db.delayreports.find().pretty()
db.routes.find().pretty()

// Count documents
db.users.countDocuments()

// Find specific document
db.users.findOne({ email: "admin@transit.com" })

// Find with filter
db.feedbacks.find({ status: "pending" }).pretty()
