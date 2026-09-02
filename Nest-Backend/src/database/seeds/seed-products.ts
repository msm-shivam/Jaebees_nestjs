/**
 * Seed script - Products catalog (Brands, Categories, Subcategories, Products, Variants, Images, Inventory)
 * Run: npx ts-node -r tsconfig-paths/register src/database/seeds/seed-products.ts
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { AppDataSource } from '../data-source';
import { v4 as uuid } from 'uuid';

dotenv.config();

const U = {
  brand1: '20000001-0000-4000-8000-000000000001',
  brand2: '20000001-0000-4000-8000-000000000002',
  brand3: '20000001-0000-4000-8000-000000000003',
  brand4: '20000001-0000-4000-8000-000000000004',
  cat1:   '30000001-0000-4000-8000-000000000001',
  cat2:   '30000001-0000-4000-8000-000000000002',
  cat3:   '30000001-0000-4000-8000-000000000003',
  sub1:   '40000001-0000-4000-8000-000000000001',
  sub2:   '40000001-0000-4000-8000-000000000002',
  sub3:   '40000001-0000-4000-8000-000000000003',
  sub4:   '40000001-0000-4000-8000-000000000004',
};

const prodPrefix = '50000001-0000-4000-8000-000000000000';
function pid(n: number) {
  return prodPrefix.slice(0, -2) + n.toString().padStart(2, '0');
}

const variantPrefix = 'a0000001-0000-4000-8000-000000000000';
function vid(n: number) {
  return variantPrefix.slice(0, -2) + n.toString().padStart(2, '0');
}

interface ProductSpec {
  id: string;
  brandId: string;
  categoryId: string;
  subCategoryId: string;
  name: string;
  slug: string;
  skuPrefix: string;
  price: number;
  compareAt: number;
  sizes: string[];
  images: { primary: string; secondary: string };
}

async function seed() {
  console.log('Connecting...');
  await AppDataSource.initialize();
  const qr = AppDataSource.createQueryRunner();

  const cleanTables = [
    'inventories', 'stock_adjustments', 'stock_alerts', 'inventory_audits',
    'product_variant_attributes', 'product_variants',
    'product_images', 'product_tag_mappings',
    'products', 'brand_categories', 'sub_categories', 'categories', 'brands',
  ];
  for (const name of cleanTables) {
    try { await qr.query(`DELETE FROM "${name}"`); } catch { /* skip */ }
  }
  console.log('Cleared catalog data');

  const now = new Date();

  // ─── Brands ────────────────────────────────────────────────────────────
  const brands = [
    { id: U.brand1, name: 'Nike', slug: 'nike', description: 'American sportswear brand', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80' },
    { id: U.brand2, name: 'Adidas', slug: 'adidas', description: 'German sportswear brand', logo: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=400&q=80' },
    { id: U.brand3, name: 'Puma', slug: 'puma', description: 'German sportswear brand', logo: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=400&q=80' },
    { id: U.brand4, name: 'Under Armour', slug: 'under-armour', description: 'American sportswear brand', logo: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80' },
  ];
  for (const b of brands) {
    await qr.query(
      `INSERT INTO brands (id, name, slug, description, logo, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, $6, $6) ON CONFLICT (slug) DO NOTHING`,
      [b.id, b.name, b.slug, b.description, b.logo, now],
    );
  }
  console.log('  Brands: 4');

  // ─── Categories ────────────────────────────────────────────────────────
  const cats = [
    { id: U.cat1, name: 'Running', slug: 'running', description: 'Running shoes & gear', sortOrder: 1, image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1000&q=80' },
    { id: U.cat2, name: 'Training & Gym', slug: 'training-gym', description: 'Workout clothing & accessories', sortOrder: 2, image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80' },
    { id: U.cat3, name: 'Casual', slug: 'casual', description: 'Everyday casual wear', sortOrder: 3, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=80' },
  ];
  for (const c of cats) {
    await qr.query(
      `INSERT INTO categories (id, name, slug, description, image, sort_order, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, $7, $7) ON CONFLICT (slug) DO NOTHING`,
      [c.id, c.name, c.slug, c.description, c.image, c.sortOrder, now],
    );
  }
  const bcPairs = [
    [U.brand1, U.cat1], [U.brand1, U.cat2],
    [U.brand2, U.cat1], [U.brand2, U.cat2], [U.brand2, U.cat3],
    [U.brand3, U.cat2], [U.brand3, U.cat3],
    [U.brand4, U.cat1], [U.brand4, U.cat2],
  ];
  for (const [bid, cid] of bcPairs) {
    await qr.query(`INSERT INTO brand_categories (brand_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [bid, cid]);
  }
  console.log('  Categories: 3');

  // ─── Sub Categories ────────────────────────────────────────────────────
  const subs = [
    { id: U.sub1, categoryId: U.cat1, name: 'Running Shoes', slug: 'running-shoes', sortOrder: 1 },
    { id: U.sub2, categoryId: U.cat2, name: 'Gym Wear', slug: 'gym-wear', sortOrder: 1 },
    { id: U.sub3, categoryId: U.cat3, name: 'Casual Shoes', slug: 'casual-shoes', sortOrder: 1 },
    { id: U.sub4, categoryId: U.cat3, name: 'Casual Apparel', slug: 'casual-apparel', sortOrder: 2 },
  ];
  for (const s of subs) {
    await qr.query(
      `INSERT INTO sub_categories (id, category_id, name, slug, sort_order, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, $6, $6) ON CONFLICT (slug) DO NOTHING`,
      [s.id, s.categoryId, s.name, s.slug, s.sortOrder, now],
    );
  }
  console.log('  SubCategories: 4');

  // ─── Products (12) ─────────────────────────────────────────────────────
  const products: ProductSpec[] = [
    // Nike
    {
      id: pid(1),
      brandId: U.brand1,
      categoryId: U.cat1,
      subCategoryId: U.sub1,
      name: 'Nike Air Zoom Pegasus 40',
      slug: 'nike-air-zoom-pegasus-40',
      skuPrefix: 'NIKE-PEG-40',
      price: 4399,
      compareAt: 5499,
      sizes: ['S', 'M', 'L'],
      images: {
        primary: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
        secondary: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1000&q=80',
      },
    },
    {
      id: pid(2),
      brandId: U.brand1,
      categoryId: U.cat2,
      subCategoryId: U.sub2,
      name: 'Nike Dri-FIT Training Tee',
      slug: 'nike-dri-fit-training-tee',
      skuPrefix: 'NIKE-DF-TEE',
      price: 1199,
      compareAt: 1499,
      sizes: ['S', 'M', 'L'],
      images: {
        primary: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
        secondary: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80',
      },
    },
    {
      id: pid(3),
      brandId: U.brand1,
      categoryId: U.cat1,
      subCategoryId: U.sub1,
      name: 'Nike Revolution 6',
      slug: 'nike-revolution-6',
      skuPrefix: 'NIKE-REV-6',
      price: 1999,
      compareAt: 2499,
      sizes: ['S', 'M', 'L'],
      images: {
        primary: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80',
        secondary: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80',
      },
    },
    // Adidas
    {
      id: pid(4),
      brandId: U.brand2,
      categoryId: U.cat1,
      subCategoryId: U.sub1,
      name: 'Adidas Ultraboost Light',
      slug: 'adidas-ultraboost-light',
      skuPrefix: 'ADIDAS-UB-LIGHT',
      price: 6399,
      compareAt: 7999,
      sizes: ['S', 'M', 'L'],
      images: {
        primary: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80',
        secondary: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80',
      },
    },
    {
      id: pid(5),
      brandId: U.brand2,
      categoryId: U.cat2,
      subCategoryId: U.sub2,
      name: 'Adidas Essentials Hoodie',
      slug: 'adidas-essentials-hoodie',
      skuPrefix: 'ADIDAS-HOODIE',
      price: 2499,
      compareAt: 2999,
      sizes: ['S', 'M', 'L'],
      images: {
        primary: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
        secondary: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80',
      },
    },
    {
      id: pid(6),
      brandId: U.brand2,
      categoryId: U.cat2,
      subCategoryId: U.sub2,
      name: 'Adidas Training Shorts',
      slug: 'adidas-training-shorts',
      skuPrefix: 'ADIDAS-SHORTS',
      price: 1499,
      compareAt: 1799,
      sizes: ['S', 'M', 'L'],
      images: {
        primary: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1000&q=80',
        secondary: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80',
      },
    },
    {
      id: pid(7),
      brandId: U.brand2,
      categoryId: U.cat3,
      subCategoryId: U.sub3,
      name: 'Adidas Originals Forum Low',
      slug: 'adidas-originals-forum-low',
      skuPrefix: 'ADIDAS-FORUM',
      price: 3599,
      compareAt: 4599,
      sizes: ['S', 'M', 'L'],
      images: {
        primary: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=80',
        secondary: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=1000&q=80',
      },
    },
    // Puma
    {
      id: pid(8),
      brandId: U.brand3,
      categoryId: U.cat2,
      subCategoryId: U.sub2,
      name: 'Puma Training Hoodie',
      slug: 'puma-training-hoodie',
      skuPrefix: 'PUMA-HOODIE',
      price: 2199,
      compareAt: 2799,
      sizes: ['S', 'M', 'L'],
      images: {
        primary: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80',
        secondary: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
      },
    },
    {
      id: pid(9),
      brandId: U.brand3,
      categoryId: U.cat3,
      subCategoryId: U.sub4,
      name: 'Puma Classic T-Shirt',
      slug: 'puma-classic-tshirt',
      skuPrefix: 'PUMA-TEE',
      price: 799,
      compareAt: 999,
      sizes: ['S', 'M', 'L'],
      images: {
        primary: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80',
        secondary: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
      },
    },
    {
      id: pid(10),
      brandId: U.brand3,
      categoryId: U.cat3,
      subCategoryId: U.sub3,
      name: 'Puma Carina Street',
      slug: 'puma-carina-street',
      skuPrefix: 'PUMA-CARINA',
      price: 2999,
      compareAt: 3999,
      sizes: ['S', 'M', 'L'],
      images: {
        primary: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=80',
        secondary: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80',
      },
    },
    // Under Armour
    {
      id: pid(11),
      brandId: U.brand4,
      categoryId: U.cat1,
      subCategoryId: U.sub1,
      name: 'UA Charged Assert 10',
      slug: 'ua-charged-assert-10',
      skuPrefix: 'UA-ASSERT',
      price: 2999,
      compareAt: 3799,
      sizes: ['S', 'M', 'L'],
      images: {
        primary: 'https://images.unsplash.com/photo-1460353581641-37babbab0fa6?auto=format&fit=crop&w=1000&q=80',
        secondary: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
      },
    },
    {
      id: pid(12),
      brandId: U.brand4,
      categoryId: U.cat2,
      subCategoryId: U.sub2,
      name: 'UA Tech Short Sleeve',
      slug: 'ua-tech-short-sleeve',
      skuPrefix: 'UA-TECH-TEE',
      price: 999,
      compareAt: 1299,
      sizes: ['S', 'M', 'L'],
      images: {
        primary: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80',
        secondary: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80',
      },
    },
    { id: pid(13), brandId: U.brand1, categoryId: U.cat1, subCategoryId: U.sub1, name: 'Nike Vaporfly 3', slug: 'nike-vaporfly-3', skuPrefix: 'NIKE-VP-3', price: 8999, compareAt: 10999, sizes: ['S', 'M', 'L'], images: { primary: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80', secondary: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1000&q=80' } },
    { id: pid(14), brandId: U.brand1, categoryId: U.cat1, subCategoryId: U.sub1, name: 'Nike Invincible 3', slug: 'nike-invincible-3', skuPrefix: 'NIKE-INV-3', price: 6499, compareAt: 7499, sizes: ['S', 'M', 'L'], images: { primary: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80', secondary: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80' } },
    { id: pid(15), brandId: U.brand1, categoryId: U.cat1, subCategoryId: U.sub1, name: 'Nike Structure 25', slug: 'nike-structure-25', skuPrefix: 'NIKE-STR-25', price: 3999, compareAt: 4999, sizes: ['S', 'M', 'L'], images: { primary: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80', secondary: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80' } },
    { id: pid(16), brandId: U.brand2, categoryId: U.cat1, subCategoryId: U.sub1, name: 'Adidas Boston 12', slug: 'adidas-boston-12', skuPrefix: 'ADIDAS-BST-12', price: 5499, compareAt: 6499, sizes: ['S', 'M', 'L'], images: { primary: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80', secondary: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80' } },
    { id: pid(17), brandId: U.brand2, categoryId: U.cat1, subCategoryId: U.sub1, name: 'Adidas Adizero Adios Pro 3', slug: 'adidas-adizero-adios-pro-3', skuPrefix: 'ADIDAS-ADIOS-3', price: 9499, compareAt: 11499, sizes: ['S', 'M', 'L'], images: { primary: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=80', secondary: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=1000&q=80' } },
    { id: pid(18), brandId: U.brand2, categoryId: U.cat1, subCategoryId: U.sub1, name: 'Adidas Solarglide 6', slug: 'adidas-solarglide-6', skuPrefix: 'ADIDAS-SOLAR-6', price: 4299, compareAt: 5299, sizes: ['S', 'M', 'L'], images: { primary: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80', secondary: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80' } },
    { id: pid(19), brandId: U.brand3, categoryId: U.cat1, subCategoryId: U.sub1, name: 'Puma Deviate Nitro 2', slug: 'puma-deviate-nitro-2', skuPrefix: 'PUMA-DEV-2', price: 4999, compareAt: 5999, sizes: ['S', 'M', 'L'], images: { primary: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=80', secondary: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=80' } },
    { id: pid(20), brandId: U.brand3, categoryId: U.cat1, subCategoryId: U.sub1, name: 'Puma Velocity Nitro 3', slug: 'puma-velocity-nitro-3', skuPrefix: 'PUMA-VEL-3', price: 3799, compareAt: 4499, sizes: ['S', 'M', 'L'], images: { primary: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80', secondary: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80' } },
    { id: pid(21), brandId: U.brand3, categoryId: U.cat1, subCategoryId: U.sub1, name: 'Puma ForeverRun Nitro', slug: 'puma-foreverrun-nitro', skuPrefix: 'PUMA-FR-NITRO', price: 4199, compareAt: 5199, sizes: ['S', 'M', 'L'], images: { primary: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80', secondary: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1000&q=80' } },
    { id: pid(22), brandId: U.brand4, categoryId: U.cat1, subCategoryId: U.sub1, name: 'UA Infinite Elite', slug: 'ua-infinite-elite', skuPrefix: 'UA-INF-ELITE', price: 4799, compareAt: 5799, sizes: ['S', 'M', 'L'], images: { primary: 'https://images.unsplash.com/photo-1460353581641-37babbab0fa6?auto=format&fit=crop&w=1000&q=80', secondary: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80' } },
    { id: pid(23), brandId: U.brand4, categoryId: U.cat1, subCategoryId: U.sub1, name: 'UA Flow Velocity Wind 2', slug: 'ua-flow-velocity-wind-2', skuPrefix: 'UA-FLOW-WIND', price: 5199, compareAt: 6199, sizes: ['S', 'M', 'L'], images: { primary: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80', secondary: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80' } },
    { id: pid(24), brandId: U.brand4, categoryId: U.cat1, subCategoryId: U.sub1, name: 'UA Hovr Sonic 6', slug: 'ua-hovr-sonic-6', skuPrefix: 'UA-HOVR-S6', price: 3499, compareAt: 4299, sizes: ['S', 'M', 'L'], images: { primary: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80', secondary: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80' } },
    { id: pid(25), brandId: U.brand1, categoryId: U.cat1, subCategoryId: U.sub1, name: 'Nike Pegasus Trail 4', slug: 'nike-pegasus-trail-4', skuPrefix: 'NIKE-PEG-TR4', price: 4699, compareAt: 5699, sizes: ['S', 'M', 'L'], images: { primary: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80', secondary: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1000&q=80' } },
    { id: pid(26), brandId: U.brand2, categoryId: U.cat1, subCategoryId: U.sub1, name: 'Adidas Terrex Agravic Speed', slug: 'adidas-terrex-agravic-speed', skuPrefix: 'ADIDAS-TERREX', price: 5899, compareAt: 6899, sizes: ['S', 'M', 'L'], images: { primary: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80', secondary: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80' } },
    { id: pid(27), brandId: U.brand3, categoryId: U.cat1, subCategoryId: U.sub1, name: 'Puma Fast-R Nitro Elite 2', slug: 'puma-fastr-nitro-elite-2', skuPrefix: 'PUMA-FASTR-2', price: 9999, compareAt: 11999, sizes: ['S', 'M', 'L'], images: { primary: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=80', secondary: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=80' } },
    { id: pid(28), brandId: U.brand4, categoryId: U.cat1, subCategoryId: U.sub1, name: 'UA Surge 3 Running Shoes', slug: 'ua-surge-3-running-shoes', skuPrefix: 'UA-SURGE-3', price: 2199, compareAt: 2799, sizes: ['S', 'M', 'L'], images: { primary: 'https://images.unsplash.com/photo-1460353581641-37babbab0fa6?auto=format&fit=crop&w=1000&q=80', secondary: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80' } },
  ];

  for (const p of products) {
    await qr.query(
      `INSERT INTO products (id, brand_id, category_id, sub_category_id, name, slug, sku_prefix, description, short_description, status, is_featured, is_active, average_rating, total_ratings, total_reviews, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE', true, true, 4.8, 12, 12, $10, $10)
       ON CONFLICT (slug) DO NOTHING`,
      [p.id, p.brandId, p.categoryId, p.subCategoryId, p.name, p.slug, p.skuPrefix, `Premium athletic performance and style with ${p.name}. Built with advanced breathability and durable materials for maximum comfort during training or daily wear.`, p.skuPrefix, now],
    );
  }
  console.log(`  Products: ${products.length}`);

  // ─── Product Images (2 per product with Unsplash URLs) ────────────────
  for (const p of products) {
    await qr.query(
      `INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 0, true, $5, $5)`,
      [uuid(), p.id, p.images.primary, p.name, now],
    );
    await qr.query(
      `INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 1, false, $5, $5)`,
      [uuid(), p.id, p.images.secondary, `${p.name} - Side View`, now],
    );
  }
  console.log('  Images: 24');

  // ─── Variants (3 sizes per product = 36) ──────────────────────────────
  let vIdx = 0;
  const productVariants: Record<string, string[]> = {};
  for (const p of products) {
    const ids: string[] = [];
    for (const size of p.sizes) {
      vIdx++;
      const vId = vid(vIdx);
      ids.push(vId);
      await qr.query(
        `INSERT INTO product_variants (id, product_id, sku, price, compare_at_price, cost_price, status, is_default, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE', $7, $8, $8)`,
        [vId, p.id, `${p.skuPrefix}-${size}`, p.price, p.compareAt, Math.round(p.compareAt * 0.6), size === 'M' ? true : false, now],
      );
    }
    productVariants[p.id] = ids;
  }
  console.log('  Variants: 36');

  // ─── Inventory (1 per variant = 36) ────────────────────────────────────
  for (const vId of Object.values(productVariants).flat()) {
    await qr.query(
      `INSERT INTO inventories (id, variant_id, quantity, reserved_quantity, available_quantity, low_stock_threshold, reorder_point, reorder_quantity, created_at, updated_at)
       VALUES ($1, $2, 100, 0, 100, 5, 10, 50, $3, $3)`,
      [uuid(), vId, now],
    );
  }
  console.log('  Inventory: 36');

  await qr.release();
  await AppDataSource.destroy();
  console.log('\nProduct catalog seed completed successfully with real Unsplash images!');
}

seed().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
