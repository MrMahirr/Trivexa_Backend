trivexa-backend/
├── .editorconfig
├── .env.example
├── .eslintignore
├── .eslintrc.cjs
├── .gitignore
├── .prettierignore
├── .prettierrc
├── README.md
├── docker-compose.yml
├── nest-cli.json
├── package.json
├── tsconfig.build.json
├── tsconfig.json
│
├── docker/
│   ├── postgres/
│   │   ├── init/
│   │   │   ├── 001_extensions.sql
│   │   │   ├── 010_schema_core.sql
│   │   │   ├── 020_schema_rbac.sql
│   │   │   ├── 030_schema_clients.sql
│   │   │   ├── 040_schema_projects.sql
│   │   │   ├── 050_schema_time_tracking.sql
│   │   │   ├── 060_schema_tickets.sql
│   │   │   ├── 070_schema_meetings.sql
│   │   │   ├── 080_schema_contracts.sql
│   │   │   ├── 090_schema_accounting.sql
│   │   │   ├── 100_schema_notifications.sql
│   │   │   ├── 110_schema_audit.sql
│   │   │   ├── 900_views_reports.sql
│   │   │   └── 999_seed_minimal.sql
│   │   └── README.md
│   ├── redis/
│   │   └── README.md
│   └── pgadmin/
│       ├── servers.json
│       └── README.md
│
├── scripts/
│   ├── README.md
│   ├── seed.ts
│   ├── generate-permissions.ts
│   └── maintenance/
│       ├── close-month.ts
│       ├── reconcile-bank.ts
│       └── cleanup-expired-client-links.ts
│
├── test/
│   ├── README.md
│   ├── e2e/
│   │   ├── auth.e2e-spec.ts
│   │   ├── users.e2e-spec.ts
│   │   ├── projects.e2e-spec.ts
│   │   ├── tickets.e2e-spec.ts
│   │   ├── accounting.e2e-spec.ts
│   │   └── audit.e2e-spec.ts
│   └── helpers/
│       ├── test-db.ts
│       ├── test-http.ts
│       └── test-seed.ts
│
└── src/
    ├── main.ts
    ├── app.module.ts
    │
    ├── config/
    │   ├── app.config.ts
    │   ├── database.config.ts
    │   ├── jwt.config.ts
    │   ├── redis.config.ts
    │   ├── rate-limit.config.ts
    │   ├── cors.config.ts
    │   ├── feature-flags.config.ts
    │   ├── security.config.ts
    │   ├── mail.config.ts
    │   ├── storage.config.ts
    │   └── swagger.config.ts
    │
    ├── database/
    │   ├── pg/
    │   │   ├── pool.ts
    │   │   ├── client.ts
    │   │   └── transaction.ts
    │   ├── query/
    │   │   ├── sql.ts
    │   │   ├── pagination.sql.ts
    │   │   ├── filters.sql.ts
    │   │   └── index.ts
    │   ├── error-mapping/
    │   │   ├── pg-error.types.ts
    │   │   └── pg-error.mapper.ts
    │   └── migrations/
    │       ├── README.md
    │       ├── 001_extensions.sql
    │       ├── 010_schema_core.sql
    │       ├── 020_schema_rbac.sql
    │       ├── 030_schema_clients.sql
    │       ├── 040_schema_projects.sql
    │       ├── 050_schema_time_tracking.sql
    │       ├── 060_schema_tickets.sql
    │       ├── 070_schema_meetings.sql
    │       ├── 080_schema_contracts.sql
    │       ├── 090_schema_accounting.sql
    │       ├── 100_schema_notifications.sql
    │       ├── 110_schema_audit.sql
    │       ├── 900_views_reports.sql
    │       └── 999_seed_minimal.sql
    │
    ├── infrastructure/
    │   ├── cache/
    │   │   ├── redis.client.ts
    │   │   ├── rate-limit.store.ts
    │   │   └── idempotency.store.ts
    │   ├── queue/
    │   │   ├── audit.producer.ts
    │   │   ├── audit.consumer.ts
    │   │   └── dead-letter.queue.ts
    │   ├── logging/
    │   │   ├── logger.service.ts
    │   │   └── logger.formatter.ts
    │   └── monitoring/
    │       ├── health.controller.ts
    │       └── sentry.service.ts
    │
    ├── common/
    │   ├── constants/
    │   │   ├── error-codes.ts
    │   │   ├── headers.ts
    │   │   ├── tokens.ts
    │   │   ├── pagination.ts
    │   │   └── audit.constants.ts
    │   ├── decorators/
    │   │   ├── public.decorator.ts
    │   │   ├── roles.decorator.ts
    │   │   ├── departments.decorator.ts
    │   │   ├── permissions.decorator.ts
    │   │   ├── feature.decorator.ts
    │   │   ├── audit.decorator.ts
    │   │   ├── current-user.decorator.ts
    │   │   ├── client-user.decorator.ts
    │   │   ├── request-ip.decorator.ts
    │   │   └── request-id.decorator.ts
    │   ├── middlewares/
    │   │   ├── request-id.middleware.ts
    │   │   ├── request-ip.middleware.ts
    │   │   ├── logger.middleware.ts
    │   │   ├── payload-limit.middleware.ts
    │   │   └── cors.middleware.ts
    │   ├── guards/
    │   │   ├── auth/
    │   │   │   ├── jwt.guard.ts
    │   │   │   └── client-token.guard.ts
    │   │   ├── tenant.guard.ts
    │   │   ├── feature-flag.guard.ts
    │   │   ├── idempotency.guard.ts
    │   │   ├── rate-limit.guard.ts
    │   │   ├── force-password.guard.ts
    │   │   ├── roles.guard.ts
    │   │   ├── departments.guard.ts
    │   │   └── permissions.guard.ts
    │   ├── interceptors/
    │   │   ├── response.interceptor.ts
    │   │   ├── timing.interceptor.ts
    │   │   ├── cache.interceptor.ts
    │   │   └── audit.interceptor.ts
    │   ├── filters/
    │   │   ├── global-exception.filter.ts
    │   │   ├── http-exception.filter.ts
    │   │   └── validation-exception.filter.ts
    │   ├── pipes/
    │   │   ├── validation.pipe.ts
    │   │   ├── sanitize.pipe.ts
    │   │   └── parse-uuid.pipe.ts
    │   └── utils/
    │       ├── crypto.util.ts
    │       ├── date.util.ts
    │       ├── pagination.util.ts
    │       ├── sanitize.util.ts
    │       ├── mask.util.ts
    │       └── id.util.ts
    │
    ├── application/
    │   ├── transaction/
    │   │   ├── transaction-manager.ts
    │   │   └── transaction-context.ts
    │   ├── ports/
    │   │   ├── repositories/
    │   │   │   ├── user.repository.port.ts
    │   │   ├── audit.port.ts
    │   │   └── idempotency.port.ts
    │   └── use-cases/
    │       └── README.md
    │
    ├── domain/
    │   ├── errors/
    │   │   ├── domain-error.base.ts
    │   │   ├── rule-violation.error.ts
    │   │   ├── not-found.error.ts
    │   │   ├── conflict.error.ts
    │   │   └── forbidden.error.ts
    │   ├── value-objects/
    │   │   ├── uuid.vo.ts
    │   │   ├── email.vo.ts
    │   │   └── money.vo.ts
    │   └── rules/
    │       └── README.md
    │
    ├── shared/
    │   ├── enums/
    │   │   ├── role.enum.ts
    │   │   ├── department.enum.ts
    │   │   ├── permission.enum.ts
    │   │   ├── project-status.enum.ts
    │   │   ├── ticket-status.enum.ts
    │   │   ├── ticket-type.enum.ts
    │   │   ├── priority.enum.ts
    │   │   ├── contract-status.enum.ts
    │   │   ├── contract-type.enum.ts
    │   │   ├── currency.enum.ts
    │   │   ├── payment-method.enum.ts
    │   │   ├── transaction-type.enum.ts
    │   │   ├── ledger-entry-type.enum.ts
    │   │   └── approval-status.enum.ts
    │   ├── dto/
    │   │   ├── page.dto.ts
    │   │   ├── page-meta.dto.ts
    │   │   ├── api-response.dto.ts
    │   │   └── date-range.dto.ts
    │   ├── events/
    │   │   ├── event-bus.module.ts
    │   │   ├── event.types.ts
    │   │   ├── event.constants.ts
    │   │   └── handlers/
    │   │       ├── notification.handlers.ts
    │   │       └── audit.handlers.ts
    │   ├── notifications/
    │   │   ├── notifications.module.ts
    │   │   ├── notifications.service.ts
    │   │   ├── notifications.factory.ts
    │   │   └── notifications.types.ts
    │   ├── files/
    │   │   ├── files.module.ts
    │   │   ├── files.service.ts
    │   │   ├── storage/
    │   │   │   ├── local-storage.provider.ts
    │   │   │   └── s3-storage.provider.ts
    │   │   └── validators/
    │   │       ├── file-size.validator.ts
    │   │       └── file-type.validator.ts
    │   └── security/
    │       ├── password-policy.ts
    │       ├── encryption.service.ts
    │       ├── token.service.ts
    │       ├── field-visibility.service.ts
    │       └── rate-limit.service.ts
    │
    └── modules/
        ├── auth/
        │   ├── auth.module.ts
        │   ├── api/
        │   │   ├── auth.controller.ts
        │   │   └── dto/
        │   │       ├── login.dto.ts
        │   │       ├── refresh.dto.ts
        │   │       ├── logout.dto.ts
        │   │       └── force-change-password.dto.ts
        │   ├── application/
        │   │   ├── services/
        │   │   │   └── auth-app.service.ts
        │   │   └── usecases/
        │   │       ├── login.usecase.ts
        │   │       ├── refresh-token.usecase.ts
        │   │       ├── logout.usecase.ts
        │   │       └── force-change-password.usecase.ts
        │   ├── domain/
        │   │   ├── models/
        │   │   │   └── auth-session.model.ts
        │   │   └── rules/
        │   │       └── auth.rules.ts
        │   ├── infrastructure/
        │   │   ├── repositories/
        │   │   │   └── auth-token.repository.ts
        │   │   └── sql/
        │   │       ├── auth-token.sql.ts
        │   │       └── index.ts
        │   └── public/
        │       └── auth-public.service.ts
        │
        ├── users/
        │   ├── users.module.ts
        │   ├── api/
        │   │   ├── users.controller.ts
        │   │   └── dto/
        │   │       ├── create-user.dto.ts
        │   │       ├── update-user.dto.ts
        │   │       ├── list-users.query.ts
        │   │       └── export-users.query.ts
        │   ├── application/
        │   │   ├── services/
        │   │   │   └── users-app.service.ts
        │   │   └── usecases/
        │   │       ├── create-user.usecase.ts
        │   │       ├── update-user.usecase.ts
        │   │       ├── change-department.usecase.ts
        │   │       ├── change-role.usecase.ts
        │   │       ├── deactivate-user.usecase.ts
        │   │       └── export-users.usecase.ts
        │   ├── domain/
        │   │   ├── entities/
        │   │   │   └── user.entity.ts
        │   │   ├── value-objects/
        │   │   │   ├── email.vo.ts
        │   │   │   └── phone.vo.ts
        │   │   └── rules/
        │   │       └── user.rules.ts
        │   ├── infrastructure/
        │   │   ├── repositories/
        │   │   │   └── user.repository.ts
        │   │   └── sql/
        │   │       ├── users.sql.ts
        │   │       └── index.ts
        │   └── public/
        │       └── users-public.service.ts
        │
        ├── roles/
        │   ├── roles.module.ts
        │   ├── api/
        │   │   ├── roles.controller.ts
        │   │   └── dto/
        │   │       ├── create-role.dto.ts
        │   │       ├── update-role.dto.ts
        │   │       └── assign-permissions.dto.ts
        │   ├── application/
        │   │   └── usecases/
        │   │       ├── create-role.usecase.ts
        │   │       ├── update-role.usecase.ts
        │   │       └── assign-permissions.usecase.ts
        │   ├── domain/
        │   │   ├── entities/
        │   │   │   ├── role.entity.ts
        │   │   │   └── permission.entity.ts
        │   │   └── rules/
        │   │       └── rbac.rules.ts
        │   ├── infrastructure/
        │   │   ├── repositories/
        │   │   │   ├── role.repository.ts
        │   │   │   └── permission.repository.ts
        │   │   └── sql/
        │   │       ├── roles.sql.ts
        │   │       ├── permissions.sql.ts
        │   │       └── index.ts
        │   └── public/
        │       └── roles-public.service.ts
        │
        ├── departments/
        │   ├── departments.module.ts
        │   ├── api/
        │   │   ├── departments.controller.ts
        │   │   └── dto/
        │   │       ├── create-department.dto.ts
        │   │       └── update-department.dto.ts
        │   ├── application/
        │   │   └── usecases/
        │   │       ├── create-department.usecase.ts
        │   │       └── update-department.usecase.ts
        │   ├── domain/
        │   │   └── entities/
        │   │       └── department.entity.ts
        │   ├── infrastructure/
        │   │   ├── repositories/
        │   │   │   └── department.repository.ts
        │   │   └── sql/
        │   │       ├── departments.sql.ts
        │   │       └── index.ts
        │   └── public/
        │       └── departments-public.service.ts
        │
        ├── clients/
        │   ├── clients.module.ts
        │   ├── api/
        │   │   ├── clients.controller.ts
        │   │   ├── client-portal.controller.ts
        │   │   └── dto/
        │   │       ├── create-client.dto.ts
        │   │       ├── update-client.dto.ts
        │   │       ├── create-client-user.dto.ts
        │   │       ├── issue-client-access-link.dto.ts
        │   │       ├── client-portal-login.dto.ts
        │   │       └── force-change-client-password.dto.ts
        │   ├── application/
        │   │   └── usecases/
        │   │       ├── create-client.usecase.ts
        │   │       ├── update-client.usecase.ts
        │   │       ├── create-client-user.usecase.ts
        │   │       ├── issue-client-access-link.usecase.ts
        │   │       └── force-change-client-password.usecase.ts
        │   ├── domain/
        │   │   ├── entities/
        │   │   │   ├── client.entity.ts
        │   │   │   └── client-user.entity.ts
        │   │   └── rules/
        │   │       └── client.rules.ts
        │   ├── infrastructure/
        │   │   ├── repositories/
        │   │   │   ├── client.repository.ts
        │   │   │   └── client-user.repository.ts
        │   │   └── sql/
        │   │       ├── clients.sql.ts
        │   │       ├── client-users.sql.ts
        │   │       └── index.ts
        │   └── public/
        │       └── clients-public.service.ts
        │
        ├── projects/
        │   ├── projects.module.ts
        │   ├── api/
        │   │   ├── projects.controller.ts
        │   │   └── dto/
        │   │       ├── create-project.dto.ts
        │   │       ├── update-project.dto.ts
        │   │       ├── update-project-status.dto.ts
        │   │       ├── update-github-url.dto.ts
        │   │       └── assign-client.dto.ts
        │   ├── application/
        │   │   └── usecases/
        │   │       ├── create-project.usecase.ts
        │   │       ├── update-project.usecase.ts
        │   │       ├── update-status.usecase.ts
        │   │       ├── update-github-url.usecase.ts
        │   │       └── assign-client.usecase.ts
        │   ├── domain/
        │   │   ├── entities/
        │   │   │   └── project.entity.ts
        │   │   └── rules/
        │   │       └── project.rules.ts
        │   ├── infrastructure/
        │   │   ├── repositories/
        │   │   │   └── project.repository.ts
        │   │   └── sql/
        │   │       ├── projects.sql.ts
        │   │       └── index.ts
        │   └── public/
        │       └── projects-public.service.ts
        │
        ├── time-tracking/
        │   ├── time-tracking.module.ts
        │   ├── api/
        │   │   ├── time-tracking.controller.ts
        │   │   └── dto/
        │   │       ├── start-timer.dto.ts
        │   │       ├── stop-timer.dto.ts
        │   │       ├── cancel-time-entry.dto.ts
        │   │       └── list-time-entries.query.ts
        │   ├── application/
        │   │   └── usecases/
        │   │       ├── start-timer.usecase.ts
        │   │       ├── stop-timer.usecase.ts
        │   │       ├── cancel-entry.usecase.ts
        │   │       └── list-entries.usecase.ts
        │   ├── domain/
        │   │   ├── entities/
        │   │   │   └── time-entry.entity.ts
        │   │   └── rules/
        │   │       └── time-tracking.rules.ts
        │   ├── infrastructure/
        │   │   ├── repositories/
        │   │   │   └── time-entry.repository.ts
        │   │   └── sql/
        │   │       ├── time-tracking.sql.ts
        │   │       └── index.ts
        │   └── public/
        │       └── time-tracking-public.service.ts
        │
        ├── tickets/
        │   ├── tickets.module.ts
        │   ├── api/
        │   │   ├── tickets.controller.ts
        │   │   └── dto/
        │   │       ├── create-ticket.dto.ts
        │   │       ├── update-ticket-status.dto.ts
        │   │       ├── assign-ticket.dto.ts
        │   │       └── list-tickets.query.ts
        │   ├── application/
        │   │   └── usecases/
        │   │       ├── create-ticket.usecase.ts
        │   │       ├── approve-ticket.usecase.ts
        │   │       ├── assign-ticket.usecase.ts
        │   │       └── update-status.usecase.ts
        │   ├── domain/
        │   │   ├── entities/
        │   │   │   └── ticket.entity.ts
        │   │   └── rules/
        │   │       └── ticket.rules.ts
        │   ├── infrastructure/
        │   │   ├── repositories/
        │   │   │   └── ticket.repository.ts
        │   │   └── sql/
        │   │       ├── tickets.sql.ts
        │   │       └── index.ts
        │   └── public/
        │       └── tickets-public.service.ts
        │
        ├── meetings/
        │   ├── meetings.module.ts
        │   ├── api/
        │   │   ├── meetings.controller.ts
        │   │   └── dto/
        │   │       ├── create-meeting.dto.ts
        │   │       ├── update-meeting.dto.ts
        │   │       └── convert-to-ticket.dto.ts
        │   ├── application/
        │   │   └── usecases/
        │   │       ├── create-meeting.usecase.ts
        │   │       ├── update-meeting.usecase.ts
        │   │       └── convert-to-ticket.usecase.ts
        │   ├── domain/
        │   │   ├── entities/
        │   │   │   └── meeting.entity.ts
        │   │   └── rules/
        │   │       └── meeting.rules.ts
        │   ├── infrastructure/
        │   │   ├── repositories/
        │   │   │   └── meeting.repository.ts
        │   │   └── sql/
        │   │       ├── meetings.sql.ts
        │   │       └── index.ts
        │   └── public/
        │       └── meetings-public.service.ts
        │
        ├── contracts/
        │   ├── contracts.module.ts
        │   ├── api/
        │   │   ├── contracts.controller.ts
        │   │   └── dto/
        │   │       ├── create-contract.dto.ts
        │   │       ├── update-contract-status.dto.ts
        │   │       └── list-contracts.query.ts
        │   ├── application/
        │   │   └── usecases/
        │   │       ├── create-contract.usecase.ts
        │   │       ├── update-status.usecase.ts
        │   │       └── list-expiring-contracts.usecase.ts
        │   ├── domain/
        │   │   ├── entities/
        │   │   │   └── contract.entity.ts
        │   │   └── rules/
        │   │       └── contract.rules.ts
        │   ├── infrastructure/
        │   │   ├── repositories/
        │   │   │   └── contract.repository.ts
        │   │   └── sql/
        │   │       ├── contracts.sql.ts
        │   │       └── index.ts
        │   └── public/
        │       └── contracts-public.service.ts
        │
        ├── notifications/
        │   ├── notifications.module.ts
        │   ├── api/
        │   │   ├── notifications.controller.ts
        │   │   └── dto/
        │   │       ├── list-notifications.query.ts
        │   │       ├── mark-read.dto.ts
        │   │       └── mark-all-read.dto.ts
        │   ├── application/
        │   │   └── usecases/
        │   │       ├── create-notification.usecase.ts
        │   │       ├── mark-read.usecase.ts
        │   │       └── mark-all-read.usecase.ts
        │   ├── domain/
        │   │   ├── entities/
        │   │   │   └── notification.entity.ts
        │   │   └── rules/
        │   │       └── notification.rules.ts
        │   ├── infrastructure/
        │   │   ├── repositories/
        │   │   │   └── notification.repository.ts
        │   │   └── sql/
        │   │       ├── notifications.sql.ts
        │   │       └── index.ts
        │   └── public/
        │       └── notifications-public.service.ts
        │
        ├── audit/
        │   ├── audit.module.ts
        │   ├── api/
        │   │   ├── audit.controller.ts
        │   │   └── dto/
        │   │       └── list-audit.query.ts
        │   ├── application/
        │   │   └── usecases/
        │   │       ├── write-audit-log.usecase.ts
        │   │       └── list-audit-logs.usecase.ts
        │   ├── domain/
        │   │   ├── entities/
        │   │   │   └── audit-log.entity.ts
        │   │   └── rules/
        │   │       └── audit.rules.ts
        │   ├── infrastructure/
        │   │   ├── repositories/
        │   │   │   └── audit-log.repository.ts
        │   │   └── sql/
        │   │       ├── audit.sql.ts
        │   │       └── index.ts
        │   └── public/
        │       └── audit-public.service.ts
        │
        └── accounting/
            ├── accounting.module.ts
            ├── api/
            │   ├── accounting-dashboard.controller.ts
            │   ├── preaccounting.controller.ts
            │   ├── transactions.controller.ts
            │   ├── invoices.controller.ts
            │   ├── payments.controller.ts
            │   ├── expenses.controller.ts
            │   ├── vendors.controller.ts
            │   ├── ledger.controller.ts
            │   ├── reports.controller.ts
            │   └── dto/
            │       ├── common/
            │       │   ├── date-range.query.ts
            │       │   ├── pagination.query.ts
            │       │   └── export.query.ts
            │       ├── accounts/
            │       │   ├── create-account.dto.ts
            │       │   └── list-accounts.query.ts
            │       ├── ledger/
            │       │   ├── create-ledger-entry.dto.ts
            │       │   ├── list-ledger-entries.query.ts
            │       │   └── export-ledger.query.ts
            │       ├── transactions/
            │       │   ├── create-cash-transaction.dto.ts
            │       │   ├── create-bank-transaction.dto.ts
            │       │   ├── list-transactions.query.ts
            │       │   └── reconcile-bank.dto.ts
            │       ├── invoices/
            │       │   ├── create-invoice.dto.ts
            │       │   ├── update-invoice-status.dto.ts
            │       │   └── list-invoices.query.ts
            │       ├── payments/
            │       │   ├── record-payment.dto.ts
            │       │   ├── refund-payment.dto.ts
            │       │   └── list-payments.query.ts
            │       ├── expenses/
            │       │   ├── create-expense.dto.ts
            │       │   ├── approve-expense.dto.ts
            │       │   └── list-expenses.query.ts
            │       ├── vendors/
            │       │   ├── create-vendor.dto.ts
            │       │   ├── update-vendor.dto.ts
            │       │   └── list-vendors.query.ts
            │       └── reports/
            │           ├── cashflow.query.ts
            │           ├── profit-loss.query.ts
            │           └── aging.query.ts
            ├── application/
            │   ├── services/
            │   │   ├── accounting-app.service.ts
            │   │   ├── preaccounting-app.service.ts
            │   │   ├── payments-app.service.ts
            │   │   └── reporting-app.service.ts
            │   └── usecases/
            │       ├── accounts/
            │       │   ├── create-account.usecase.ts
            │       │   └── list-accounts.usecase.ts
            │       ├── ledger/
            │       │   ├── create-ledger-entry.usecase.ts
            │       │   ├── list-ledger-entries.usecase.ts
            │       │   └── export-ledger.usecase.ts
            │       ├── cash-bank/
            │       │   ├── create-cash-transaction.usecase.ts
            │       │   ├── create-bank-transaction.usecase.ts
            │       │   ├── list-transactions.usecase.ts
            │       │   └── reconcile-bank.usecase.ts
            │       ├── invoices/
            │       │   ├── create-invoice.usecase.ts
            │       │   ├── update-invoice-status.usecase.ts
            │       │   └── list-invoices.usecase.ts
            │       ├── payments/
            │       │   ├── record-payment.usecase.ts
            │       │   ├── refund-payment.usecase.ts
            │       │   └── list-payments.usecase.ts
            │       ├── expenses/
            │       │   ├── create-expense.usecase.ts
            │       │   ├── approve-expense.usecase.ts
            │       │   └── list-expenses.usecase.ts
            │       ├── vendors/
            │       │   ├── create-vendor.usecase.ts
            │       │   ├── update-vendor.usecase.ts
            │       │   └── list-vendors.usecase.ts
            │       └── reports/
            │           ├── cashflow-report.usecase.ts
            │           ├── profit-loss-report.usecase.ts
            │           └── aging-report.usecase.ts
            ├── domain/
            │   ├── entities/
            │   │   ├── account.entity.ts
            │   │   ├── ledger-entry.entity.ts
            │   │   ├── money-transaction.entity.ts
            │   │   ├── invoice.entity.ts
            │   │   ├── payment.entity.ts
            │   │   ├── expense.entity.ts
            │   │   └── vendor.entity.ts
            │   └── rules/
            │       ├── accounting.rules.ts
            │       ├── preaccounting.rules.ts
            │       └── payments.rules.ts
            ├── infrastructure/
            │   ├── repositories/
            │   │   ├── account.repository.ts
            │   │   ├── ledger-entry.repository.ts
            │   │   ├── money-transaction.repository.ts
            │   │   ├── invoice.repository.ts
            │   │   ├── payment.repository.ts
            │   │   ├── expense.repository.ts
            │   │   └── vendor.repository.ts
            │   └── sql/
            │       ├── accounting.sql.ts
            │       ├── ledger.sql.ts
            │       ├── invoices.sql.ts
            │       ├── payments.sql.ts
            │       ├── expenses.sql.ts
            │       ├── vendors.sql.ts
            │       ├── reports.sql.ts
            │       └── index.ts
            └── public/
                └── accounting-public.service.ts
