# API Reference

## Authentication

POST /auth/login  
POST /auth/register  

---

## Projects

GET /projects  
POST /projects  
PUT /projects/{id}  
GET /projects/{id}  

Supports filtering:
- page
- limit
- status
- category
- search

---

## Bids

POST /bids  
GET /bids/project/{project_id}  

---

## Audit Logs

GET /audit-logs  

---

## Analytics

GET /analytics/summary  
GET /analytics/budget-by-category  

---

## Notifications

GET /notifications  
PUT /notifications/{id}/read  