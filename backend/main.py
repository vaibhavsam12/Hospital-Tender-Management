from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models  # noqa: F401 – ensures tables are registered

import os, sys
# Ensure backend directory is in path
sys.path.append(os.path.dirname(__file__))

import auth_utils
from routers import (
    hospitals, tenders, bids, analytics, auth, 
    audit, notifications, clarifications, settings, billing
)
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

# Create uploads directory if it doesn't exist
if not os.path.exists("uploads"):
    os.makedirs("uploads")

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hospital Tender Management API")

# app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads") # Secure: replaced by authenticated stream

# CORS – allow Angular dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200", 
        "http://127.0.0.1:4200", 
        "http://localhost:4201",
        "http://127.0.0.1:4201",
        "http://localhost:55252"
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"GLOBAL ERROR: {exc}") # Log it
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Our team has been notified."},
    )

app.include_router(hospitals.router)
app.include_router(tenders.router)
app.include_router(bids.router)
app.include_router(analytics.router)
app.include_router(audit.router)
app.include_router(notifications.router)
app.include_router(clarifications.router)
app.include_router(auth.router)
app.include_router(settings.router)
app.include_router(billing.router)


@app.get("/")
def read_root():
    return {"message": "Hospital Tender Management API", "docs": "/docs"}
