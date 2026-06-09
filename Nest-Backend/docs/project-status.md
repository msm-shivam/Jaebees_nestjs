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

### Layer 10 — Wishlist, Reviews & Ratings Management (Complete)

| Module | Status | Started | Completed |
|--------|--------|---------|-----------|
| Wishlist | ✅ Complete | 2026-06-08 | 2026-06-09 |
| Reviews & Ratings | ✅ Complete | 2026-06-08 | 2026-06-09 |
| Review Moderation | ✅ Complete | 2026-06-08 | 2026-06-09 |
| Review Images | ✅ Complete | 2026-06-08 | 2026-06-09 |

### Phase 10 Deliverables

- [x] ReviewStatus Enum
- [x] Wishlist Entity
- [x] WishlistItem Entity
- [x] Review Entity
- [x] ReviewImage Entity
- [x] Product entity extended (average_rating, review_count)
- [x] DTOs (CreateReview, UpdateReview, WishlistResponse, ReviewResponse)
- [x] WishlistService (getOrCreate, add, remove, find)
- [x] ReviewsService (create, update, find, approve, reject, rating aggregation)
- [x] WishlistController (GET, POST, DELETE)
- [x] ReviewsController (customer: POST, GET, PATCH, DELETE)
- [x] AdminReviewsController (admin: GET, PATCH approve/reject, DELETE)
- [x] WishlistModule
- [x] ReviewsModule
- [x] Migration Phase10 (wishlists, wishlist_items, reviews, review_images + product columns)
- [x] Permissions (wishlist.view, review.*)
- [x] Role mappings (SUPPORT_MANAGER gets review.view)
- [x] Module registration in app.module.ts + data-source.ts
- [x] Swagger tags in main.ts
- [x] Zero TypeScript build errors

### API Endpoints

#### Wishlist — `/api/v1/wishlist`

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | /wishlist | Customer JWT | ✅ |
| POST | /wishlist/products/:productId | Customer JWT | ✅ |
| DELETE | /wishlist/products/:productId | Customer JWT | ✅ |

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

### Layer 10 Out of Scope

- Wishlist sharing / public wishlists
- Review voting (helpful/not helpful)
- Review images upload endpoint (manual image URL entry for now)
- Verified purchase badge auto-display
- Review analytics / moderation queue dashboard
- Review reply from seller
- Photo/Video reviews with media upload
- Average rating history tracking

---

## Layer 9 Out of Scope

- Buy X Get Y cart adjustment logic (rule stored, checkout application pending)
- Tiered/Multi-Tier Discounts
- Bulk Coupon Generation
- Cart-Level Promotion Auto-Application
- Customer-Facing Promotion List
- Abandoned Cart Recovery Coupons
- Referral Discounts
- Loyalty Points System
- Gift Card / Store Credit
- BOGO (Buy One Get One) auto-apply
- Time-limited flash sale countdown




