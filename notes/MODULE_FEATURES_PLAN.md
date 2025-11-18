# Module Feature Plan

This document tracks the core features we intend to build for each demo vertical. Use it as the implementation checklist.

## Retail POS System (`pos`)
- Product catalog management (CRUD for SKUs, pricing, tax)
- Store inventory balances with restock alerts
- POS order capture and settlement workflow
- Till audit logging and variance tracking
- Multi-store revenue metrics and KPIs
- Promotions and discounts engine (optional)
- Staff activity/audit feed (optional)

## Complete HRMS Solution (`hrms`)
- Employee directory with profile CRUD and org chart
- Leave requests, approval workflow, attendance calendar
- Recruitment pipeline dashboard (jobs, candidates, stages)
- Payroll run management and payslip exports
- Asset issuance & onboarding checklists
- Timesheet/time tracking with approvals
- Policy/document library with version history

## School Management System (`school`)
- Student/guardian enrollment and roster management
- Class & section timetables + teacher assignments
- Attendance capture with alerts and behaviour log
- Fee billing, concessions, payment receipts
- Examination scheduling, grading, and transcripts
- Parent communication hub (notices, messages)
- Co-curricular & transport tracking modules

## Restaurant Ordering System (`restaurant`)
- Digital menu builder (categories, items, modifiers)
- Order aggregation (dine-in, takeaway, delivery)
- Kitchen display system (ticket routing, status)
- Loyalty accounts & automated campaigns
- Table reservation & floor management
- Staff shift scheduling & attendance capture
- Supplier ingredient inventory & procurement

## Appointment Booking System (`booking`)
- Service catalog and provider availability setup
- Appointment creation, reschedule, cancellation flow
- Intake forms per service with stored responses
- Payment/deposit capture and outstanding balances
- Waitlist automation for filled or cancelled slots
- Reminder and recall notifications (SMS/email)
- Reporting on no-shows, utilisation, revenue

## Business CRM System (`crm`)
- Deal pipeline with stage transitions and Kanban view
- Contact/account management and ownership rules
- Communication logging (emails, calls, meetings)
- Forecasting (commit vs best-case) and dashboards
- Tasks, sequences, and outbound automation
- Sales playbook/checklists per stage
- Custom reports & exports workspace

## Inventory & Warehouse Management (`inventory`)
- Warehouse/bin layout with capacity utilisation
- Inventory movements (receive, pick, adjust, cycle count)
- Purchase orders and supplier performance tracking
- Inter-warehouse transfer workflow & SLAs
- Replenishment rules and demand forecasting
- Batch/serial tracking with expiry monitoring
- Central alert dashboard (low stock, blocked stock)

---

### Implementation Notes
- Follow the same Django app structure as `hrms` and `pos` for consistency.
- Each module needs:
  - Models + migrations
  - Admin/CRUD forms or DRF viewsets
  - Service layer feeding `/demo/<module>/` dashboard widgets
  - Management command to seed demo data
  - Front-end demo integrations (static page + API hooks)

Update this file as work progresses—check off completed features or add new ones if requirements evolve.
