import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino'; // ← Pino Logger
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// RxJS (Reactive Extensions for JavaScript) is a library for reactive programming using Observables.
// Like Promises, but More Powerful
// Think of Observable as a "stream" of data over time
// const stream$ = new Observable(observer => {
//   observer.next('Hello');
//   observer.next('World');
//   observer.complete();
// });

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  // private = cannot be accessed outside this class
  // readonly = cannot be reassigned after initialization
  // both are class property modifiers. const cannot be used in class.
  constructor(private readonly logger: Logger) {}

  // intercept: Required method from NestInterceptor interface
  // context: Provides access to the current execution context (request, response, handler)
  // next: Represents the next handler in the pipeline (your controller method)
  // Returns: Observable that will emit the response
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers, user } = request;
    const now = Date.now();
    const correlationId = headers['x-correlation-id'] || crypto.randomUUID();

    this.logger.log(
      {
        type: 'incoming_request',
        method,
        url,
        correlationId,
        userId: user?.id,
        userAgent: headers['user-agent'],
        ip: request.ip,
      },
      'Incoming Request',
    );

    // next.handle(): Executes the next handler (your controller method)
    // Returns: Observable that will emit the controller's response
    // .pipe(): Allows chaining RxJS operators
    // tap(): RxJS operator that performs side effects
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const responseTime = Date.now() - now;

        this.logger.log(
          {
            type: 'outgoing_response',
            method,
            url,
            correlationId,
            userId: user?.id,
            responseTime,
            statusCode: response.statusCode,
          },
          'Outgoing Response',
        );
      }),
      catchError((error) => {
        const responseTime = Date.now() - now;

        // Error logging
        this.logger.error(
          {
            type: 'request_error',
            method,
            url,
            correlationId,
            userId: user?.id,
            responseTime,
            error: error.message,
            stack: error.stack,
          },
          'Request Error',
        );

        throw error;
      }),
    );
  }
}
