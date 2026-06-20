import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppValidationPipe } from './common/pipes/validation.pipe';
import {
  API_PREFIX,
  API_VERSION,
  APP_NAME,
  APP_VERSION,
  SWAGGER_PATH,
} from './common/constants/app.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') ?? 3000;
  const nodeEnv = configService.get<string>('app.nodeEnv') ?? 'development';

  // ─── Global Prefix & Versioning ──────────────────────────────────────────
  app.setGlobalPrefix(`${API_PREFIX}/${API_VERSION}`);

  app.enableVersioning({ type: VersioningType.URI });

  // ─── Global Pipes ────────────────────────────────────────────────────────
  app.useGlobalPipes(AppValidationPipe);

  // ─── Class Serializer (for @Expose / @Exclude DTOs) ──────────────────────
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
    }),
  );

  // ─── CORS ────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: nodeEnv === 'production' ? [] : '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // ─── Swagger ─────────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle(APP_NAME)
    .setDescription(
      'Sport E-Commerce Platform API — Layer 1 + Catalog Foundation\n\n' +
        '**Base URL:** `/api/v1`\n\n' +
        'All endpoints are prefixed with `/api/v1`.\n\n' +
        '### Authentication\n' +
        '- **Customer JWT** — obtained from `POST /api/v1/auth/login`\n' +
        '- **Admin JWT** — obtained from `POST /api/v1/admin/auth/login`\n\n' +
        '### Catalog Admin Endpoints\n' +
        'All catalog admin routes require **Admin JWT** and the appropriate **permission**.',
    )
    .setVersion(APP_VERSION)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT access token',
        in: 'header',
      },
      'JWT',
    )
    .addTag('Customer Auth', 'Customer registration, login, token management')
    .addTag('Admin Auth', 'Admin login, token management')
    .addTag('Customer Profile', 'Customer profile management')
    .addTag('Admin — User Management', 'Admin user CRUD and role assignment')
    .addTag('Admin — RBAC', 'Roles and permissions management')
    .addTag('Admin — Brands', 'Brand catalog management')
    .addTag('Admin — Categories', 'Top-level category management')
    .addTag('Admin — Sub Categories', 'Sub category management')
    .addTag('Admin — Collections', 'Marketing collection management')
    .addTag('Admin — Attributes', 'Product attribute management')
    .addTag('Admin — Attribute Values', 'Attribute value management')
    .addTag('Admin — Product Tags', 'Marketing tag management')
    .addTag(
      'Admin — Products',
      'Product catalog management with images, collections and tags',
    )
    .addTag(
      'Product Variants',
      'Product variant management with SKU and attributes',
    )
    .addTag(
      'Inventory',
      'Inventory stock management with adjustments and reservations',
    )
    .addTag('Cart', 'Customer shopping cart management')
    .addTag('Customer — Orders', 'Customer order placement and history')
    .addTag('Admin — Orders', 'Admin order management and status updates')
    .addTag(
      'Payments — Stripe',
      'Stripe payment intent creation and webhook handling',
    )
    .addTag('Customer — Payments', 'Customer payment history')
    .addTag('Admin — Payments', 'Admin payment management and refunds')
    .addTag('Admin — Payment Methods', 'Payment method configuration')
    .addTag('Customer — Addresses', 'Customer address book management')
    .addTag('Admin — Warehouses', 'Warehouse location management')
    .addTag('Admin — Delivery Settings', 'Delivery configuration and pricing')
    .addTag('Customer — Shipments', 'Customer shipment tracking')
    .addTag('Admin — Shipments', 'Admin shipment management and status updates')
    .addTag('Admin Coupons', 'Coupon code management')
    .addTag('Admin Promotions', 'Promotion campaign management')
    .addTag('Customer Coupons', 'Customer coupon application and validation')
    .addTag('Wishlist', 'Customer product wishlist management')
    .addTag('Reviews', 'Customer product reviews and ratings')
    .addTag('Admin — Reviews', 'Admin review moderation (approve/reject)')
    // Layer 21 — Reports, Dashboards & Business Intelligence
    .addTag(
      'Admin — Reports',
      'Business intelligence reports (sales, revenue, products, inventory, returns, support, marketing)',
    )
    .addTag(
      'Admin — Saved Reports',
      'Saved report configurations for quick access',
    )
    .addTag(
      'Admin — Dashboards',
      'Aggregated dashboard metrics with snapshot persistence',
    )
    // Layer 22 — Audit, Security & Compliance
    .addTag('Admin — Audit Logs', 'System-wide audit trail for entity changes')
    .addTag(
      'Admin — Security',
      'Security events, login activities, and active sessions',
    )
    .addTag(
      'Admin — Privacy',
      'Privacy request management (data access, deletion)',
    )
    .addTag(
      'Customer — Privacy',
      'Customer privacy requests and consent management',
    )
    // Layer 23 — Settings & CMS
    .addTag('Admin — Settings', 'System-wide key-value configuration')
    .addTag(
      'Admin — CMS Pages',
      'CMS page management (about, privacy, terms, etc.)',
    )
    .addTag('Admin — Homepage', 'Homepage section management with sort order')
    .addTag('Admin — Contact Settings', 'Contact information configuration')
    .addTag(
      'Public — Content',
      'Publicly accessible CMS pages, homepage sections, and contact info',
    )
    .addTag(
      'Admin — Customers',
      'Customer list, search, filters, and statistics',
    )
    .addTag(
      'Admin — Wishlist',
      'Admin view of any customer wishlist',
    )
    .addTag(
      'Admin — Support',
      'Admin support ticket management, assignment, and resolution',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: `${APP_NAME} — Docs`,
  });

  // ─── Start ───────────────────────────────────────────────────────────────
  await app.listen(port);

  console.log(`\n🚀 Application running on: http://localhost:${port}/api/v1`);
  console.log(
    `📄 Swagger docs:            http://localhost:${port}/api/docs\n`,
  );
}

bootstrap();
