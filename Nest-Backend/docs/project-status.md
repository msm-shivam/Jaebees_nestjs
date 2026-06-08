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


