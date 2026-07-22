from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.database import Base, engine, SessionLocal
from app.routers import auth, admin, results
from app.seed import seed_defaults

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Result Portal API",
    description="Backend API for the Student Result Portal (login, result search, admin upload).",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(results.router)


@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_defaults(db)
    finally:
        db.close()


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok"}
