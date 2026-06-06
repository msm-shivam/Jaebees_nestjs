# Sport E-Commerce Backend — Layer 3 Product Module

You are a Senior Software Architect and Senior NestJS Developer.

Current Project Status:

✅ Layer 1 Complete

* Authentication
* Users
* Admin
* RBAC
* Sessions
* OTP

✅ Layer 2 Complete

* Brands
* Categories
* Sub Categories
* Collections
* Attributes
* Attribute Values
* Product Tags

✅ Layer 2.1 Complete

* Product Collections Mapping
* Product Tag Mapping
* Catalog Relationship Improvements

Do NOT rebuild any completed modules.

Your task is ONLY Layer 3 Product Module.

---

# Goal

Build the Product Catalog Core.

This phase creates products and product images.

Do NOT build variants.

Do NOT build inventory.

Do NOT build cart.

Do NOT build orders.

Do NOT build payments.

Do NOT build reviews.

Do NOT build search.

Do NOT build analytics.

---

# Modules To Build

Create:

* Products Module
* Product Images Module

---

# Product Table

Create:

products

Columns:

id UUID PK

brand_id UUID FK

category_id UUID FK

sub_category_id UUID FK

name VARCHAR(255)

slug VARCHAR(255) UNIQUE

sku_prefix VARCHAR(100)

short_description TEXT

description TEXT

status ENUM

meta_title VARCHAR(255)

meta_description TEXT

meta_keywords TEXT

is_featured BOOLEAN

is_active BOOLEAN

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

deleted_at TIMESTAMPTZ

---

# Product Status Enum

Values:

DRAFT

ACTIVE

INACTIVE

ARCHIVED

---

# Product Relationships

Brand

1 → Many Products

Category

1 → Many Products

SubCategory

1 → Many Products

Product

1 → Many ProductImages

Product

Many → Many Collections

(using product_collections)

Product

Many → Many Tags

(using product_tag_mappings)

---

# Product Images Table

Create:

product_images

Columns:

id UUID PK

product_id UUID FK

image_url TEXT

alt_text VARCHAR(255)

sort_order INTEGER

is_primary BOOLEAN

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

deleted_at TIMESTAMPTZ

---

# Slug Rules

Auto-generate slug from product name.

Example:

Nike Air Zoom Pegasus 41

↓

nike-air-zoom-pegasus-41

If already exists:

nike-air-zoom-pegasus-41-2

nike-air-zoom-pegasus-41-3

Must always remain unique.

---

# Product Creation Flow

Admin creates product.

Required:

brand_id

category_id

sub_category_id

name

status

Optional:

short_description

description

seo fields

featured flag

collections

tags

images

Product may initially be saved as:

DRAFT

without images.

---

# Product Update Flow

Admin can:

Update product details

Assign collections

Assign tags

Add images

Remove images

Publish product

Archive product

Deactivate product

---

# Product Delete Flow

Soft delete only.

Set:

deleted_at

Do not permanently remove data.

---

# Permissions

Add new permissions:

product.create

product.view

product.update

product.delete

product.publish

product.archive

Seed all permissions.

---

# API Endpoints

Base:

/api/v1/admin/products

Create Product

POST /products

List Products

GET /products

Get Product

GET /products/:id

Update Product

PATCH /products/:id

Delete Product

DELETE /products/:id

Publish Product

PATCH /products/:id/publish

Archive Product

PATCH /products/:id/archive

Assign Collections

POST /products/:id/collections

Remove Collection

DELETE /products/:id/collections/:collectionId

Assign Tags

POST /products/:id/tags

Remove Tag

DELETE /products/:id/tags/:tagId

---

# Product Images APIs

POST /products/:id/images

GET /products/:id/images

PATCH /products/images/:imageId

DELETE /products/images/:imageId

Set Primary Image

PATCH /products/images/:imageId/primary

---

# Validation Rules

Brand must exist.

Category must exist.

Sub Category must belong to Category.

Collection must exist.

Tag must exist.

Slug must be unique.

No duplicate collection mappings.

No duplicate tag mappings.

---

# Migration Requirements

Create:

products

product_images

Add FK from:

product_collections.product_id → products.id

product_tag_mappings.product_id → products.id

Add indexes:

brand_id

category_id

sub_category_id

slug

status

is_active

is_featured

---

# Swagger

Document every endpoint.

Document DTOs.

Document enums.

Document permissions.

---

# Deliverables

Generate:

1. Product Entity
2. Product Image Entity
3. DTOs
4. Controllers
5. Services
6. Modules
7. Migration
8. Permission Seeds
9. Swagger Documentation
10. Postman Updates

Before generating code:

Output:

* Database Design
* ER Diagram
* API List
* Validation Rules

Then generate code.

Stop after Product Module is complete.

Do NOT start Variants.
Do NOT start Inventory.
Do NOT start Orders.
