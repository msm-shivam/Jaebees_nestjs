# Layer 18 — Customer Support, Helpdesk, Ticketing & Complaint Management

### Status: ✅ Complete
### Complete this layer and this layer  test by the Claud ai so make not error found 
### Module Build Log

| Module | Status | Started | Completed |
|----------|----------|----------|----------|
| Support Ticket Management | ✅ Done | 2026-06-11 | 2026-06-11 |
| Ticket Assignment Engine | ✅ Done | 2026-06-11 | 2026-06-11 |
| Ticket Status Workflow | ✅ Done | 2026-06-11 | 2026-06-11 |
| Customer Reply System | ✅ Done | 2026-06-11 | 2026-06-11 |
| Internal Notes System | ✅ Done | 2026-06-11 | 2026-06-11 |
| SLA Monitoring | ✅ Done | 2026-06-11 | 2026-06-11 |
| Support Analytics | ✅ Done | 2026-06-11 | 2026-06-11 |
| Migration Phase18SupportDesk | ✅ Done | 2026-06-11 | 2026-06-11 |

---

## New Entities (5 Tables)

| Entity | Table | Key Fields |
|----------|----------|----------|
| SupportTicket | support_tickets | ticketNumber (unique), customerId, orderId (nullable), subject, category, priority, status, assignedTo, firstResponseAt, resolvedAt |
| TicketMessage | ticket_messages | ticketId, senderId, senderType (CUSTOMER/ADMIN), message |
| TicketAssignment | ticket_assignments | ticketId, assignedTo, assignedBy |
| TicketNote | ticket_notes | ticketId, note, createdBy |
| TicketSlaLog | ticket_sla_logs | ticketId, firstResponseAt, resolvedAt, responseMinutes, resolutionMinutes |

---

# API Endpoints

## Customer Support — `/api/v1/support`

| Method | Path | Auth | Status |
|----------|----------|----------|----------|
| POST | /support | Customer JWT | ✅ |
| GET | /support/my | Customer JWT | ✅ |
| GET | /support/:id | Customer JWT | ✅ |
| POST | /support/:id/reply | Customer JWT | ✅ |
| POST | /support/:id/close | Customer JWT | ✅ |

---

## Admin Support — `/api/v1/admin/support`

| Method | Path | Permission | Status |
|----------|----------|----------|----------|
| GET | /admin/support | support.view | ✅ |
| GET | /admin/support/:id | support.view | ✅ |
| POST | /admin/support/:id/assign | support.assign | ✅ |
| POST | /admin/support/:id/reply | support.reply | ✅ |
| POST | /admin/support/:id/resolve | support.resolve | ✅ |
| POST | /admin/support/:id/reopen | support.resolve | ✅ |
| POST | /admin/support/:id/note | support.note | ✅ |

---

## Admin Support Analytics — `/api/v1/admin/support-analytics`

| Method | Path | Permission | Status |
|----------|----------|----------|----------|
| GET | /admin/support-analytics/summary | support.view | ✅ |
| GET | /admin/support-analytics/categories | support.view | ✅ |
| GET | /admin/support-analytics/agents | support.view | ✅ |
| GET | /admin/support-analytics/sla | support.view | ✅ |

---

# New Permissions

| Permission | Slug | Assigned To |
|------------|------------|------------|
| View Support Tickets | support.view | SUPER_ADMIN, SUPPORT_MANAGER |
| Assign Support Tickets | support.assign | SUPER_ADMIN, SUPPORT_MANAGER |
| Reply To Tickets | support.reply | SUPER_ADMIN, SUPPORT_MANAGER |
| Resolve Tickets | support.resolve | SUPER_ADMIN, SUPPORT_MANAGER |
| Add Internal Notes | support.note | SUPER_ADMIN, SUPPORT_MANAGER |

---

# Ticket Categories

| Category |
|------------|
| ORDER_ISSUE |
| PAYMENT_ISSUE |
| SHIPPING_ISSUE |
| RETURN_ISSUE |
| REFUND_ISSUE |
| PRODUCT_ISSUE |
| ACCOUNT_ISSUE |
| OTHER |

---

# Ticket Priorities

| Priority |
|------------|
| LOW |
| MEDIUM |
| HIGH |
| URGENT |

---

# Ticket Status Workflow

```text
OPEN
 ↓
ASSIGNED
 ↓
IN_PROGRESS
 ↓
RESOLVED
 ↓
CLOSED
```

### Reopen Flow

```text
RESOLVED
 ↓
REOPENED
 ↓
IN_PROGRESS
```

---

# Business Rules

| Rule | Description |
|--------|--------|
| Login Required | Customer must be authenticated |
| Ticket Ownership | Customer can only access own tickets |
| Auto Ticket Number | Format TKT-YYYY-000001 |
| Order Linking | Optional order reference for order-related complaints |
| Reply Tracking | Every customer/admin reply stored separately |
| Internal Notes | Admin only, hidden from customer |
| Assignment History | Full assignment tracking |
| SLA Tracking | First response and resolution timestamps tracked |
| Auto Audit Logs | Every ticket action logged |
| Close Ticket | Customer can close RESOLVED tickets |
| Reopen Ticket | Admin can reopen resolved tickets |
| Email Notifications | New ticket, reply, assignment, resolution |
| Soft Status History | Complete workflow preserved |

---

# SLA Rules

| Priority | First Response SLA | Resolution SLA |
|-----------|------------------|----------------|
| LOW | 24 Hours | 72 Hours |
| MEDIUM | 12 Hours | 48 Hours |
| HIGH | 4 Hours | 24 Hours |
| URGENT | 1 Hour | 8 Hours |

---
Before start the module  update the project-status.md file  and after the complete the module update the project-status.md 
---
# Analytics

## Summary

- Total Tickets
- Open Tickets
- Assigned Tickets
- In Progress Tickets
- Resolved Tickets
- Closed Tickets
- Average First Response Time
- Average Resolution Time
- SLA Compliance %

---

## Category Breakdown

- Order Issues
- Payment Issues
- Shipping Issues
- Return Issues
- Refund Issues
- Product Issues
- Account Issues

---

## Agent Performance

- Tickets Assigned
- Tickets Resolved
- Average Resolution Time
- SLA Compliance
- Reopened Tickets

---

# Deliverables

- [x] SupportTicket Entity
- [x] TicketMessage Entity
- [x] TicketAssignment Entity
- [x] TicketNote Entity
- [x] TicketSlaLog Entity
- [x] CreateTicketDto
- [x] ReplyTicketDto
- [x] AssignTicketDto
- [x] ResolveTicketDto
- [x] SupportService
- [x] TicketAssignmentService
- [x] SlaMonitoringService
- [x] SupportAnalyticsService
- [x] CustomerSupportController
- [x] AdminSupportController
- [x] AdminSupportAnalyticsController
- [x] SupportModule
- [x] Migration Phase18SupportDesk
- [x] Seed permissions (support.*)
- [x] Role mappings (SUPER_ADMIN, SUPPORT_MANAGER)
- [x] Email notification integration
- [x] Notification logs integration
- [x] app.module.ts wiring
- [x] data-source.ts wiring
- [x] Zero TypeScript build errors
- [x] Migration executed successfully
- [x] Seed executed successfully