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

**AI question generation:** The super admin can add multiple AI providers from the system settings page. Each provider supports either Gemini API or an OpenAI-compatible endpoint, with an encrypted key, custom base URL, and optional model; when the model is blank, the backend discovers a suitable model from the provider. Set `APP_ENCRYPTION_KEY` in Render to a long random secret; it is required to encrypt saved keys. Existing `GEMINI_API_KEY` and `GROK_API_KEY` environment variables remain supported as a legacy fallback. Never put API keys in frontend files or commit them.

Built by ALSayed Omer - aspiring Computer Science student, Fall 2027.
