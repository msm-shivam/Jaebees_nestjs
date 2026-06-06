# Sport E-Commerce Backend — Phase 2 Catalog Foundation

You are a Senior Backend Architect and Senior NestJS Developer.

The project is a large-scale sportswear e-commerce platform similar to Nike, Adidas, Puma, and Under Armour.

Layer 1 (Authentication, Users, Admin, RBAC, Sessions, OTP) is already completed and production-ready.

Your task is to build ONLY Phase 2 (Catalog Foundation).

Do NOT modify Layer 1 unless required for permissions or module registration.

---

# Critical Rules

1. Do not build Products yet.
2. Do not build Product Variants.
3. Do not build Inventory.
4. Do not build Cart.
5. Do not build Orders.
6. Do not build Payments.
7. Do not build Reviews.
8. Do not build Elasticsearch.
9. Do not build RabbitMQ.
10. Do not build Analytics.
11. Do not build CMS.

Only build Catalog Foundation.

---

# Existing Stack

Backend:

* NestJS
* TypeScript
* PostgreSQL
* TypeORM
* JWT
* Swagger

Existing Modules:

* Auth
* Users
* Admin
* RBAC

---

# New Modules To Build

Create the following modules:

* Brands Module
* Categories Module
* Sub Categories Module
* Collections Module
* Attributes Module
* Attribute Values Module
* Product Tags Module

---

# Folder Structure

src/modules/

brands/
categories/
sub-categories/
collections/
attributes/
attribute-values/
product-tags/

Each module must contain:

* controller
* service
* dto
* entity
* module

---

# Database Design

## brands

Purpose:
Manage brands.

Examples:

* Nike
* Adidas
* Puma
* Reebok

Columns:

* id UUID PK
* name
* slug UNIQUE
* logo
* description
* is_active
* created_at
* updated_at
* deleted_at

Indexes:

* slug
* is_active

---

## categories

Purpose:
Top-level categories.

Examples:

* Shoes
* Clothing
* Accessories

Columns:

* id UUID PK
* name
* slug UNIQUE
* image
* description
* sort_order
* is_active
* created_at
* updated_at
* deleted_at

Indexes:

* slug
* sort_order
* is_active

---

## sub_categories

Purpose:
Child categories.

Examples:

Category:
Shoes

Sub Categories:

* Running Shoes
* Football Shoes
* Basketball Shoes

Columns:

* id UUID PK
* category_id FK
* name
* slug UNIQUE
* image
* description
* sort_order
* is_active
* created_at
* updated_at
* deleted_at

Relations:

Many Sub Categories
belong to
One Category

Indexes:

* category_id
* slug
* sort_order

---

## collections

Purpose:
Marketing collections.

Examples:

* Summer Collection
* Winter Collection
* Running Collection
* Training Collection

Columns:

* id UUID PK
* name
* slug UNIQUE
* banner_image
* description
* is_active
* created_at
* updated_at
* deleted_at

Indexes:

* slug
* is_active

---

## attributes

Purpose:
Dynamic product attributes.

Examples:

* Color
* Size
* Gender
* Material
* Fit

Columns:

* id UUID PK
* name
* slug UNIQUE
* is_filterable
* is_required
* sort_order
* created_at
* updated_at

Indexes:

* slug
* sort_order

---

## attribute_values

Purpose:
Values belonging to attributes.

Examples:

Color:

* Black
* White
* Blue

Size:

* S
* M
* L
* XL

Columns:

* id UUID PK
* attribute_id FK
* value
* slug
* sort_order
* created_at
* updated_at

Relations:

Many Attribute Values
belong to
One Attribute

Unique Constraint:

(attribute_id, slug)

Indexes:

* attribute_id
* slug
* sort_order

---

## product_tags

Purpose:
Marketing labels.

Examples:

* Best Seller
* Trending
* Featured
* New Arrival
* Limited Edition

Columns:

* id UUID PK
* name
* slug UNIQUE
* created_at
* updated_at

Indexes:

* slug

---

# Permissions

Add new permissions.

Brand Permissions:

* brand.create
* brand.view
* brand.update
* brand.delete

Category Permissions:

* category.create
* category.view
* category.update
* category.delete

Collection Permissions:

* collection.create
* collection.view
* collection.update
* collection.delete

Attribute Permissions:

* attribute.create
* attribute.view
* attribute.update
* attribute.delete

Tag Permissions:

* tag.create
* tag.view
* tag.update
* tag.delete

Seed these permissions.

---

# RBAC Integration

All admin endpoints must be protected by:

Admin JWT Guard

AND

Permissions Guard

Examples:

Create Brand:

Permission:
brand.create

Delete Category:

Permission:
category.delete

Create Attribute:

Permission:
attribute.create

---

# API Requirements

Every module must support:

Create
List
Get By ID
Update
Delete

Soft delete wherever deleted_at exists.

---

# API Versioning

All APIs must use:

/api/v1

Examples:

/api/v1/admin/brands
/api/v1/admin/categories
/api/v1/admin/sub-categories
/api/v1/admin/collections
/api/v1/admin/attributes
/api/v1/admin/attribute-values
/api/v1/admin/product-tags

---

# DTO Requirements

Use:

* class-validator
* class-transformer
* Swagger decorators

Validate:

* required fields
* UUID fields
* booleans
* strings
* sort_order

---

# Swagger

All endpoints documented.

All DTOs documented.

Swagger must automatically display:

* request schemas
* response schemas
* auth requirements

---

# Migrations

Create migration files.

Requirements:

* UUID PKs
* FK constraints
* indexes
* unique constraints
* soft delete columns

Never use synchronize=true.

---

# Deliverables

Generate:

1. Entities
2. DTOs
3. Controllers
4. Services
5. Modules
6. Migrations
7. Permission seed updates
8. Swagger documentation
9. RBAC integration
10. Postman collection updates

Before generating code:

First output:

* Architecture plan
* Database relationship diagram
* API list

Then generate code module-by-module.

Do not start Product Module.
Do not start Inventory Module.
Do not start Order Module.

Stop after Catalog Foundation is complete.
