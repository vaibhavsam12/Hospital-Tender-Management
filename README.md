# 🏥 HealthTender Pro: Enterprise SaaS Platform

HealthTender Pro is a premium, **Multi-Tenant SaaS platform** designed for healthcare procurement. It features an AI-driven L1 prediction engine, role-based multi-tenancy, and a comprehensive monetization layer.

---

## 🚀 Key SaaS Features

### 🔐 Multi-Tenancy & RBAC
- **Data Isolation**: Each hospital organization operates in a strictly isolated environment via `organization_id`.
- **RBAC**: Fine-grained roles including System Admin, Procurement Officer, Finance, and Vendor.

### 🤖 AI-Driven Insights
- **L1 Prediction**: Real-time bid analysis predicts the lowest winning bid (L1) using historical category data.
- **Confidence Scoring**: Dynamic assessment of prediction reliability.

### 💰 Monetization
- **Subscription Tiers**: Support for Free, Pro, and Enterprise billing plans.
- **Billing History**: Tracking for transactions and subscription lifecycle.

---

## 🏗 Tech Stack

### Frontend
- **Angular 17** (Standalone Architecture)
- **Angular Material** (Premium Glassmorphic UI)
- **Chart.js** (Procurement Analytics)

### Backend
- **FastAPI** (Python)
- **PostgreSQL** (Production-ready relational DB)
- **SQLAlchemy ORM**
- **Alembic** (Migration Management)

---

## 🛠 Development Setup

### 1️⃣ Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=health_tender_pro
```

### 2️⃣ Backend Setup
```bash
cd backend
pip install -r requirements.txt
python seed.py # Populates demo data
uvicorn main:app --reload
```

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs at: **http://localhost:4200**

---
*Architected for a ₹10 Lakh+ market valuation.*
