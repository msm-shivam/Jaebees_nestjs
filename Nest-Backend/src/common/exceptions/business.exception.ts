import { HttpException, HttpStatus } from '@nestjs/common';

export interface BusinessExceptionOptions {
  message: string;
  code?: string;
  statusCode?: HttpStatus;
  details?: Record<string, unknown>;
}

export class BusinessException extends HttpException {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(options: BusinessExceptionOptions) {
    const statusCode = options.statusCode ?? HttpStatus.BAD_REQUEST;
    super(
      {
        statusCode,
        code: options.code ?? 'BUSINESS_ERROR',
        message: options.message,
        details: options.details,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
    this.code = options.code ?? 'BUSINESS_ERROR';
    this.details = options.details;
  }
}
