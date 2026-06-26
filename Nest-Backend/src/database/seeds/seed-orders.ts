/**
 * Seed script - Orders + returns at different dates across last 3 months
 * Run: npm run seed:orders
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { AppDataSource } from '../data-source';
import { v4 as uuid } from 'uuid';

dotenv.config();

const U = {
  brand1: '20000001-0000-4000-8000-000000000001',
  brand2: '20000001-0000-4000-8000-000000000002',
  cat1:   '30000001-0000-4000-8000-000000000001',
  cat2:   '30000001-0000-4000-8000-000000000002',
  sub1:   '40000001-0000-4000-8000-000000000001',
  sub2:   '40000001-0000-4000-8000-000000000002',
  prod1:  '50000001-0000-4000-8000-000000000001',
  prod2:  '50000001-0000-4000-8000-000000000002',
  prod3:  '50000001-0000-4000-8000-000000000003',
  prod4:  '50000001-0000-4000-8000-000000000004',
  prod5:  '50000001-0000-4000-8000-000000000005',
  prod6:  '50000001-0000-4000-8000-000000000006',
  wh:     '60000001-0000-4000-8000-000000000001',
};

const variantPrefix = 'a0000001-0000-4000-8000-000000000000';
function vid(n: number) {
  return variantPrefix.slice(0, -2) + n.toString().padStart(2, '0');
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function seed() {
  console.log('Connecting...');
  await AppDataSource.initialize();
  const qr = AppDataSource.createQueryRunner();

  // ─── Clean all consumer tables ──────────────────────────────────────────
  const cleanTables = [
    'return_audits', 'return_items', 'return_requests', 'reverse_shipments',
    'return_reason_master',
    'shipment_tracking_logs', 'shipments',
    'payment_refunds', 'payment_logs', 'payments',
    'order_items', 'orders',
    'wishlist_items', 'wishlists',
    'cart_items', 'carts',
    'product_variant_attributes', 'product_variants',
    'product_images', 'product_tag_mappings',
    'products', 'brand_categories', 'sub_categories', 'categories', 'brands',
    'inventory', 'stock_adjustments', 'stock_alerts', 'inventory_audits',
    'addresses',
  ];
  for (const name of cleanTables) {
    try { await qr.query(`DELETE FROM "${name}"`); } catch { /* skip */ }
  }
  console.log('Cleared consumer data');

  const now = new Date();

  // ─── Brands ────────────────────────────────────────────────────────────
  const brands = [
    { id: U.brand1, name: 'Nike', slug: 'nike', description: 'American sportswear brand' },
    { id: U.brand2, name: 'Adidas', slug: 'adidas', description: 'German sportswear brand' },
  ];
  for (const b of brands) {
    await qr.query(
      `INSERT INTO brands (id, name, slug, description, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, true, $5, $5) ON CONFLICT (slug) DO NOTHING`,
      [b.id, b.name, b.slug, b.description, now],
    );
  }
  console.log('  Brands: 2');

  // ─── Categories ────────────────────────────────────────────────────────
  const cats = [
    { id: U.cat1, name: 'Running', slug: 'running', description: 'Running shoes & gear', sortOrder: 1 },
    { id: U.cat2, name: 'Training & Gym', slug: 'training-gym', description: 'Workout clothing & accessories', sortOrder: 2 },
  ];
  for (const c of cats) {
    await qr.query(
      `INSERT INTO categories (id, name, slug, description, sort_order, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, $6, $6) ON CONFLICT (slug) DO NOTHING`,
      [c.id, c.name, c.slug, c.description, c.sortOrder, now],
    );
  }
  const bcPairs = [[U.brand1, U.cat1], [U.brand1, U.cat2], [U.brand2, U.cat1]];
  for (const [bid, cid] of bcPairs) {
    await qr.query(`INSERT INTO brand_categories (brand_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [bid, cid]);
  }
  console.log('  Categories: 2');

  // ─── Sub Categories ────────────────────────────────────────────────────
  const subs = [
    { id: U.sub1, categoryId: U.cat1, name: 'Running Shoes', slug: 'running-shoes', sortOrder: 1 },
    { id: U.sub2, categoryId: U.cat2, name: 'Gym Wear', slug: 'gym-wear', sortOrder: 1 },
  ];
  for (const s of subs) {
    await qr.query(
      `INSERT INTO sub_categories (id, category_id, name, slug, sort_order, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, $6, $6) ON CONFLICT (slug) DO NOTHING`,
      [s.id, s.categoryId, s.name, s.slug, s.sortOrder, now],
    );
  }
  console.log('  SubCategories: 2');

  // ─── Products (6) ──────────────────────────────────────────────────────
  const products = [
    { id: U.prod1, brandId: U.brand1, categoryId: U.cat1, subCategoryId: U.sub1, name: 'Nike Air Zoom Pegasus 40', slug: 'nike-air-zoom-pegasus-40', skuPrefix: 'NIKE-PEG-40', price: 4399, compareAt: 5499 },
    { id: U.prod2, brandId: U.brand1, categoryId: U.cat2, subCategoryId: U.sub2, name: 'Nike Dri-FIT Training Tee', slug: 'nike-dri-fit-training-tee', skuPrefix: 'NIKE-DF-TEE', price: 1199, compareAt: 1499 },
    { id: U.prod3, brandId: U.brand2, categoryId: U.cat1, subCategoryId: U.sub1, name: 'Adidas Ultraboost Light', slug: 'adidas-ultraboost-light', skuPrefix: 'ADIDAS-UB-LIGHT', price: 6399, compareAt: 7999 },
    { id: U.prod4, brandId: U.brand2, categoryId: U.cat2, subCategoryId: U.sub2, name: 'Adidas Essentials Hoodie', slug: 'adidas-essentials-hoodie', skuPrefix: 'ADIDAS-HOODIE', price: 2499, compareAt: 2999 },
    { id: U.prod5, brandId: U.brand1, categoryId: U.cat1, subCategoryId: U.sub1, name: 'Nike Revolution 6', slug: 'nike-revolution-6', skuPrefix: 'NIKE-REV-6', price: 1999, compareAt: 2499 },
    { id: U.prod6, brandId: U.brand2, categoryId: U.cat2, subCategoryId: U.sub2, name: 'Adidas Training Shorts', slug: 'adidas-training-shorts', skuPrefix: 'ADIDAS-SHORTS', price: 1499, compareAt: 1799 },
  ];
  for (const p of products) {
    await qr.query(
      `INSERT INTO products (id, brand_id, category_id, sub_category_id, name, slug, sku_prefix, description, short_description, status, is_featured, is_active, average_rating, total_ratings, total_reviews, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE', true, true, 0, 0, 0, $10, $10)
       ON CONFLICT (slug) DO NOTHING`,
      [p.id, p.brandId, p.categoryId, p.subCategoryId, p.name, p.slug, p.skuPrefix, `Description for ${p.name}`, p.skuPrefix, now],
    );
  }
  console.log('  Products: 6');

  // ─── Product Images ────────────────────────────────────────────────────
  for (const p of products) {
    await qr.query(
      `INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 0, true, $5, $5)`,
      [uuid(), p.id, `/images/products/${p.skuPrefix.toLowerCase()}-1.jpg`, p.name, now],
    );
    await qr.query(
      `INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 1, false, $5, $5)`,
      [uuid(), p.id, `/images/products/${p.skuPrefix.toLowerCase()}-2.jpg`, `${p.name} - Side`, now],
    );
  }
  console.log('  Images: 12');

  // ─── Variants ──────────────────────────────────────────────────────────
  let vIdx = 0;
  const productVariants: Record<string, string[]> = {};
  for (const p of products) {
    const ids: string[] = [];
    for (const size of ['S', 'M']) {
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
  console.log('  Variants: 12');

  // ─── Payment Methods (upsert) ─────────────────────────────────────────
  let pmRows = await qr.query(`SELECT id, code FROM payment_methods LIMIT 3`);
  if (pmRows.length === 0) {
    await qr.query(
      `INSERT INTO payment_methods (id, name, code, description, is_active, sort_order, created_at, updated_at)
       VALUES ($1, 'Credit Card', 'card', 'Visa/Mastercard', true, 1, $2, $2)`,
      [uuid(), now],
    );
    await qr.query(
      `INSERT INTO payment_methods (id, name, code, description, is_active, sort_order, created_at, updated_at)
       VALUES ($1, 'Cash on Delivery', 'cod', 'Pay on delivery', true, 2, $2, $2)`,
      [uuid(), now],
    );
    pmRows = await qr.query(`SELECT id, code FROM payment_methods LIMIT 3`);
  }
  const paymentMethodIds = pmRows.map((r: { id: string }) => r.id);

  // ─── Warehouse (upsert) ───────────────────────────────────────────────
  let whRows = await qr.query(`SELECT id FROM warehouses LIMIT 1`);
  if (whRows.length === 0) {
    await qr.query(
      `INSERT INTO warehouses (id, name, code, address, city, state, country, postal_code, latitude, longitude, is_active, created_at, updated_at)
       VALUES ($1, 'Dubai Main Warehouse', 'DXB-MAIN', 'Al Quoz', 'Dubai', 'Dubai', 'UAE', '00000', 25.135, 55.3044, true, $2, $2)`,
      [U.wh, now],
    );
    whRows = [{ id: U.wh }];
  }
  const warehouseId = whRows[0].id;

  // ─── Get users by email ───────────────────────────────────────────────
  const userRows = await qr.query(
    `SELECT id, email, created_at FROM users WHERE email IN ($1, $2, $3)`,
    ['ahmed@example.com', 'sara@example.com', 'omar@example.com'],
  );
  const userMap = new Map<string, { id: string; createdAt: Date }>();
  for (const u of userRows) {
    u.createdAt = new Date(u.created_at);
    userMap.set(u.email, u);
  }
  console.log('  Users found:', userMap.size);

  // ─── Addresses (created at user's date) ───────────────────────────────
  const addrRows: Array<{ id: string; userId: string }> = [];
  const addrData = [
    { email: 'ahmed@example.com', fullName: 'Ahmed Ali', phone: '+971501111111', addr1: 'Villa 12, Al Wasl Road', city: 'Dubai' },
    { email: 'sara@example.com', fullName: 'Sara Mohammed', phone: '+971502222222', addr1: 'Apartment 304, Al Reem Island', city: 'Abu Dhabi' },
    { email: 'omar@example.com', fullName: 'Omar Hassan', phone: '+971503333333', addr1: 'Flat 8, Marina Walk', city: 'Dubai' },
  ];
  for (const a of addrData) {
    const u = userMap.get(a.email);
    if (!u) continue;
    const addrId = uuid();
    const addrCreatedAt = addDays(u.createdAt, 1);
    await qr.query(
      `INSERT INTO addresses (id, user_id, full_name, phone, address_line_1, city, state, country, postal_code, latitude, longitude, is_default, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'Dubai', 'UAE', '00000', 25.2048, 55.2708, true, $7, $7)`,
      [addrId, u.id, a.fullName, a.phone, a.addr1, a.city, addrCreatedAt],
    );
    addrRows.push({ id: addrId, userId: u.id });
  }
  console.log('  Addresses:', addrRows.length);

  // ─── Orders at different dates ────────────────────────────────────────

  interface OrderSpec {
    userEmail: string;
    addrIdx: number;
    orderStatus: string;
    paymentStatus: string;
    /** Days offset relative to the user's created_at */
    daysAfterSignup: number;
    items: Array<{ productId: string; variantIdx: number; qty: number }>;
    createShipment: boolean;
    deliveredAfterDays: number | null;
    createReturn?: boolean;
    returnReason?: string;
  }

  const orderSpecs: OrderSpec[] = [
    // Ahmed: signed up ~95 days ago → ordered 90 days ago → delivered
    { userEmail: 'ahmed@example.com', addrIdx: 0, orderStatus: 'DELIVERED', paymentStatus: 'PAID',
      daysAfterSignup: 5,
      items: [{ productId: U.prod1, variantIdx: 1, qty: 1 }, { productId: U.prod5, variantIdx: 0, qty: 2 }],
      createShipment: true, deliveredAfterDays: 5 },
    // Ahmed: second order 80 days ago → delivered
    { userEmail: 'ahmed@example.com', addrIdx: 0, orderStatus: 'DELIVERED', paymentStatus: 'PAID',
      daysAfterSignup: 15,
      items: [{ productId: U.prod3, variantIdx: 0, qty: 1 }],
      createShipment: true, deliveredAfterDays: 4 },
    // Sara: signed up ~60 days ago → ordered 50 days ago → out for delivery
    { userEmail: 'sara@example.com', addrIdx: 1, orderStatus: 'OUT_FOR_DELIVERY', paymentStatus: 'PAID',
      daysAfterSignup: 10,
      items: [{ productId: U.prod2, variantIdx: 0, qty: 3 }, { productId: U.prod4, variantIdx: 1, qty: 1 }],
      createShipment: true, deliveredAfterDays: null },
    // Sara: second order 40 days ago → cancelled
    { userEmail: 'sara@example.com', addrIdx: 1, orderStatus: 'CANCELLED', paymentStatus: 'REFUNDED',
      daysAfterSignup: 20,
      items: [{ productId: U.prod6, variantIdx: 0, qty: 1 }],
      createShipment: false, deliveredAfterDays: null },
    // Omar: signed up ~30 days ago → ordered 25 days ago → delivered
    { userEmail: 'omar@example.com', addrIdx: 2, orderStatus: 'DELIVERED', paymentStatus: 'PAID',
      daysAfterSignup: 5,
      items: [{ productId: U.prod4, variantIdx: 0, qty: 2 }, { productId: U.prod6, variantIdx: 1, qty: 1 }],
      createShipment: true, deliveredAfterDays: 4 },
    // Omar: second order 2 days ago → pending (recent)
    { userEmail: 'omar@example.com', addrIdx: 2, orderStatus: 'PENDING', paymentStatus: 'PENDING',
      daysAfterSignup: 28,
      items: [{ productId: U.prod1, variantIdx: 0, qty: 1 }],
      createShipment: false, deliveredAfterDays: null },
  ];

  let orderCount = 0, itemCount = 0, paymentCount = 0, shipmentCount = 0, returnCount = 0;

  for (const spec of orderSpecs) {
    const u = userMap.get(spec.userEmail);
    if (!u) continue;
    const addrId = addrRows[spec.addrIdx]?.id;
    if (!addrId) continue;

    // Order date is relative to user's signup date
    const createdAt = addDays(u.createdAt, spec.daysAfterSignup);
    const orderId = uuid();

    // Build item details
    const itemDetails: Array<{
      productId: string; variantId: string; productName: string;
      sku: string; quantity: number; unitPrice: number; totalPrice: number;
    }> = [];
    for (const it of spec.items) {
      const product = products.find((p) => p.id === it.productId)!;
      const vIds = productVariants[it.productId];
      const vId = vIds[it.variantIdx];
      itemDetails.push({
        productId: it.productId, variantId: vId, productName: product.name,
        sku: `${product.skuPrefix}-${['S', 'M'][it.variantIdx]}`,
        quantity: it.qty, unitPrice: product.price,
        totalPrice: it.qty * product.price,
      });
    }

    const subtotal = itemDetails.reduce((s, i) => s + i.totalPrice, 0);
    const paidAmount = (spec.paymentStatus === 'PAID' || spec.paymentStatus === 'REFUNDED') ? subtotal : 0;

    // Insert order
    await qr.query(
      `INSERT INTO orders (id, order_number, user_id, status, subtotal, discount_amount, shipping_amount, delivery_charge, cod_charge, handling_charge, tax_amount, total_amount, paid_amount, due_amount, payment_status, shipping_address_id, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 0, 0, 0, 0, 0, 0, $6, $7, 0, $8, $9, $10, $11, $11)`,
      [orderId, `ORD-${String(orderCount + 1).padStart(4, '0')}`, u.id, spec.orderStatus, subtotal,
       subtotal, paidAmount,
       spec.paymentStatus === 'PAID' ? 'PAID' : (spec.paymentStatus === 'REFUNDED' ? 'REFUNDED' : 'PENDING'),
       addrId, null, createdAt],
    );
    orderCount++;

    for (const item of itemDetails) {
      await qr.query(
        `INSERT INTO order_items (id, order_id, product_id, variant_id, product_name, sku, quantity, unit_price, total_price, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)`,
        [uuid(), orderId, item.productId, item.variantId, item.productName, item.sku, item.quantity, item.unitPrice, item.totalPrice, createdAt],
      );
      itemCount++;
    }

    // Payment
    if (paymentMethodIds.length > 0) {
      const pmId = paymentMethodIds[orderCount % paymentMethodIds.length];
      if (spec.paymentStatus === 'PAID' || spec.paymentStatus === 'REFUNDED') {
        const paidAt = addDays(createdAt, 1);
        await qr.query(
          `INSERT INTO payments (id, order_id, payment_method_id, amount, transaction_number, status, paid_at, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
          [uuid(), orderId, pmId, subtotal, `TXN-${orderId.slice(0, 8).toUpperCase()}`, spec.paymentStatus === 'REFUNDED' ? 'REFUNDED' : 'PAID', paidAt, createdAt],
        );
        paymentCount++;
      } else {
        await qr.query(
          `INSERT INTO payments (id, order_id, payment_method_id, amount, transaction_number, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, 'PENDING', $6, $6)`,
          [uuid(), orderId, pmId, subtotal, `TXN-${orderId.slice(0, 8).toUpperCase()}`, createdAt],
        );
        paymentCount++;
      }
    }

    // Shipment
    if (spec.createShipment) {
      const shipmentId = uuid();
      const shippedAt = addDays(createdAt, 2);
      const deliveredAt = spec.deliveredAfterDays ? addDays(createdAt, spec.deliveredAfterDays) : null;
      let sStatus: string;
      if (spec.orderStatus === 'DELIVERED') sStatus = 'DELIVERED';
      else if (spec.orderStatus === 'OUT_FOR_DELIVERY' || spec.orderStatus === 'SHIPPED') sStatus = 'OUT_FOR_DELIVERY';
      else sStatus = 'PENDING';

      await qr.query(
        `INSERT INTO shipments (id, order_id, warehouse_id, status, tracking_number, dispatched_at, delivered_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
        [shipmentId, orderId, warehouseId, sStatus, `TRK-${orderId.slice(0, 8).toUpperCase()}-${String(shipmentCount + 1).padStart(3, '0')}`, shippedAt, deliveredAt, createdAt],
      );
      shipmentCount++;

      // Tracking logs
      if (deliveredAt) {
        for (let t = 0; t < 3; t++) {
          await qr.query(
            `INSERT INTO shipment_tracking_logs (id, shipment_id, status, note, changed_by, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NULL, $5, $5)`,
            [uuid(), shipmentId, ['PACKED', 'READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY'][t],
             `Shipment ${['packed', 'ready for dispatch', 'out for delivery'][t]}`, addDays(createdAt, t + 1)],
          );
        }
        await qr.query(
          `INSERT INTO shipment_tracking_logs (id, shipment_id, status, note, changed_by, created_at, updated_at)
           VALUES ($1, $2, 'DELIVERED', 'Package delivered successfully', NULL, $3, $3)`,
          [uuid(), shipmentId, deliveredAt],
        );
      } else if (spec.orderStatus === 'SHIPPED' || spec.orderStatus === 'OUT_FOR_DELIVERY') {
        for (let t = 0; t < 3; t++) {
          await qr.query(
            `INSERT INTO shipment_tracking_logs (id, shipment_id, status, note, changed_by, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NULL, $5, $5)`,
            [uuid(), shipmentId, ['PACKED', 'READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY'][t],
             `Shipment ${['packed', 'ready for dispatch', 'out for delivery'][t]}`, addDays(createdAt, t + 1)],
          );
        }
      } else {
        await qr.query(
          `INSERT INTO shipment_tracking_logs (id, shipment_id, status, note, changed_by, created_at, updated_at)
           VALUES ($1, $2, 'PENDING', 'Shipment pending', NULL, $3, $3)`,
          [uuid(), shipmentId, createdAt],
        );
      }
    }

    // ─── Return data ──────────────────────────────────────────────────────
    if (spec.createReturn) {
      const reasons = [
        { code: 'WRONG_SIZE', title: 'Wrong Size' },
        { code: 'DAMAGED', title: 'Damaged' },
        { code: 'DEFECTIVE', title: 'Defective' },
        { code: 'WRONG_ITEM', title: 'Wrong Item' },
        { code: 'QUALITY_ISSUE', title: 'Quality Issue' },
        { code: 'OTHER', title: 'Other' },
      ];
      for (const r of reasons) {
        await qr.query(
          `INSERT INTO return_reason_master (id, code, title, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, true, $4, $4) ON CONFLICT (code) DO NOTHING`,
          [uuid(), r.code, r.title, now],
        );
      }

      const orderItemRows = await qr.query(
        `SELECT id, product_id, quantity FROM order_items WHERE order_id = $1`, [orderId],
      );

      if (orderItemRows.length > 0) {
        const returnRequestId = uuid();
        const deliveredAtDate = spec.deliveredAfterDays ? addDays(createdAt, spec.deliveredAfterDays) : createdAt;
        const returnDate = addDays(deliveredAtDate, 2);
        const refundAmount = itemDetails.reduce((s, i) => s + i.totalPrice, 0);

        await qr.query(
          `INSERT INTO return_requests (id, return_number, order_id, user_id, status, reason, notes, total_refund_amount, requested_at, approved_at, completed_at, created_at, updated_at)
           VALUES ($1, $2, $3, $4, 'COMPLETED', $5, $6, $7, $8, $9, $10, $11, $11)`,
          [returnRequestId, `RET-${String(returnCount + 1).padStart(4, '0')}`, orderId, u.id,
           spec.returnReason ?? 'OTHER',
           `Return requested: ${(spec.returnReason ?? 'OTHER').toLowerCase().replace(/_/g, ' ')}`,
           refundAmount, returnDate, addDays(returnDate, 1), addDays(returnDate, 2), now],
        );

        for (const oiRow of orderItemRows) {
          await qr.query(
            `INSERT INTO return_items (id, return_request_id, order_item_id, quantity, reason, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $6)`,
            [uuid(), returnRequestId, oiRow.id, oiRow.quantity, spec.returnReason ?? 'OTHER', now],
          );
        }
        returnCount++;
      }
    }
  }

  console.log(`\nOrders: ${orderCount}, Items: ${itemCount}`);
  console.log(`Payments: ${paymentCount}, Shipments: ${shipmentCount}, Returns: ${returnCount}`);

  await qr.release();
  await AppDataSource.destroy();
  console.log('\nOrders seed completed!');
}

seed().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
