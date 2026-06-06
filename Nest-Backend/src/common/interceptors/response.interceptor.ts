import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((data) => ({
        statusCode: response.statusCode,
        message: data?.message ?? 'Success',
        data: data?.data !== undefined ? data.data : data?.message !== undefined ? undefined : data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
