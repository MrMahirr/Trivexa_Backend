# Trivexa Backend - Kapsamli Mimari Akis Semasi

> **Proje**: Trivexa Ajans Yonetim Sistemi Backend  
> **Framework**: NestJS  
> **Database**: PostgreSQL (pg - raw SQL, ORM yok)  

---

# BOLUM A: GENEL REQUEST PIPELINE

## 1. Ana Akis Semasi

```mermaid
flowchart TD
    HTTP["HTTP Request"] --> MW_START

    subgraph MIDDLEWARE["Middleware Layer"]
        MW_START["Request Basladi"] --> MW_REQID["RequestIdMiddleware"]
        MW_REQID --> MW_IP["RequestIpMiddleware"]
        MW_IP --> MW_LOG["LoggerMiddleware"]
    end

    MIDDLEWARE --> RATE_LIMIT

    RATE_LIMIT{"RateLimitGuard"}
    RATE_LIMIT -->|Hayir| AUTH_GUARD
    RATE_LIMIT -->|Evet| ERR_429["429 Too Many Requests"]

    subgraph AUTH["Authentication Guard"]
        AUTH_GUARD{"Route Public mi?"}
        AUTH_GUARD -->|Public| RBAC_SKIP["RBAC Atla"]
        AUTH_GUARD -->|Protected| TOKEN_CHECK

        TOKEN_CHECK{"Token Var mi?"}
        TOKEN_CHECK -->|Yok| ERR_401A["401 AUTH_TOKEN_MISSING"]
        TOKEN_CHECK -->|Var| TOKEN_PARSE

        TOKEN_PARSE{"Token Format?"}
        TOKEN_PARSE -->|Hatali| ERR_401B["401 AUTH_TOKEN_MALFORMED"]
        TOKEN_PARSE -->|Gecerli| TOKEN_VERIFY

        TOKEN_VERIFY{"JWT Verify"}
        TOKEN_VERIFY -->|Invalid| ERR_401C["401 AUTH_TOKEN_INVALID"]
        TOKEN_VERIFY -->|Expired| ERR_401D["401 AUTH_TOKEN_EXPIRED"]
        TOKEN_VERIFY -->|Valid| USER_LOAD

        USER_LOAD["User Yukle"] --> USER_ACTIVE

        USER_ACTIVE{"Kullanici Aktif mi?"}
        USER_ACTIVE -->|Deaktif| ERR_403A["403 USER_DEACTIVATED"]
        USER_ACTIVE -->|Aktif| FORCE_PWD

        FORCE_PWD{"Zorunlu Sifre Degisikligi?"}
        FORCE_PWD -->|Evet| ERR_403B["403 FORCE_PASSWORD_CHANGE"]
        FORCE_PWD -->|Hayir| RBAC_CHECK
    end

    RBAC_SKIP --> VALIDATION
    
    subgraph RBAC["RBAC Authorization"]
        RBAC_CHECK{"Role Yeterli mi?"}
        RBAC_CHECK -->|Hayir| ERR_403C["403 RBAC_ROLE_DENIED"]
        RBAC_CHECK -->|Evet| PERM_CHECK

        PERM_CHECK{"Permission Var mi?"}
        PERM_CHECK -->|Hayir| ERR_403D["403 RBAC_PERMISSION_DENIED"]
        PERM_CHECK -->|Evet| DEPT_CHECK

        DEPT_CHECK{"Department Erisimi?"}
        DEPT_CHECK -->|Hayir| ERR_403E["403 RBAC_DEPARTMENT_DENIED"]
        DEPT_CHECK -->|Evet| VALIDATION
    end

    subgraph VAL["Validation Layer"]
        VALIDATION["ValidationPipe"] --> VAL_CHECK{"DTO Valid mi?"}
        VAL_CHECK -->|Hayir| ERR_400["400 VALIDATION_FAILED"]
        VAL_CHECK -->|Evet| CONTROLLER
    end

    subgraph CTRL["Controller Layer"]
        CONTROLLER["Controller Method"] --> ETAG_CHECK
        ETAG_CHECK{"Cache Hit?"}
        ETAG_CHECK -->|Match| RES_304["304 Not Modified"]
        ETAG_CHECK -->|No Match| USECASE
    end

    subgraph APP["Application Layer"]
        USECASE["UseCase Execute"]
        USECASE --> TX_NEEDED{"Transaction Gerekli mi?"}
        TX_NEEDED -->|Hayir| DOMAIN_RULES
        TX_NEEDED -->|Evet| TX_BEGIN
        TX_BEGIN["BEGIN TRANSACTION"] --> DOMAIN_RULES
        DOMAIN_RULES{"Domain Rules?"}
        DOMAIN_RULES -->|Hayir| ERR_422["422 DOMAIN_RULE_VIOLATION"]
        DOMAIN_RULES -->|Evet| REPOSITORY
    end

    subgraph INFRA["Infrastructure Layer"]
        REPOSITORY["Repository Raw SQL"]
        REPOSITORY --> DB_QUERY["pool.query"]
        DB_QUERY --> DB_CHECK{"DB Baglantisi OK?"}
        DB_CHECK -->|Error| ERR_503["503 DATABASE_UNAVAILABLE"]
        DB_CHECK -->|OK| SQL_EXEC
        SQL_EXEC["SQL Execute"] --> PG_ERROR{"PostgreSQL Error?"}
        PG_ERROR -->|23505| ERR_409A["409 DUPLICATE_ENTRY"]
        PG_ERROR -->|23503| ERR_409B["409 FK_CONSTRAINT"]
        PG_ERROR -->|23502| ERR_400B["400 REQUIRED_FIELD"]
        PG_ERROR -->|40001| ERR_409C["409 CONCURRENT_MOD"]
        PG_ERROR -->|Other| ERR_500["500 DATABASE_ERROR"]
        PG_ERROR -->|Success| ENTITY_CHECK
    end

    ENTITY_CHECK{"Kayit Bulundu mu?"}
    ENTITY_CHECK -->|Hayir| ERR_404["404 RESOURCE_NOT_FOUND"]
    ENTITY_CHECK -->|Evet| AUDIT_NEEDED

    subgraph AUDIT["Audit Layer"]
        AUDIT_NEEDED{"Audit Log Gerekli mi?"}
        AUDIT_NEEDED -->|Hayir| TX_DECISION
        AUDIT_NEEDED -->|Evet| AUDIT_WRITE
        AUDIT_WRITE["INSERT audit_logs"] --> AUDIT_CHECK
        AUDIT_CHECK{"Audit Yazildi mi?"}
        AUDIT_CHECK -->|Kritik Fail| ERR_500B["500 AUDIT_FAILED"]
        AUDIT_CHECK -->|Non-kritik| AUDIT_QUEUE["Async Queue"]
        AUDIT_CHECK -->|Basarili| TX_DECISION
        AUDIT_QUEUE --> TX_DECISION
    end

    TX_DECISION{"Transaction Acik mi?"}
    TX_DECISION -->|Evet| TX_COMMIT["COMMIT"]
    TX_DECISION -->|Hayir| RESPONSE_BUILD
    TX_COMMIT --> RESPONSE_BUILD

    subgraph RESPONSE["Response Layer"]
        RESPONSE_BUILD["ResponseInterceptor"]
        RESPONSE_BUILD --> METHOD_CHECK
        METHOD_CHECK{"HTTP Method?"}
        METHOD_CHECK -->|POST| RES_201["201 Created"]
        METHOD_CHECK -->|DELETE| RES_204["204 No Content"]
        METHOD_CHECK -->|GET PUT PATCH| RES_200["200 OK"]
    end

    ERR_422 --> TX_ROLLBACK
    ERR_409A --> TX_ROLLBACK
    ERR_409B --> TX_ROLLBACK
    ERR_409C --> TX_ROLLBACK
    ERR_500 --> TX_ROLLBACK
    ERR_500B --> TX_ROLLBACK
    TX_ROLLBACK["ROLLBACK"] --> EXCEPTION_FILTER

    subgraph EXCEPTION["Exception Filter"]
        EXCEPTION_FILTER["HttpExceptionFilter"]
        EXCEPTION_FILTER --> LOG_ERROR["Server Log"]
        LOG_ERROR --> MASK_ERROR["Client Response"]
    end

    ERR_429 --> EXCEPTION_FILTER
    ERR_401A --> EXCEPTION_FILTER
    ERR_401B --> EXCEPTION_FILTER
    ERR_401C --> EXCEPTION_FILTER
    ERR_401D --> EXCEPTION_FILTER
    ERR_400 --> EXCEPTION_FILTER
    ERR_400B --> EXCEPTION_FILTER
    ERR_403A --> EXCEPTION_FILTER
    ERR_403B --> EXCEPTION_FILTER
    ERR_403C --> EXCEPTION_FILTER
    ERR_403D --> EXCEPTION_FILTER
    ERR_403E --> EXCEPTION_FILTER
    ERR_404 --> EXCEPTION_FILTER
    ERR_503 --> EXCEPTION_FILTER
```

---

# BOLUM B: ALT AKISLAR

## 2. Auth Login ve Refresh Token Akisi

```mermaid
sequenceDiagram
    autonumber
    participant C as Client
    participant Ctrl as AuthController
    participant Val as ValidationPipe
    participant UC as LoginUseCase
    participant Repo as UserRepository
    participant Crypto as EncryptionService
    participant Token as TokenService
    participant Audit as AuditService
    participant DB as PostgreSQL

    rect rgb(240, 248, 255)
        Note over C,DB: LOGIN FLOW
        C->>Ctrl: POST /auth/login
        Ctrl->>Val: LoginDto email password
        
        alt Validation Failed
            Val-->>C: 400 VALIDATION_FAILED
        end
        
        Val->>UC: execute dto
        UC->>Repo: findByEmail email
        Repo->>DB: SELECT FROM users WHERE email
        
        alt User Not Found
            DB-->>Repo: null
            UC-->>C: 401 AUTH_INVALID_CREDENTIALS
        end
        
        DB-->>Repo: UserRow
        Repo-->>UC: UserEntity
        
        alt User Deactivated
            UC-->>C: 403 USER_DEACTIVATED
        end
        
        UC->>Crypto: verify password hash
        
        alt Password Mismatch
            Crypto-->>UC: false
            UC->>Audit: log LOGIN_FAILED userId
            UC-->>C: 401 AUTH_INVALID_CREDENTIALS
        end
        
        Crypto-->>UC: true
        
        alt Force Password Change
            UC-->>C: 403 FORCE_PASSWORD_CHANGE
        end
        
        UC->>Token: generatePair userId permissions
        Token-->>UC: accessToken refreshToken
        
        UC->>Repo: saveRefreshToken userId refreshToken expiresAt
        Repo->>DB: INSERT INTO refresh_tokens
        
        UC->>Audit: log LOGIN_SUCCESS userId ip
        
        UC-->>C: 200 accessToken refreshToken user
    end

    rect rgb(255, 248, 240)
        Note over C,DB: REFRESH TOKEN FLOW
        C->>Ctrl: POST /auth/refresh
        Ctrl->>Val: RefreshDto refreshToken
        
        Val->>UC: refresh token
        UC->>Token: verify refreshToken
        
        alt Token Invalid or Expired
            Token-->>UC: error
            UC-->>C: 401 AUTH_REFRESH_TOKEN_INVALID
        end
        
        Token-->>UC: payload
        UC->>Repo: findRefreshToken token
        Repo->>DB: SELECT FROM refresh_tokens WHERE token AND revoked false
        
        alt Token Revoked or Not Found
            DB-->>Repo: null
            UC-->>C: 401 AUTH_REFRESH_TOKEN_REVOKED
        end
        
        DB-->>Repo: TokenRow
        
        Note over UC: TOKEN ROTATION
        UC->>Repo: revokeToken oldToken
        Repo->>DB: UPDATE refresh_tokens SET revoked true
        
        UC->>Token: generatePair userId permissions
        Token-->>UC: newAccessToken newRefreshToken
        
        UC->>Repo: saveRefreshToken userId newRefreshToken
        Repo->>DB: INSERT INTO refresh_tokens
        
        UC-->>C: 200 accessToken refreshToken
    end
```

---

## 3. Accounting Transaction Akisi - Invoice Odeme

```mermaid
flowchart TD
    START["POST /payments invoiceId amount method"] --> VALIDATE

    VALIDATE{"DTO Valid?"}
    VALIDATE -->|Hayir| ERR_400["400 VALIDATION_FAILED"]
    VALIDATE -->|Evet| AUTH_CHECK

    AUTH_CHECK{"Token ve PAYMENT_CREATE Permission?"}
    AUTH_CHECK -->|Hayir| ERR_403["403 RBAC_PERMISSION_DENIED"]
    AUTH_CHECK -->|Evet| TX_START

    subgraph TX["TRANSACTION BLOCK"]
        TX_START["BEGIN"] --> FIND_INVOICE
        
        FIND_INVOICE["SELECT FROM invoices WHERE id FOR UPDATE"]
        FIND_INVOICE --> INV_EXISTS{"Invoice Var mi?"}
        
        INV_EXISTS -->|Hayir| ROLLBACK_404["ROLLBACK 404 INVOICE_NOT_FOUND"]
        INV_EXISTS -->|Evet| INV_STATUS
        
        INV_STATUS{"Invoice Status?"}
        INV_STATUS -->|PAID| ROLLBACK_409A["ROLLBACK 409 INVOICE_ALREADY_PAID"]
        INV_STATUS -->|CANCELLED| ROLLBACK_422A["ROLLBACK 422 INVOICE_CANCELLED"]
        INV_STATUS -->|DRAFT veya SENT| CHECK_AMOUNT
        
        CHECK_AMOUNT{"amount <= remaining?"}
        CHECK_AMOUNT -->|Fazla| ROLLBACK_422B["ROLLBACK 422 PAYMENT_EXCEEDS_REMAINING"]
        CHECK_AMOUNT -->|OK| INSERT_PAYMENT
        
        INSERT_PAYMENT["INSERT payments"]
        INSERT_PAYMENT --> LEDGER_DEBIT
        
        LEDGER_DEBIT["INSERT ledger_entries Kasa BORC"]
        LEDGER_DEBIT --> LEDGER_CREDIT
        
        LEDGER_CREDIT["INSERT ledger_entries Musteri ALACAK"]
        LEDGER_CREDIT --> BALANCE_CHECK
        
        BALANCE_CHECK{"Ledger Dengeli mi?"}
        BALANCE_CHECK -->|Hayir| ROLLBACK_500["ROLLBACK 500 LEDGER_IMBALANCE"]
        BALANCE_CHECK -->|Evet| UPDATE_INVOICE
        
        UPDATE_INVOICE["UPDATE invoices SET paid_amount"]
        UPDATE_INVOICE --> FULL_PAID
        
        FULL_PAID{"Tam Odendi mi?"}
        FULL_PAID -->|Evet| MARK_PAID["UPDATE invoices SET status PAID"]
        FULL_PAID -->|Hayir| AUDIT_LOG
        MARK_PAID --> AUDIT_LOG
        
        AUDIT_LOG["INSERT audit_logs PAYMENT_RECEIVED"]
        AUDIT_LOG --> AUDIT_SUCCESS{"Audit Basarili?"}
        
        AUDIT_SUCCESS -->|Hayir| ROLLBACK_500B["ROLLBACK 500 AUDIT_WRITE_FAILED"]
        AUDIT_SUCCESS -->|Evet| TX_COMMIT["COMMIT"]
    end

    TX_COMMIT --> SUCCESS["201 PAYMENT_CREATED"]

    ROLLBACK_404 --> EXCEPTION
    ROLLBACK_409A --> EXCEPTION
    ROLLBACK_422A --> EXCEPTION
    ROLLBACK_422B --> EXCEPTION
    ROLLBACK_500 --> EXCEPTION
    ROLLBACK_500B --> EXCEPTION

    EXCEPTION["ExceptionFilter"]
```

---

## 4. Audit Log Yazim Akisi

```mermaid
flowchart TD
    TRIGGER["Islem Tamamlandi Create Update Delete"] --> CRITICAL_CHECK

    CRITICAL_CHECK{"Islem Kritik mi?"}
    CRITICAL_CHECK -->|Kritik| SYNC_WRITE
    CRITICAL_CHECK -->|Non-kritik| ASYNC_QUEUE

    subgraph SYNC["Synchronous TX icinde"]
        SYNC_WRITE["INSERT audit_logs"]
        SYNC_WRITE --> SYNC_RESULT{"Yazildi mi?"}
        SYNC_RESULT -->|Hayir| TX_FAIL["Transaction ROLLBACK 500 AUDIT_WRITE_FAILED"]
        SYNC_RESULT -->|Evet| TX_CONTINUE["Transaction Devam"]
    end

    subgraph ASYNC["Asynchronous Fire and Forget"]
        ASYNC_QUEUE["Event Queue"]
        ASYNC_QUEUE --> WORKER["Background Worker"]
        WORKER --> ASYNC_WRITE["INSERT audit_logs"]
        ASYNC_WRITE --> ASYNC_RESULT{"Yazildi mi?"}
        ASYNC_RESULT -->|Hayir| RETRY["Retry 3x Dead Letter Queue"]
        ASYNC_RESULT -->|Evet| DONE["Log Tamamlandi"]
        RETRY --> ALERT["Ops Alert Gonder"]
    end

    TX_CONTINUE --> SUCCESS["Islem Basarili"]
    TX_FAIL --> ERROR["Islem Failed"]
```

---

# BOLUM C: RESPONSE ENVELOPE STANDARDI

## 5. JSON Response Envelope Semasi

```typescript
interface ApiResponse<T> {
  requestId: string;
  timestamp: string;
  path: string;
  method: string;
  statusCode: number;
  success: boolean;
  message: string;
  code?: string;
  data?: T;
  details?: any;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    cacheHit?: boolean;
    etag?: string;
  };
}
```

---

## 6. Ornek JSON Responselar

### 200 OK - Basarili Liste

```json
{
  "requestId": "req_abc123",
  "timestamp": "2026-01-25T19:15:00.000Z",
  "path": "/api/v1/users",
  "method": "GET",
  "statusCode": 200,
  "success": true,
  "message": "Kullanicilar basariyla listelendi",
  "data": [
    {"id": "uuid-1", "email": "admin@trivexa.com", "name": "Admin"},
    {"id": "uuid-2", "email": "user@trivexa.com", "name": "User"}
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

### 201 Created - Kayit Olusturuldu

```json
{
  "requestId": "req_def456",
  "timestamp": "2026-01-25T19:16:00.000Z",
  "path": "/api/v1/invoices",
  "method": "POST",
  "statusCode": 201,
  "success": true,
  "message": "Fatura basariyla olusturuldu",
  "data": {
    "id": "inv_uuid-123",
    "invoiceNumber": "TRV-2026-0001",
    "total": 5000.00,
    "status": "DRAFT"
  }
}
```

### 400 Bad Request - Validation Hatasi

```json
{
  "requestId": "req_ghi789",
  "timestamp": "2026-01-25T19:17:00.000Z",
  "path": "/api/v1/users",
  "method": "POST",
  "statusCode": 400,
  "success": false,
  "message": "Gonderilen veriler gecersiz",
  "code": "VALIDATION_FAILED",
  "details": [
    {"field": "email", "message": "Gecerli bir email adresi giriniz"},
    {"field": "password", "message": "Sifre en az 8 karakter olmalidir"},
    {"field": "phone", "message": "Telefon numarasi formati hatali"}
  ]
}
```

### 401 Unauthorized - Token Hatasi

```json
{
  "requestId": "req_jkl012",
  "timestamp": "2026-01-25T19:18:00.000Z",
  "path": "/api/v1/projects",
  "method": "GET",
  "statusCode": 401,
  "success": false,
  "message": "Oturum sureniz dolmus lutfen tekrar giris yapin",
  "code": "AUTH_TOKEN_EXPIRED"
}
```

### 403 Forbidden - Yetki Hatasi

```json
{
  "requestId": "req_mno345",
  "timestamp": "2026-01-25T19:19:00.000Z",
  "path": "/api/v1/accounting/ledger",
  "method": "POST",
  "statusCode": 403,
  "success": false,
  "message": "Bu islem icin yetkiniz bulunmamaktadir",
  "code": "RBAC_PERMISSION_DENIED",
  "details": {
    "required": "ACCOUNTING_LEDGER_WRITE",
    "userPermissions": ["PROJECT_VIEW", "TICKET_CREATE"]
  }
}
```

### 404 Not Found - Kayit Bulunamadi

```json
{
  "requestId": "req_pqr678",
  "timestamp": "2026-01-25T19:20:00.000Z",
  "path": "/api/v1/clients/uuid-999",
  "method": "GET",
  "statusCode": 404,
  "success": false,
  "message": "Istenen musteri kaydi bulunamadi",
  "code": "RESOURCE_NOT_FOUND",
  "details": {
    "resource": "Client",
    "id": "uuid-999"
  }
}
```

### 409 Conflict - Cakisma

```json
{
  "requestId": "req_stu901",
  "timestamp": "2026-01-25T19:21:00.000Z",
  "path": "/api/v1/users",
  "method": "POST",
  "statusCode": 409,
  "success": false,
  "message": "Bu email adresi zaten kayitli",
  "code": "DUPLICATE_ENTRY",
  "details": {
    "field": "email",
    "value": "existing@trivexa.com"
  }
}
```

### 422 Unprocessable - Is Kurali Ihlali

```json
{
  "requestId": "req_vwx234",
  "timestamp": "2026-01-25T19:22:00.000Z",
  "path": "/api/v1/payments",
  "method": "POST",
  "statusCode": 422,
  "success": false,
  "message": "Odeme tutari kalan borctan fazla olamaz",
  "code": "DOMAIN_RULE_VIOLATION",
  "details": {
    "rule": "PAYMENT_EXCEEDS_REMAINING",
    "invoiceId": "inv_uuid-123",
    "remainingAmount": 1500.00,
    "attemptedAmount": 2000.00
  }
}
```

### 429 Too Many Requests - Rate Limit

```json
{
  "requestId": "req_yza567",
  "timestamp": "2026-01-25T19:23:00.000Z",
  "path": "/api/v1/auth/login",
  "method": "POST",
  "statusCode": 429,
  "success": false,
  "message": "Cok fazla istek gonderdiniz lutfen bekleyin",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "retryAfter": 60,
    "limit": "10 requests per minute"
  }
}
```

### 500 Internal Server Error

```json
{
  "requestId": "req_bcd890",
  "timestamp": "2026-01-25T19:24:00.000Z",
  "path": "/api/v1/reports/cashflow",
  "method": "GET",
  "statusCode": 500,
  "success": false,
  "message": "Beklenmeyen bir hata olustu lutfen daha sonra tekrar deneyin",
  "code": "INTERNAL_ERROR",
  "details": {
    "support": "Bu hata devam ederse destek@trivexa.com adresine basvurun",
    "errorRef": "req_bcd890"
  }
}
```

### 503 Service Unavailable

```json
{
  "requestId": "req_efg123",
  "timestamp": "2026-01-25T19:25:00.000Z",
  "path": "/api/v1/users",
  "method": "GET",
  "statusCode": 503,
  "success": false,
  "message": "Servis gecici olarak kullanilamiyor lutfen birkac dakika sonra tekrar deneyin",
  "code": "DATABASE_UNAVAILABLE",
  "details": {
    "retryAfter": 30
  }
}
```

---

# BOLUM D: HATA YONETIMI

## 7. Hata Mesaji Stratejisi

| Seviye | Hedef | Icerik | Ornek |
|--------|-------|--------|-------|
| message | Frontend Son Kullanici | Kisa anlasilir aksiyon odakli | Oturum sureniz dolmus lutfen tekrar giris yapin |
| details | Developer Debug | Field errors stack trace | field email constraint unique pgCode 23505 |

---

# BOLUM E: POSTGRESQL HATA MAPPING TABLOSU

## 8. pg Error Code HTTP Status Mapping

| PostgreSQL Code | PostgreSQL Name | HTTP Status | Frontend Code | Aciklama |
|-----------------|-----------------|-------------|---------------|----------|
| 23505 | unique_violation | 409 | DUPLICATE_ENTRY | Email invoice_number vb unique constraint ihlali |
| 23503 | foreign_key_violation | 409 | FK_CONSTRAINT_FAILED | Var olmayan parent kaydina referans |
| 23502 | not_null_violation | 400 | REQUIRED_FIELD_MISSING | NULL olamaz alan bos gonderilmis |
| 23514 | check_violation | 422 | CHECK_CONSTRAINT_FAILED | CHECK constraint ihlali |
| 40001 | serialization_failure | 409 | CONCURRENT_MODIFICATION | Concurrent transaction cakismasi |
| 40P01 | deadlock_detected | 409 | DEADLOCK_DETECTED | Deadlock Client retry yapmali |
| 08000-08999 | connection_exception | 503 | DATABASE_UNAVAILABLE | DB baglanti hatasi |
| 57P01 | admin_shutdown | 503 | DATABASE_SHUTDOWN | DB bakimda |
| XX000 | internal_error | 500 | DATABASE_INTERNAL | Beklenmeyen DB hatasi |

---

# BOLUM F: ADIM ADIM ACIKLAMA

## 9. Request Pipeline Adimlari

### Adim 1: HTTP Request Alimi
1. Client HTTP istegi gonderir GET POST PUT DELETE
2. NestJS istegi karsilar

### Adim 2: Middleware Zinciri
1. RequestIdMiddleware Unique X-Request-Id uretir veya headerdan alir
2. RequestIpMiddleware X-Forwarded-For veya socket IPden client IP cikarir
3. LoggerMiddleware Method path user-agent loglar

### Adim 3: Rate Limit Guard
1. IP ve endpoint bazli rate limit kontrolu
2. Redis Memory de sayac kontrol
3. Limit asilirsa 429 RATE_LIMIT_EXCEEDED

### Adim 4: JWT Auth Guard
1. Public route ise atla
2. Authorization header kontrolu yoksa 401 AUTH_TOKEN_MISSING
3. Bearer format kontrolu hataliysa 401 AUTH_TOKEN_MALFORMED
4. JWT verify signature ve expiry invalid 401 AUTH_TOKEN_INVALID expired 401 AUTH_TOKEN_EXPIRED
5. Useri DBden yukle permissions attach et
6. User aktif degilse 403 USER_DEACTIVATED
7. Force password change aktifse 403 FORCE_PASSWORD_CHANGE

### Adim 5: RBAC Guard
1. Endpointin gerektirdigi role kontrolu yetersiz 403 RBAC_ROLE_DENIED
2. Endpointin gerektirdigi permission kontrolu yetersiz 403 RBAC_PERMISSION_DENIED
3. Department-scoped resource ise department kontrolu yetersiz 403 RBAC_DEPARTMENT_DENIED

### Adim 6: Validation Pipe
1. Request bodyyi DTO classa transform et
2. class-validator ile validate et
3. Validation failed 400 VALIDATION_FAILED field errors

### Adim 7: Controller
1. ETag If-None-Match varsa cache hit kontrolu match 304 Not Modified
2. UseCasei cagir

### Adim 8: UseCase Application Layer
1. Transaction gerekli mi kontrolu
2. Gerekli ise BEGIN
3. Domain rules kontrolu ihlal 422 DOMAIN_RULE_VIOLATION
4. Repository call

### Adim 9: Repository Infrastructure Layer
1. pool.query ile SQL calistir
2. Connection error 503 DATABASE_UNAVAILABLE
3. PostgreSQL error mappinge gore 409 400 422 500
4. Kayit bulunamadi 404 RESOURCE_NOT_FOUND

### Adim 10: Audit Log
1. Kritik islem mi kontrol
2. Kritik ise sync TX icinde INSERT basarisiz ise 500 AUDIT_WRITE_FAILED ROLLBACK
3. Non-kritik ise async queueya at

### Adim 11: Transaction Sonucu
1. Tum adimlar basarili COMMIT
2. Herhangi bir hata ROLLBACK

### Adim 12: Response Interceptor
1. Basarili responseu envelopea sar
2. POST 201 DELETE deactivate 204 diger 200

### Adim 13: Exception Filter Hata Durumunda
1. Exception yakala
2. Server log full stack requestId
3. Client response masked in prod
4. Standart error envelope dondur

---

# BOLUM G: AUDIT LOG KARARI

## 10. Kritik vs Non-Kritik Islemler

| Islem Tipi | Audit Modu | Basarisizlik Davranisi |
|------------|------------|------------------------|
| LOGIN LOGOUT | Sync | TX fail 500 dondur |
| PAYMENT_CREATE | Sync | TX fail 500 dondur |
| USER_DELETE | Sync | TX fail 500 dondur |
| PERMISSION_CHANGE | Sync | TX fail 500 dondur |
| PROJECT_UPDATE | Async | Log to queue continue |
| TICKET_COMMENT | Async | Log to queue continue |
| TIME_ENTRY_START | Async | Log to queue continue |

Karar: Kritik islemler auth payment delete permission icin audit yazilamamasi durumunda islem fail edilir veri tutarliligi. Non-kritik islemler icin async queue kullanilir ve retry mekanizmasi devrededir.
