<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

# Sports ERP System

## Project Type

B2B Sports Manufacturing ERP

## Tech Stack

Frontend:
- Next.js 15
- TypeScript
- TailwindCSS
- Shadcn UI
- React Query
- React Hook Form
- Zod
- Zustand

Backend:
- NestJS
- PostgreSQL
- TypeORM
- JWT Authentication

## Development Rules

- Never break existing APIs
- Follow existing folder structure
- Use TypeScript strict mode
- No any types
- Reuse shared components
- Use React Hook Form + Zod
- Use PermissionGuard
- Role based UI
- Permission based access
- Responsive design mandatory
- Mobile friendly
- Drawer for Create/Edit
- No Create/Edit pages

## Table Rules

All tables must support:

- Search
- Filters
- Pagination
- Sorting
- Loading State
- Empty State
- Column Toggle

## Form Rules

All forms must support:

- Zod Validation
- Error Messages
- Loading State
- Disabled Submit
- Reset Form

## API Rules

All APIs use:

/api/v1

Response Format:

{
  success: true,
  message: string,
  data: {}
}

## Current Layer

Completed:
1-23

Current Work:
Admin Panel Development

Next Priority:
Layout
Authentication
Permission System
Shared Components
Table System
Form System


# SPORTS ECOMMERCE ADMIN PANEL RULES

## CRITICAL RULE

DO NOT USE:

- Mock Data
- Dummy Data
- Fake Analytics
- Static Arrays
- Hardcoded Counts
- Placeholder Revenue
- Placeholder Customers

EVERYTHING MUST COME FROM API.

---

## API SOURCE

Swagger:

http://localhost:3000/api/docs#/

Base URL:

http://localhost:3000/api/v1

---

## DATA RULE

Before creating any page:

1. Check Swagger
2. Find API endpoint
3. Create TypeScript types
4. Create API service
5. Fetch real data
6. Connect UI to API

Never generate fake data.

---

## DASHBOARD RULE

Dashboard cards must use:

Total Orders
Total Revenue
Total Customers
Total Products
Open Tickets
Pending Returns
Low Stock Products

From:

GET /admin/dashboards/main

Never hardcode values.

---

## TABLE RULE

Every table must support:

Search
Filter
Sort
Pagination
Column Toggle
Row Actions

Server-side only.

No client-side fake filtering.

---

## CREATE / EDIT RULE

Never use separate page.

Use:

List Page
+
Drawer

Pattern.

Example:

Products
 -> Add Product
 -> Drawer Open

Edit Product
 -> Drawer Open

Delete Product
 -> Confirmation Modal

---

## FORM RULE

Use:

React Hook Form
+
Zod

Never manual validation.

---

## API RULE

Every module must have:

services/

product.service.ts
category.service.ts
brand.service.ts

etc.

No fetch inside page component.

---

## PERMISSION RULE

Everything uses permission slug.

Never role name.

Correct:

hasPermission("product.create")

Wrong:

user.role === "ADMIN"

---

## RESPONSIVE RULE

Desktop:

Sidebar Expanded

Tablet:

Sidebar Collapsed

Mobile:

Drawer Menu

Cards Instead Of Tables

---

## DESIGN RULE

Follow enterprise admin layout:

Header
Breadcrumb
Stats Cards
Filter Bar
Table
Pagination

Use clean spacing.

Avoid template dashboards.

---

## CODE RULE

No any type.

No duplicated component.

Reuse global components.

Use TypeScript strict mode.

---

## BEFORE MARKING TASK COMPLETE

Verify:

✓ API Connected
✓ Loading State
✓ Error State
✓ Empty State
✓ Permission Protected
✓ Responsive
✓ Pagination Working
✓ Search Working
✓ Filters Working
✓ Type Safe

WARNING:

This project already has a completed NestJS backend.

DO NOT create mock data.

DO NOT create fake dashboards.

DO NOT use static arrays.

Every page must consume actual API endpoints from Swagger.

If API is missing, stop and report the missing endpoint.

Never invent data.
<!-- END:nextjs-agent-rules -->
