from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models  # noqa: F401 – ensures tables are registered

from routers import hospitals, tenders, bids, analytics, auth, audit

from fastapi.staticfiles import StaticFiles
import os

# Create uploads directory if it doesn't exist
if not os.path.exists("uploads"):
    os.makedirs("uploads")

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Hospital Tender Dashboard API Pro",
    version="2.0.0",
    description="REST API for managing hospital procurement tenders, bids, and audit logs with RBAC.",
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS – allow Angular dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(hospitals.router)
app.include_router(tenders.router)
app.include_router(bids.router)
app.include_router(analytics.router)
app.include_router(audit.router)


@app.get("/")
def root():
    return {"message": "Hospital Tender Dashboard API", "docs": "/docs"}
