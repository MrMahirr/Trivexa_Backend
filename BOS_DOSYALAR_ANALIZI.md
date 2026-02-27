# Proje Dosya ve Mimari Analizi (Boş/Stub Dosyalar)

Sistem üzerinde yapılan güncel analiz sonucunda, proje mimarisi oluşturulurken ileriye dönük olarak hazırlanmış (iskelet) fakat henüz **içi doldurulmamış veya sadece taslak (stub) kod barındıran toplam 118 dosya** tespit edilmiştir. 

Aşağıda bu boş/taslak dosyaların modüllere göre detaylı listesi ve projede ne için gerekli oldukları açıklanmıştır:

## 1. Ortak Paylaşımlı (Shared & Common) Katmanlar
Daha sonradan projeye hizmet edecek genel yapılar:
- **Common (Filtre, Pipe, Middleware):** `pagination.constants.ts`, `http-exception.filter.ts`, `logger.middleware.ts`, `request-id.middleware.ts`, `request-ip.middleware.ts`, `parse-uuid.pipe.ts`, `validation.pipe.ts`
- **Config & DB:** `storage.config.ts`, `swagger.config.ts`, `database/query/index.ts`, `database/query/sql.ts`, `database/types/base.interface.ts`
- **Shared Audit & Enums:** `audit.helpers.ts`, `audit.module.ts`, `audit.service.ts`, `audit.types.ts`, `approval-status.enum.ts`, `contract-type.enum.ts`, `currency.enum.ts`, `ledger-entry-type.enum.ts`, `priority.enum.ts`, `role.enum.ts`, `ticket-type.enum.ts`, `transaction-type.enum.ts`
- **Shared Notifications & Events:** `notification.handlers.ts`, `notifications.factory.ts`, `notifications.module.ts`, `notifications.service.ts`, `notifications.types.ts`

## 2. Modüller (Modules) Katmanı

### Auth & Users (Kullanıcılar ve Kimlik)
- **Auth:** `auth-session.model.ts`, `auth-public.service.ts`, `sql/auth-token.sql.ts`
- **Users:** `change-role.usecase.ts`, `list-users.query.ts`, `email.vo.ts`, `phone.vo.ts`, `user.entity.ts`, `user.rules.ts`, `user.repository.ts`, `users-public.service.ts`

### Clients (Müşteri ve İstemciler)
- İstemci işlemleri, parola değiştirme ve davet sistemleri:
- **DTOs & Usecases:** `force-change-client-password.dto.ts`, `issue-client-access-link.dto.ts`, `force-change-client-password.usecase.ts`
- **Domain & Repo:** `client-user.entity.ts`, `client.entity.ts`, `client.rules.ts`, `client-user.repository.ts`, `client.repository.ts`, `client-users.sql.ts`, `clients.sql.ts`
- **Public:** `clients-public.service.ts`

### Contracts (Sözleşmeler)
- Sözleşme işlemlerinin veritabanı logları ve modellemeleri:
- **DTOs:** `list-contracts.query.ts`, `update-contract-status.dto.ts`
- **Domain & Repo:** `contract.entity.ts`, `contract.rules.ts`, `contract.repository.ts`, `contracts.sql.ts`
- **Public:** `contracts-public.service.ts`

### Departments & Roles (Departmanlar ve Roller)
- Kurumsal yapı ve yetkilendirme altyapısı kuralları:
- **Departments:** `create-department.dto.ts`, `update-department.dto.ts`, `create-department.usecase.ts`, `update-department.usecase.ts`, `departments.sql.ts`, `departments-public.service.ts`
- **Roles:** `rbac.rules.ts`, `roles-public.service.ts`

### Meetings & Tickets (Toplantı ve Biletler)
- Müşteri destek sistemi ve online toplantı detayları:
- **Meetings:** `convert-to-ticket.dto.ts`, `update-meeting.dto.ts`, `update-meeting.usecase.ts`, `meeting.entity.ts`, `meeting.repository.ts`, `meetings.sql.ts`, `meetings-public.service.ts`
- **Tickets:** `list-tickets.query.ts`, `update-ticket-status.dto.ts`, `update-status.usecase.ts`, `ticket.entity.ts`, `ticket.rules.ts`, `ticket.repository.ts`, `tickets.sql.ts`, `tickets-public.service.ts`

### Time Tracking (Zaman Takibi)
- Efor takibi ve sayaç logları:
- **DTOs & Usecases:** `cancel-time-entry.dto.ts`, `list-time-entries.query.ts`, `start-timer.dto.ts`, `stop-timer.dto.ts`, `cancel-entry.usecase.ts`
- **Domain & Repo:** `time-entry.entity.ts`, `time-entry.repository.ts`, `time-tracking.sql.ts`
- **Public:** `time-tracking-public.service.ts`

### Projects (Projeler)
- Proje durumu güncellemeleri ve github vs dış entegrasyonlar:
- **DTOs & Usecases:** `update-github-url.dto.ts`, `update-project-status.dto.ts`, `update-github-url.usecase.ts`, `update-project.usecase.ts`
- **Domain & Repo:** `project.entity.ts`, `project.rules.ts`, `project.repository.ts`, `projects-public.service.ts`

### Notifications (Bildirimler - Artık/Kalanlar)
- Faz 34'te kısmen işlenmiş olsa da hala geliştirilmeye açık ek alanlar:
- **DTOs:** `mark-all-read.dto.ts`, `mark-read.dto.ts`
- **Domain & Repo:** `notification.entity.ts`, `notification.rules.ts`, `notification.repository.ts`
- **Public:** `notifications-public.service.ts`

## 🚀 Sonraki Adım ve Öneriler
Projeyi ileri taşımak ve kapsama oranını artırmak için aşağıdaki adımlar önerilir:

1. **Clients (Müşteriler) ve Contracts (Sözleşmeler) Modülleri:** Her ne kadar bu özelliklerin bazı Usecase dosyaları yazılmış olsa da, asıl veritabanı kurgusunu tutacak olan `Repository` ve `Entity` (Domain) sınıfları boştur. Öncelikli olarak buraların doldurulması sistemdeki en kritik verilerin saklanmasını sağlayacaktır.
2. **Ortak Yapıların Tamamlanması:** `common/` altında bulunan Exception loglayıcıları ve Middleware'ler (işlem süresi, log atma vb.) projenin production ortamı stabilitesini artıracağı için önemlidir.
3. **Faz Organizasyonu:** Boş olan Use Case ve DTO'lar birbiriyle bağlantılıdır (Örneğin `update-project.usecase.ts` ile `update-project-status.dto.ts`). Bunları işlevlerine (Finance, Projects, Time Tracking vb.) göre mantıksal FAZ'lara bölerek sistematik bir şekilde tamamlamak en güvenli ilerleyiş olacaktır.

*(Bu analiz, sistemin kök dizinindeki 0 bayt ve <150 karakterlik stub dosyaların JS script ile taranması sonucu elde edilmiştir.)*
