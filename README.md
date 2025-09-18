# Fasting Tracker – Backend (Node.js + Express + MongoDB)

## Overview
This is the **backend API** for the **Fasting Tracker** project.  
It provides secure authentication, fasting session management, goals, and statistics endpoints.  
The backend is built with **Node.js, Express, and MongoDB (Mongoose)**.

---

## Features
-  **JWT Authentication** (signup, login, protected routes)
-  **Fasting Sessions API** (start, stop, list history)
   **Goals API** (set, update, delete weekly/monthly targets)
-  **Statistics API** (calculate progress and streaks)
-  **Security Middleware** (Helmet, CORS, Rate limiting, Error handling)

---

##  Tech Stack
- **Node.js 20+**
- **Express.js**
- **MongoDB + Mongoose**
- **JWT (jsonwebtoken)**
- **bcrypt** (password hashing)
- **helmet, cors, morgan, express-rate-limit**

---

##  Project Structure
```bash
src/
 ├─ models/         # Mongoose models (User, Fast, Goal)
 ├─ routes/         # Express routes (auth, fasts, goals, stats)
 ├─ controllers/    # Business logic for each route
 ├─ middleware/     # Auth middleware, error handler, rate limit
 ├─ utils/          # Helper functions
 ├─ server.js       # App entry point
 └─ config/         # DB connection, env setup
API Endpoints
## Auth
POST /auth/signup
POST /auth/login
GET /auth/verify
## fasts
GET /fasts
POST /fasts (start new fast)
PUT /fasts/:id (stop fast)
##Goals
GET /goals
POST /goals
DELETE /goals/:id
##Stats
GET /stats/summary
GET /stats/progress
