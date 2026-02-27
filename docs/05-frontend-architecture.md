# Frontend Architecture

The frontend is built using Angular 17 with standalone components.

## Structure

src/app/

models/
- models.ts

pages/
- dashboard
- tenders
- tender-detail
- my-bids
- analytics
- audit-trail
- login

## Routing

Defined in app.routes.ts

Each module is a standalone component.

## Responsibilities

tenders.component
- Fetch tender data
- Manage filters
- Handle pagination

tender-detail.component
- Show tender details
- Display bids
- Manage status updates

analytics.component
- Display dashboard insights
- Category breakdown charts

audit-trail.component
- Display system action logs