# Frontend Architecture

The frontend is built using Angular 17 with standalone components.

## Structure

src/app/

models/
- models.ts

pages/
- dashboard
- projects
- project-detail
- my-bids
- analytics
- audit-trail
- login

## Routing

Defined in app.routes.ts

Each module is a standalone component.

## Responsibilities

projects.component
- Fetch project data
- Manage filters
- Handle pagination

project-detail.component
- Show project details
- Display bids
- Manage status updates

analytics.component
- Display dashboard insights
- Category breakdown charts

audit-trail.component
- Display system action logs