import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp['message'] as string) ?? exception.message;
        code = (resp['code'] as string) ?? 'HTTP_ERROR';
        details = resp['details'];
      } else {
        message = exceptionResponse as string;
        code = 'HTTP_ERROR';
      }
    } else if (exception instanceof QueryFailedError) {
      statusCode = HttpStatus.CONFLICT;
      code = 'DATABASE_ERROR';
      message = 'A database constraint was violated.';

      const dbError = exception as QueryFailedError & { code?: string };
      if (dbError.code === '23505') {
        message = 'A record with the provided value already exists.';
        code = 'DUPLICATE_ENTRY';
      }

      this.logger.error(`DB Error: ${exception.message}`, exception.stack);
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    }

    response.status(statusCode).json({
      statusCode,
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
