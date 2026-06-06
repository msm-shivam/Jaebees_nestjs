# Sport E-Commerce Backend — Layer 3 Product Module

You are a Senior NestJS Architect and Senior PostgreSQL Database Designer.

Project Type:

Large-scale Sports E-Commerce Platform similar to Nike, Adidas, Puma, Under Armour.

Current Status:

✅ Layer 1 Complete

* Auth
* Users
* Admin
* RBAC
* OTP
* Sessions

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

DO NOT MODIFY OR REBUILD COMPLETED MODULES.

---

# Objective

Build the Product Catalog Core.

This layer must create the foundation for:

* Product Variants
* Inventory
* Cart
* Orders
* Search
* Analytics

but DO NOT build those modules yet.

---

# Build Scope

Create ONLY:

1. Products Module
2. Product Images Module

Nothing else.

---

# Products Table

Create:

products

Columns:

id UUID PK

brand_id UUID FK → brands.id

category_id UUID FK → categories.id

sub_category_id UUID FK → sub_categories.id

name VARCHAR(255)

slug VARCHAR(255) UNIQUE

sku_prefix VARCHAR(100)

short_description TEXT NULL

description TEXT NULL

status ENUM

meta_title VARCHAR(255) NULL

meta_description TEXT NULL

meta_keywords TEXT NULL

is_featured BOOLEAN DEFAULT false

is_active BOOLEAN DEFAULT true

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

deleted_at TIMESTAMPTZ

---

# Product Status Enum

Create enum:

ProductStatus

Values:

DRAFT
ACTIVE
INACTIVE
ARCHIVED

Default:

DRAFT

---

# Product Images Table

Create:

product_images

Columns:

id UUID PK

product_id UUID FK

image_url TEXT

alt_text VARCHAR(255)

sort_order INTEGER DEFAULT 0

is_primary BOOLEAN DEFAULT false

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

deleted_at TIMESTAMPTZ

---

# Relationships

Brand

1 → Many Products

Category

1 → Many Products

Sub Category

1 → Many Products

Product

1 → Many Product Images

Product

Many → Many Collections

via:

product_collections

Product

Many → Many Tags

via:

product_tag_mappings

---

# Update Existing Relations

Add Product FK to:

product_collections.product_id

product_tag_mappings.product_id

Use:

ON DELETE CASCADE

---

# Slug Generation

Automatically generate slug from name.

Example:

Nike Air Zoom Pegasus 41

↓

nike-air-zoom-pegasus-41

If already exists:

nike-air-zoom-pegasus-41-2

nike-air-zoom-pegasus-41-3

Must always remain unique.

---

# Validation Rules

Product creation requires:

brand_id
category_id
sub_category_id
name

Validation:

Brand exists

Category exists

Sub Category exists

Sub Category belongs to Category

Slug unique

Collections exist

Tags exist

No duplicate mappings

---

# Product Creation Flow

Admin creates product.

Initial status:

DRAFT

Product may exist without:

images

collections

tags

SEO

---

# Product Update Flow

Admin can:

Update details

Assign collections

Remove collections

Assign tags

Remove tags

Upload images

Change primary image

Publish product

Archive product

Deactivate product

---

# Soft Delete

Do not permanently delete products.

Use:

deleted_at

for products and images.

---

# Permissions

Create:

product.create
product.view
product.update
product.delete
product.publish
product.archive

Update seeds.

Update permission constants.

Update RBAC integration.

---

# Admin APIs

Base Path:

/api/v1/admin/products

Endpoints:

POST    /products

GET     /products

GET     /products/:id

PATCH   /products/:id

DELETE  /products/:id

PATCH   /products/:id/publish

PATCH   /products/:id/archive

POST    /products/:id/collections

DELETE  /products/:id/collections/:collectionId

POST    /products/:id/tags

DELETE  /products/:id/tags/:tagId

---

# Product Image APIs

POST    /products/:id/images

GET     /products/:id/images

PATCH   /products/images/:imageId

DELETE  /products/images/:imageId

PATCH   /products/images/:imageId/primary

---

# Query Features

Product List API must support:

search

status filter

brand filter

category filter

sub category filter

featured filter

active filter

pagination

sorting

---

# Migration

Create migration:

CreateProductsAndImages

Must create:

products

product_images

Must add:

FK product_collections.product_id → products.id

FK product_tag_mappings.product_id → products.id

Must create indexes:

slug

brand_id

category_id

sub_category_id

status

is_active

is_featured

---

# Swagger

Document:

Entities

DTOs

Enums

Permissions

Responses

Validation

Examples

---

# Postman

Update collection with all Product APIs.

---

# Deliverables

Generate:

1. Database Design
2. ER Diagram
3. Entity Files
4. DTOs
5. Services
6. Controllers
7. Modules
8. Migration
9. Permission Seed Updates
10. Swagger Updates
11. Postman Updates
12. Updated project-status.md

Before code generation:

Output architecture review and database design first.

After code generation:

Run full dependency validation.

Run build validation.

Ensure:

npm run build

passes with zero TypeScript errors.

STOP after Layer 3 is complete.

DO NOT start:

* Product Variants
* Inventory
* Cart
* Orders
* Payments
* Reviews
* Elasticsearch
* Analytics
