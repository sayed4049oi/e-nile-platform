# E-Nile Platform

An offline-first learning platform built for students in Bahri, Sudan during war-related internet and power cuts.

I built this since 2023 using a phone and old laptop, learning Python and web development by myself.

**Tech:** HTML, CSS, JavaScript, Python (backend folder)
**Why:** Schools were closed after April 2023 war. I wanted to create a platform that works with low internet for my community in East Nile / Bahri.

**Live Demo:** (will be added via GitHub Pages)

**How to run locally:**

1. Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI` and `JWT_SECRET`.
2. Run `cd backend && npm install && npm start`.
3. Open `http://localhost:4000`.

The frontend is served by the backend so that API requests and the static files use the same origin.

**AI question generation:** The super admin can add any number of OpenAI-compatible AI APIs from the system settings page. Only the API name, base URL, and key are required; the model is optional and is discovered automatically when the provider exposes `/models`. Choose whether to use one active provider or all active providers together. Keys are encrypted with `APP_ENCRYPTION_KEY` and are never returned in full or committed to the project.

**Languages and scrolling:** The interface supports Arabic and English from the fixed language control. The selected language is stored per browser, updates document direction (`rtl`/`ltr`), and the admin/student/exam layouts remain vertically scrollable on desktop and mobile.

Built by ALSayed Omer - aspiring Computer Science student, Fall 2027.
