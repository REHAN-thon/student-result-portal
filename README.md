# Student Result Portal

A production-ready Student Result Portal: students sign in, search their Semester IV
result by Roll Number, and view/download/print the result PDF. Admins sign in
separately to upload each student's result PDF.

Built with:

- **Frontend** — React, TypeScript, Vite, Tailwind CSS, React Router
- **Backend** — FastAPI, SQLAlchemy, SQLite, JWT Authentication

---

## 1. Project Structure

```
student-result-portal/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS, router registration
│   │   ├── config.py          # Environment-driven settings
│   │   ├── database.py        # SQLAlchemy engine/session
│   │   ├── models.py          # User, Admin, StudentResult tables
│   │   ├── schemas.py         # Pydantic request/response models
│   │   ├── security.py        # Password hashing + JWT helpers
│   │   ├── deps.py            # Role-based auth guards
│   │   ├── seed.py            # Seeds default student/admin accounts
│   │   └── routers/
│   │       ├── auth.py        # Student login
│   │       ├── admin.py       # Admin login + result upload/list/delete
│   │       └── results.py     # Student result search + PDF download
│   ├── uploads/results/       # Uploaded result PDFs are stored here
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/              # Login, Dashboard, ResultSearch, ResultPreview,
│   │   │                       # AdminLogin, AdminDashboard, NotFound, ServerError,
│   │   │                       # AccessDenied
│   │   ├── components/         # Seal, Spinner, Skeleton, ProtectedRoute, ErrorBoundary
│   │   ├── context/             # AuthContext, ToastContext
│   │   └── api/client.ts        # Typed fetch wrapper
│   ├── nginx.conf              # Used by the production Docker image
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 2. How it works

1. **Login** (`/login`) — a student signs in with a **User ID** and **Password**.
2. **Dashboard** (`/dashboard`) — shows a single card: *Semester IV Examination Result*.
3. **Result Search** (`/results/semester-4`) — the student enters their **Roll Number**.
4. **Result Preview** — if a result exists for that Roll Number, the PDF is displayed
   inline in the browser with **Download PDF**, **Print**, and **Back** actions. If not,
   the page shows **"Result not found."**
5. **Admin Panel** (`/admin/login` → `/admin/dashboard`) — a separate login for admins.
   Admins upload a PDF along with the **Student Name** and **Roll Number**; this is
   stored in SQLite and served back to students who search that Roll Number. Admins can
   also see the list of uploaded results and delete any of them.

### Default seed accounts

On first startup the backend automatically creates one student account and one admin
account so you can log in immediately:

| Role    | User ID   | Password      |
|---------|-----------|---------------|
| Student | `student` | `student123`  |
| Admin   | `admin`   | `admin123`    |

**Change these** (via the environment variables below) before deploying anywhere real.

---

## 3. Running locally (without Docker)

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

The API is now running at `http://127.0.0.1:8000`. Interactive docs are available at
`http://127.0.0.1:8000/docs`.

Optional: copy `backend/.env.example` to `backend/.env` and adjust values, then export
them into your shell (or use a tool like `python-dotenv`) before starting uvicorn.

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies any request to `/api/*`
straight to `http://127.0.0.1:8000`, so no extra configuration is needed in development.

---

## 4. Running with Docker (recommended)

From the project root:

```bash
cp .env.example .env      # adjust SECRET_KEY and seed passwords
docker compose up --build
```

- Frontend (nginx, serving the production build and proxying `/api`): `http://localhost:8080`
- Backend (FastAPI, also reachable directly): `http://localhost:8000`

Uploaded PDFs and the SQLite database are stored in named Docker volumes
(`backend-uploads`, `backend-data`) so they persist across `docker compose down` /
`up` cycles. To wipe all data, run `docker compose down -v`.

To stop the stack:

```bash
docker compose down
```

---

## 5. Deployment notes

- **Backend**: any host that can run a Docker container or a Python/ASGI process
  (Uvicorn/Gunicorn behind a reverse proxy) works. Set `SECRET_KEY`, `CORS_ORIGINS`,
  and the seed-account variables via real environment variables/secrets — never commit
  a `.env` file. For anything beyond a single instance, swap `DATABASE_URL` to a
  managed Postgres/MySQL instance (SQLAlchemy makes this a connection-string change).
- **Frontend**: the `frontend/Dockerfile` produces a static build served by nginx,
  which also proxies `/api` to the `backend` service name — this only works as written
  inside `docker-compose`'s network. If you deploy the frontend and backend on separate
  hosts, update `frontend/nginx.conf`'s `proxy_pass` target (or serve the static build
  from any static host and point it at your backend's public URL).
- **Uploads**: PDF files are stored on disk under `UPLOAD_DIR`. Mount a persistent
  volume/disk at that path in production so uploads survive redeploys.
- **HTTPS**: put a reverse proxy (nginx, Caddy, or your platform's load balancer) with
  TLS in front of both services in any real deployment.

---

## 6. Security features

- Passwords hashed with bcrypt (`passlib`) — never stored in plain text.
- JWT-based authentication with a configurable expiry (`ACCESS_TOKEN_EXPIRE_MINUTES`).
- Separate roles (`student` / `admin`) enforced on every protected route — a student
  token cannot call admin endpoints and vice versa.
- Server-side validation: required fields, PDF-only uploads, file-size limit, and a
  Roll Number character allow-list.
- CORS is restricted to the configured origin list.

---

## 7. API reference (summary)

| Method | Path                              | Auth          | Description                          |
|--------|-----------------------------------|---------------|---------------------------------------|
| POST   | `/api/auth/login`                 | —             | Student login → JWT                   |
| POST   | `/api/admin/login`                | —             | Admin login → JWT                     |
| POST   | `/api/admin/results`              | Admin         | Upload/replace a result (multipart)   |
| GET    | `/api/admin/results`              | Admin         | List all uploaded results             |
| DELETE | `/api/admin/results/{id}`         | Admin         | Delete a result                       |
| GET    | `/api/results/search?roll_number=`| Student       | Look up a result by Roll Number       |
| GET    | `/api/results/{roll_number}/pdf`  | Student       | Stream the result PDF                 |
| GET    | `/api/health`                     | —             | Health check                          |

Full interactive documentation (Swagger UI) is available at `/docs` while the backend
is running.

---

## 8. Extending this project

- Add self-service student registration and per-student accounts (currently a single
  shared student login gates access, matching the original brief).
- Add pagination/search to the admin results table once the dataset grows.
- Add additional semesters by generalizing the `/results/semester-4` route into
  `/results/:semester`.
