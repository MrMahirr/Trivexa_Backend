# Trivexa Backend - API Referansı ve Standartlar (API)

Trivexa RESTful mimarisindeki tüm istemci <-> sunucu (Client to Server) iletişimleri sıkı bir takım kurallar ve standartlar setine oturtulmuştur. Backend ile entegre olacak her yeni modülün veya Frontend istemcisinin (Web, Mobile vs.) aşağıdaki yapı taşlarına (contrats) saygı duyması gerekmektedir.

## 1. Routing ve Versiyonlama (URL Formatı)

Tüm API Endpoints bir "Global Prefix" ile başlar:

- Format: `http(s)://<domain_or_localhost>:<port>/api/v1/[module_name]`
- Bu tanım `main.ts` içerisinde `app.setGlobalPrefix('api/v1')` marifetiyle konfigüre edilmiştir. Major (büyük) değişikliklerde v2, v3 olarak ilerlenebilecektir.

## 2. Swagger OpenAPI Dokümantasyonu

Endpoint parametreleri, şemaları (DTO'lar üzerinden yansıtılmış) ve yanıt örnekleri tek bir dinamik arayüzde toplanmıştır. Backend ayağa kaldırıldıktan sonra interaktif dokümanı incelemek için:

- **Swagger UI:** `http://localhost:3500/api/docs`
- **JSON Format:** `http://localhost:3500/api/docs-json`

Tüm controller sınıfları `@ApiTags`, `@ApiOperation` ve `@ApiResponse` dekoratörleri ile zenginleştirilmiş olup, başarılı ve başarısız tüm yanıtların (Response DTOs) Swagger arayüzünde eksiksiz görünmesi garanti edilmiştir. Arayüzün sağ üst köşesindeki "Authorize" butonuna basarak alınan Access Token ile güvenli (Bearer) uç noktaları da denenebilir.

## 3. Yanıt (Response) Şeması Standardı

Endpoint'lerin kendi başına direkt olarak döneceği veri tipi dahi olsa (Örn: Array, String veya Number) proje genelinde bulunan **`ResponseInterceptor`** tüm Output'u normalize (standartlaştırma) eder.

**A. Başarılı İşlemler (200 OK / 201 Created):**

```json
{
  "success": true,
  "data": {
    "key": "Payload veya dizi buraya yerleşir."
  }
}
```

**B. Hatalı İşlemler (400 Bad Request / 401 Unauthorized / 404 Not Found vs):**
**`GlobalExceptionFilter`**, standart fırlatılan Exception'ları tek tipe indirger:

```json
{
  "success": false,
  "error": {
    "statusCode": 404,
    "path": "/api/v1/users/x-y-z",
    "timestamp": "2026-03-05T12:00:00.000Z",
    "message": "User not found."
  }
}
```

## 4. Validasyon (DTO Pipeline)

Post (Oluşturma) ve Patch/Put (Güncelleme) operasyonlarında gelen payload `class-validator` kütüphanesi ve NestJS `ValidationPipe` vasıtasıyla karşılanır.

- Eğer gönderilen JSON içerisinde eksik, hatalı format (`@IsEmail()` hatası vb.) bulunuyorsa; filtre otomatik olarak `400 Bad Request` yanıtını ve hangi property'lerin (alanların) hatalı olduğunu `message` dizisi olarak (Array) return eder.
- DTO'da (`class` üzerinde) tanımlı OLMAYAN hiçbir key/property dikkate alınmaz (Whitelist açıktır).

## 5. Sıralama ve Filtreleme (Pagination & Sorting) Mimarisi

Modüller arasında (Örn: Kullanıcılar, Faturalar, Destek Talepleri) GET fonksiyonlarında bir standart DTO kullanılır (Örn `PaginationQueryDto`). Ortak parametre formları şunlardır:

- `?page=1` (Sayfa Numarası)
- `?limit=20` (Bir sayfadaki kayıt sayısı)
- `?search="john"` (Genel harcanan String tablo araması)
- `?sortBy=created_at` (Sıralamada alınacak kolon ismi)
- `?sortOrder=DESC` (Artan veya azalan `ASC / DESC`)

Backend yanıtındaysa `data` objesinin içerisinde `items` dizisi ve standart sayfalama metadataları bulunur (`PaginatedDataDto`). Örnek Pagination Yanıtı:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "e6fbb29f-...",
        "name": "Jane Doe",
        "created_at": "2026-03-05T12:00:00.000Z"
      }
    ],
    "meta": {
      "totalItems": 150,
      "itemsPerPage": 20,
      "totalPages": 8,
      "currentPage": 1
    }
  }
}
```

Swagger API dökümantasyonunda listeleme dönecek uç noktalar, örneğin `UsersListResponseDto` şeklinde bu sayfalanmış yapıyı tam dökümante edecek şekilde tanımlanmıştır.
