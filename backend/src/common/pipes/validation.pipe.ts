import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class GlobalValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors = this.formatErrors(validationErrors);
        return new BadRequestException({
          message: 'Validation failed',
          errors,
        });
      },
    });
  }

  private formatErrors(
    validationErrors: ValidationError[],
  ): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    validationErrors.forEach((error) => {
      if (error.constraints) {
        errors[error.property] = Object.values(error.constraints);
      }

      if (error.children && error.children.length > 0) {
        const nestedErrors = this.formatErrors(error.children);
        Object.keys(nestedErrors).forEach((key) => {
          errors[`${error.property}.${key}`] = nestedErrors[key];
        });
      }
    });

    return errors;
  }
}
