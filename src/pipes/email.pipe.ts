import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { isEmail } from 'class-validator';

@Injectable()
export class ParseEmailPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (isEmail(value)) {
      return value;
    }

    throw new BadRequestException('Value must be an email');
  }
}
