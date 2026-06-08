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
