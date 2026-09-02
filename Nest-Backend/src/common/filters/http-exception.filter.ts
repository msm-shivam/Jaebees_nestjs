import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: unknown = undefined;
    let customData: unknown = undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;

        if (Array.isArray(resp['message'])) {
          message = 'Validation failed';
          errors = resp['message'];
        } else {
          message = (resp['message'] as string) ?? exception.message;
          errors = resp['errors'] ?? undefined;
        }

        if (resp['data'] !== undefined) {
          customData = resp['data'];
        }
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof QueryFailedError) {
      statusCode = HttpStatus.CONFLICT;
      const dbError = exception as QueryFailedError & { code?: string; detail?: string; driverError?: any };
      const detailMsg = dbError.detail || dbError.driverError?.detail || exception.message;

      if (dbError.code === '23505') {
        message = detailMsg || 'A record with the provided value already exists.';
      } else {
        message = detailMsg ? `A database constraint was violated: ${detailMsg}` : 'A database constraint was violated.';
      }
    } else if (exception instanceof Error) {
      message = 'Internal server error';
    }

    // ─── Structured logging with safe request context ──────────────────────
    const logContext = this.buildLogContext(request, statusCode, message, exception);

    if (statusCode >= 500) {
      // 5xx — unexpected errors: log at ERROR level with full stack
      this.logger.error(
        logContext.summary,
        exception instanceof Error ? exception.stack : undefined,
        'ExceptionFilter',
      );
    } else if (statusCode >= 400 && statusCode !== 401 && statusCode !== 403) {
      // 4xx (excluding routine auth failures) — log at WARN level
      this.logger.warn(logContext.summary, 'ExceptionFilter');
    }

    // ─── Send the response (format unchanged from original) ────────────────
    response.status(statusCode).json({
      statusCode,
      message,
      data: customData ?? null,
      ...(errors ? { errors } : {}),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Build a safe log context object with request metadata.
   * NEVER includes: authorization headers, cookies, tokens, passwords, 
   * Stripe secrets, payment details, or raw request bodies.
   */
  private buildLogContext(
    request: Request,
    statusCode: number,
    message: string,
    exception: unknown,
  ) {
    const user = (request as any).user as { sub?: string } | undefined;

    const summary = [
      `[${request.method}]`,
      request.originalUrl || request.url,
      `→ ${statusCode}`,
      `| ${message}`,
      user?.sub ? `| userId: ${user.sub}` : '',
      exception instanceof Error && exception.stack
        ? `\n${exception.stack}`
        : '',
    ]
      .filter(Boolean)
      .join(' ');

    return { summary };
  }
}
