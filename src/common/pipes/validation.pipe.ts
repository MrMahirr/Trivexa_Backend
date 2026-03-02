import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

/**
 * CustomValidationPipe — class-validator ve class-transformer kullanarak
 * gelen DTO'ları doğrular. NestJS'in dahili ValidationPipe'ından farklı olarak
 * hata mesajlarını düzleştirilmiş bir string dizisi olarak döndürür.
 *
 * Bu pipe, @UsePipes() dekoratörü ile controller veya handler seviyesinde
 * kullanılabilir. Global seviyede ise main.ts'deki ValidationPipe aktiftir.
 */
@Injectable()
export class CustomValidationPipe implements PipeTransform {
  async transform(
    value: unknown,
    { metatype }: { metatype?: new (...args: unknown[]) => unknown },
  ) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      const messages = this.flattenErrors(errors);
      throw new BadRequestException({
        message: 'Doğrulama hatası',
        errors: messages,
      });
    }

    return object;
  }

  /**
   * Primitive tipleri doğrulamaya gerek yok
   */
  private toValidate(metatype: new (...args: unknown[]) => unknown): boolean {
    const types: Array<new (...args: unknown[]) => unknown> = [
      String,
      Boolean,
      Number,
      Array,
      Object,
    ];
    return !types.includes(metatype);
  }

  /**
   * İç içe geçmiş validasyon hatalarını düz bir string dizisine çevirir
   */
  private flattenErrors(errors: ValidationError[]): string[] {
    const messages: string[] = [];

    for (const error of errors) {
      if (error.constraints) {
        messages.push(...Object.values(error.constraints));
      }
      if (error.children && error.children.length > 0) {
        messages.push(...this.flattenErrors(error.children));
      }
    }

    return messages;
  }
}
