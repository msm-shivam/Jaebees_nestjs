# Sport E-Commerce Backend — Project Status

## Layer 1: Foundation Setup

**Started:** 2026-06-06  
**Completed:** 2026-06-06  
**Status:** ✅ Complete

---

## Module Build Log

| Module | Status | Started | Completed |
|---|---|---|---|
| Project Setup (env, packages, scripts) | ✅ Done | 2026-06-06 | 2026-06-06 |
| Folder Structure (common, shared, modules) | ✅ Done | 2026-06-06 | 2026-06-06 |
| Common Layer (constants, decorators, guards, filters, interceptors, pipes, utils) | ✅ Done | 2026-06-06 | 2026-06-06 |
| Config Module | ✅ Done | 2026-06-06 | 2026-06-06 |
| Database Module + Entities | ✅ Done | 2026-06-06 | 2026-06-06 |
| Migration — CreateFoundationTables | ✅ Done | 2026-06-06 | 2026-06-06 |
| Auth Module (customer + admin strategies, JWT, all endpoints) | ✅ Done | 2026-06-06 | 2026-06-06 |
| Users Module (profile, change password) | ✅ Done | 2026-06-06 | 2026-06-06 |
| RBAC Module (roles, permissions, admin role assignment) | ✅ Done | 2026-06-06 | 2026-06-06 |
| Admin Module (admin user management) | ✅ Done | 2026-06-06 | 2026-06-06 |
| main.ts (Swagger, versioning, global pipes/filters) | ✅ Done | 2026-06-06 | 2026-06-06 |
| Seed Data (roles, permissions, super admin) | ✅ Done | 2026-06-06 | 2026-06-06 |
| app.module.ts (full wiring) | ✅ Done | 2026-06-06 | 2026-06-06 |
| TypeScript Build (zero errors) | ✅ Done | 2026-06-06 | 2026-06-06 |
| Postman Collection | ✅ Done | 2026-06-06 | 2026-06-06 |
| Search & Discovery Module (search/analytics/discovery) | ✅ Done | 2026-06-10 | 2026-06-10 |

---

## Layer 1 Deliverables Checklist

- [x] Folder structure (`src/common/`, `src/modules/`, `src/shared/`, `src/database/`)
- [x] Entity definitions (users, user_sessions, admin_users, admin_sessions, roles, permissions, otp_verifications)
- [x] role_permissions + admin_roles via ManyToMany (JoinTable)
- [x] DTOs with class-validator and Swagger decorators
- [x] JWT strategies (customer `jwt-customer` + admin `jwt-admin`)
- [x] Guards (JwtAuthGuard, AdminJwtGuard, RolesGuard, PermissionsGuard)
- [x] Decorators (@Roles, @Permissions, @CurrentUser, @Public)
- [x] Interceptors (ResponseInterceptor, LoggingInterceptor)
- [x] Global exception filter (handles HTTP, DB constraint, unhandled)
- [x] Migration file (all 9 tables with indexes, FKs, constraints)
- [x] RBAC service + controller (roles CRUD, permissions CRUD, assign/revoke)
- [x] Admin module service + controller (admin CRUD, assign/revoke roles)
- [x] Swagger setup (`/api/docs`)
- [x] API versioning (`/api/v1`)
- [x] Seed data (6 roles, 20 permissions, super admin `admin@sport.com`)
- [x] Postman collection (`docs/postman-collection.json`)
- [x] Zero TypeScript build errors

---

## Database Tables

| Table | Status |
|---|---|
| users | ✅ Entity + Migration |
| user_sessions | ✅ Entity + Migration |
| admin_users | ✅ Entity + Migration |
| admin_sessions | ✅ Entity + Migration |
| roles | ✅ Entity + Migration |
| permissions | ✅ Entity + Migration |
| role_permissions | ✅ Entity + Migration (join table) |
| admin_roles | ✅ Entity + Migration (join table) |
| otp_verifications | ✅ Entity + Migration |

---

## API Endpoints

### Customer Auth — `/api/v1/auth`
| Method | Path | Auth | Status |
|---|---|---|---|
| POST | /auth/register | Public | ✅ |
| POST | /auth/verify-email | Public | ✅ |
| POST | /auth/resend-otp | Public | ✅ |
| POST | /auth/login | Public | ✅ |
| POST | /auth/refresh | Public | ✅ |
| POST | /auth/logout | Customer JWT | ✅ |
| POST | /auth/forgot-password | Public | ✅ |
| POST | /auth/reset-password | Public | ✅ |

### Admin Auth — `/api/v1/admin/auth`
| Method | Path | Auth | Status |
|---|---|---|---|
| POST | /admin/auth/login | Public | ✅ |
| POST | /admin/auth/refresh | Public | ✅ |
| POST | /admin/auth/logout | Admin JWT | ✅ |

### Customer Profile — `/api/v1/users/me`
| Method | Path | Auth | Status |
|---|---|---|---|
| GET | /users/me | Customer JWT | ✅ |
| PATCH | /users/me | Customer JWT | ✅ |
| PUT | /users/me/password | Customer JWT | ✅ |

### RBAC — `/api/v1/admin/roles` & `/api/v1/admin/permissions`
| Method | Path | Auth | Status |
|---|---|---|---|
| POST | /admin/roles | Admin JWT + permissions.manage | ✅ |
| GET | /admin/roles | Admin JWT + permissions.manage | ✅ |
| GET | /admin/roles/:id | Admin JWT + permissions.manage | ✅ |
| PATCH | /admin/roles/:id | Admin JWT + permissions.manage | ✅ |
| DELETE | /admin/roles/:id | Admin JWT + permissions.manage | ✅ |
| POST | /admin/roles/:id/permissions | Admin JWT + permissions.manage | ✅ |
| DELETE | /admin/roles/:id/permissions | Admin JWT + permissions.manage | ✅ |
| POST | /admin/permissions | Admin JWT + permissions.manage | ✅ |
| GET | /admin/permissions | Admin JWT + permissions.manage | ✅ |
| GET | /admin/permissions/:id | Admin JWT + permissions.manage | ✅ |
| DELETE | /admin/permissions/:id | Admin JWT + permissions.manage | ✅ |

### Admin User Management — `/api/v1/admin/users`
| Method | Path | Auth | Status |
|---|---|---|---|
| POST | /admin/users | Admin JWT + admin.create | ✅ |
| GET | /admin/users | Admin JWT + admin.update | ✅ |
| GET | /admin/users/:id | Admin JWT + admin.update | ✅ |
| PATCH | /admin/users/:id | Admin JWT + admin.update | ✅ |
| DELETE | /admin/users/:id | Admin JWT + admin.delete | ✅ |
| POST | /admin/users/:id/roles | Admin JWT + roles.manage | ✅ |
| DELETE | /admin/users/:id/roles | Admin JWT + roles.manage | ✅ |

---

## Seed Data

| Item | Value |
|---|---|
| Super Admin Email | admin@sport.com |
| Super Admin Password | SuperAdmin@123 |
| Roles seeded | 6 (super_admin, product_manager, inventory_manager, order_manager, finance_manager, support_manager) |
| Permissions seeded | 20 |

---

## How To Run

```bash
# 1. Start PostgreSQL (ensure DB exists: sport_ecommerce)
# 2. Run migration
npm run migration:run

# 3. Seed the database
npm run seed

# 4. Start development server
npm run start:dev

# 5. Open Swagger
# http://localhost:3000/api/docs
```

---

## Layer 2 — Catalog Foundation (Complete)

| Module | Status |
|--------|--------|
| Brands | ✅ Complete |
| Categories | ✅ Complete |
| Sub Categories | ✅ Complete |
| Collections | ✅ Complete |
| Attributes | ✅ Complete |
| Attribute Values | ✅ Complete |
| Product Tags | ✅ Complete |

### Phase 2 Deliverables

- [x] Entities
- [x] DTOs
- [x] Controllers
- [x] Services
- [x] Modules
- [x] Migrations (`1749200100000-CreateLayer2Tables.ts`)
- [x] Permission seed updates
- [x] Swagger documentation
- [x] RBAC integration (AdminJwtGuard + PermissionsGuard)
- [x] Postman collection (`postman/Sport-E-Commerce-API.postman_collection.json`)

### API Base Path

All catalog admin endpoints: `/api/v1/admin/{resource}`

### Permissions Seeded

| Resource | Permissions |
|----------|-------------|
| Brand | `brand.create`, `brand.view`, `brand.update`, `brand.delete` |
| Category | `category.create`, `category.view`, `category.update`, `category.delete` |
| Collection | `collection.create`, `collection.view`, `collection.update`, `collection.delete` |
| Attribute | `attribute.create`, `attribute.view`, `attribute.update`, `attribute.delete` |
| Tag | `tag.create`, `tag.view`, `tag.update`, `tag.delete` |

Sub-categories use **category.\*** permissions. Attribute-values use **attribute.\*** permissions.

### Out of Scope (Phase 2)

- Products
- Product Variants
- Inventory
- Cart / Orders / Payments
- Reviews / Elasticsearch / RabbitMQ / Analytics / CMS

### Setup Commands

```bash
npm run migration:run
npm run seed
npm run dev
```

---

## Layer 3 — Product Module (Complete)

| Module | Status | Started | Completed |
|--------|--------|---------|-----------|
| Products | ✅ Complete | 2026-06-06 | 2026-06-06 |
| Product Images | ✅ Complete | 2026-06-06 | 2026-06-06 |

### Phase 3 Deliverables

- [x] Product Entity (with Brand, Category, SubCategory relations)
- [x] ProductImage Entity
- [x] DTOs (Create, Update, Query, Response)
- [x] Controllers (all CRUD + publish/archive + collections/tags/images management)
- [x] Services (all business logic with slug generation, validation)
- [x] Enhanced Query Features (search, status, brand, category, subCategory, featured, active, sorting)
- [x] Modules
- [x] Migration (products, product_images tables + FKs to product_collections and product_tag_mappings)
- [x] Permission seeds (6 product permissions + role mappings)
- [x] Swagger documentation (all endpoints documented with examples and validation)
- [x] RBAC integration (AdminJwtGuard + PermissionsGuard)
- [x] Postman collection updates (with query parameters)

### Product Permissions

| Permission | Slug |
|------------|------|
| Create Product | `product.create` |
| Update Product | `product.update` |
| Delete Product | `product.delete` |
| View Product | `product.view` |
| Publish Product | `product.publish` |
| Archive Product | `product.archive` |

### API Endpoints

#### Products — `/api/v1/admin/products`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | /products | Admin JWT + product.create | ✅ |
| GET | /products | Admin JWT + product.view | ✅ |
| GET | /products/:id | Admin JWT + product.view | ✅ |
| PATCH | /products/:id | Admin JWT + product.update | ✅ |
| DELETE | /products/:id | Admin JWT + product.delete | ✅ |
| PATCH | /products/:id/publish | Admin JWT + product.publish | ✅ |
| PATCH | /products/:id/archive | Admin JWT + product.archive | ✅ |
| POST | /products/:id/collections | Admin JWT + product.update | ✅ |
| DELETE | /products/:id/collections/:collectionId | Admin JWT + product.update | ✅ |
| POST | /products/:id/tags | Admin JWT + product.update | ✅ |
| DELETE | /products/:id/tags/:tagId | Admin JWT + product.update | ✅ |
| POST | /products/:id/images | Admin JWT + product.update | ✅ |
| GET | /products/:id/images | Admin JWT + product.view | ✅ |
| PATCH | /products/images/:imageId | Admin JWT + product.update | ✅ |
| DELETE | /products/images/:imageId | Admin JWT + product.update | ✅ |
| PATCH | /products/images/:imageId/primary | Admin JWT + product.update | ✅ |

### Query Features

The Product List API (`GET /products`) supports advanced filtering and sorting:

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| search | string | Search in name, description, shortDescription |
| status | enum | Filter by ProductStatus (DRAFT, ACTIVE, INACTIVE, ARCHIVED) |
| brandId | UUID | Filter by brand |
| categoryId | UUID | Filter by category |
| subCategoryId | UUID | Filter by sub-category |
| isFeatured | boolean | Filter featured products |
| isActive | boolean | Filter active products |
| sortBy | string | Sort field: name, createdAt, updatedAt, status (default: name) |
| sortOrder | string | Sort order: ASC or DESC (default: ASC) |

### Database Tables (Layer 3)

| Table | Status |
|-------|--------|
| products | ✅ Entity + Migration |
| product_images | ✅ Entity + Migration |

### Layer 3 Out of Scope

- Product Variants
- Inventory
- Cart / Orders / Payments
- Reviews / Search / Analytics

---

---

## Layer 4 — Product Variants & Inventory Foundation (Complete)

| Module | Status | Started | Completed |
|--------|--------|---------|-----------|
| Product Variants | ✅ Complete | 2026-06-06 | 2026-06-06 |
| Variant Attributes | ✅ Complete | 2026-06-06 | 2026-06-06 |
| Inventory | ✅ Complete | 2026-06-06 | 2026-06-06 |

### Phase 4 Deliverables

- [x] ProductVariant Entity (with VariantStatus enum: ACTIVE, INACTIVE, OUT_OF_STOCK, ARCHIVED)
- [x] ProductVariantAttribute Entity (join table for variant-attribute-value mappings)
- [x] Inventory Entity (with stock management: quantity, reserved_quantity, available_quantity)
- [x] DTOs for Product Variants (Create, Update, Query, Response)
- [x] DTOs for Inventory (Create, Update, Adjust, Reserve, Release, Response)
- [x] ProductVariantsService (SKU validation, default variant management, attribute assignment)
- [x] InventoryService (stock adjustment, reservation, release, availability calculation)
- [x] ProductVariantsController (CRUD + default + attributes management)
- [x] InventoryController (CRUD + adjust + reserve + release)
- [x] ProductVariantsModule
- [x] InventoryModule
- [x] Migration (product_variants, product_variant_attributes, inventories tables + FKs + indexes)
- [x] Permission seeds (4 variant permissions + 4 inventory permissions)
- [x] Updated existing entities with reverse relations (Product, Attribute, AttributeValue)
- [x] Swagger documentation (all endpoints documented with examples and validation)
- [x] RBAC integration (AdminJwtGuard + PermissionsGuard)
- [x] Postman collection updates (with Variant and Inventory APIs)

### Variant Permissions

| Permission | Slug |
|------------|------|
| Create Variant | `variant.create` |
| Update Variant | `variant.update` |
| Delete Variant | `variant.delete` |
| View Variant | `variant.view` |

### Inventory Permissions

| Permission | Slug |
|------------|------|
| Create Inventory | `inventory.create` |
| Update Inventory | `inventory.update` |
| View Inventory | `inventory.view` |
| Adjust Inventory | `inventory.adjust` |

### API Endpoints

#### Product Variants — `/api/v1/admin/product-variants`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | /product-variants | Admin JWT + variant.create | ✅ |
| GET | /product-variants | Admin JWT + variant.view | ✅ |
| GET | /product-variants/:id | Admin JWT + variant.view | ✅ |
| PATCH | /product-variants/:id | Admin JWT + variant.update | ✅ |
| DELETE | /product-variants/:id | Admin JWT + variant.delete | ✅ |
| PATCH | /product-variants/:id/default | Admin JWT + variant.update | ✅ |
| POST | /product-variants/:id/attributes | Admin JWT + variant.update | ✅ |
| DELETE | /product-variants/:id/attributes/:mappingId | Admin JWT + variant.update | ✅ |

#### Inventory — `/api/v1/admin/inventory`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | /inventory | Admin JWT + inventory.create | ✅ |
| GET | /inventory | Admin JWT + inventory.view | ✅ |
| GET | /inventory/:id | Admin JWT + inventory.view | ✅ |
| PATCH | /inventory/:id | Admin JWT + inventory.update | ✅ |
| PATCH | /inventory/:id/adjust | Admin JWT + inventory.adjust | ✅ |
| PATCH | /inventory/:id/reserve | Admin JWT + inventory.adjust | ✅ |
| PATCH | /inventory/:id/release | Admin JWT + inventory.adjust | ✅ |

### Database Tables (Layer 4)

| Table | Status |
|-------|--------|
| product_variants | ✅ Entity + Migration |
| product_variant_attributes | ✅ Entity + Migration |
| inventories | ✅ Entity + Migration |

### Migration Details

**Migration:** `1749200400000-Phase4ProductVariantsAndInventory.ts`

**Tables Created:**
- `product_variants` with columns: id, product_id, sku, barcode, price, compare_at_price, cost_price, weight, status, is_default, created_at, updated_at, deleted_at
- `product_variant_attributes` with columns: id, variant_id, attribute_id, attribute_value_id, created_at
- `inventories` with columns: id, variant_id, quantity, reserved_quantity, available_quantity, low_stock_threshold, created_at, updated_at

**Foreign Keys Added:**
- `product_variants.product_id` → `products.id` (ON DELETE CASCADE)
- `product_variant_attributes.variant_id` → `product_variants.id` (ON DELETE CASCADE)
- `product_variant_attributes.attribute_id` → `attributes.id` (ON DELETE CASCADE)
- `product_variant_attributes.attribute_value_id` → `attribute_values.id` (ON DELETE CASCADE)
- `inventories.variant_id` → `product_variants.id` (ON DELETE CASCADE)

**Indexes Created:**
- product_variants: product_id, sku (unique), status, is_default
- product_variant_attributes: variant_id, attribute_id, attribute_value_id
- inventories: variant_id (unique), quantity, available_quantity

**Unique Constraints:**
- product_variants: sku
- product_variant_attributes: (variant_id, attribute_id)
- inventories: variant_id

### Layer 4 Out of Scope

- Product Variants with complex pricing rules
- Multi-warehouse inventory
- Inventory transfers
- Stock forecasting
- Cart / Orders / Payments
- Reviews / Search / Analytics

*Last updated: 2026-06-08 — Layer 4 Product Variants & Inventory Foundation complete*

---

## Layer 5 — Cart Management (Complete)

| Module | Status | Started | Completed |
|--------|--------|---------|-----------|
| Cart | ✅ Complete | 2026-06-08 | 2026-06-08 |
| Cart Items | ✅ Complete | 2026-06-08 | 2026-06-08 |

### Phase 5 Deliverables

- [x] Cart Entity (with User relation, subtotal, totalItems)
- [x] CartItem Entity (with Cart, ProductVariant relations)
- [x] DTOs (AddCartItemDto, UpdateCartItemDto, CartResponseDto, CartItemResponseDto)
- [x] CartService (getOrCreateCart, addItem, updateItem, removeItem, clearCart, recalculateCart)
- [x] CartController (5 endpoints with JwtAuthGuard)
- [x] CartModule (with TypeOrm imports for Cart, CartItem, ProductVariant, Product, Inventory)
- [x] Migration (carts, cart_items tables + FKs + indexes)
- [x] Swagger documentation (all endpoints documented with request/response examples)
- [x] JWT integration (JwtAuthGuard for customer authentication)
- [x] Business rules (variant validation, inventory check, duplicate handling, auto-recalculation)

### Business Rules Implemented

| Rule | Description |
|------|-------------|
| One Cart Per User | Auto-creates cart if none exists (getOrCreateCart) |
| Variant Exists | 404 if variant not found |
| Variant Active | 400 if variant status is not ACTIVE |
| Product Not Archived | 400 if product status is ARCHIVED |
| Inventory Exists | 400 if no inventory record |
| Stock Validation | 400 if quantity > availableQuantity |
| Duplicate Variant | Increases quantity instead of creating duplicate row |
| Line Total | `quantity * unitPrice` |
| Cart Totals | `subtotal = sum(lineTotals)`, `totalItems = sum(quantities)` |
| Auto Recalculate | After every add/update/remove operation |

### API Endpoints

#### Cart — `/api/v1/cart`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | /cart | Customer JWT | ✅ |
| POST | /cart/items | Customer JWT | ✅ |
| PATCH | /cart/items/:itemId | Customer JWT | ✅ |
| DELETE | /cart/items/:itemId | Customer JWT | ✅ |
| DELETE | /cart/clear | Customer JWT | ✅ |

### Database Tables (Layer 5)

| Table | Status |
|-------|--------|
| carts | ✅ Entity + Migration |
| cart_items | ✅ Entity + Migration |

### Migration Details

**Migration:** `1749200500000-Phase5CartModule.ts`

**Tables Created:**
- `carts` with columns: id, user_id, subtotal, total_items, created_at, updated_at, deleted_at
- `cart_items` with columns: id, cart_id, variant_id, quantity, unit_price, line_total, created_at, updated_at

**Foreign Keys Added:**
- `carts.user_id` → `users.id` (ON DELETE CASCADE)
- `cart_items.cart_id` → `carts.id` (ON DELETE CASCADE)
- `cart_items.variant_id` → `product_variants.id` (ON DELETE CASCADE)

**Indexes Created:**
- carts: user_id
- cart_items: cart_id, variant_id

### Layer 5 Out of Scope

- Wishlist (Layer 6)
- Address Book (Layer 7)
- Checkout (Layer 8)
- Payments
- Reviews
- Search / Analytics

---

## Layer 6 — Order Management (Complete)

| Module | Status | Started | Completed |
|--------|--------|---------|-----------|
| Orders | ✅ Complete | 2026-06-08 | 2026-06-08 |
| Order Items | ✅ Complete | 2026-06-08 | 2026-06-08 |

### Phase 6 Deliverables

- [x] Order Entity (with User relation, order number, status, totals, notes, timestamps)
- [x] OrderItem Entity (with Order relation, product snapshots, pricing)
- [x] DTOs (CreateOrderDto, OrderListQueryDto, UpdateOrderStatusDto, CancelOrderDto, OrderResponseDto, OrderItemResponseDto)
- [x] OrdersService (createOrder, getMyOrders, getMyOrder, getAllOrders, getOrder, updateStatus, cancelOrder, generateOrderNumber)
- [x] OrdersController (customer: 3 endpoints)
- [x] AdminOrdersController (admin: 4 endpoints)
- [x] OrdersModule (with TypeOrm imports for Order, OrderItem, Cart, CartItem, ProductVariant, Inventory)
- [x] Migration (orders, order_items tables + FKs + indexes)
- [x] Swagger documentation (all endpoints documented with request/response examples)
- [x] JWT integration (JwtAuthGuard for customer, AdminJwtGuard + PermissionsGuard for admin)
- [x] Permission seeds (order.cancel permission + ORDER_MANAGER role mapping)
- [x] Business rules (inventory deduction, order number generation, status machine, cancellation)

### Business Rules Implemented

| Rule | Description |
|------|-------------|
| Order From Cart | Creates order from current cart contents, then clears cart |
| Order Number | `ORD-YYYYMMDD-000001` format with daily sequence reset |
| Product Snapshot | Stores productName, sku, unitPrice at order creation time |
| Inventory Deduction | `availableQuantity -= quantity` on order create |
| Inventory Restore | `availableQuantity += quantity` on order cancel |
| Status Machine | PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED (or CANCELLED) |
| Customer Cancel | Only PENDING or CONFIRMED orders (soft delete) |
| Admin Cancel | Any status (soft delete) |
| Order History | Customer can list their own orders with pagination/status filter/search |

### API Endpoints

#### Orders (Customer) — `/api/v1/orders`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | /orders | Customer JWT | ✅ |
| GET | /orders | Customer JWT | ✅ |
| GET | /orders/:id | Customer JWT | ✅ |
| POST | /orders/:id/cancel | Customer JWT | ✅ |

#### Orders (Admin) — `/api/v1/admin/orders`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | /admin/orders | Admin JWT + order.view | ✅ |
| GET | /admin/orders/:id | Admin JWT + order.view | ✅ |
| PATCH | /admin/orders/:id/status | Admin JWT + order.update | ✅ |
| POST | /admin/orders/:id/cancel | Admin JWT + order.cancel | ✅ |

### Database Tables (Layer 6)

| Table | Status |
|-------|--------|
| orders | ✅ Entity + Migration |
| order_items | ✅ Entity + Migration |

### Migration Details

**Migration:** `1749200600000-Phase6Orders.ts`

**Tables Created:**
- `orders` with columns: id, user_id, order_number, status, total_items, subtotal, tax_amount, shipping_amount, discount_amount, total_amount, notes, cancelled_at, cancel_reason, created_at, updated_at, deleted_at
- `order_items` with columns: id, order_id, product_id, variant_id, product_name, sku, quantity, unit_price, total_price, created_at

**Foreign Keys Added:**
- `orders.user_id` → `users.id` (ON DELETE CASCADE)
- `order_items.order_id` → `orders.id` (ON DELETE CASCADE)

**Indexes Created:**
- orders: user_id, order_number (unique), status, created_at
- order_items: order_id, variant_id

---

## Layer 7 — Payments & Transactions with Stripe Integration (Complete)

| Module | Status | Started | Completed |
|--------|--------|---------|-----------|
| Payment Methods | ✅ Complete | 2026-06-08 | 2026-06-08 |
| Stripe Integration | ✅ Complete | 2026-06-08 | 2026-06-08 |
| Payments | ✅ Complete | 2026-06-08 | 2026-06-08 |
| Refunds | ✅ Complete | 2026-06-08 | 2026-06-08 |
| Payment Logs | ✅ Complete | 2026-06-08 | 2026-06-08 |
| Payment Webhooks | ✅ Complete | 2026-06-08 | 2026-06-08 |
| Order Payment Sync | ✅ Complete | 2026-06-08 | 2026-06-08 |

### Phase 7 Deliverables

- [x] PaymentMethod Entity (name, code, description, isActive, sortOrder)
- [x] Payment Entity (order, method, transaction number, amount, status, Stripe IDs, gateway response)
- [x] PaymentRefund Entity (payment, Stripe refund ID, amount, reason, processed by)
- [x] PaymentLog Entity (payment, action, message, performed by)
- [x] PaymentWebhook Entity (event ID, type, payload, processed)
- [x] PaymentStatus Enum (PENDING, PROCESSING, PAID, FAILED, CANCELLED, REFUNDED, PARTIALLY_REFUNDED)
- [x] Order entity extended (paymentStatus, paidAmount, dueAmount)
- [x] DTOs (CreatePaymentIntent, ConfirmPayment, CreateRefund, Create/Update PaymentMethod, PaymentQuery, PaymentResponse)
- [x] StripeService (createPaymentIntent, retrievePaymentIntent, createRefund, constructWebhookEvent)
- [x] PaymentsService (createIntent, confirmPayment, handleWebhook, CRUD, order sync, customer payments)
- [x] RefundsService (full refund, partial refund, status updates)
- [x] PaymentMethodsService (CRUD with code uniqueness)
- [x] PaymentsController (POST create-intent, POST confirm, POST webhook — public)
- [x] AdminPaymentsController (GET list, GET by id, PATCH notes, POST refund)
- [x] CustomerPaymentsController (GET my payments, GET order payment)
- [x] PaymentMethodsController (admin CRUD)
- [x] PaymentsModule (all services, controllers, TypeOrm imports)
- [x] Migration (payment_methods, payments, payment_refunds, payment_logs, payment_webhooks + orders columns)
- [x] Permission seeds (11 new permissions: payment.*, refund.*, payment_method.*)
- [x] Role mappings (ORDER_MANAGER gets payment.view; FINANCE_MANAGER gets payment + refund permissions)
- [x] Swagger documentation (all endpoints documented)
- [x] RBAC integration (AdminJwtGuard + PermissionsGuard on admin endpoints)
- [x] Stripe SDK installed (v22)
- [x] Zero TypeScript build errors

### Business Rules Implemented

| Rule | Description |
|------|-------------|
| One Payment Per Intent | Reuses existing PENDING payment for same order |
| Duplicate Payment Prevention | Blocks create-intent if order already PAID |
| Status Sync | Payment status changes sync to Order.paymentStatus |
| Paid/Due Amounts | Order.paidAmount and dueAmount recalculated on every status change |
| Full Refund | Entire payment amount refunded, status → REFUNDED |
| Partial Refund | Partial amount refunded, status → PARTIALLY_REFUNDED |
| Refund Validation | Cannot exceed remaining balance; cannot refund already refunded payment |
| Webhook Processing | Handles payment_intent.succeeded, payment_intent.payment_failed, charge.refunded, charge.dispute.created |
| Payment Logs | Every payment action (create intent, success, failure, refund) is logged |
| Stripe Fallback | Webhook signature verification attempted; falls back to raw parsing if Stripe not configured |

### API Endpoints

#### Payment Methods (Admin) — `/api/v1/admin/payment-methods`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | /admin/payment-methods | Admin JWT + payment_method.create | ✅ |
| GET | /admin/payment-methods | Admin JWT + payment_method.view | ✅ |
| GET | /admin/payment-methods/:id | Admin JWT + payment_method.view | ✅ |
| PATCH | /admin/payment-methods/:id | Admin JWT + payment_method.update | ✅ |
| DELETE | /admin/payment-methods/:id | Admin JWT + payment_method.delete | ✅ |

#### Stripe Payments — `/api/v1/payments`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | /payments/create-intent | Customer JWT | ✅ |
| POST | /payments/confirm | Customer JWT | ✅ |
| POST | /payments/webhook | Public | ✅ |

#### Payments (Admin) — `/api/v1/admin/payments`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | /admin/payments | Admin JWT + payment.view | ✅ |
| GET | /admin/payments/:id | Admin JWT + payment.view | ✅ |
| PATCH | /admin/payments/:id | Admin JWT + payment.update | ✅ |
| POST | /admin/payments/:id/refund | Admin JWT + refund.create | ✅ |

#### Customer Payments — `/api/v1/payments`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | /payments | Customer JWT | ✅ |
| GET | /payments/order/:orderId | Customer JWT | ✅ |

### Database Tables (Layer 7)

| Table | Status |
|-------|--------|
| payment_methods | ✅ Entity + Migration |
| payments | ✅ Entity + Migration |
| payment_refunds | ✅ Entity + Migration |
| payment_logs | ✅ Entity + Migration |
| payment_webhooks | ✅ Entity + Migration |

### Migration Details

**Migration:** `1749200700000-Phase7PaymentsAndTransactions.ts`

**Tables Created:**
- `payment_methods` — id, name, code (unique), description, is_active, sort_order, timestamps
- `payments` — id, order_id (FK→orders), payment_method_id (FK→payment_methods), transaction_number (unique), amount, status, stripe_payment_intent_id, stripe_charge_id, gateway_status, gateway_response (jsonb), notes, paid_at, timestamps
- `payment_refunds` — id, payment_id (FK→payments), stripe_refund_id, refund_amount, reason, notes, processed_by, processed_at, created_at
- `payment_logs` — id, payment_id (FK→payments), action, message, performed_by, created_at
- `payment_webhooks` — id, event_id (unique), event_type, payload (jsonb), processed, processed_at, created_at

**Columns Added to `orders`:**
- `payment_status` (varchar, default 'PENDING')
- `paid_amount` (decimal, default 0)
- `due_amount` (decimal, default 0)

### Permissions Added

| Permission | Slug |
|------------|------|
| Create Payment | `payment.create` |
| View Payment | `payment.view` |
| Update Payment | `payment.update` |
| Delete Payment | `payment.delete` |
| Create Refund | `refund.create` |
| View Refund | `refund.view` |
| Update Refund | `refund.update` |
| Create Payment Method | `payment_method.create` |
| View Payment Method | `payment_method.view` |
| Update Payment Method | `payment_method.update` |
| Delete Payment Method | `payment_method.delete` |

### Layer 7 Out of Scope

- PayPal
- Subscription Billing
- Wallet System
- EMI Processing
- Marketplace Split Payments

---

## Layer 8 — Shipping & Delivery Management (Complete)

| Module | Status | Started | Completed |
|--------|--------|---------|-----------|
| Address Management | ✅ Complete | 2026-06-08 | 2026-06-08 |
| Warehouse Management | ✅ Complete | 2026-06-08 | 2026-06-08 |
| Delivery Settings | ✅ Complete | 2026-06-08 | 2026-06-08 |
| Shipment Management | ✅ Complete | 2026-06-08 | 2026-06-08 |
| Checkout Integration | ✅ Complete | 2026-06-08 | 2026-06-08 |

### Phase 8 Deliverables

- [x] Address Entity (userId, fullName, phone, addressLine1/2, city, state, country, postalCode, lat/lng, isDefault)
- [x] Warehouse Entity (name, code, phone, email, address, city, state, country, postalCode, lat/lng, isActive)
- [x] DeliverySetting Entity (perKmCharge, freeShippingThreshold, maxDeliveryDistanceKm, isActive)
- [x] Shipment Entity (orderId, warehouseId, trackingNumber, status, notes, dispatchedAt, deliveredAt)
- [x] ShipmentTrackingLog Entity (shipmentId, status, note, changedBy)
- [x] ShipmentStatus Enum (PENDING, PACKED, READY_FOR_DISPATCH, OUT_FOR_DELIVERY, DELIVERED, FAILED_DELIVERY)
- [x] Order entity extended (shippingAddressId, warehouseId, distanceKm)
- [x] DTOs (CreateAddress, UpdateAddress, AddressResponse, CreateWarehouse, UpdateWarehouse, WarehouseResponse, UpdateDeliverySetting, DeliverySettingResponse, UpdateShipmentStatus, ShipmentResponse, ShipmentQuery)
- [x] AddressesService (CRUD, setDefault, ownership check, single default)
- [x] WarehousesService (CRUD, code uniqueness, findNearest with Haversine)
- [x] DeliverySettingsService (getOrCreate singleton, update, calculateCharge, isServiceable)
- [x] ShipmentsService (createShipment, findByOrder, findAll, findOne, updateStatus with auto-logging)
- [x] AddressesController (customer: POST, GET list, GET by id, PATCH, DELETE, PATCH default)
- [x] WarehousesController (admin: CRUD with RBAC)
- [x] DeliverySettingsController (admin: GET, PATCH with RBAC)
- [x] ShipmentsController (customer: GET by order)
- [x] AdminShipmentsController (admin: GET list, GET by id, PATCH status)
- [x] Checkout Integration (validate address, find nearest warehouse, Haversine distance, calculate charge, delivery area check, create shipment)
- [x] Haversine Distance Formula (accurate to 2 decimal places)
- [x] Delivery Charge Calculation (distance × perKmCharge, free shipping threshold)
- [x] Maximum Delivery Distance Guard (400 if not serviceable)
- [x] Each module registered (Addresses, Warehouses, DeliverySettings, Shipments)
- [x] Migration (addresses, warehouses, delivery_settings, shipments, shipment_tracking_logs + orders shipping columns)
- [x] Permission seeds (10 new permissions: address.*, warehouse.*, delivery.manage, shipment.*)
- [x] Role mappings (ORDER_MANAGER gets warehouse.view + shipment.* + delivery.manage)
- [x] Swagger documentation (all endpoints documented)
- [x] RBAC integration (AdminJwtGuard + PermissionsGuard on all admin endpoints)
- [x] Zero TypeScript build errors
- [x] Automated tracking log creation on status changes

### Business Rules Implemented

| Rule | Description |
|------|-------------|
| Single Default Address | Only one address marked as default per user |
| Address Ownership | Customer can only CRUD their own addresses |
| Warehouse Code Unique | Enforced at DB + service level |
| Soft Delete | Addresses and warehouses support soft delete |
| Nearest Warehouse | Haversine formula selects the closest active warehouse |
| Distance Calculation | `distance = haversine(warehouse.lat/lng, address.lat/lng)` |
| Delivery Charge | `charge = distance × perKmCharge` |
| Free Shipping | Charge = 0 if order amount ≥ free shipping threshold |
| Area Guard | 400 Bad Request if distance > maxDeliveryDistanceKm |
| Auto Shipment | Shipment created automatically on order placement |
| Auto Tracking Logs | Log entry created on every shipment status change |
| DISPATCH/DELIVER Timestamps | dispatchedAt set on OUT_FOR_DELIVERY; deliveredAt set on DELIVERED |

### API Endpoints

#### Addresses (Customer) — `/api/v1/addresses`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | /addresses | Customer JWT | ✅ |
| GET | /addresses | Customer JWT | ✅ |
| GET | /addresses/:id | Customer JWT | ✅ |
| PATCH | /addresses/:id | Customer JWT | ✅ |
| DELETE | /addresses/:id | Customer JWT | ✅ |
| PATCH | /addresses/:id/default | Customer JWT | ✅ |

#### Warehouses (Admin) — `/api/v1/admin/warehouses`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | /admin/warehouses | Admin JWT + warehouse.create | ✅ |
| GET | /admin/warehouses | Admin JWT + warehouse.view | ✅ |
| GET | /admin/warehouses/:id | Admin JWT + warehouse.view | ✅ |
| PATCH | /admin/warehouses/:id | Admin JWT + warehouse.update | ✅ |
| DELETE | /admin/warehouses/:id | Admin JWT + warehouse.delete | ✅ |

#### Delivery Settings (Admin) — `/api/v1/admin/delivery-settings`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | /admin/delivery-settings | Admin JWT + delivery.manage | ✅ |
| PATCH | /admin/delivery-settings | Admin JWT + delivery.manage | ✅ |

#### Shipments (Customer) — `/api/v1/shipments`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | /shipments/:orderId | Customer JWT | ✅ |

#### Shipments (Admin) — `/api/v1/admin/shipments`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | /admin/shipments | Admin JWT + shipment.view | ✅ |
| GET | /admin/shipments/:id | Admin JWT + shipment.view | ✅ |
| PATCH | /admin/shipments/:id/status | Admin JWT + shipment.update | ✅ |

### Database Tables (Layer 8)

| Table | Status |
|-------|--------|
| addresses | ✅ Entity + Migration |
| warehouses | ✅ Entity + Migration |
| delivery_settings | ✅ Entity + Migration |
| shipments | ✅ Entity + Migration |
| shipment_tracking_logs | ✅ Entity + Migration |

### Migration Details

**Migration:** `1749200800000-Phase8ShippingAndDelivery.ts`

**Tables Created:**
- `addresses` — id, user_id (FK→users), full_name, phone, address_line_1, address_line_2, city, state, country, postal_code, latitude, longitude, is_default, timestamps, deleted_at
- `warehouses` — id, name, code (unique), phone, email, address, city, state, country, postal_code, latitude, longitude, is_active, timestamps, deleted_at
- `delivery_settings` — id, per_km_charge, free_shipping_threshold, max_delivery_distance_km, is_active, updated_by, timestamps
- `shipments` — id, order_id (FK→orders), warehouse_id (FK→warehouses), tracking_number (unique), status, notes, dispatched_at, delivered_at, timestamps
- `shipment_tracking_logs` — id, shipment_id (FK→shipments), status, note, changed_by, created_at

**Columns Added to `orders`:**
- `shipping_address_id` (FK→addresses, nullable)
- `warehouse_id` (FK→warehouses, nullable)
- `distance_km` (decimal, nullable)

### Permissions Added

| Permission | Slug |
|------------|------|
| Create Address | `address.create` |
| View Address | `address.view` |
| Update Address | `address.update` |
| Delete Address | `address.delete` |
| Create Warehouse | `warehouse.create` |
| View Warehouse | `warehouse.view` |
| Update Warehouse | `warehouse.update` |
| Delete Warehouse | `warehouse.delete` |
| Manage Delivery | `delivery.manage` |
| View Shipments | `shipment.view` |
| Update Shipments | `shipment.update` |

### Layer 8 Out of Scope

- Third-party courier APIs (Shiprocket, Delhivery, BlueDart)
- Return Management
- Exchange Management
- Pickup Scheduling
- Multi-Warehouse Inventory Allocation
- Delivery Partner Mobile App
- Route Optimization
- Subscription Delivery

---

## Layer 9 — Promotions, Coupons & Discounts Management (Complete)

| Module | Status | Started | Completed |
|--------|--------|---------|-----------|
| Coupon Management | ✅ Complete | 2026-06-08 | 2026-06-08 |
| Discount Rules Engine | ✅ Complete | 2026-06-08 | 2026-06-08 |
| Promotion Campaigns | ✅ Complete | 2026-06-08 | 2026-06-08 |
| Coupon Redemption Tracking | ✅ Complete | 2026-06-08 | 2026-06-08 |
| Checkout Discount Engine | ✅ Complete | 2026-06-08 | 2026-06-08 |

### Phase 9 Deliverables

- [x] Coupon Entity (soft delete, unique code, timestamps)
- [x] Promotion Entity (status, discount type, date range, priority, stackable)
- [x] CouponUsage Entity (couponId, userId, orderId, discountAmount)
- [x] DiscountRule Entity (promotionId, categoryId, productId, variantId, minimumQty, minimumAmount, buyX/getY)
- [x] DiscountType Enum (PERCENTAGE, FIXED, FREE_SHIPPING)
- [x] CouponType Enum (GENERAL, FIRST_ORDER, CATEGORY, PRODUCT)
- [x] PromotionStatus Enum (DRAFT, ACTIVE, EXPIRED, PAUSED)
- [x] DTOs (CreateCoupon, UpdateCoupon, ApplyCoupon, CreatePromotion with nested rules, UpdatePromotion, CouponQuery, PromotionQuery, DiscountResponse)
- [x] CouponsService (CRUD, unique code validation, code lookup, validation rules)
- [x] PromotionsService (CRUD with nested rules, active promotions lookup, auto-expire)
- [x] DiscountEngineService (applyCoupon, applyBestPromotion, calculateDiscountAmount, user validation, rule matching)
- [x] CouponUsageService (recordUsage, getUserUsageCount, findByOrder, findByUser)
- [x] CouponsController (admin CRUD with RBAC)
- [x] PromotionsController (admin CRUD with RBAC)
- [x] CustomerCouponsController (apply coupon, validate coupon)
- [x] PromotionsModule (TypeOrm + providers + exports)
- [x] Migration Phase9 (coupons, promotions, discount_rules, coupon_usages tables + FK + indexes)
- [x] Permission seeds (8 new: coupon.* + promotion.*)
- [x] Role mappings (PRODUCT_MANAGER gets coupon CRUD + promotion.view; ORDER_MANAGER gets coupon/promotion view)
- [x] Module registered in app.module.ts + data-source.ts
- [x] Swagger documentation (all endpoints documented with ApiTags, ApiOperation, ApiBearerAuth)
- [x] RBAC integration (AdminJwtGuard + PermissionsGuard + DefaultPermissions enum)
- [x] Zero TypeScript build errors
- [x] Zero new lint errors

### Business Rules Implemented

| Rule | Description |
|------|-------------|
| Coupon Code Unique | Enforced at DB + service level (case-insensitive uppercase storage) |
| Coupon Code Validation | Inactive, not-yet-started, expired, used-up, min-order, first-order-only checks |
| Per-User Limit | Tracks usage per user via CouponUsage table |
| Usage Limit | Global cap on total coupon redemptions |
| Percentage Discount | `amount = orderAmount × discountValue / 100`, capped by maximumDiscountAmount |
| Fixed Discount | `amount = min(discountValue, orderAmount)` |
| Free Shipping | Discount amount is 0 (handled by order service) |
| First Order Coupon | Only valid if user has no prior orders |
| Promotion Status | DRAFT → ACTIVE → EXPIRED (auto) or PAUSED |
| Auto-Expire | Promotions past endDate auto-set to EXPIRED |
| Priority System | Higher priority promotions applied first |
| Buy X Get Y | Buy X quantity → Get Y quantity free (via DiscountRule buyQuantity/getQuantity) |
| Product/Category Rules | Promotions restricted to specific products or categories |
| Minimum Quantity Rules | Requires minimum item quantity for promotion |
| Minimum Amount Rules | Requires minimum order amount for promotion |
| Best Promotion Auto-Select | autoExpirePromotions returns the best applicable promotion |
| Coupon + Promotion Independence | Coupons and promotions are evaluated separately |
| Soft Delete Coupons | Coupons support soft delete |
| Promotion Cascade Delete | Deleting a promotion cascades to its discount rules |

### API Endpoints

#### Admin Coupons — `/api/v1/admin/coupons`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | /admin/coupons | Admin JWT + coupon.create | ✅ |
| GET | /admin/coupons | Admin JWT + coupon.view | ✅ |
| GET | /admin/coupons/:id | Admin JWT + coupon.view | ✅ |
| PATCH | /admin/coupons/:id | Admin JWT + coupon.update | ✅ |
| DELETE | /admin/coupons/:id | Admin JWT + coupon.delete | ✅ |

#### Admin Promotions — `/api/v1/admin/promotions`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | /admin/promotions | Admin JWT + promotion.create | ✅ |
| GET | /admin/promotions | Admin JWT + promotion.view | ✅ |
| GET | /admin/promotions/:id | Admin JWT + promotion.view | ✅ |
| PATCH | /admin/promotions/:id | Admin JWT + promotion.update | ✅ |
| DELETE | /admin/promotions/:id | Admin JWT + promotion.delete | ✅ |

#### Customer Coupons — `/api/v1/coupons`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | /coupons/apply | Customer JWT | ✅ |
| GET | /coupons/validate/:code | Customer JWT | ✅ |

### Database Tables (Layer 9)

| Table | Status |
|-------|--------|
| coupons | ✅ Entity + Migration |
| promotions | ✅ Entity + Migration |
| discount_rules | ✅ Entity + Migration |
| coupon_usages | ✅ Entity + Migration |

### Migration Details

**Migration:** `1749200900000-Phase9PromotionsAndDiscounts.ts`

**Tables Created:**
- `coupons` — id, code (unique), name, description, type, discount_type, discount_value, minimum_order_amount, maximum_discount_amount, usage_limit, usage_per_user, used_count, starts_at, expires_at, is_active, created_by (FK→admin_users), timestamps, deleted_at
- `promotions` — id, name, description, status, discount_type, discount_value, start_date, end_date, priority, is_stackable, timestamps
- `discount_rules` — id, promotion_id (FK→promotions), category_id, product_id, variant_id, minimum_quantity, minimum_amount, buy_quantity, get_quantity, created_at
- `coupon_usages` — id, coupon_id (FK→coupons), user_id (FK→users), order_id (FK→orders), discount_amount, used_at

### Permissions Added

| Permission | Slug |
|------------|------|
| Create Coupon | `coupon.create` |
| View Coupon | `coupon.view` |
| Update Coupon | `coupon.update` |
| Delete Coupon | `coupon.delete` |
| Create Promotion | `promotion.create` |
| View Promotion | `promotion.view` |
| Update Promotion | `promotion.update` |
| Delete Promotion | `promotion.delete` |

### Layer 10 — Reviews, Ratings, Wishlist & Customer Engagement (Complete)

| Module | Status | Started | Completed |
|--------|--------|---------|-----------|
| Wishlist | ✅ Complete | 2026-06-08 | 2026-06-09 |
| Product Reviews | ✅ Complete | 2026-06-08 | 2026-06-09 |
| Product Ratings | ✅ Complete | 2026-06-08 | 2026-06-09 |
| Review Moderation | ✅ Complete | 2026-06-08 | 2026-06-09 |
| Review Media | ✅ Complete | 2026-06-08 | 2026-06-09 |
| Product Questions & Answers | ⏳ Pending | — | — |
| Recently Viewed Products | ⏳ Pending | — | — |
| Customer Engagement Metrics | ⏳ Pending | — | — |

### Phase 10 Deliverables

- [x] ReviewStatus Enum (PENDING, APPROVED, REJECTED, HIDDEN)
- [x] Wishlist Entity
- [x] WishlistItem Entity (with variantId nullable)
- [x] Review Entity (with helpfulCount)
- [x] ReviewImage Entity (soft delete support)
- [x] ReviewMedia Entity
- [x] Product entity extended (average_rating, total_ratings, total_reviews)
- [x] DTOs (CreateReview, UpdateReview, ReviewQuery, ReviewResponse, CreateWishlistItem, WishlistResponse)
- [x] WishlistService (getWishlist, addItem, removeItem, moveToCart, clearWishlist)
- [x] ReviewsService (create, update, remove, approve, reject, hide, recalculateProductRating)
- [x] WishlistController (GET /wishlist, POST /wishlist/items, DELETE /wishlist/items/:id, POST /wishlist/items/:id/move-to-cart, DELETE /wishlist)
- [x] ReviewsController (customer: POST /reviews, GET /reviews/my, GET /products/:productId/reviews, PATCH /reviews/:id, DELETE /reviews/:id)
- [x] AdminReviewsController (admin: GET, GET/:id, PATCH approve/reject/hide, DELETE)
- [x] WishlistModule (imports CartModule for moveToCart)
- [x] ReviewsModule
- [x] Migration Phase10 (wishlists, wishlist_items, reviews, review_images + product columns)
- [x] Migration Phase10Part2 (variant_id, helpful_count, deleted_at, HIDDEN enum, total_ratings/total_reviews)
- [x] Permissions (wishlist.view, review.*)
- [x] Role mappings (SUPPORT_MANAGER gets review.view; PRODUCT_MANAGER gets review approve/reject)
- [x] Module registration in app.module.ts + data-source.ts
- [x] Swagger tags in main.ts
- [x] Zero TypeScript build errors
- [x] Ratings auto-recalculated on create, update, delete, approve, reject
- [ ] Product Questions & Answers (entity, service, controller, migration)
- [ ] Recently Viewed Products (entity, service, controller, migration)
- [ ] Customer Engagement Metrics (analytics tracking)

### API Endpoints

#### Wishlist — `/api/v1/wishlist`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | /wishlist | Customer JWT | ✅ |
| POST | /wishlist/items | Customer JWT | ✅ |
| DELETE | /wishlist/items/:id | Customer JWT | ✅ |
| POST | /wishlist/items/:id/move-to-cart | Customer JWT | ✅ |
| DELETE | /wishlist | Customer JWT | ✅ |

#### Reviews (Customer) — `/api/v1/reviews`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | /reviews | Customer JWT | ✅ |
| GET | /reviews/my | Customer JWT | ✅ |
| GET | /products/:productId/reviews | Public | ✅ |
| PATCH | /reviews/:id | Customer JWT | ✅ |
| DELETE | /reviews/:id | Customer JWT | ✅ |

#### Reviews (Admin) — `/api/v1/admin/reviews`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | /admin/reviews | Admin JWT + review.view | ✅ |
| GET | /admin/reviews/:id | Admin JWT + review.view | ✅ |
| PATCH | /admin/reviews/:id/approve | Admin JWT + review.approve | ✅ |
| PATCH | /admin/reviews/:id/reject | Admin JWT + review.reject | ✅ |
| PATCH | /admin/reviews/:id/hide | Admin JWT + review.approve | ✅ |
| DELETE | /admin/reviews/:id | Admin JWT + review.delete | ✅ |

### Permissions Added

| Permission | Slug |
|------------|------|
| View Wishlist | `wishlist.view` |
| View Review | `review.view` |
| Create Review | `review.create` |
| Update Review | `review.update` |
| Delete Review | `review.delete` |
| Approve Review | `review.approve` |
| Reject Review | `review.reject` |

### Business Rules Implemented

| Rule | Description |
|------|-------------|
| No Duplicate Products | Unique constraint on (wishlistId, productId) + ConflictException |
| Customer Only Access | JwtAuthGuard on all wishlist/review endpoints |
| Verified Purchase | Only DELIVERED orders can be reviewed |
| One Review Per Item | Unique constraint on orderItemId |
| Rating 1-5 Only | @Min(1) @Max(5) validation on DTOs |
| Approval Required | Default PENDING status, only APPROVED shown publicly |
| Auto Rating Recalc | averageRating/totalRatings/totalReviews recalculated on create, update, approve, reject, delete |
| Soft Delete Reviews | DeleteDateColumn on Review + ReviewImage entities |
| HIDDEN Status | Admin can hide inappropriate reviews |
| Move to Cart | Wishlist items can be moved to cart with quantity 1 |
| Clear Wishlist | All items removed in one operation |
| Variant Support | WishlistItem supports optional variantId |

### Layer 10 Out of Scope

- Product Questions & Answers (pending)
- Recently Viewed Products (pending)
- Customer Engagement Metrics (pending)
- Wishlist sharing / public wishlists
- Review voting (helpful/not helpful)
- Review images upload endpoint (manual image URL entry for now)
- Review analytics / moderation queue dashboard
- Review reply from seller
- Photo/Video reviews with media upload
- Average rating history tracking

---

## Layer 11 — Wishlist & Saved Items Management (Complete)

---

## Layer 12 — Reviews, Ratings, Product Q&A & Customer Feedback (Complete)

| Module | Status | Started | Completed |
|--------|--------|---------|-----------|
| Product Reviews | ✅ Complete | 2026-06-09 | 2026-06-09 |
| Product Ratings | ✅ Complete | 2026-06-09 | 2026-06-09 |
| Review Images | ✅ Complete | 2026-06-09 | 2026-06-09 |
| Review Moderation | ✅ Complete | 2026-06-09 | 2026-06-09 |
| Review Helpful Votes | ✅ Complete | 2026-06-09 | 2026-06-09 |
| Review Reports | ✅ Complete | 2026-06-09 | 2026-06-09 |
| Product Questions | ✅ Complete | 2026-06-09 | 2026-06-09 |
| Product Answers | ✅ Complete | 2026-06-09 | 2026-06-09 |
| Customer Feedback Analytics | ✅ Complete | 2026-06-09 | 2026-06-09 |

### Phase 12 Deliverables

- [x] Review entity updated (variantId, adminNote)
- [x] ReviewHelpfulVote entity (unique reviewId+userId)
- [x] ReviewReport entity (reason enum: SPAM, OFFENSIVE, FAKE_REVIEW, OTHER)
- [x] ProductQuestion entity (status: OPEN, ANSWERED, CLOSED)
- [x] ProductAnswer entity (isAdminAnswer)
- [x] Product entity updated (fiveStarCount through oneStarCount)
- [x] Rating aggregation with star distribution
- [x] Verified purchase validation
- [x] Review moderation workflow (approve, reject, hide)
- [x] Helpful vote tracking (vote/removeVote with helpfulCount increment/decrement)
- [x] Abuse reporting system
- [x] Product Q&A system
- [x] Admin review management
- [x] Admin Q&A management
- [x] Review analytics (total, approved, pending, rejected, averageRating, distribution, mostReviewed, mostHelpful)
- [x] 7-day edit window enforcement
- [x] Swagger documentation (all endpoints have ApiOperation, ApiBearerAuth)
- [x] RBAC integration (REVIEW_MODERATE, QUESTION_VIEW, QUESTION_ANSWER, QUESTION_DELETE)
- [x] Migration Phase12ReviewsRatingsAndQA
- [x] Seed updates (new permissions + role mappings)
- [x] Zero TypeScript build errors

### API Endpoints

#### Reviews (Customer) — `/api/v1/reviews`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | /reviews | Customer JWT | ✅ |
| GET | /reviews/my | Customer JWT | ✅ |
| GET | /reviews/product/:productId | Public | ✅ |
| GET | /reviews/:id | Public | ✅ |
| PATCH | /reviews/:id | Customer JWT | ✅ |
| DELETE | /reviews/:id | Customer JWT | ✅ |
| POST | /reviews/:id/helpful | Customer JWT | ✅ |
| DELETE | /reviews/:id/helpful | Customer JWT | ✅ |
| POST | /reviews/:id/report | Customer JWT | ✅ |

#### Questions (Customer) — `/api/v1/questions`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | /questions | Customer JWT | ✅ |
| GET | /questions/product/:productId | Public | ✅ |
| GET | /questions/:id | Public | ✅ |

#### Reviews (Admin) — `/api/v1/admin/reviews`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | /admin/reviews | Admin JWT + review.view | ✅ |
| GET | /admin/reviews/analytics | Admin JWT + review.view | ✅ |
| GET | /admin/reviews/:id | Admin JWT + review.view | ✅ |
| PATCH | /admin/reviews/:id/approve | Admin JWT + review.approve | ✅ |
| PATCH | /admin/reviews/:id/reject | Admin JWT + review.reject | ✅ |
| PATCH | /admin/reviews/:id/hide | Admin JWT + review.moderate | ✅ |
| DELETE | /admin/reviews/:id | Admin JWT + review.delete | ✅ |

#### Questions (Admin) — `/api/v1/admin/questions`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | /admin/questions | Admin JWT + question.view | ✅ |
| GET | /admin/questions/:id | Admin JWT + question.view | ✅ |
| POST | /admin/questions/:id/answer | Admin JWT + question.answer | ✅ |
| PATCH | /admin/questions/:id/close | Admin JWT + question.answer | ✅ |
| DELETE | /admin/questions/:id | Admin JWT + question.delete | ✅ |

### Permissions Added

| Permission | Slug |
|------------|------|
| Moderate Review | `review.moderate` |
| View Question | `question.view` |
| Answer Question | `question.answer` |
| Delete Question | `question.delete` |

### Business Rules Implemented

| Rule | Description |
|------|-------------|
| Verified Purchase | Only DELIVERED orders can be reviewed |
| One Review Per Item | Unique constraint on orderItemId |
| Rating 1-5 Only | @Min(1) @Max(5) validation |
| 7-Day Edit Window | Can only edit own review within 7 days of creation |
| Approval Required | Default PENDING status, only APPROVED shown publicly |
| Rating Auto-Recalc | averageRating + star counts recalculated on every create/update/delete/approve/reject |
| Helpful Vote Once | Unique (reviewId, userId) constraint; removing vote decrements count |
| Report Reasons | SPAM, OFFENSIVE, FAKE_REVIEW, OTHER |
| Question Status Flow | OPEN → ANSWERED (when admin answers) → CLOSED (admin can close) |
| Admin Answers | Marked with isAdminAnswer = true |
| Soft Delete Reviews | DeleteDateColumn on Review |
| Variant Support | Review can optionally link to a variant (SET NULL on delete) |

| Module | Status | Started | Completed |
|--------|--------|---------|-----------|
| Wishlist (Rebuild) | ✅ Complete | 2026-06-09 | 2026-06-09 |
| Wishlist Items | ✅ Complete | 2026-06-09 | 2026-06-09 |
| Move To Cart | ✅ Complete | 2026-06-09 | 2026-06-09 |
| Save For Later | ✅ Complete | 2026-06-09 | 2026-06-09 |
| Wishlist Analytics | ✅ Complete | 2026-06-09 | 2026-06-09 |

### Phase 11 Deliverables

- [x] Wishlist entity updated (totalItems, deletedAt)
- [x] WishlistItem entity updated (addedAt, unique wishlistId+productId+variantId via COALESCE)
- [x] Product validation (ACTIVE, not ARCHIVED) on add item
- [x] Variant validation (exists, belongs to product, ACTIVE) on add item
- [x] MoveToCart with inventory validation (availableQuantity < 1 → 400)
- [x] Save For Later functionality (cart item → wishlist, cart recalculated)
- [x] TotalItems tracking and maintenance (recounted after every add/remove)
- [x] Soft delete wishlist (deletedAt + paranoid filter)
- [x] Cascade delete on user
- [x] Wishlist analytics tracking (GET /wishlist/count)
- [x] Migration Phase11WishlistSavedItems (executed successfully)
- [x] Zero TypeScript build errors
- [x] Swagger documentation
- [x] project-status.md updated

### API Endpoints

#### Wishlist — `/api/v1/wishlist`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | /wishlist | Customer JWT | ✅ |
| GET | /wishlist/count | Customer JWT | ✅ |
| POST | /wishlist/items | Customer JWT | ✅ |
| DELETE | /wishlist/items/:id | Customer JWT | ✅ |
| POST | /wishlist/items/:id/move-to-cart | Customer JWT | ✅ |
| POST | /wishlist/save-for-later | Customer JWT | ✅ |
| DELETE | /wishlist | Customer JWT | ✅ |
| DELETE | /wishlist/delete | Customer JWT | ✅ |

---

## Layer 13 — Email Notifications & Communication Center

### Status: ✅ Complete

### Deliverables

- [x] Email infrastructure: nodemailer + handlebars (template rendering)
- [x] Bull queue for async email processing (backed by Redis)
- [x] Email template CRUD (DB-stored, admin managed)
- [x] Notification preferences per user (order/payment/shipment/promotional/review toggles)
- [x] Notification logs (status tracking, sent/failed/queued)
- [x] Default email templates seeded (17 templates: welcome, verify, password, order, payment, shipment, wishlist, review)
- [x] Customer endpoints: GET/PATCH notification preferences
- [x] Admin endpoints: email template CRUD, notification logs, send test email
- [x] New permissions: notification.view, notification.manage, email_template.*
- [x] Seed updated (SUPER_ADMIN, PRODUCT_MANAGER, SUPPORT_MANAGER roles)
- [x] Migration Phase13EmailNotifications (3 tables: email_templates, notification_preferences, notification_logs)
- [x] Integration triggers wired into Auth, Orders, Payments, Refunds, Shipments
- [x] Zero TypeScript build errors

### Architecture

```
┌─────────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ Existing Services   │────▶│ Notifications    │────▶│ EmailQueueService│
│ (Auth/Orders/etc.)  │     │ Service          │     │ (Bull Producer)   │
└─────────────────────┘     └──────────────────┘     └──────────────────┘
                                                           │
                                                    ┌──────┴──────┐
                                                    │ Email       │
                                                    │ Processor   │
                                                    │ (Consumer)   │
                                                    └──────┬──────┘
                                                           │
                                                    ┌──────┴──────┐
                                                    │ EmailService │
                                                    │ (nodemailer) │
                                                    └─────────────┘
```

### New Entities (3 tables)

| Entity | Table | Key Fields |
|--------|-------|------------|
| EmailTemplate | email_templates | name, code (unique), subject, body, isActive |
| NotificationPreference | notification_preferences | userId (unique), orderEmails, paymentEmails, shipmentEmails, promotionalEmails, reviewEmails |
| NotificationLog | notification_logs | userId (nullable), recipient, templateCode, subject, status, errorMessage, sentAt |

### New Permissions

| Permission | Slug | Assigned To |
|------------|------|-------------|
| View Notification Logs | `notification.view` | SUPER_ADMIN, PRODUCT_MANAGER, SUPPORT_MANAGER |
| Manage Notifications | `notification.manage` | SUPER_ADMIN, SUPPORT_MANAGER |
| View Email Templates | `email_template.view` | SUPER_ADMIN, PRODUCT_MANAGER, SUPPORT_MANAGER |
| Create Email Templates | `email_template.create` | SUPER_ADMIN, PRODUCT_MANAGER |
| Update Email Templates | `email_template.update` | SUPER_ADMIN, PRODUCT_MANAGER |
| Delete Email Templates | `email_template.delete` | SUPER_ADMIN, PRODUCT_MANAGER |

### API Endpoints

#### Email Templates (Admin) — `/api/v1/admin/email-templates`

| Method | Path | Permission | Status |
|--------|------|------------|--------|
| POST | /admin/email-templates | email_template.create | ✅ |
| GET | /admin/email-templates | email_template.view | ✅ |
| GET | /admin/email-templates/:id | email_template.view | ✅ |
| PATCH | /admin/email-templates/:id | email_template.update | ✅ |
| DELETE | /admin/email-templates/:id | email_template.delete | ✅ |

#### Notifications (Admin) — `/api/v1/admin/notifications`

| Method | Path | Permission | Status |
|--------|------|------------|--------|
| GET | /admin/notifications/logs | notification.view | ✅ |
| GET | /admin/notifications/logs/:id | notification.view | ✅ |
| POST | /admin/notifications/send-test | notification.manage | ✅ |

#### Notification Preferences (Customer) — `/api/v1/notifications/preferences`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | /notifications/preferences | Customer JWT | ✅ |
| PATCH | /notifications/preferences | Customer JWT | ✅ |

### Email Trigger Integration Points

| Service | Method | Event | Email Sent |
|---------|--------|-------|------------|
| AuthService | register() | User registered | Welcome + Verify Email |
| AuthService | resendOtp() | OTP resent | Verify Email / Password Reset |
| AuthService | verifyEmail() | Email verified | Email Verified Confirmation |
| AuthService | forgotPassword() | Forgot password | Password Reset OTP |
| AuthService | resetPassword() | Password reset | Password Reset Confirmation |
| OrdersService | createOrder() | Order placed | Order Confirmation |
| PaymentsService | confirmPayment() | Payment success | Payment Success |
| PaymentsService | confirmPayment() | Payment failed | Payment Failed |
| PaymentsService | handleWebhook() | Webhook refund | Refund Processed |
| PaymentsService | handleWebhook() | Webhook payment failed | Payment Failed |
| RefundsService | createRefund() | Manual refund | Refund Processed |
| ShipmentsService | createShipment() | Shipment created | Shipment Created |
| ShipmentsService | updateStatus() | Out for delivery | Out for Delivery |
| ShipmentsService | updateStatus() | Delivered | Order Delivered |

### Seeded Email Templates (17)

1. **welcome** — Welcome to Sports Store
2. **verify_email** — Email Verification (with OTP)
3. **password_reset** — Password Reset (with OTP)
4. **password_reset_confirm** — Password Reset Confirmation
5. **email_verified** — Email Verified Successfully
6. **order_confirmation** — Order #{{orderNumber}} Confirmed
7. **payment_success** — Payment Received for Order #{{orderNumber}}
8. **payment_failed** — Payment Failed for Order #{{orderNumber}}
9. **payment_processing** — Payment Processing for Order #{{orderNumber}}
10. **refund_processed** — Refund Processed for Order #{{orderNumber}}
11. **shipment_created** — Order #{{orderNumber}} Is Being Prepared
12. **shipment_out_for_delivery** — Your Order #{{orderNumber}} Is Out for Delivery
13. **order_delivered** — Order #{{orderNumber}} Delivered
14. **shipment_status_update** — Shipment Update for Order #{{orderNumber}}
15. **wishlist_back_in_stock** — Item Back in Stock
16. **price_drop_alert** — Price Dropped on Your Wishlist Item
17. **review_reminder** — How Was Your Purchase?

---

## Layer 14 — Advanced Product Search, Filtering, Discovery & Catalog Intelligence

### Status: ✅ Complete

### Module Build Log

| Module | Status | Started | Completed |
|--------|--------|---------|-----------|
| Search Module (entities, DTOs, services, controllers, wiring) | ✅ Done | 2026-06-10 | 2026-06-10 |
| Search Controller (search/suggestions/filter-options/recent/click/category/brand/collection) | ✅ Done | 2026-06-10 | 2026-06-10 |
| Discovery Controller (related/also-viewed/frequently-bought/trending/new-arrivals/recently-viewed/recommended/similar/recent-trending/seasonal) | ✅ Done | 2026-06-10 | 2026-06-10 |
| Admin Search Controller (analytics/summary/top-keywords/trending/no-results/clear-cache) | ✅ Done | 2026-06-10 | 2026-06-10 |
| Migration Phase14SearchAndDiscovery (3 tables) | ✅ Done | 2026-06-10 | 2026-06-10 |
| Migration Phase14SearchPerformanceIndexes (9 indexes) | ✅ Done | 2026-06-10 | 2026-06-10 |
| Seed permissions (search_analytics.view + search_analytics.manage) | ✅ Done | 2026-06-10 | 2026-06-10 |

### New Entities (3 tables)

| Entity | Table | Key Fields |
|--------|-------|------------|
| SearchLog | search_logs | userId (nullable), keyword, resultsCount, clickedProductId (nullable), convertedOrderId (nullable), ipAddress (nullable) |
| RecentSearch | recent_searches | userId + keyword (unique composite), timestamps |
| ProductView | product_views | userId (nullable), productId, viewedAt |

### API Endpoints

#### Search (Customer) — `/api/v1/search`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | /search | Public | ✅ |
| GET | /search/suggestions | Public | ✅ |
| GET | /search/trending | Public | ✅ |
| GET | /search/filter-options | Public | ✅ |
| GET | /search/recent | Customer JWT | ✅ |
| POST | /search/click | Public | ✅ |
| GET | /search/category/:slug | Public | ✅ |
| GET | /search/brand/:slug | Public | ✅ |
| GET | /search/collection/:slug | Public | ✅ |

#### Search (Admin) — `/api/v1/admin/search`

| Method | Path | Permission | Status |
|--------|------|------------|--------|
| GET | /admin/search/analytics | search_analytics.view | ✅ |
| GET | /admin/search/summary | search_analytics.view | ✅ |
| GET | /admin/search/top-keywords | search_analytics.view | ✅ |
| GET | /admin/search/trending | search_analytics.view | ✅ |
| GET | /admin/search/no-results | search_analytics.view | ✅ |
| DELETE | /admin/search/cache | search_analytics.manage | ✅ |

#### Discovery — `/api/v1/discovery`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | /discovery/related/:productId | Public | ✅ |
| GET | /discovery/also-viewed/:productId | Public | ✅ |
| GET | /discovery/frequently-bought/:productId | Public | ✅ |
| GET | /discovery/trending | Public | ✅ |
| GET | /discovery/featured | Public | ✅ |
| GET | /discovery/new-arrivals | Public | ✅ |
| GET | /discovery/recently-viewed | Customer JWT | ✅ |
| GET | /discovery/recommended | Customer JWT | ✅ |
| GET | /discovery/similar/:productId | Public | ✅ |
| GET | /discovery/recent-trending | Public | ✅ |
| GET | /discovery/seasonal | Public | ✅ |
| POST | /discovery/record-view | Public | ✅ |

### New Permissions

| Permission | Slug | Assigned To |
|------------|------|-------------|
| View Search Analytics | `search_analytics.view` | SUPER_ADMIN, ADMIN |
| Manage Search Analytics | `search_analytics.manage` | SUPER_ADMIN, ADMIN |

### Search Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| q | string | Keyword full-text search (ILIKE on name, description) |
| categoryIds | UUID[] | Filter by categories |
| brandIds | UUID[] | Filter by brands |
| collectionIds | UUID[] | Filter by collections |
| attributeValueIds | UUID[] | Generic attribute value filtering (alternative to per-attribute params) |
| sizes | string[] | Filter by variant size attributes |
| colors | string[] | Filter by variant color attributes |
| materials | string[] | Filter by variant material attributes |
| genders | string[] | Filter by variant gender attributes |
| sports | string[] | Filter by variant sport attributes |
| priceBuckets | string[] | Faceted price ranges (e.g. 0-500,500-1000,1000-2000,2000+) |
| availability | enum | IN_STOCK, OUT_OF_STOCK, PREORDER |
| tags | string[] | Filter by product tag slugs |
| minPrice | number | Minimum price filter |
| maxPrice | number | Maximum price filter |
| minRating | number | Minimum average rating (0-5) |
| maxRating | number | Maximum average rating (0-5) |
| minDiscount | number | Minimum discount percentage (0-100) |
| maxDiscount | number | Maximum discount percentage (0-100) |
| inStock | boolean | Only show in-stock products |
| hasReview | boolean | Only products with at least one review |
| isFeatured | boolean | Only featured products |
| isNewArrival | boolean | Products created within last 30 days |
| isBestSeller | boolean | Products with 10+ reviews |
| onSale | boolean | Products with any variant on sale (compare_at_price > price) |
| createdAfter | ISO date | Products created after date |
| createdBefore | ISO date | Products created before date |
| sellerIds | UUID[] | Future marketplace support |
| warehouseIds | UUID[] | Future inventory-aware search |
| countryOfOrigin | string[] | Product origin country filter |
| sort | enum | relevance (default), newest, price_asc, price_desc, highest_rated, name_asc, name_desc, discount_desc |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 100 max) |

### Business Rules Implemented

| Rule | Description |
|------|-------------|
| Only Active Products | Search results exclude DRAFT, INACTIVE, ARCHIVED |
| ILIKE Full-Text Search | Case-insensitive pattern match on product name + description |
| Dynamic Attribute Filters | Sizes/colors/materials/genders/sports filter via subqueries through product_variants → product_variant_attributes → attribute_values |
| Price Range Filter | Products with at least one variant price in range |
| Rating Filter | Products with average_rating >= threshold |
| Discount Filter | Products with at least one variant having compare_at_price > price and discount ≥ threshold |
| In-Stock Filter | Products with at least one variant having available_quantity > 0 |
| Search Suggestions | Products (by rating) → Brands → Categories → Collections → Popular Searches |
| Trending Products (30d) | COUNT(DISTINCT) aggregation from product_views + order_items + wishlist_items |
| Trending Keywords (7d vs 30d) | Growth rate calculation: ((current - previous) / previous) × 100 |
| Dedup Product Views | Skips recording if same user+product viewed within 30 minutes |
| Recent Searches Capped | Max 20 per user, deletes oldest when limit exceeded |
| Click Tracking | POST /search/click logs which search result was clicked |
| Filter Options | Returns distinct available brands, categories, collections, price range, sizes/colors/materials from active products |
| minRating / maxRating | Replaces old single `rating` param — supports range filtering |
| minDiscount / maxDiscount | Replaces old single `discount` param — supports range filtering |
| hasReview | Filters to products with `total_reviews > 0` |
| isFeatured | Filters to `is_featured = true` |
| isNewArrival | Filters to products created within last 30 days |
| isBestSeller | Filters to products with 10+ reviews (high purchase count proxy) |
| onSale | Filters to products where any variant has `compare_at_price > price` |
| Category/Brand/Collection Slug Routes | Resolves slug to ID, then delegates to search with the ID filter set |
| Generic attributeValueIds | Filters by any attribute value ID (not just size/color/material/gender/sport) |
| Price Buckets | Pre-defined price ranges for faceted search (e.g. 0-500, 500-1000) |
| Availability | IN_STOCK/OUT_OF_STOCK/PREORDER filter via inventory + variant status |
| Tags | Filter by product tag slugs via product_tag_mappings |
| Created Date Range | createdAfter/createdBefore for archival or new-arrival date ranges |
| Seller/Warehouse/Country | Future-ready filter params accepted but no-op until those features exist |
| Recommended | Personalized recommendations based on user's viewed categories |
| Similar Products | Products in same category + brand, ordered by rating |
| Recent Trending | Trending products within 7 days (faster window than 30d) |
| Seasonal | Products matching season keywords based on current month |
| Analytics Summary | searchCount, clickCount, CTR, conversionRate, avgPositionClicked |
| Search Performance Indexes | 9 new indexes (status, brand, category, rating, price, stock, product_collections) |

### Deliverables

- [x] SearchLog entity + migration
- [x] RecentSearch entity + migration
- [x] ProductView entity + migration
- [x] SearchQueryDto with all filters + sort + pagination
- [x] SearchService (ILIKE + joins + attribute subqueries + pagination)
- [x] SearchSuggestionsService (products/brands/categories/collections/popular searches)
- [x] SearchAnalyticsService (logSearch, logClick, logConversion, top keywords, trending, no-results)
- [x] DiscoveryService (related, also-viewed, frequently-bought, trending, featured, new-arrivals, recently-viewed)
- [x] SearchController (6 endpoints)
- [x] DiscoveryController (8 endpoints)
- [x] AdminSearchController (5 endpoints)
- [x] SearchModule (TypeOrm imports + providers + exports)
- [x] Migration Phase14SearchAndDiscovery (3 tables with indexes + FKs)
- [x] Seed permissions (search_analytics.view + search_analytics.manage)
- [x] Role mappings (ADMIN gets both permissions)
- [x] Zero TypeScript build errors
- [x] Enhanced filter fields (minRating/maxRating/minDiscount/maxDiscount/hasReview/isFeatured/isNewArrival/isBestSeller/onSale)
- [x] Category/brand/collection slug routes (/search/category/:slug, /search/brand/:slug, /search/collection/:slug)
- [x] attributeValueIds generic filter
- [x] priceBuckets faceted search
- [x] availability filter (IN_STOCK/OUT_OF_STOCK/PREORDER)
- [x] tags[] filter
- [x] createdAfter/createdBefore date range filter
- [x] sellerIds/warehouseIds/countryOfOrigin future-ready params
- [x] Discovery: GET /discovery/recommended (JWT)
- [x] Discovery: GET /discovery/similar/:productId
- [x] Discovery: GET /discovery/recent-trending
- [x] Discovery: GET /discovery/seasonal
- [x] Analytics: GET /admin/search/summary (searchCount, clickCount, CTR, conversionRate, avgPositionClicked)
- [x] Migration Phase14SearchPerformanceIndexes (9 indexes)

---

## Layer 15 — Coupons, Promotions, Discount Engine & Marketing Campaigns

### Status: ✅ Complete

### Module Build Log

| Module | Status | Started | Completed |
|--------|--------|---------|-----------|
| Coupon Module | ✅ Done | 2026-06-10 | 2026-06-10 |
| Promotion Module | ✅ Done | 2026-06-10 | 2026-06-10 |
| Campaign Module | ✅ Done | 2026-06-10 | 2026-06-10 |
| Discount Calculation Engine | ✅ Done | 2026-06-10 | 2026-06-10 |
| Coupon Validation Engine | ✅ Done | 2026-06-10 | 2026-06-10 |
| Marketing Analytics | ✅ Done | 2026-06-10 | 2026-06-10 |
| Admin Coupon Management | ✅ Done | 2026-06-10 | 2026-06-10 |
| Admin Promotion Management | ✅ Done | 2026-06-10 | 2026-06-10 |
| Admin Campaign Management | ✅ Done | 2026-06-10 | 2026-06-10 |
| Migration Phase15CouponsPromotions | ✅ Done | 2026-06-10 | 2026-06-10 |

### New Entities (6 tables)

| Entity | Table | Key Fields |
|--------|-------|------------|
| Coupon | coupons | code (unique), type (PERCENTAGE/FIXED_AMOUNT/FREE_SHIPPING), value, startDate, endDate, maxUses, maxUsesPerUser, minimumOrderAmount, maximumDiscountAmount, firstOrderOnly, isStackable, usageCount |
| CouponUsage | coupon_usages | couponId, userId, orderId, discountAmount |
| Promotion | promotions | name, type (PRODUCT_DISCOUNT/CATEGORY_DISCOUNT/CART_DISCOUNT/BUY_X_GET_Y/FLASH_SALE), discountValue, startDate, endDate, priority, isStackable, autoApply |
| PromotionProduct | promotion_products | promotionId, productId (join table) |
| PromotionCategory | promotion_categories | promotionId, categoryId (join table) |
| Campaign | campaigns | name, type (SUMMER_SALE/FESTIVAL_SALE/CLEARANCE/BLACK_FRIDAY/CUSTOM), bannerUrl, landingPageUrl, discountValue, startDate, endDate, priority |

### API Endpoints

#### Customer Coupons — `/api/v1/coupons`
| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | /coupons/validate | Customer JWT | ✅ |
| POST | /coupons/apply | Customer JWT | ✅ |
| DELETE | /coupons/remove | Customer JWT | ✅ |

#### Customer Promotions — `/api/v1/promotions`
| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | /promotions | Public | ✅ |
| GET | /promotions/active | Public | ✅ |
| GET | /promotions/:id | Public | ✅ |

#### Admin Coupons — `/api/v1/admin/coupons`
| Method | Path | Permission | Status |
|--------|------|------------|--------|
| POST | /admin/coupons | coupon.create | ✅ |
| GET | /admin/coupons | coupon.view | ✅ |
| GET | /admin/coupons/:id | coupon.view | ✅ |
| PATCH | /admin/coupons/:id | coupon.update | ✅ |
| DELETE | /admin/coupons/:id | coupon.delete | ✅ |

#### Admin Promotions — `/api/v1/admin/promotions`
| Method | Path | Permission | Status |
|--------|------|------------|--------|
| POST | /admin/promotions | promotion.create | ✅ |
| GET | /admin/promotions | promotion.view | ✅ |
| GET | /admin/promotions/:id | promotion.view | ✅ |
| PATCH | /admin/promotions/:id | promotion.update | ✅ |
| DELETE | /admin/promotions/:id | promotion.delete | ✅ |

#### Admin Campaigns — `/api/v1/admin/campaigns`
| Method | Path | Permission | Status |
|--------|------|------------|--------|
| POST | /admin/campaigns | campaign.create | ✅ |
| GET | /admin/campaigns | campaign.view | ✅ |
| GET | /admin/campaigns/:id | campaign.view | ✅ |
| PATCH | /admin/campaigns/:id | campaign.update | ✅ |
| DELETE | /admin/campaigns/:id | campaign.delete | ✅ |

#### Admin Analytics — `/api/v1/admin/analytics`
| Method | Path | Permission | Status |
|--------|------|------------|--------|
| GET | /admin/analytics/coupons | coupon.view | ✅ |
| GET | /admin/analytics/promotions | promotion.view | ✅ |
| GET | /admin/analytics/campaigns | campaign.view | ✅ |

### New Permissions

| Permission | Slug | Assigned To |
|------------|------|-------------|
| View Campaigns | `campaign.view` | SUPER_ADMIN, PRODUCT_MANAGER, ORDER_MANAGER |
| Create Campaign | `campaign.create` | SUPER_ADMIN, PRODUCT_MANAGER |
| Update Campaign | `campaign.update` | SUPER_ADMIN, PRODUCT_MANAGER |
| Delete Campaign | `campaign.delete` | SUPER_ADMIN, PRODUCT_MANAGER |

### Key Business Rules

| Rule | Description |
|------|-------------|
| Coupon Code Unique | Unique constraint at DB + service level |
| Coupon Date Validation | Rejects if not yet active or expired |
| Usage Limit | Global and per-user limits enforced |
| Minimum Order | Rejects if order amount below minimum |
| First Order Only | Rejects if user has existing orders |
| Percentage Discount | `amount = orderAmount × value / 100`, capped by maximumDiscountAmount |
| Fixed Amount Discount | `amount = min(value, orderAmount)` |
| Free Shipping | Discount amount is 0 |
| Promotion Priority | Higher priority promotions applied first |
| Auto-Expire | Promotions and campaigns past endDate auto-deactivated |
| Buy X Get Y | Supported via PromotionType |
| Flash Sale | Highest priority promotion type |
| Promotion Scheduling | Supports product-specific and category-specific discounts |
| Campaign Scheduling | Automatic activation/deactivation |

### Deliverables

- [x] Coupon Entity + CouponUsage Entity
- [x] Promotion Entity + PromotionProduct + PromotionCategory
- [x] Campaign Entity
- [x] CouponService, CouponUsageService, CouponValidationService
- [x] PromotionService, CampaignService
- [x] DiscountCalculationService
- [x] AnalyticsService
- [x] CouponController (admin), PromotionController (admin), CampaignController (admin)
- [x] CustomerCouponController, CustomerPromotionController
- [x] AnalyticsController
- [x] CouponsPromotionsModule
- [x] Migration Phase15CouponsPromotions (6 tables, 3 enums, indexes, FKs)
- [x] Seed permissions (campaign.*)
- [x] Role mappings (SUPER_ADMIN, PRODUCT_MANAGER, ORDER_MANAGER)
- [x] app.module.ts wiring
- [x] data-source.ts wiring
- [x] Zero TypeScript build errors

---

## Layer 16 — Inventory Intelligence, Stock Alerts, Purchase Orders & Supplier Management

### Status: ✅ Complete

### Module Build Log

| Module | Status | Started | Completed |
|--------|--------|---------|-----------|
| Supplier Management | ✅ Done | 2026-06-11 | 2026-06-11 |
| Purchase Order Management | ✅ Done | 2026-06-11 | 2026-06-11 |
| Goods Receipt (GRN) | ✅ Done | 2026-06-11 | 2026-06-11 |
| Stock Adjustments | ✅ Done | 2026-06-11 | 2026-06-11 |
| Stock Alerts | ✅ Done | 2026-06-11 | 2026-06-11 |
| Inventory Audits | ✅ Done | 2026-06-11 | 2026-06-11 |
| Inventory Analytics | ✅ Done | 2026-06-11 | 2026-06-11 |
| Migration Phase16InventoryManagement | ✅ Done | 2026-06-11 | 2026-06-11 |
| Migration Phase16Part2InventoryImprovements | ✅ Done | 2026-06-11 | 2026-06-11 |

### New Entities (8 tables)

| Entity | Table | Key Fields |
|--------|-------|------------|
| Supplier | suppliers | code (unique), name, contactPerson, email, phone, address, isActive, paymentTerms, leadTimeDays, deletedAt (soft delete) |
| PurchaseOrder | purchase_orders | poNumber (unique), supplierId, status (DRAFT/APPROVED/PARTIALLY_RECEIVED/RECEIVED/CLOSED/CANCELLED), totalAmount, expectedDate, notes |
| PurchaseOrderItem | purchase_order_items | purchaseOrderId, variantId, quantity, receivedQuantity, costPrice, lineTotal |
| GoodsReceipt | goods_receipts | receiptNumber (unique), purchaseOrderId, receivedBy, notes |
| GoodsReceiptItem | goods_receipt_items | receiptId, variantId, quantityReceived |
| StockAdjustment | stock_adjustments | variantId, previousQuantity, newQuantity, reason |
| StockAlert | stock_alerts | variantId, alertType (LOW_STOCK/OUT_OF_STOCK), thresholdQuantity, currentQuantity, isResolved, triggeredAt, resolvedAt |
| InventoryAudit | inventory_audits | variantId, actionType (STOCK_IN/STOCK_OUT/ADJUSTMENT/RESERVATION/RELEASE/GOODS_RECEIPT/MANUAL_ADJUST), beforeQuantity, afterQuantity, referenceType, referenceId |
| POCounter | po_sequence_counters | year (PK), last_number (atomic counter for PO number generation) |
| GRNCounter | grn_sequence_counters | locked (PK, single row), last_number (atomic counter for GRN number generation) |

### API Endpoints

#### Admin Suppliers — `/api/v1/admin/suppliers`
| Method | Path | Permission | Status |
|--------|------|------------|--------|
| POST | /admin/suppliers | supplier.create | ✅ |
| GET | /admin/suppliers | supplier.view | ✅ |
| GET | /admin/suppliers/:id | supplier.view | ✅ |
| PATCH | /admin/suppliers/:id | supplier.update | ✅ |
| DELETE | /admin/suppliers/:id | supplier.delete | ✅ |

#### Admin Purchase Orders — `/api/v1/admin/purchase-orders`
| Method | Path | Permission | Status |
|--------|------|------------|--------|
| POST | /admin/purchase-orders | purchase_order.create | ✅ |
| GET | /admin/purchase-orders | purchase_order.view | ✅ |
| GET | /admin/purchase-orders/:id | purchase_order.view | ✅ |
| PATCH | /admin/purchase-orders/:id | purchase_order.update | ✅ |
| POST | /admin/purchase-orders/:id/approve | purchase_order.approve | ✅ |
| POST | /admin/purchase-orders/:id/cancel | purchase_order.cancel | ✅ |

#### Admin Goods Receipts — `/api/v1/admin/goods-receipts`
| Method | Path | Permission | Status |
|--------|------|------------|--------|
| POST | /admin/goods-receipts | inventory.receive | ✅ |
| GET | /admin/goods-receipts | inventory.view | ✅ |
| GET | /admin/goods-receipts/:id | inventory.view | ✅ |

#### Admin Inventory Plus — `/api/v1/admin/inventory-plus`
| Method | Path | Permission | Status |
|--------|------|------------|--------|
| GET | /admin/inventory-plus | inventory.view | ✅ |
| GET | /admin/inventory-plus/low-stock | inventory.view | ✅ |
| GET | /admin/inventory-plus/out-of-stock | inventory.view | ✅ |
| GET | /admin/inventory-plus/alerts | inventory.view | ✅ |
| GET | /admin/inventory-plus/movements | inventory.view | ✅ |
| POST | /admin/inventory-plus/adjust | inventory.adjust | ✅ |

#### Admin Inventory Analytics — `/api/v1/admin/inventory-analytics`
| Method | Path | Permission | Status |
|--------|------|------------|--------|
| GET | /admin/inventory-analytics/summary | inventory_analytics.view | ✅ |
| GET | /admin/inventory-analytics/top-selling | inventory_analytics.view | ✅ |
| GET | /admin/inventory-analytics/slow-moving | inventory_analytics.view | ✅ |
| GET | /admin/inventory-analytics/stock-value | inventory_analytics.view | ✅ |
| GET | /admin/inventory-analytics/alerts | inventory_analytics.view | ✅ |

### New Permissions

| Permission | Slug | Assigned To |
|------------|------|-------------|
| Create Supplier | `supplier.create` | SUPER_ADMIN, WAREHOUSE_MANAGER, INVENTORY_MANAGER |
| View Supplier | `supplier.view` | SUPER_ADMIN, PRODUCT_MANAGER, WAREHOUSE_MANAGER, INVENTORY_MANAGER, ORDER_MANAGER |
| Update Supplier | `supplier.update` | SUPER_ADMIN, WAREHOUSE_MANAGER, INVENTORY_MANAGER |
| Delete Supplier | `supplier.delete` | SUPER_ADMIN, WAREHOUSE_MANAGER |
| Create Purchase Order | `purchase_order.create` | SUPER_ADMIN, WAREHOUSE_MANAGER, INVENTORY_MANAGER |
| View Purchase Order | `purchase_order.view` | SUPER_ADMIN, PRODUCT_MANAGER, WAREHOUSE_MANAGER, INVENTORY_MANAGER, ORDER_MANAGER |
| Update Purchase Order | `purchase_order.update` | SUPER_ADMIN, WAREHOUSE_MANAGER, INVENTORY_MANAGER |
| Approve Purchase Order | `purchase_order.approve` | SUPER_ADMIN, WAREHOUSE_MANAGER |
| Cancel Purchase Order | `purchase_order.cancel` | SUPER_ADMIN, WAREHOUSE_MANAGER |
| Receive Inventory | `inventory.receive` | SUPER_ADMIN, WAREHOUSE_MANAGER, INVENTORY_MANAGER, ORDER_MANAGER |
| View Inventory Analytics | `inventory_analytics.view` | SUPER_ADMIN, PRODUCT_MANAGER, WAREHOUSE_MANAGER, INVENTORY_MANAGER, ORDER_MANAGER |

### Business Rules Implemented

| Rule | Description |
|------|-------------|
| PO Auto-Numbering | Format PO-YYYY-000001 via atomic counter table (po_sequence_counters) — race-condition safe, survives deletes |
| GRN Auto-Numbering | Sequential GRN number via atomic counter table (grn_sequence_counters) |
| PO Status Flow | DRAFT → APPROVED → PARTIALLY_RECEIVED → RECEIVED → CLOSED (or CANCELLED from any) |
| Approval Guard | Only DRAFT POs can be approved |
| Cancel Guard | Cannot cancel already CLOSED/CANCELLED POs |
| Over-Receiving Blocked | cumulative receivedQuantity + current receipt ≤ ordered quantity |
| Auto Inventory Update | Goods receipt updates inventory.availableQuantity |
| Auto PO Status | PARTIALLY_RECEIVED or RECEIVED based on fulfillment |
| Auto Audit Logging | Every movement recorded in inventory_audits |
| Reorder Point | reorderPoint and reorderQuantity on Inventory entity (default 10/50) |
| Low-Stock Detection | findLowStock returns items where 0 < availableQuantity ≤ lowStockThreshold (was incorrectly ≤ 0) |
| Low-Stock Alerts | Created when quantity drops below reorderPoint (fallback lowStockThreshold) |
| Auto Alert Resolution | Stock replenished above active threshold auto-resolves alert |
| Reservation Tracking | availableQuantity = quantity - reservedQuantity maintained across all flows |
| Supplier Code Unique | Enforced at DB + service level |
| Soft Delete Supplier | DeletedAt column with softRemove |
| Manual Stock Adjust | Creates StockAdjustment + InventoryAudit + updates inventory |
| Analytics | Summary, top-selling (30d), slow-moving (no sales 30d), stock value, alert stats |

### Deliverables

- [x] Supplier Entity (soft delete) + DTOs + Service + Controller
- [x] PurchaseOrder Entity + PurchaseOrderItem Entity + DTOs + Service + Controller (with approve/cancel)
- [x] GoodsReceipt Entity + GoodsReceiptItem Entity + DTOs + Service + Controller
- [x] StockAdjustment Entity + StockAlert Entity + InventoryAudit Entity
- [x] InventoryPlusService (list, low-stock, out-of-stock, alerts, movements, adjust)
- [x] InventoryAnalyticsService (summary, top-selling, slow-moving, stock-value, alert-stats)
- [x] AdminSupplierController, AdminPurchaseOrderController, AdminGoodsReceiptController
- [x] AdminInventoryController, AdminInventoryAnalyticsController
- [x] InventoryPlusModule
- [x] Migration Phase16InventoryManagement (8 tables, 2 enums, indexes, FKs)
- [x] Seed permissions (11 new: supplier.*, purchase_order.*, inventory.receive, inventory_analytics.view)
- [x] New role: WAREHOUSE_MANAGER with full inventory/Po/supplier permissions
- [x] Role mappings (SUPER_ADMIN, PRODUCT_MANAGER, INVENTORY_MANAGER, ORDER_MANAGER, WAREHOUSE_MANAGER)
- [x] app.module.ts wiring
- [x] data-source.ts wiring
- [x] Zero TypeScript build errors
- [x] Migration executed successfully (23 migrations total)
- [x] Seed executed successfully (7 roles, 80+ permissions)

### Phase 16 Part 2 Improvements (2026-06-11)

- [x] Atomic PO number generation via `po_sequence_counters` table — replaces `COUNT+1` (race-condition safe, survives deletes)
- [x] Atomic GRN number generation via `grn_sequence_counters` table
- [x] `reorderPoint` (default 10) and `reorderQuantity` (default 50) added to Inventory entity
- [x] `findLowStock` fixed to use `availableQuantity ≤ lowStockThreshold AND availableQuantity > 0` (was `≤ 0`)
- [x] Stock alert/resolve logic prioritizes `reorderPoint` over `lowStockThreshold`
- [x] Reservation tracking verified correct across goods-receipt and adjust-stock flows
- [x] `inventory.view` and `inventory.adjust` permissions verified existing from Layer 4
- [x] Migration Phase16Part2InventoryImprovements (2 counter tables + 2 inventory columns + index)
- [x] Zero TypeScript build errors

---

## Layer 17 — Returns (RMA), Reverse Logistics & Refund Management

### Status: ✅ Complete

### Module Build Log

| Module | Status | Started | Completed |
|--------|--------|---------|-----------|
| Return Request Management (RMA) | ✅ Done | 2026-06-11 | 2026-06-11 |
| Return Approval Workflow | ✅ Done | 2026-06-11 | 2026-06-11 |
| Reverse Logistics Tracking | ✅ Done | 2026-06-11 | 2026-06-11 |
| Return Inventory Processing | ✅ Done | 2026-06-11 | 2026-06-11 |
| Refund Processing Integration | ✅ Done | 2026-06-11 | 2026-06-11 |
| Return Analytics | ✅ Done | 2026-06-11 | 2026-06-11 |
| Migration Phase17ReturnsAndRMA | ✅ Done | 2026-06-11 | 2026-06-11 |

### New Entities (5 tables + 1 counter table)

| Entity | Table | Key Fields |
|--------|-------|------------|
| ReturnRequest | return_requests | returnNumber (unique), orderId, userId, status (REQUESTED→COMPLETED), reason, totalRefundAmount, requestedAt |
| ReturnItem | return_items | returnRequestId, orderItemId, quantity, condition (UNOPENED/OPENED/DAMAGED), refundAmount |
| ReverseShipment | reverse_shipments | returnRequestId, courierName, trackingNumber, status (PENDING/DELIVERED) |
| ReturnAudit | return_audits | returnRequestId, action, performedBy |
| ReturnReasonMaster | return_reason_master | code (unique), title, isActive |
| ReturnCounter | return_sequence_counters | Atomic counter for RMA number generation |

### API Endpoints

#### Customer Returns — `/api/v1/returns`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | /returns | Customer JWT | ✅ |
| GET | /returns/my | Customer JWT | ✅ |
| GET | /returns/:id | Customer JWT | ✅ |
| DELETE | /returns/:id | Customer JWT | ✅ |

#### Admin Returns — `/api/v1/admin/returns`

| Method | Path | Permission | Status |
|--------|------|------------|--------|
| GET | /admin/returns | return.view | ✅ |
| GET | /admin/returns/:id | return.view | ✅ |
| POST | /admin/returns/:id/approve | return.approve | ✅ |
| POST | /admin/returns/:id/reject | return.reject | ✅ |
| POST | /admin/returns/:id/schedule-pickup | return.approve | ✅ |
| POST | /admin/returns/:id/received | return.receive | ✅ |
| POST | /admin/returns/:id/refund | return.refund | ✅ |
| POST | /admin/returns/:id/complete | return.approve | ✅ |

#### Admin Return Analytics — `/api/v1/admin/return-analytics`

| Method | Path | Permission | Status |
|--------|------|------------|--------|
| GET | /admin/return-analytics/summary | return.view | ✅ |
| GET | /admin/return-analytics/reasons | return.view | ✅ |
| GET | /admin/return-analytics/products | return.view | ✅ |
| GET | /admin/return-analytics/refunds | return.view | ✅ |

### New Permissions

| Permission | Slug | Assigned To |
|------------|------|-------------|
| View Returns | return.view | SUPER_ADMIN, ORDER_MANAGER, FINANCE_MANAGER, SUPPORT_MANAGER, WAREHOUSE_MANAGER |
| Approve Returns | return.approve | SUPER_ADMIN, ORDER_MANAGER |
| Reject Returns | return.reject | SUPER_ADMIN, ORDER_MANAGER |
| Receive Returns | return.receive | SUPER_ADMIN, ORDER_MANAGER, WAREHOUSE_MANAGER |
| Refund Returns | return.refund | SUPER_ADMIN, FINANCE_MANAGER |

### Business Rules Implemented

| Rule | Description |
|------|-------------|
| Login Required | Customer must be authenticated |
| Order Ownership | Order must belong to logged-in customer |
| Delivered Only | Only DELIVERED orders eligible |
| 24 Hour Window | Return request allowed only within 24 hours after delivery |
| One Active Return | One active return request per order |
| Quantity Validation | Returned quantity cannot exceed purchased quantity |
| Refund After Receive | Refund only processed after warehouse receives item |
| Inventory Restock | Returned quantity added back to inventory |
| Auto Return Number | RMA-YYYY-000001 format via atomic counter table |
| Auto Audit Logging | Every status change creates a ReturnAudit entry |
| Reverse Logistics Tracking | Shipment status auto-advances return status |
| Email Notifications | Return requested, approved, rejected, refunded |
| Soft Delete (Cancel) | Customer can cancel REQUESTED returns only |

### Return Status Workflow

```
REQUESTED → APPROVED → PICKUP_SCHEDULED → IN_TRANSIT → RECEIVED → REFUNDED → COMPLETED
```

### Deliverables

- [x] ReturnRequest Entity + ReturnItem Entity
- [x] ReverseShipment Entity + ReturnAudit Entity + ReturnReasonMaster Entity
- [x] ReturnService (create, approve, reject, schedulePickup, markReceived, processRefund, complete)
- [x] ReverseLogisticsService (update shipment status, auto-advance return)
- [x] ReturnAnalyticsService (summary, reasons, products, refunds)
- [x] CustomerReturnController (create, my returns, view, cancel)
- [x] AdminReturnController (list, approve, reject, schedule pickup, receive, refund, complete)
- [x] AdminReturnAnalyticsController (summary, reasons, products, refunds)
- [x] ReturnsModule
- [x] Migration Phase17ReturnsAndRMA (5 tables + 1 counter table + 4 enums + indexes + FKs)
- [x] Seed permissions (5 new: return.*)
- [x] Role mappings (SUPER_ADMIN, ORDER_MANAGER, FINANCE_MANAGER, SUPPORT_MANAGER, WAREHOUSE_MANAGER)
- [x] app.module.ts wiring
- [x] data-source.ts wiring
- [x] Zero TypeScript build errors
- [x] Migration executed successfully (22 migrations total)
- [x] Seed executed successfully

---

## Layer 18 — Customer Support, Helpdesk, Ticketing & Complaint Management

### Status: ✅ Complete

### Module Build Log

| Module | Status | Started | Completed |
|--------|--------|---------|-----------|
| Support Ticket Management | ✅ Done | 2026-06-11 | 2026-06-11 |
| Ticket Assignment Engine | ✅ Done | 2026-06-11 | 2026-06-11 |
| Ticket Status Workflow | ✅ Done | 2026-06-11 | 2026-06-11 |
| Customer Reply System | ✅ Done | 2026-06-11 | 2026-06-11 |
| Internal Notes System | ✅ Done | 2026-06-11 | 2026-06-11 |
| SLA Monitoring | ✅ Done | 2026-06-11 | 2026-06-11 |
| Support Analytics | ✅ Done | 2026-06-11 | 2026-06-11 |
| Migration Phase18SupportDesk | ✅ Done | 2026-06-11 | 2026-06-11 |
| Migration Phase18Part2SupportEnhancements (attachments, audits, ratings, tags) | ✅ Done | 2026-06-11 | 2026-06-11 |
| Ticket Attachments | ✅ Done | 2026-06-11 | 2026-06-11 |
| Ticket Audit History | ✅ Done | 2026-06-11 | 2026-06-11 |
| Ticket Rating System | ✅ Done | 2026-06-11 | 2026-06-11 |
| Ticket Tags | ✅ Done | 2026-06-11 | 2026-06-11 |
| Admin Filters (assignedTo, customer, date range) | ✅ Done | 2026-06-11 | 2026-06-11 |

### New Entities (9 tables + 1 counter table)

| Entity | Table | Key Fields |
|--------|-------|------------|
| SupportTicket | support_tickets | ticketNumber (unique), customerId, orderId (nullable), subject, category, priority, status, assignedTo, firstResponseAt, resolvedAt |
| TicketMessage | ticket_messages | ticketId, senderId, senderType (CUSTOMER/ADMIN), message |
| TicketAssignment | ticket_assignments | ticketId, assignedTo, assignedBy |
| TicketNote | ticket_notes | ticketId, note, createdBy |
| TicketSlaLog | ticket_sla_logs | ticketId, firstResponseAt, resolvedAt, responseMinutes, resolutionMinutes |
| TicketCounter | ticket_sequence_counters | Atomic counter for ticket number generation |
| TicketAttachment | ticket_attachments | ticketId, fileUrl, fileName, uploadedBy |
| TicketAudit | ticket_audits | ticketId, action, previousStatus, newStatus, previousPriority, newPriority, previousAssignee, newAssignee, performedBy, notes |
| TicketRating | ticket_ratings | ticketId (unique), rating (1-5), comment |
| TicketTag | ticket_tags | ticketId, tag (unique per ticket) |

### API Endpoints

#### Customer Support — `/api/v1/support`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | /support | Customer JWT | ✅ |
| GET | /support/my | Customer JWT | ✅ |
| GET | /support/:id | Customer JWT | ✅ |
| POST | /support/:id/reply | Customer JWT | ✅ |
| POST | /support/:id/close | Customer JWT | ✅ |
| POST | /support/:id/reopen | Customer JWT | ✅ |
| POST | /support/:id/rate | Customer JWT | ✅ |
| GET | /support/:id/attachments | Customer JWT | ✅ |
| GET | /support/:id/audit | Customer JWT | ✅ |

#### Admin Support — `/api/v1/admin/support`

| Method | Path | Permission | Status |
|--------|------|------------|--------|
| GET | /admin/support | support.view | ✅ |
| GET | /admin/support/:id | support.view | ✅ |
| POST | /admin/support/:id/assign | support.assign | ✅ |
| POST | /admin/support/:id/reply | support.reply | ✅ |
| POST | /admin/support/:id/resolve | support.resolve | ✅ |
| POST | /admin/support/:id/reopen | support.resolve | ✅ |
| POST | /admin/support/:id/note | support.note | ✅ |
| POST | /admin/support/:id/attachments | support.reply | ✅ |
| GET | /admin/support/:id/attachments | support.view | ✅ |
| GET | /admin/support/:id/audit | support.view | ✅ |
| POST | /admin/support/:id/tags | support.assign | ✅ |
| DELETE | /admin/support/:id/tags/:tagId | support.assign | ✅ |
| GET | /admin/support/:id/tags | support.view | ✅ |

#### Admin Support Analytics — `/api/v1/admin/support-analytics`

| Method | Path | Permission | Status |
|--------|------|------------|--------|
| GET | /admin/support-analytics/summary | support.view | ✅ |
| GET | /admin/support-analytics/categories | support.view | ✅ |
| GET | /admin/support-analytics/agents | support.view | ✅ |
| GET | /admin/support-analytics/sla | support.view | ✅ |

### New Permissions

| Permission | Slug | Assigned To |
|------------|------|-------------|
| View Support Tickets | support.view | SUPER_ADMIN, SUPPORT_MANAGER |
| Assign Support Tickets | support.assign | SUPER_ADMIN, SUPPORT_MANAGER |
| Reply To Tickets | support.reply | SUPER_ADMIN, SUPPORT_MANAGER |
| Resolve Tickets | support.resolve | SUPER_ADMIN, SUPPORT_MANAGER |
| Add Internal Notes | support.note | SUPER_ADMIN, SUPPORT_MANAGER |

### Ticket Categories

ORDER_ISSUE, PAYMENT_ISSUE, SHIPPING_ISSUE, RETURN_ISSUE, REFUND_ISSUE, PRODUCT_ISSUE, ACCOUNT_ISSUE, OTHER

### Ticket Priorities

LOW (24h response / 72h resolution), MEDIUM (12h / 48h), HIGH (4h / 24h), URGENT (1h / 8h)

### Ticket Status Workflow

```
OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED
RESOLVED → REOPENED → IN_PROGRESS (reopen path)
```

### Business Rules Implemented

| Rule | Description |
|------|-------------|
| Login Required | Customer must be authenticated |
| Ticket Ownership | Customer can only access own tickets |
| Auto Ticket Number | Format TKT-YYYY-000001 via atomic counter table |
| Order Linking | Optional order reference for order-related complaints |
| Reply Tracking | Every customer/admin reply stored separately |
| Internal Notes | Admin only, hidden from customer |
| Assignment History | Full assignment tracking via ticket_assignments |
| SLA Tracking | First response and resolution timestamps tracked |
| Auto Audit Logs | Every admin reply auto-sets firstResponseAt |
| Close Ticket | Customer can close RESOLVED tickets |
| Reopen Ticket | Customer or admin can reopen resolved tickets |
| Email Notifications | Ticket created, admin reply notification |
| SLA Targets | Priority-based response/resolution targets |
| Ticket Attachments | Files linked to tickets via URL |
| Audit Trail | Auto-logged on assign, resolve, reopen, status change |
| Ticket Rating | Customer can rate resolved/closed tickets (1-5) one-time |
| Ticket Tags | Free-text tags per ticket, unique per ticket |
| Admin Filters | Filter by assignedTo, customer search, date range |

### Deliverables

- [x] SupportTicket Entity + TicketMessage Entity
- [x] TicketAssignment Entity + TicketNote Entity + TicketSlaLog Entity
- [x] TicketAttachment Entity + TicketAudit Entity + TicketRating Entity + TicketTag Entity
- [x] SupportService (create, findMy, findOne, reply, close, findAll, assign, adminReply, resolve, reopen, addNote, + attachments, audit, rating, tags)
- [x] TicketAssignmentService (byAdmin, history)
- [x] SlaMonitoringService (getSlaStatus, checkCompliance, getTargets)
- [x] SupportAnalyticsService (summary, categories, agentPerformance, slaSummary)
- [x] CustomerSupportController (create, my, view, reply, close, reopen, rate, attachments, audit)
- [x] AdminSupportController (list, view, assign, reply, resolve, reopen, note, attachments, audit, tags)
- [x] AdminSupportAnalyticsController (summary, categories, agents, sla)
- [x] SupportModule
- [x] Migration Phase18SupportDesk (5 tables + 1 counter table + 4 enums + indexes + FKs)
- [x] Migration Phase18Part2SupportEnhancements (4 new tables + enum + indexes + FKs)
- [x] Seed permissions (4 new: support.assign, support.reply, support.resolve, support.note)
- [x] Role mappings (SUPER_ADMIN, SUPPORT_MANAGER)
- [x] Email notification integration (ticket_created, ticket_reply)
- [x] RateTicketDto + AddTagDto + updated TicketQueryDto
- [x] app.module.ts wiring
- [x] data-source.ts wiring (9 support entities total)
- [x] Zero TypeScript build errors
- [x] Migration executed successfully (24 migrations total)
- [x] Seed executed successfully

---

## Layer 19 — Email Notification Center, Templates, Campaigns & Communication Analytics

**Started:** 2026-06-11  
**Completed:** 2026-06-11  
**Status:** ✅ Complete

### Module Build Log

| Module | Status | Started | Completed |
|--------|--------|---------|-----------|
| Email Notification Management | ✅ Done | 2026-06-11 | 2026-06-11 |
| Transactional Email Engine | ✅ Done | 2026-06-11 | 2026-06-11 |
| Email Template Management | ✅ Done | 2026-06-11 | 2026-06-11 |
| Email Campaign Management | ✅ Done | 2026-06-11 | 2026-06-11 |
| Customer Email Preferences | ✅ Done | 2026-06-11 | 2026-06-11 |
| Email Delivery Logging | ✅ Done | 2026-06-11 | 2026-06-11 |
| Communication Analytics | ✅ Done | 2026-06-11 | 2026-06-11 |
| Migration Phase19EmailNotifications | ✅ Done | 2026-06-11 | 2026-06-11 |

### New Entities (5 tables)

| Entity | Table | Key Fields |
|--------|-------|------------|
| EmailNotification | email_notifications | userId, templateId, subject, body, recipientEmail, status, type, sentAt, readAt, retries |
| EmailTemplate | email_notification_templates | code (unique), name, subjectTemplate, bodyTemplate, variables, active |
| EmailPreference | email_preferences | userId (unique), marketingEmailsEnabled, transactionalEmailsEnabled, orderUpdates, promotionsAndOffers, productRecommendations, newsletter |
| EmailLog | email_logs | notificationId, provider, status, errorMessage, deliveredAt, openedAt, clickedAt, metadata |
| EmailCampaign | email_campaigns | name, subject, body, type, targetAudience, status, scheduledAt, sentAt, totalRecipients, successfulSends, failedSends, opensCount, clicksCount, createdBy |

### API Endpoints

#### Customer Email Notifications — `/api/v1/notifications`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | /notifications | Customer JWT | ✅ |
| GET | /notifications/unread-count | Customer JWT | ✅ |
| PATCH | /notifications/:id/read | Customer JWT | ✅ |
| PATCH | /notifications/read-all | Customer JWT | ✅ |
| GET | /notifications/preferences | Customer JWT | ✅ |
| PATCH | /notifications/preferences | Customer JWT | ✅ |

#### Admin Email Notifications — `/api/v1/admin/notifications`

| Method | Path | Permission | Status |
|--------|------|------------|--------|
| POST | /admin/notifications/send | notification.send | ✅ |
| POST | /admin/notifications/bulk | notification.send | ✅ |
| GET | /admin/notifications | notification.view | ✅ |
| GET | /admin/notifications/:id | notification.view | ✅ |

#### Admin Email Templates — `/api/v1/admin/email-templates`

| Method | Path | Permission | Status |
|--------|------|------------|--------|
| POST | /admin/email-templates | notification.manage | ✅ |
| GET | /admin/email-templates | notification.view | ✅ |
| GET | /admin/email-templates/:id | notification.view | ✅ |
| PATCH | /admin/email-templates/:id | notification.manage | ✅ |
| DELETE | /admin/email-templates/:id | notification.manage | ✅ |

#### Admin Email Campaigns — `/api/v1/admin/email-campaigns`

| Method | Path | Permission | Status |
|--------|------|------------|--------|
| POST | /admin/email-campaigns | campaign.manage | ✅ |
| GET | /admin/email-campaigns | campaign.view | ✅ |
| GET | /admin/email-campaigns/:id | campaign.view | ✅ |
| PATCH | /admin/email-campaigns/:id | campaign.manage | ✅ |
| DELETE | /admin/email-campaigns/:id | campaign.manage | ✅ |

#### Admin Communication Analytics — `/api/v1/admin/communication-analytics`

| Method | Path | Permission | Status |
|--------|------|------------|--------|
| GET | /admin/communication-analytics/summary | notification.view | ✅ |
| GET | /admin/communication-analytics/emails | notification.view | ✅ |
| GET | /admin/communication-analytics/campaigns | notification.view | ✅ |

### New Permissions

| Permission | Slug | Assigned To |
|------------|------|-------------|
| Send Notifications | notification.send | SUPER_ADMIN, MARKETING_MANAGER |
| Manage Campaigns | campaign.manage | SUPER_ADMIN, MARKETING_MANAGER |

### New Role

| Role | Slug | Description |
|------|------|-------------|
| Marketing Manager | marketing_manager | Manages email campaigns, templates, notifications, and promotions |

### Transactional Email Types

ORDER_CREATED, ORDER_CONFIRMED, ORDER_SHIPPED, ORDER_DELIVERED, ORDER_CANCELLED, PAYMENT_SUCCESS, PAYMENT_FAILED, RETURN_REQUESTED, RETURN_APPROVED, RETURN_REJECTED, RETURN_REFUNDED, SUPPORT_TICKET_CREATED, SUPPORT_REPLY, PASSWORD_RESET, ACCOUNT_CREATED, WELCOME_EMAIL, COUPON_ASSIGNED, PROMOTION_STARTED, CUSTOM

### Campaign Types

PROMOTIONAL, ABANDONED_CART, FLASH_SALE, SEASONAL, NEW_ARRIVAL, CUSTOM

### Business Rules Implemented

| Rule | Description |
|------|-------------|
| Email Only | No SMS or Push Notifications |
| Template Engine | Dynamic variable replacement with `{{variable}}` syntax |
| Email Preferences | Customer can disable marketing emails independently of transactional |
| Transactional Emails | Always sent regardless of marketing preferences |
| Delivery Logging | Every email attempt logged with provider, status, timestamps |
| Campaign Scheduling | Future scheduling via scheduledAt field |
| Bulk Sending | Supports array of notifications in one request |
| Retry Failed Emails | Automatic retry counter on notification entity |
| HTML Templates | Rich email via bodyTemplate field |
| Queue Processing | Async email delivery via placeholder deliverEmail method |
| Open/Click Tracking | Campaign-level opensCount/clicksCount + per-log openedAt/clickedAt |
| Audit Logs | Complete communication history in email_logs |
| Unread Notification Counter | Customer notification center unread count endpoint |

### Deliverables

- [x] EmailNotification Entity
- [x] EmailTemplate Entity
- [x] EmailPreference Entity
- [x] EmailLog Entity
- [x] EmailCampaign Entity
- [x] EmailNotificationService (send, sendFromTemplate, sendBulk, sendTransactional, findAll, findOne, findMyNotifications, markAsRead, markAllAsRead, preferences)
- [x] TransactionalEmailService (17 convenience methods: order lifecycle, payment, return, support, auth, coupon)
- [x] EmailTemplateService (CRUD + findByCode)
- [x] EmailCampaignService (CRUD)
- [x] EmailAnalyticsService (summary, email stats, campaign stats)
- [x] CustomerNotificationController (list, unread, mark read, mark all, preferences)
- [x] AdminNotificationController (send, bulk, list, view)
- [x] AdminEmailTemplateController (CRUD)
- [x] AdminEmailCampaignController (CRUD)
- [x] AdminCommunicationAnalyticsController (summary, emails, campaigns)
- [x] EmailNotificationsModule
- [x] Migration Phase19EmailNotifications (5 tables + 4 enums + indexes + FKs)
- [x] Drop stale Phase13 email_templates table (replaced by email_notification_templates)
- [x] Seed permissions (notification.send, campaign.manage)
- [x] Seed MARKETING_MANAGER role with all notification/campaign permissions
- [x] Role mappings (SUPER_ADMIN, MARKETING_MANAGER)
- [x] app.module.ts wiring
- [x] data-source.ts wiring
- [x] Zero TypeScript build errors
- [x] Migration executed successfully (25 migrations total)
- [x] Seed executed successfully


