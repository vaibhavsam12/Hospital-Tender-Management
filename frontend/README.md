# 🏥 Organization Project Management Platform

A role-based healthcare procurement management system designed to digitize organization project workflows, vendor coordination, and procurement analytics.

The platform centralizes project lifecycle management and aims to evolve into a data-driven procurement intelligence system.

---

## 🚀 Vision

Organizations often manage procurement using fragmented systems or manual processes.  
This platform provides a structured, secure, and scalable solution to:

- Manage projects end-to-end
- Coordinate vendor bidding
- Compare bids intelligently
- Track procurement analytics
- Maintain audit-ready logs

Long-term goal: Build an intelligent procurement platform powered by analytics and predictive insights.

---

## 🧩 Core Features

### 🔐 Authentication & Access Control
- JWT-based authentication
- Role-Based Access Control (Admin / Vendor / Finance)
- Protected frontend routes and backend endpoints

### 📄 Project Lifecycle Management
- Create, update, and publish projects
- Status tracking (Draft, Open, Closed, Awarded)
- Multi-stage workflow handling

### 💰 Bid Management
- Vendor bid submission
- File upload support
- L1 (Lowest Bidder) detection
- Structured bid comparison

### 📊 Analytics Dashboard
- Budget distribution by category
- Project status insights
- Vendor performance overview
- Procurement trend visualization

### 🧾 Audit Trail
- System action logging
- User-based activity tracking
- Compliance-friendly logs

### 🔎 Filtering & Pagination
- API-driven filtering
- Search functionality
- Category & status filters
- Pagination support

---

## 🏗 Tech Stack

### Frontend
- Angular 17 (Standalone Components)
- Angular Material
- Responsive UI architecture
- Modular component design

### Backend
- REST API architecture
- JWT Authentication
- Role-based middleware
- File upload handling
- Audit logging layer

### Database
- Relational SQL schema
- Optimized queries for filtering and pagination

---

## 📂 Project Structure
Organization-Project-Management/
│
├── backend/ # API layer, authentication, models, business logic
├── frontend/ # Angular application
├── scripts/ # Utility scripts
└── README.md


---

## 🛠 Development Setup

### 1️⃣ Clone the Repository

```bash
git clone <your-repo-url>
cd Organization-Project-Management

2️⃣ Backend Setup
cd backend
# Install dependencies
# Configure environment variables
# Start backend server

3️⃣ Frontend Setup
cd frontend
npm install
ng serve

Frontend runs at:
http://localhost:4200