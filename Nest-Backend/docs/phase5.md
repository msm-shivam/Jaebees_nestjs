# Layer 5 — Cart Management Module (Implementation Prompt)

## Objective

Build a complete Cart Management module for the Sport E-Commerce Backend using NestJS, TypeORM, PostgreSQL, JWT Authentication, Swagger, and existing RBAC architecture.

This layer must integrate with:

* Users Module
* Products Module
* Product Variants Module
* Inventory Module

The cart system must support customer shopping workflows and maintain inventory validation.

---

# Layer Information

**Layer:** 5

**Name:** Cart Management

**Status:** In Development

**Dependencies:**

* Layer 1 (Foundation)
* Layer 2 (Catalog)
* Layer 3 (Products)
* Layer 4 (Variants & Inventory)

---

# Modules To Build

```text
src/modules/cart
├── controllers
├── services
├── dto
├── entities
├── enums
├── interfaces
└── cart.module.ts
```

---

# Database Tables

## carts

| Column      | Type          |
| ----------- | ------------- |
| id          | uuid          |
| user_id     | uuid          |
| subtotal    | decimal(12,2) |
| total_items | integer       |
| created_at  | timestamp     |
| updated_at  | timestamp     |
| deleted_at  | timestamp     |

### Constraints

```sql
One Active Cart Per User
```

---

## cart_items

| Column     | Type          |
| ---------- | ------------- |
| id         | uuid          |
| cart_id    | uuid          |
| variant_id | uuid          |
| quantity   | integer       |
| unit_price | decimal(12,2) |
| line_total | decimal(12,2) |
| created_at | timestamp     |
| updated_at | timestamp     |

---

# Relationships

```text
User
 └── Cart
       └── CartItems
              └── ProductVariant
                     └── Inventory
```

---

# Entities

## Cart Entity

Relations:

```ts
ManyToOne(User)
OneToMany(CartItem)
```

---

## CartItem Entity

Relations:

```ts
ManyToOne(Cart)
ManyToOne(ProductVariant)
```

---

# DTOs

## AddCartItemDto

```ts
{
  variantId: string;
  quantity: number;
}
```

Validation:

```ts
quantity >= 1
```

---

## UpdateCartItemDto

```ts
{
  quantity: number;
}
```

Validation:

```ts
quantity >= 1
```

---

## CartResponseDto

Return:

```ts
{
  id,
  subtotal,
  totalItems,
  items: []
}
```

---

# Business Rules

## Rule 1

User may only have one active cart.

If cart does not exist:

```text
Create automatically.
```

---

## Rule 2

Variant must exist.

Otherwise:

```text
404 Variant Not Found
```

---

## Rule 3

Variant status must be ACTIVE.

Otherwise:

```text
400 Variant Not Available
```

---

## Rule 4

Product must not be archived.

---

## Rule 5

Inventory must exist.

Otherwise:

```text
400 Inventory Missing
```

---

## Rule 6

Requested quantity cannot exceed:

```ts
inventory.availableQuantity
```

Otherwise:

```text
400 Insufficient Stock
```

---

## Rule 7

If variant already exists in cart:

```text
Increase quantity
```

Instead of creating duplicate rows.

---

## Rule 8

Line Total

```ts
quantity * unitPrice
```

---

## Rule 9

Cart Totals

```ts
subtotal = sum(lineTotals)

totalItems = sum(quantities)
```

Must recalculate automatically after every change.

---

# Services

## CartService

Methods:

```ts
getOrCreateCart(userId)

getCart(userId)

addItem(userId, dto)

updateItem(userId, itemId, dto)

removeItem(userId, itemId)

clearCart(userId)

recalculateCart(cartId)
```

---

# API Endpoints

Base Path

```text
/api/v1/cart
```

Customer JWT required for all endpoints.

---

## Get Current Cart

```http
GET /cart
```

Permission:

```text
Authenticated Customer
```

Response:

```json
{
  "success": true,
  "data": {}
}
```

---

## Add Item

```http
POST /cart/items
```

Body:

```json
{
  "variantId": "uuid",
  "quantity": 2
}
```

---

## Update Quantity

```http
PATCH /cart/items/:itemId
```

Body:

```json
{
  "quantity": 3
}
```

---

## Remove Item

```http
DELETE /cart/items/:itemId
```

---

## Clear Cart

```http
DELETE /cart/clear
```

Removes all cart items.

---

# Controller

## CartController

Methods:

```ts
GET     /cart
POST    /cart/items
PATCH   /cart/items/:itemId
DELETE  /cart/items/:itemId
DELETE  /cart/clear
```

Use:

```ts
JwtAuthGuard
@CurrentUser()
```

---

# Migration

Create Migration:

```text
1749200500000-Phase5CartModule.ts
```

Create Tables:

```sql
carts
cart_items
```

---

# Indexes

## carts

```sql
user_id
```

---

## cart_items

```sql
cart_id
variant_id
```

---

# Foreign Keys

```sql
carts.user_id
→ users.id

cart_items.cart_id
→ carts.id

cart_items.variant_id
→ product_variants.id
```

ON DELETE CASCADE.

---

# Swagger Documentation

Document:

* Get Cart
* Add Item
* Update Item
* Remove Item
* Clear Cart

Include:

```ts
@ApiTags('Cart')
@ApiBearerAuth()
```

Add request/response examples.

---

# Response Structure

Use existing ResponseInterceptor format:

```json
{
  "success": true,
  "message": "Cart updated successfully",
  "data": {}
}
```

---

# Testing Requirements

Verify:

* Add item
* Update quantity
* Remove item
* Clear cart
* Inventory validation
* Variant validation
* Auto cart creation
* Duplicate variant handling
* Cart total recalculation

---

# Deliverables

* Cart Entity
* CartItem Entity
* DTOs
* Service
* Controller
* Module
* Migration
* Swagger Documentation
* RBAC/JWT Integration
* Postman Collection Updates
* Zero TypeScript Build Errors

Expected Result:

Layer 5 completes the customer shopping cart foundation and prepares the platform for Layer 6 (Wishlist), Layer 7 (Address Book), Layer 8 (Checkout), and Layer 9 (Orders).
