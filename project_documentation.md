# Hospital Tender Management System - Project Documentation

## 📌 Project Overview
The **HealthTender Pro** is an enterprise-grade, **Multi-Tenant SaaS platform** designed to digitize healthcare procurement workflows. It features a robust multi-tenant architecture, an AI-driven bid prediction engine, and a comprehensive monetization system.

---

## 🏗️ Tech Stack

### 🔹 Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (`project_pro.db`) with SQLAlchemy ORM
- **Authentication**: JWT-based authentication with Role-Based Access Control (RBAC).

### 🔹 Frontend
- **Framework**: Angular 17 (Standalone Components)
- **UI Library**: Angular Material
- **Data Visualization**: Chart.js (for analytics dashboards)
- **PDF Generation**: jsPDF & jsPDF-AutoTable (for reports and bid exports)

---

## 🔗 Core Functionalities

### 1️⃣ Role-Based Access Control (RBAC)
The system supports multiple user roles, each with specific permissions:
- **Admin**: Full control over hospitals, users, and system settings.
- **Officer/Finance**: Can create and manage tenders, review bids, and award contracts.
- **Vendor**: Can view open tenders, submit bids, and ask for clarifications.
- **Viewer**: Read-only access to public tenders and dashboard analytics.

### 2️⃣ Hospital & Tender Management
- **Hospitals**: Admins can manage hospital entities (Government, Private, Trust).
- **Tender Lifecycle**: Create, update, publish, and close tenders. Tenders are categorized (Equipment, Drugs, Services, IT) and tracked through statuses (Open, Closed, Awarded).

### 3️⃣ Bid Management & L1 Detection
- **Submission**: Vendors can submit priced bids along with quotation PDF uploads.
- **Evaluation**: The system automatically detects the lowest bidder (L1).
- **Awarding**: Authorized personnel can award the tender to the winning bid.

### 4️⃣ Q&A / Clarifications
- Vendors can ask questions regarding specific tenders before bidding.
- Procurement officers can provide public answers to maintain transparency.

### 5️⃣ Real-Time Analytics & Dashboard
- Visual dashboards for tracking budget distribution by category.
- Metrics for project status insights and vendor performance overviews.

### 6️⃣ Audit Trail & Notifications
- **System Logging**: All critical actions (e.g., updating tender status, awarding bids) are logged in the `audit_logs` table for compliance and transparency.
### 7️⃣ Multi-Tenant Architecture
- **Data Isolation**: Strict row-level isolation using `organization_id` ensures that each organization's data remains private and secure.
- **SaaS Ready**: Capable of supporting thousands of independent organizations on a single deployment.

### 8️⃣ AI-Driven Bid Prediction
- **Competitive Insights**: Proprietary algorithm analyzes historical winning bids to provide vendors with "L1 Prediction" insights.
- **Confidence Scoring**: Dynamic confidence metrics based on historical data density.

### 9️⃣ Monetization & SaaS Billing
- **Subscription Tiers**: Built-in support for Free, Pro, and Enterprise plans.
- **Transaction Logs**: Integrated tracking for all monetary transactions and subscription status.

---

## 🗃️ Database Architecture (Key Entities)
1. **Users (`users`)**: Stores credentials and roles.
2. **Hospitals (`hospitals`)**: Stores basic hospital demographic details.
3. **Tenders (`tenders`)**: Stores active and past procurement requirements.
4. **Bids (`bids`)**: Stores vendor submissions tied to specific tenders.
5. **Clarifications (`clarifications`)**: Q&A tied to tenders and users.
6. **Audit Logs (`audit_logs`)** & **Notifications (`notifications`)**: Tracks system compliance and user alerts.

---

## 📂 Project Structure
```text
Health Care/
│
├── backend/                  # FastAPI Application
│   ├── main.py               # Application entry point
│   ├── models.py             # SQLAlchemy Database Models
│   ├── schemas.py            # Pydantic schemas for request/response validation
│   ├── database.py           # DB connection setup
│   ├── crud.py               # Core database operations
│   ├── routers/              # API Endpoints (auth, tenders, hospitals, analytics, etc.)
│   ├── services/             # Background tasks and complex logic
│   └── uploads/              # Stored PDFs and vendor quotation files
│
├── frontend/                 # Angular 17 Application
│   ├── src/                  # Standalone components, services, guards, and interceptors
│   ├── package.json          # Node dependencies
│   └── angular.json          # Angular workspace configurations
│
├── scripts/                  # Utility and DB migration scripts
└── README.md                 # Project vision and setup instructions
```

## 🚀 How to Run Locally

**Backend**:
```bash
cd backend
uvicorn main:app --reload
# Runs on http://127.0.0.1:8000
```

**Frontend**:
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:4200
```
