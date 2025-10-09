import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseFilePipe implements PipeTransform {
  constructor(
    private readonly options: {
      maxSize?: number;
      allowedMimeTypes?: string[];
    } = {},
  ) {}

  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (this.options.maxSize && file.size > this.options.maxSize) {
      throw new BadRequestException(
        `File size too large. Maximum size is ${this.options.maxSize} bytes`,
      );
    }

    if (
      this.options.allowedMimeTypes &&
      !this.options.allowedMimeTypes.includes(file.mimetype)
    ) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${this.options.allowedMimeTypes.join(', ')}`,
      );
    }

    return file;
  }
}
