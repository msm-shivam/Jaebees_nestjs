Build Layer 6 of the Sport E-Commerce Backend using NestJS, TypeORM, PostgreSQL, JWT Authentication, Swagger, and RBAC.

IMPORTANT RULES

- Follow existing project architecture.
- Use NestJS modules.
- TypeORM entities.
- PostgreSQL migrations.
- DTO validation using class-validator.
- Swagger documentation.
- Soft delete where appropriate.
- Customer JWT for customer APIs.
- Admin JWT + PermissionsGuard for admin APIs.
- Zero TypeScript build errors.

--------------------------------------------------
LAYER 6 — ORDER MANAGEMENT
--------------------------------------------------
STATUS:
Build complete Order Management System.

--------------------------------------------------
MODULES
--------------------------------------------------

1. Orders Module

--------------------------------------------------
DATABASE TABLES
--------------------------------------------------

orders

- id
- order_number
- user_id
- status
- subtotal
- discount_amount
- shipping_amount
- tax_amount
- total_amount
- notes
- created_at
- updated_at

order_items

- id
- order_id
- product_id
- variant_id
- product_name
- sku
- quantity
- unit_price
- total_price
- created_at

--------------------------------------------------
ORDER STATUS
--------------------------------------------------

PENDING
CONFIRMED
PROCESSING
PACKED
SHIPPED
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
RETURN_REQUESTED
RETURNED

--------------------------------------------------
RELATIONSHIPS
--------------------------------------------------

Order
→ belongs to User

OrderItem
→ belongs to Order
→ belongs to Product
→ belongs to ProductVariant

--------------------------------------------------
BUSINESS RULES
--------------------------------------------------

Customer creates order from cart.

Order creation should:

1. Validate cart exists.
2. Validate cart has items.
3. Validate inventory availability.
4. Lock inventory.
5. Create order.
6. Create order items.
7. Reduce available inventory.
8. Clear cart.

Order number format:

ORD-YYYYMMDD-000001

Example:

ORD-20260608-000001

--------------------------------------------------
ORDER SNAPSHOT
--------------------------------------------------

Store product information at order time:

product_name
sku
unit_price

Future product changes must not affect orders.

--------------------------------------------------
CUSTOMER ACTIONS
--------------------------------------------------

Create Order

View My Orders

View Single Order

Cancel Order

Customer can cancel only if:

PENDING
CONFIRMED

--------------------------------------------------
ADMIN ACTIONS
--------------------------------------------------

View Orders

View Order Details

Change Status

Cancel Order

--------------------------------------------------
DTOs
--------------------------------------------------

CreateOrderDto

UpdateOrderStatusDto

CancelOrderDto

OrderResponseDto

OrderItemResponseDto

OrderListResponseDto

--------------------------------------------------
SERVICES
--------------------------------------------------

OrdersService

Methods

createOrder()

getMyOrders()

getMyOrder()

getAllOrders()

getOrder()

updateStatus()

cancelOrder()

generateOrderNumber()

--------------------------------------------------
CUSTOMER API
--------------------------------------------------

Base

/api/v1/orders

GET /orders

My Orders

GET /orders/:id

Order Details

POST /orders

Create Order From Cart

PATCH /orders/:id/cancel

Cancel Order

--------------------------------------------------
ADMIN API
--------------------------------------------------

Base

/api/v1/admin/orders

GET /admin/orders

List Orders

GET /admin/orders/:id

Order Details

PATCH /admin/orders/:id/status

Update Status

PATCH /admin/orders/:id/cancel

Cancel Order

--------------------------------------------------
PERMISSIONS
--------------------------------------------------

order.view

order.update

order.cancel

--------------------------------------------------
VALIDATIONS
--------------------------------------------------

Validate:

- User exists
- Cart exists
- Cart has items
- Product exists
- Variant exists
- Inventory available
- Status transitions valid

--------------------------------------------------
INVENTORY INTEGRATION
--------------------------------------------------

When order created:

available_quantity -= quantity

When order cancelled:

available_quantity += quantity

--------------------------------------------------
MIGRATION
--------------------------------------------------

Create migration:

1749200600000-Phase6Orders.ts

Create:

orders
order_items

Add:

indexes
foreign keys
constraints

Indexes:

orders.user_id
orders.order_number
orders.status
orders.created_at

order_items.order_id
order_items.variant_id

Unique:

orders.order_number

--------------------------------------------------
SWAGGER
--------------------------------------------------

Document all APIs.

Provide examples.

Document order status flow.

--------------------------------------------------
POSTMAN
--------------------------------------------------

Add:

Customer Order APIs

Admin Order APIs

--------------------------------------------------
DELIVERABLES
--------------------------------------------------

Generate:

- Entities
- DTOs
- Services
- Controllers
- Modules
- Migration
- Swagger documentation
- Permission seeds
- Postman updates
note:  before the module start update the projeect-status.md  and after module complete update the project-status.md file 
Ensure:

npm run build

passes with zero TypeScript errors.