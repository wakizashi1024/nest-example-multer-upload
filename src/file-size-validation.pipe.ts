import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value instanceof Array) {
      value.map((v) => {
        if (v.size > 10 * 1024) {
          throw new HttpException(
            'File size is larger than 10KB',
            HttpStatus.BAD_REQUEST,
          );
        }
      });
    }
    if (!(value instanceof Array) && value.size > 10 * 1024) {
      throw new HttpException(
        'File size is larger than 10KB',
        HttpStatus.BAD_REQUEST,
      );
    }

    return value;
  }
}
