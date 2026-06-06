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
      'Sport E-Commerce Platform API — Layer 1 Foundation\n\n' +
      '**Base URL:** `/api/v1`\n\n' +
      'All endpoints are prefixed with `/api/v1`.\n\n' +
      '### Authentication\n' +
      '- **Customer JWT** — obtained from `POST /api/v1/auth/login`\n' +
      '- **Admin JWT** — obtained from `POST /api/v1/admin/auth/login`',
    )
    .setVersion(APP_VERSION)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'Authorization',
    )
    .addTag('Customer Auth', 'Customer registration, login, token management')
    .addTag('Admin Auth', 'Admin login, token management')
    .addTag('Customer Profile', 'Customer profile management')
    .addTag('Admin — User Management', 'Admin user CRUD and role assignment')
    .addTag('Admin — RBAC', 'Roles and permissions management')
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
  console.log(`📄 Swagger docs:            http://localhost:${port}/api/docs\n`);
}

bootstrap();
