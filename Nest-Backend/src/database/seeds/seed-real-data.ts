import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { AppDataSource } from '../data-source';
import { v4 as uuid } from 'uuid';

dotenv.config();

// ─── Deterministic UUID helpers ────────────────────────────────────────────

const bPrefix = 'a1000001-0000-4000-8000-000000000000';
const cPrefix = 'a2000001-0000-4000-8000-000000000000';
const sPrefix = 'a3000001-0000-4000-8000-000000000000';
const uPrefix = 'a4000001-0000-4000-8000-000000000000';
const pPrefix = 'a5000001-0000-4000-8000-000000000000';
const vPrefix = 'a6000001-0000-4000-8000-000000000000';
const addrPrefix = 'a8000001-0000-4000-8000-000000000000';

function id(prefix: string, n: number): string {
  return prefix.slice(0, -2) + n.toString().padStart(2, '0');
}

async function seedRealData() {
  console.log('Connecting to database...');
  await AppDataSource.initialize();
  const qr = AppDataSource.createQueryRunner();

  // ─── Clean consumer data (preserve admin/auth/permissions) ─────────────────
  const cleanTables = [
    'review_reports', 'review_helpful_votes', 'review_images', 'reviews',
    'product_answers', 'product_questions',
    'shipment_tracking_logs', 'shipments',
    'payment_refunds', 'payment_logs', 'payments',
    'order_items', 'orders',
    'cart_items', 'carts',
    'wishlist_items', 'wishlists',
    'product_variant_attributes', 'product_variants',
    'product_images', 'product_tag_mappings',
    'products', 'product_tags',
    'stock_alerts', 'stock_adjustments', 'inventory_audits',
    'sub_categories', 'categories', 'brands',
    'addresses', 'users',
  ];
  for (const name of cleanTables) {
    try { await qr.query(`DELETE FROM "${name}"`); } catch { /* skip */ }
  }
  console.log('Cleaned consumer data (admin/auth/permissions preserved)');

  const now = new Date();

  // ──────────────────────── BRANDS (2) ──────────────────────────────────────
  const brands = [
    { id: id(bPrefix, 1), name: 'Nike', slug: 'nike', description: 'American sportswear brand known for innovation and performance' },
    { id: id(bPrefix, 2), name: 'Adidas', slug: 'adidas', description: 'German sportswear brand with iconic three-stripe design' },
  ];
  for (const b of brands) {
    await qr.query(
      `INSERT INTO brands (id, name, slug, description, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, true, $5, $5)`,
      [b.id, b.name, b.slug, b.description, now],
    );
  }
  console.log(`Brands: ${brands.length}`);

  // ──────────────────────── CATEGORIES (3) ──────────────────────────────────
  const categories = [
    { id: id(cPrefix, 1), name: 'Running', slug: 'running', description: 'Running shoes, apparel & accessories', sortOrder: 1 },
    { id: id(cPrefix, 2), name: 'Football', slug: 'football', description: 'Football boots, kits & equipment', sortOrder: 2 },
    { id: id(cPrefix, 3), name: 'Training & Gym', slug: 'training-gym', description: 'Workout clothing, shoes & gear', sortOrder: 3 },
  ];
  for (const c of categories) {
    await qr.query(
      `INSERT INTO categories (id, name, slug, description, sort_order, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, $6, $6)`,
      [c.id, c.name, c.slug, c.description, c.sortOrder, now],
    );
  }
  console.log(`Categories: ${categories.length}`);

  // Brand-Category mapping (brand_categories join table)
  // Nike → Running, Training & Gym; Adidas → Football, Running
  const brandCategoryPairs = [
    { brandId: id(bPrefix, 1), categoryId: id(cPrefix, 1) },
    { brandId: id(bPrefix, 1), categoryId: id(cPrefix, 3) },
    { brandId: id(bPrefix, 2), categoryId: id(cPrefix, 1) },
    { brandId: id(bPrefix, 2), categoryId: id(cPrefix, 2) },
  ];
  for (const bc of brandCategoryPairs) {
    await qr.query(
      `INSERT INTO brand_categories (brand_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [bc.brandId, bc.categoryId],
    );
  }

  // ──────────────────────── SUBCATEGORIES (2) ───────────────────────────────
  const subcategories = [
    { id: id(sPrefix, 1), name: 'Running Shoes', slug: 'running-shoes', categoryId: id(cPrefix, 1), sortOrder: 1 },
    { id: id(sPrefix, 2), name: 'Football Boots', slug: 'football-boots', categoryId: id(cPrefix, 2), sortOrder: 1 },
  ];
  for (const sc of subcategories) {
    await qr.query(
      `INSERT INTO sub_categories (id, category_id, name, slug, sort_order, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, $6, $6)`,
      [sc.id, sc.categoryId, sc.name, sc.slug, sc.sortOrder, now],
    );
  }
  console.log(`SubCategories: ${subcategories.length}`);

  // ──────────────────────── USERS (3) ───────────────────────────────────────
  const users = [
    {
      id: id(uPrefix, 1),
      firstName: 'Ali', lastName: 'Hassan',
      email: 'ali.hassan@example.com', mobile: '+971511111111',
    },
    {
      id: id(uPrefix, 2),
      firstName: 'Fatima', lastName: 'Omar',
      email: 'fatima.omar@example.com', mobile: '+971522222222',
    },
    {
      id: id(uPrefix, 3),
      firstName: 'Khalid', lastName: 'Ali',
      email: 'khalid.ali@example.com', mobile: '+971533333333',
    },
  ];
  for (const u of users) {
    await qr.query(
      `INSERT INTO users (id, first_name, last_name, email, mobile, password_hash, is_email_verified, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, true, $7, $7)`,
      [u.id, u.firstName, u.lastName, u.email, u.mobile, '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9Rn6d5YFwPvI1n7y3f5JL2GxGq', now],
    );
  }
  console.log(`Users: ${users.length}`);

  // Fetch or create a warehouse
  let warehouseRows = await qr.query(`SELECT id FROM warehouses LIMIT 1`);
  if (warehouseRows.length === 0) {
    const whId = uuid();
    await qr.query(
      `INSERT INTO warehouses (id, name, code, address, city, state, country, postal_code, latitude, longitude, is_active, created_at, updated_at)
       VALUES ($1, 'Default Warehouse', 'DEF-MAIN', '123 Default St', 'Dubai', 'Dubai', 'UAE', '00000', 25.2048, 55.2708, true, $2, $2)`,
      [whId, now],
    );
    warehouseRows = [{ id: whId }];
  }
  const warehouseId = warehouseRows[0].id;

  // Fetch payment methods from the existing DB
  const pmRows = await qr.query(`SELECT id, code FROM payment_methods LIMIT 2`);
  const paymentMethodIds = pmRows.map((r: { id: string }) => r.id);

  // ──────────────────────── PRODUCTS (5) ────────────────────────────────────
  const products = [
    {
      id: id(pPrefix, 1), brandId: id(bPrefix, 1), categoryId: id(cPrefix, 1), subCategoryId: id(sPrefix, 1),
      name: 'Nike Air Zoom Pegasus 40', slug: 'nike-air-zoom-pegasus-40',
      skuPrefix: 'NIKE-PEG-40',
      shortDesc: 'Responsive everyday running shoe with Zoom Air cushioning',
      desc: 'The Nike Air Zoom Pegasus 40 continues the legacy of responsive cushioning and reliable performance for everyday runners. Features a breathable mesh upper and Zoom Air unit for a springy feel.',
      basePrice: 5499, salePrice: 4399, status: 'ACTIVE',
    },
    {
      id: id(pPrefix, 2), brandId: id(bPrefix, 1), categoryId: id(cPrefix, 3), subCategoryId: null,
      name: 'Nike Dri-FIT Training Tee', slug: 'nike-dri-fit-training-tee',
      skuPrefix: 'NIKE-DF-TEE',
      shortDesc: 'Moisture-wicking training t-shirt',
      desc: 'Stay cool and dry during intense workouts with this Nike Dri-FIT training tee. Made from lightweight, breathable fabric with a relaxed fit for maximum mobility.',
      basePrice: 1499, salePrice: 1199, status: 'ACTIVE',
    },
    {
      id: id(pPrefix, 3), brandId: id(bPrefix, 2), categoryId: id(cPrefix, 2), subCategoryId: id(sPrefix, 2),
      name: 'Adidas Predator Edge', slug: 'adidas-predator-edge',
      skuPrefix: 'ADIDAS-PRED-EDGE',
      shortDesc: 'Precision football boot with Demonskin technology',
      desc: 'The Adidas Predator Edge delivers exceptional ball control and precision. Features Demonskin rubber elements on the striking zone for maximum grip and spin.',
      basePrice: 6999, salePrice: 5599, status: 'ACTIVE',
    },
    {
      id: id(pPrefix, 4), brandId: id(bPrefix, 2), categoryId: id(cPrefix, 1), subCategoryId: id(sPrefix, 1),
      name: 'Adidas Ultraboost Light', slug: 'adidas-ultraboost-light',
      skuPrefix: 'ADIDAS-UB-LIGHT',
      shortDesc: 'Ultra-comfortable running shoe with Light BOOST',
      desc: 'The Adidas Ultraboost Light features the new Light BOOST midsole for incredible energy return with every stride. Primeknit upper adapts to your foot for a sock-like fit.',
      basePrice: 7999, salePrice: 6399, status: 'ACTIVE',
    },
    {
      id: id(pPrefix, 5), brandId: id(bPrefix, 1), categoryId: id(cPrefix, 1), subCategoryId: id(sPrefix, 1),
      name: 'Nike Revolution 6', slug: 'nike-revolution-6',
      skuPrefix: 'NIKE-REV-6',
      shortDesc: 'Everyday road-running shoe with soft cushioning',
      desc: 'The Nike Revolution 6 offers a soft, smooth ride for new and experienced runners alike. Features a plush midsole and engineered mesh upper for breathable comfort.',
      basePrice: 2499, salePrice: 1999, status: 'ACTIVE',
    },
  ];
  for (const p of products) {
    await qr.query(
      `INSERT INTO products (id, brand_id, category_id, sub_category_id, name, slug, sku_prefix, short_description, description, status, is_featured, is_active, average_rating, total_ratings, total_reviews, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, true, 0, 0, 0, $11, $11)`,
      [p.id, p.brandId, p.categoryId, p.subCategoryId, p.name, p.slug, p.skuPrefix, p.shortDesc, p.desc, p.status, now],
    );
  }
  console.log(`Products: ${products.length}`);

  // ─── Product Images (2 per product) ───────────────────────────────────────
  let imgCount = 0;
  for (const p of products) {
    await qr.query(
      `INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 0, true, $5, $5)`,
      [uuid(), p.id, `/images/products/${p.skuPrefix.toLowerCase()}-1.jpg`, `${p.name} - Front View`, now],
    );
    imgCount++;
    await qr.query(
      `INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 1, false, $5, $5)`,
      [uuid(), p.id, `/images/products/${p.skuPrefix.toLowerCase()}-2.jpg`, `${p.name} - Side View`, now],
    );
    imgCount++;
  }
  console.log(`Product Images: ${imgCount}`);

  // ─── Product Variants (2 per product: S, M with prices from basePrice/salePrice) ──
  const variantSizes = [
    { label: 'S', priceFactor: 0 },
    { label: 'M', priceFactor: 0 },
  ];
  let variantCount = 0;
  let variantIdCounter = 0;
  const productVariantIds: Record<string, string[]> = {};

  for (const p of products) {
    const variantIds: string[] = [];
    for (const vs of variantSizes) {
      variantIdCounter++;
      const vId = id(vPrefix, variantIdCounter);
      variantIds.push(vId);
      const price = p.salePrice + vs.priceFactor;
      await qr.query(
        `INSERT INTO product_variants (id, product_id, sku, price, status, is_default, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'ACTIVE', $5, $6, $6)`,
        [vId, p.id, `${p.skuPrefix}-${vs.label}`, price, vs.label === 'M' ? true : false, now],
      );
      variantCount++;
    }
    productVariantIds[p.id] = variantIds;
  }
  console.log(`Variants: ${variantCount}`);

  // ──────────────────────── ADDRESSES (3, one per user) ─────────────────────
  const addressData = [
    { id: id(addrPrefix, 1), userId: id(uPrefix, 1), fullName: 'Ali Hassan', phone: '+971511111111', addr1: 'Villa 45, Al Wasl Road', city: 'Dubai', state: 'Dubai', country: 'UAE', postalCode: '00000', lat: 25.2048, lng: 55.2708 },
    { id: id(addrPrefix, 2), userId: id(uPrefix, 2), fullName: 'Fatima Omar', phone: '+971522222222', addr1: 'Apartment 12, Al Reem Island', city: 'Abu Dhabi', state: 'Abu Dhabi', country: 'UAE', postalCode: '00000', lat: 24.4672, lng: 54.3921 },
    { id: id(addrPrefix, 3), userId: id(uPrefix, 3), fullName: 'Khalid Ali', phone: '+971533333333', addr1: 'Flat 8, Marina Walk', city: 'Dubai', state: 'Dubai', country: 'UAE', postalCode: '00000', lat: 25.2048, lng: 55.2708 },
  ];
  for (const a of addressData) {
    await qr.query(
      `INSERT INTO addresses (id, user_id, full_name, phone, address_line_1, city, state, country, postal_code, latitude, longitude, is_default, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, $12, $12)`,
      [a.id, a.userId, a.fullName, a.phone, a.addr1, a.city, a.state, a.country, a.postalCode, a.lat, a.lng, now],
    );
  }
  console.log(`Addresses: ${addressData.length}`);

  // ──────────────────────── WISHLISTS (3, one per user) ─────────────────────
  const wishlistData = [
    { userId: id(uPrefix, 1), productIds: [id(pPrefix, 1), id(pPrefix, 3), id(pPrefix, 5)] },
    { userId: id(uPrefix, 2), productIds: [id(pPrefix, 2)] },
    { userId: id(uPrefix, 3), productIds: [id(pPrefix, 4), id(pPrefix, 1)] },
  ];
  let wlCount = 0;
  for (const wd of wishlistData) {
    const wlId = uuid();
    await qr.query(
      `INSERT INTO wishlists (id, user_id, total_items, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $4)`,
      [wlId, wd.userId, wd.productIds.length, now],
    );
    wlCount++;
    for (const pid of wd.productIds) {
      await qr.query(
        `INSERT INTO wishlist_items (id, wishlist_id, product_id, variant_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $5)`,
        [uuid(), wlId, pid, null, now],
      );
    }
  }
  console.log(`Wishlists: ${wlCount}`);

  // ──────────────────────── ORDERS (4) ──────────────────────────────────────

  // Helper: add days to a date
  function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  const orderSpecs = [
    {
      userId: id(uPrefix, 1),
      addressId: id(addrPrefix, 1),
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      daysAgo: 45,
      items: [
        { productId: id(pPrefix, 1), variantIdx: 1, qty: 1 },
        { productId: id(pPrefix, 5), variantIdx: 0, qty: 2 },
      ],
      createShipment: true,
      deliveredAfterDays: 4,
    },
    {
      userId: id(uPrefix, 2),
      addressId: id(addrPrefix, 2),
      status: 'SHIPPED',
      paymentStatus: 'PAID',
      daysAgo: 15,
      items: [
        { productId: id(pPrefix, 2), variantIdx: 0, qty: 3 },
      ],
      createShipment: true,
      deliveredAfterDays: null,
    },
    {
      userId: id(uPrefix, 2),
      addressId: id(addrPrefix, 2),
      status: 'CANCELLED',
      paymentStatus: 'REFUNDED',
      daysAgo: 60,
      items: [
        { productId: id(pPrefix, 4), variantIdx: 1, qty: 1 },
      ],
      createShipment: false,
      deliveredAfterDays: null,
    },
    {
      userId: id(uPrefix, 3),
      addressId: id(addrPrefix, 3),
      status: 'PENDING',
      paymentStatus: 'PENDING',
      daysAgo: 2,
      items: [
        { productId: id(pPrefix, 3), variantIdx: 1, qty: 1 },
        { productId: id(pPrefix, 1), variantIdx: 0, qty: 1 },
      ],
      createShipment: false,
      deliveredAfterDays: null,
    },
    {
      userId: id(uPrefix, 1),
      addressId: id(addrPrefix, 1),
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      daysAgo: 1,
      items: [
        { productId: id(pPrefix, 4), variantIdx: 0, qty: 2 },
      ],
      createShipment: true,
      deliveredAfterDays: null,
    },
  ];

  let orderCount = 0, itemCount = 0, paymentCount = 0, shipmentCount = 0;

  for (const spec of orderSpecs) {
    const createdAt = addDays(now, -spec.daysAgo);
    const orderId = uuid();

    // Compute item details from product/variant data
    const itemDetails: Array<{
      productId: string;
      variantId: string;
      productName: string;
      sku: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }> = [];

    for (const it of spec.items) {
      const product = products.find((p) => p.id === it.productId)!;
      const variantIds = productVariantIds[it.productId];
      const variantId = variantIds[it.variantIdx];
      // Fetch variant price
      const variantRow = await qr.query(
        `SELECT price FROM product_variants WHERE id = $1`,
        [variantId],
      );
      const unitPrice = parseFloat(variantRow[0]?.price ?? product.salePrice);
      const totalPrice = it.qty * unitPrice;
      itemDetails.push({
        productId: it.productId,
        variantId,
        productName: product.name,
        sku: `${product.skuPrefix}-${['S', 'M'][it.variantIdx]}`,
        quantity: it.qty,
        unitPrice,
        totalPrice,
      });
    }

    const subtotal = itemDetails.reduce((sum, i) => sum + i.totalPrice, 0);
    const totalAmount = subtotal;
    const paidAmount = spec.paymentStatus === 'PAID' || spec.paymentStatus === 'REFUNDED' ? totalAmount : 0;

    // Insert order
    await qr.query(
      `INSERT INTO orders (id, order_number, user_id, status, subtotal, discount_amount, shipping_amount, delivery_charge, cod_charge, handling_charge, tax_amount, total_amount, paid_amount, due_amount, payment_status, shipping_address_id, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 0, 0, 0, 0, 0, 0, $6, $7, 0, $8, $9, $10, $11, $11)`,
      [orderId, `ORD-RL-${String(1000 + orderCount).padStart(4, '0')}`, spec.userId, spec.status,
       subtotal, totalAmount, paidAmount,
       spec.paymentStatus === 'PAID' ? 'PAID' : (spec.paymentStatus === 'REFUNDED' ? 'REFUNDED' : 'PENDING'),
       spec.addressId, null, createdAt],
    );
    orderCount++;

    // Insert order items
    for (const item of itemDetails) {
      await qr.query(
        `INSERT INTO order_items (id, order_id, product_id, variant_id, product_name, sku, quantity, unit_price, total_price, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)`,
        [uuid(), orderId, item.productId, item.variantId, item.productName, item.sku, item.quantity, item.unitPrice, item.totalPrice, createdAt],
      );
      itemCount++;
    }

    // Payment for paid orders
    if ((spec.paymentStatus === 'PAID' || spec.paymentStatus === 'REFUNDED') && paymentMethodIds.length > 0) {
      const pmId = paymentMethodIds[orderCount % paymentMethodIds.length];
      await qr.query(
        `INSERT INTO payments (id, order_id, payment_method_id, amount, status, transaction_number, paid_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
        [uuid(), orderId, pmId, totalAmount,
         spec.paymentStatus === 'REFUNDED' ? 'REFUNDED' : 'PAID',
         `TXN-RL-${orderId.slice(0, 8).toUpperCase()}`,
         spec.paymentStatus === 'PAID' ? addDays(createdAt, 1) : null,
         createdAt],
      );
      paymentCount++;
    }

    // Shipment for shipped/delivered/pending orders
    if (spec.createShipment) {
      const shipmentId = uuid();
      const shippedAt = spec.status !== 'PENDING' ? addDays(createdAt, 2) : null;
      const deliveredAt = spec.deliveredAfterDays ? addDays(createdAt, spec.deliveredAfterDays) : null;
      let sStatus: string;
      if (spec.status === 'DELIVERED') sStatus = 'DELIVERED';
      else if (spec.status === 'PENDING') sStatus = 'PENDING';
      else sStatus = 'OUT_FOR_DELIVERY';
      const trackingNumber = `RL-${orderId.slice(0, 8).toUpperCase()}-${String(shipmentCount + 1).padStart(3, '0')}`;

      await qr.query(
        `INSERT INTO shipments (id, order_id, warehouse_id, status, tracking_number, dispatched_at, delivered_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
        [shipmentId, orderId, warehouseId, sStatus, trackingNumber, shippedAt, deliveredAt, createdAt],
      );
      shipmentCount++;

      // Tracking logs - different per status
      if (spec.status === 'PENDING') {
        await qr.query(
          `INSERT INTO shipment_tracking_logs (id, shipment_id, status, note, changed_by, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NULL, $5, $5)`,
          [uuid(), shipmentId, 'PENDING', 'Shipment pending', createdAt],
        );
      } else {
        const trackStatuses = ['PACKED', 'READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY'];
        for (let t = 0; t < trackStatuses.length; t++) {
          const logDate = addDays(createdAt, t + 1);
          await qr.query(
            `INSERT INTO shipment_tracking_logs (id, shipment_id, status, note, changed_by, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NULL, $5, $5)`,
            [uuid(), shipmentId, trackStatuses[t], `Shipment ${trackStatuses[t].replace(/_/g, ' ').toLowerCase()}`, logDate],
          );
        }

        if (deliveredAt) {
          await qr.query(
            `INSERT INTO shipment_tracking_logs (id, shipment_id, status, note, changed_by, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NULL, $5, $5)`,
            [uuid(), shipmentId, 'DELIVERED', 'Package delivered successfully', deliveredAt],
          );
        }
      }
    }
  }

  console.log(`\nOrders: ${orderCount}, Items: ${itemCount}`);
  console.log(`Payments: ${paymentCount}, Shipments: ${shipmentCount}`);

  // ──────────────────────── REVIEWS (for delivered order item) ──────────────
  const aliOrder = await qr.query(
    `SELECT o.id, o.created_at FROM orders o WHERE o.user_id = $1 AND o.status = 'DELIVERED' LIMIT 1`,
    [id(uPrefix, 1)],
  );
  if (aliOrder.length > 0) {
    const orderId = aliOrder[0].id;
    const createdAt = aliOrder[0].created_at;
    const orderItems = await qr.query(
      `SELECT id, product_id, variant_id FROM order_items WHERE order_id = $1`,
      [orderId],
    );
    for (const oi of orderItems) {
      const existing = await qr.query(
        `SELECT id FROM reviews WHERE order_item_id = $1`,
        [oi.id],
      );
      if (existing.length === 0) {
        await qr.query(
          `INSERT INTO reviews (id, user_id, product_id, variant_id, order_id, order_item_id, rating, title, comment, status, is_verified_purchase, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, 5, 'Great product!', 'Excellent quality and fast shipping. Highly recommended!', 'APPROVED', true, $7, $7)`,
          [uuid(), id(uPrefix, 1), oi.product_id, oi.variant_id, orderId, oi.id, createdAt],
        );
      }
    }
  }
  console.log('Reviews: added for delivered orders');

  await qr.release();
  await AppDataSource.destroy();

  console.log('\nReal data seed completed successfully!');
  console.log('Summary:');
  console.log(`  Brands: ${brands.length}, Categories: ${categories.length}, SubCategories: ${subcategories.length}`);
  console.log(`  Users: ${users.length}, Products: ${products.length}, Variants: ${variantCount}`);
  console.log(`  Addresses: ${addressData.length}, Wishlists: ${wlCount}`);
  console.log(`  Orders: ${orderCount}, Items: ${itemCount}, Payments: ${paymentCount}, Shipments: ${shipmentCount}`);
}

seedRealData().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
