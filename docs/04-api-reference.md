# API Reference

## Authentication

POST /auth/login  
POST /auth/register  

---

## Tenders

GET /tenders  
POST /tenders  
PUT /tenders/{id}  
GET /tenders/{id}  

Supports filtering:
- page
- limit
- status
- category
- search

---

## Bids

POST /bids  
GET /bids/tender/{tender_id}  

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