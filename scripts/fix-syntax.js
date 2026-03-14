const fs = require('fs');

const files = [
  'src/modules/clients/application/usecases/force-change-client-password.usecase.ts',
  'src/modules/departments/application/usecases/create-department-module.usecase.ts',
  'src/modules/departments/application/usecases/update-department-module.usecase.ts',
  'src/modules/finance/ledger/application/ledger.service.ts',
  'src/modules/finance/payments/application/payments.service.ts',
  'src/modules/meetings/application/usecases/convert-to-ticket.usecase.ts',
  'src/modules/meetings/application/usecases/create-meeting.usecase.ts',
  'src/modules/meetings/application/usecases/update-meeting.usecase.ts',
  'src/modules/projects/application/projects.service.ts'
];

for (const file of files) {
   if (!fs.existsSync(file)) continue;
   let content = fs.readFileSync(file, 'utf8');
   
   // Replace lines like: `      , DomainErrorType.BUSINESS_RULE);`
   // With: `      DomainErrorType.BUSINESS_RULE);`
   content = content.replace(/,\s*DomainErrorType\./g, ', DomainErrorType.');
   content = content.replace(/',\n\s*,\s*DomainErrorType\./g, "',\n        DomainErrorType.");
   content = content.replace(/',\s*,\s*DomainErrorType\./g, "', DomainErrorType.");
   content = content.replace(/"\,\s*,\s*DomainErrorType\./g, '", DomainErrorType.');
   content = content.replace(/,\s*,\s*DomainErrorType\./g, ', DomainErrorType.');

   fs.writeFileSync(file, content);
   console.log('Fixed ' + file);
}
