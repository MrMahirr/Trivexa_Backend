import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

/**
 * ParseUuidPipe — Gelen parametre değerinin geçerli bir UUID v4 olup
 * olmadığını kontrol eder. Geçerli değilse 400 Bad Request döner.
 *
 * Kullanım: @Param('id', ParseUuidPipe) id: string
 *
 * Not: NestJS'in kendi ParseUUIDPipe'ı da mevcuttur,
 * bu özel pipe daha detaylı Türkçe hata mesajı verir.
 */
@Injectable()
export class ParseUuidPipe implements PipeTransform<string, string> {
  private static readonly UUID_V4_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  transform(value: string): string {
    if (!ParseUuidPipe.UUID_V4_REGEX.test(value)) {
      throw new BadRequestException(
        `"${value}" geçerli bir UUID formatında değil.`,
      );
    }
    return value;
  }
}
