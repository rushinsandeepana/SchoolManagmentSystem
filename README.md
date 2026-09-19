# School Management System

Mini school management application built with **React**, **Spring Boot**, and **PostgreSQL**.

Admins manage teachers and period assignments. Teachers view their weekly timetable, open each period for activities/files/notes, and can change their password. The UI is mobile-responsive and supports dark/light mode plus English/Sinhala.

---

## Prerequisites

Install these before you start:

| Tool | Version | Check command |
|------|---------|---------------|
| Java JDK | 21+ | `java -version` |
| Apache Maven | 3.9+ | `mvn -v` |
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| PostgreSQL | 14+ | `psql --version` |

---

## 1. Clone / open the project

```bash
cd SchoolManagmentSystem
```

Project layout:

```
SchoolManagmentSystem/
├── backend/     # Spring Boot API (port 8080)
├── frontend/    # React app (port 5173)
└── README.md
```

---

## 2. Set up PostgreSQL

### Create the database

Open `psql` (or pgAdmin) and run:

```sql
CREATE DATABASE school_management;
```

If your PostgreSQL user is not `postgres`, create a user or use your existing credentials.

### Configure backend database settings

Copy `backend/.env.example` to `backend/.env` and set your local values:

```dotenv
DB_URL=jdbc:postgresql://localhost:5433/school_management
DB_USERNAME=postgres
DB_PASSWORD=your-postgres-password
JWT_SECRET=replace-with-a-long-random-secret
```

Spring Boot imports this file through `application.yml`. Tables are created automatically on first startup (`ddl-auto: update`). Demo users are seeded automatically.

---

## 3. Run the backend

Open a terminal:

```bash
cd backend
mvn spring-boot:run
```

Wait until you see that Spring Boot has started.

- API base URL: **http://localhost:8080**
- Health check example: open `http://localhost:8080/api/auth/login` (POST only — browser GET will show an error, which is normal)

Uploaded files are stored in `backend/uploads/`.

**Keep this terminal running.**

---

## 4. Run the frontend

Open a **second** terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend settings are in `frontend/.env`:

```dotenv
VITE_PORT=5173
VITE_BACKEND_URL=http://localhost:8080
VITE_API_BASE_URL=/api
```

- App URL: **http://localhost:5173**

Axios reads `VITE_API_BASE_URL` and sends requests to `/api`. During development, Vite proxies that path to `VITE_BACKEND_URL`, so the browser and frontend still use one origin and CORS is not normally involved. The backend separately reads `CORS_ALLOWED_ORIGINS` for direct frontend-to-backend requests.

**Keep this terminal running** while you use the app.

---

## 5. Log in

Open **http://localhost:5173** in your browser.

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Teacher | `teacher1` | `teach123` |
| Teacher | `teacher2` | `teach123` |

After login:

- **Admin** → dashboard, manage teachers, assign periods, notes
- **Teacher** → weekly schedule, period details, notes, change password

Use the top bar to switch **Dark/Light** mode and **English/Sinhala**.

---

## Quick start (summary)

```bash
# Terminal 1 — database must already exist
cd backend
mvn spring-boot:run

# Terminal 2
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173 and sign in with `admin` / `admin123`.

---

## Optional: production-style frontend build

```bash
cd frontend
npm run build
npm run preview
```

For a real deployment, host the `frontend/dist` build behind a web server and point API calls to your Spring Boot server.

For a separate frontend and backend in production, set `frontend/.env` to the public API URL, for example `VITE_API_BASE_URL=https://api.example.com/api`. Set the backend `CORS_ALLOWED_ORIGINS` to the public frontend URL. `VITE_*` values are bundled into browser JavaScript, so never put passwords or JWT secrets in the frontend `.env` file.

---

## Troubleshooting

| Problem | What to check |
|---------|----------------|
| Backend fails to start with DB connection error | PostgreSQL is running; database `school_management` exists; username/password in `application.yml` match your install |
| Frontend cannot log in / network errors | Backend is running on port 8080; frontend is on 5173; no firewall blocking localhost |
| Port already in use | Stop the other process using 8080 or 5173, or change `server.port` / Vite `server.port` |
| Blank page after login | Hard-refresh the browser; confirm you used a demo account or a teacher created by admin |
| File upload fails | File under 50MB; backend folder is writable (`backend/uploads`) |

---

## Main features

- **Admin**: create teachers with username/password, manage teachers, assign mandatory / relief / free periods, performance dashboard, monthly calendar
- **Teacher**: view weekly schedule (8 periods per day, Mon–Fri), open a period for activity text, notes, and uploads (PDF/images/video), change password
- **Shared UI**: responsive for mobile and desktop, dark/light theme, English ↔ Sinhala
