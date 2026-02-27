<!-- # API Contracts

## GET /api/tenders

### Query Parameters
- page (number)
- limit (number)
- status (string)
- category (string)
- search (string)
- deadline_from (date)
- deadline_to (date)

### Response

{
  data: Tender[],
  total: number,
  page: number,
  total_pages: number
}

---

## POST /api/bids
- Accepts form-data
- Supports file upload
- Linked to tender_id -->

# Database Schema

The development database uses SQLite.

## Core Tables

### users
- id
- email
- hashed_password
- role

### tenders
- id
- title
- description
- category
- budget
- deadline
- status
- created_by

### bids
- id
- tender_id (FK)
- vendor_id (FK)
- amount
- quotation_url

### audit_logs
- id
- user_id
- action
- table_name
- record_id
- timestamp

### clarifications
- id
- tender_id
- question
- response

### notifications
- id
- user_id
- message
- is_read

## Relationships

- One Tender → Many Bids
- One User → Many Audit Logs
- One Tender → Many Clarifications
- One User → Many Notifications