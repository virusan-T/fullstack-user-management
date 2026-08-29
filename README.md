# Full-Stack User Management System

A full-stack user management application with user registration, JWT-based authentication, profile management, user listing, and account deletion.

## 🚀 Live Demo

**Frontend:**
[https://fullstack-user-management-ten.vercel.app](https://fullstack-user-management-ten.vercel.app)

**Backend:**
[https://fullstack-user-management-2dbc.onrender.com](https://fullstack-user-management-2dbc.onrender.com)

**GitHub:**
[https://github.com/virusan-T/fullstack-user-management](https://github.com/virusan-T/fullstack-user-management)

---

## 🛠️ Tech Stack

### Frontend

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS

### Backend

* NestJS
* TypeScript
* MongoDB
* Mongoose
* JWT
* Passport
* bcrypt

### Deployment

* Vercel — Frontend
* Render — Backend
* MongoDB Atlas — Database

---

## ✨ Features

* User registration
* User login
* JWT authentication
* HTTP-only authentication cookies
* Access token and refresh token
* Protected dashboard
* View current user profile
* Update name and email
* View all registered users
* Display user name, email, and creation date
* Logout
* Delete own account
* Password hashing using bcrypt
* Request validation
* CORS configuration
* Swagger API documentation

---

# 📁 Project Structure

```text
software-engineer-assessment/
│
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── package.json
│   └── next.config.ts
│
└── README.md
```

---

# ⚙️ Local Setup

## 1. Clone the repository

```bash
git clone git@github.com:virusan-T/fullstack-user-management.git
cd software-engineer-assessment
```

---

# 🔐 Backend Setup

Go to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Configure the `.env` file:

```env
MONGODB_URI=your_mongodb_atlas_connection_string

JWT_SECRET=your_access_token_secret

JWT_REFRESH_SECRET=your_refresh_token_secret

FRONTEND_URL=http://localhost:3000

NODE_ENV=development

PORT=3001
```

Start the backend in development mode:

```bash
npm run start:dev
```

The backend will run on:

```text
http://localhost:3001
```

---

# 💻 Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
touch .env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the frontend:

```bash
npm run dev
```

The frontend will run on:

```text
http://localhost:3000
```

---

# 🔑 Authentication

The application uses JWT-based authentication.

After successful login:

```text
Access Token
       +
Refresh Token
       ↓
HTTP-only cookies
```

The tokens are not stored in `localStorage`.

Protected endpoints use the authentication cookie to identify the logged-in user.

---

# 🔒 Security

The application includes:

* Password hashing with `bcrypt`
* JWT authentication
* HTTP-only cookies
* Secure cookies in production
* SameSite cookie configuration
* Protected API routes using `JwtAuthGuard`
* Input validation using NestJS `ValidationPipe`
* CORS configuration
* MongoDB Atlas connection

Sensitive environment variables are not committed to the repository.

---

# 📡 API Endpoints

## Authentication

| Method | Endpoint        | Description                    |
| ------ | --------------- | ------------------------------ |
| POST   | `/auth/login`   | Login user                     |
| POST   | `/auth/refresh` | Refresh authentication tokens  |
| POST   | `/auth/logout`  | Logout user                    |
| GET    | `/auth/me`      | Get current authenticated user |

## Users

| Method | Endpoint     | Description        |
| ------ | ------------ | ------------------ |
| POST   | `/users`     | Register user      |
| GET    | `/users`     | Get all users      |
| GET    | `/users/:id` | Get user by ID     |
| PATCH  | `/users/:id` | Update user        |
| DELETE | `/users/:id` | Delete own account |

---

# 📖 API Documentation

Swagger documentation is available from the backend at:

```text
http://localhost:3001/api
```

For the deployed backend:

```text
YOUR_RENDER_URL/api
```

---

# 🌐 Deployment

## Frontend — Vercel

The Next.js frontend is deployed using Vercel.

Production environment variable:

```env
NEXT_PUBLIC_API_URL=YOUR_RENDER_BACKEND_URL
```

## Backend — Render

The NestJS backend is deployed using Render.

Production environment variables:

```env
MONGODB_URI=your_mongodb_atlas_connection_string

JWT_SECRET=your_access_token_secret

JWT_REFRESH_SECRET=your_refresh_token_secret

FRONTEND_URL=https://fullstack-user-management-ten.vercel.app

NODE_ENV=production

PORT=10000
```

> The actual secret values should be configured only in Vercel/Render environment variables and should never be committed to GitHub.

---

# 🧪 Build

### Backend

```bash
cd backend
npm run build
```

Run production build:

```bash
npm run start:prod
```

### Frontend

```bash
cd frontend
npm run build
```

---

# 👤 Application Flow

```text
                    ┌──────────────┐
                    │    User      │
                    └──────┬───────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │ Next.js Frontend │
                 │     Vercel       │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │  NestJS Backend  │
                 │     Render       │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │  MongoDB Atlas   │
                 └──────────────────┘
```

### Login Flow

```text
User enters email/password
          ↓
POST /auth/login
          ↓
Validate credentials
          ↓
Compare password with bcrypt
          ↓
Generate JWT tokens
          ↓
Store tokens in HTTP-only cookies
          ↓
Redirect to dashboard
          ↓
GET /auth/me
          ↓
Display user dashboard
```

---

# 📌 Environment Variables

## Backend `.env.example`

```env
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
FRONTEND_URL=
NODE_ENV=development
PORT=3001
```

## Frontend `.env.example`

```env
NEXT_PUBLIC_API_URL=
```

---

# ⚠️ Important

Never commit:

```text
.env
.env.local
cookies.txt
```

to GitHub.

Only commit:

```text
.env.example
```

with empty/example values.

---

# 👨‍💻 Author

**Virusan T**

Software Engineering Assessment — Full-Stack User Management System.
