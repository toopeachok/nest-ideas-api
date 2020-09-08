import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');

    const req = context.switchToHttp().getRequest();

    const now = Date.now();

    if (req) {
      const method = req.method;
      const url = req.url;

      return next
        .handle()
        .pipe(
          tap(() =>
            Logger.log(
              `${method} ${url} ${Date.now() - now}ms`,
              context.getClass().name,
            ),
          ),
        );
    } else {
      const ctx = GqlExecutionContext.create(context);
      const info = ctx.getInfo();

      return next
        .handle()
        .pipe(
          tap(() =>
            Logger.log(
              `${info.parentType} ${info.fieldName} ${Date.now() - now}ms`,
              context.getClass().name,
            ),
          ),
        );
    }
  }
}
