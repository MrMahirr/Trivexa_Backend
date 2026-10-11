const fs = require('fs');
const path = require('path');

// 1. clients.service.ts
const clientsServicePath = path.join(process.cwd(), 'src/modules/clients/application/clients.service.ts');
if (fs.existsSync(clientsServicePath)) {
    let content = fs.readFileSync(clientsServicePath, 'utf8');
    content = content.replace(/extends\s+HttpException/g, 'extends DomainError');
    content = content.replace(/super\('Client not found'\.NOT_FOUND\);/g, 'super(\'Client not found\', DomainErrorType.BUSINESS_RULE);');
    content = content.replace(/super\(`A client with this \$\{field\} already exists`\.CONFLICT\);/g, 'super(`A client with this ${field} already exists`, DomainErrorType.BUSINESS_RULE);');
    
    // Multi-line HttpException Bad Request
    content = content.replace(/throw\s+new\s+HttpException\(\s*(['"`].*?['"`])\.BAD_REQUEST\s*,\s*\)/g, 'throw new DomainError($1, DomainErrorType.BUSINESS_RULE)');
    content = content.replace(/throw\s+new\s+HttpException\(\s*(['"`].*?['"`])\.BAD_REQUEST\s*\)/g, 'throw new DomainError($1, DomainErrorType.BUSINESS_RULE)');

    // Remove HttpException from imports
    content = content.replace(/HttpException\s*,?\s*/g, '');
    fs.writeFileSync(clientsServicePath, content);
    console.log('Fixed clients.service.ts');
}

// 2. landing.service.ts
const landingServicePath = path.join(process.cwd(), 'src/modules/landing/application/landing.service.ts');
if (fs.existsSync(landingServicePath)) {
    let content = fs.readFileSync(landingServicePath, 'utf8');
    content = content.replace(/throw\s+new\s+HttpException\(\s*(['"`].*?['"`])\.NOT_FOUND\s*,\s*\)/g, 'throw new NotFoundError($1)');
    content = content.replace(/throw\s+new\s+HttpException\(\s*(['"`].*?['"`])\.NOT_FOUND\s*\)/g, 'throw new NotFoundError($1)');
    
    content = content.replace(/throw\s+new\s+HttpException\(\s*(['"`].*?['"`])\.BAD_REQUEST\s*,\s*\)/g, 'throw new DomainError($1, DomainErrorType.BUSINESS_RULE)');
    content = content.replace(/throw\s+new\s+HttpException\(\s*(['"`].*?['"`])\.BAD_REQUEST\s*\)/g, 'throw new DomainError($1, DomainErrorType.BUSINESS_RULE)');

    content = content.replace(/throw\s+new\s+HttpException\(\s*(['"`].*?['"`])\.INTERNAL_SERVER_ERROR\s*,\s*\)/g, 'throw new DomainError($1, DomainErrorType.INTERNAL_ERROR)');
    content = content.replace(/throw\s+new\s+HttpException\(\s*(['"`].*?['"`])\.INTERNAL_SERVER_ERROR\s*\)/g, 'throw new DomainError($1, DomainErrorType.INTERNAL_ERROR)');
    
    content = content.replace(/HttpException\s*,?\s*/g, '');
    
    if (!content.includes('import { NotFoundError }')) {
        content = "import { NotFoundError } from '../../../../shared/errors/not-found.error';\n" + content;
    }
    fs.writeFileSync(landingServicePath, content);
    console.log('Fixed landing.service.ts');
}

// 3. Add DomainErrorType import to domain errors that need it
const addDomainErrorType = (filePath) => {
    const full = path.join(process.cwd(), filePath);
    if (fs.existsSync(full)) {
        let content = fs.readFileSync(full, 'utf8');
        if (content.includes('DomainErrorType') && !content.includes('DomainErrorType } from')) {
            content = content.replace(/DomainError\s*\}\s*from/g, 'DomainError, DomainErrorType } from');
            fs.writeFileSync(full, content);
            console.log(`Added DomainErrorType to ${filePath}`);
        }
    }
}
addDomainErrorType('src/modules/contracts/domain/contract.errors.ts');
addDomainErrorType('src/modules/files/domain/file.errors.ts');

// 4. Update project.rules.ts, task.rules.ts, ticket.rules.ts which were missed by AST
const rulesFiles = [
    'src/modules/projects/domain/project.rules.ts',
    'src/modules/tasks/domain/task.rules.ts',
    'src/modules/tickets/domain/ticket.rules.ts'
];
for (const rule of rulesFiles) {
    const full = path.join(process.cwd(), rule);
    if (!fs.existsSync(full)) continue;
    let content = fs.readFileSync(full, 'utf8');
    
    // they have classes extending HttpException
    content = content.replace(/extends\s+HttpException/g, 'extends DomainError');
    // constructors have super(msg, HttpStatus.X) -> super(msg, DomainErrorType.X)
    content = content.replace(/HttpStatus\.NOT_FOUND/g, 'DomainErrorType.NOT_FOUND');
    content = content.replace(/HttpStatus\.CONFLICT/g, 'DomainErrorType.BUSINESS_RULE');
    content = content.replace(/HttpStatus\.BAD_REQUEST/g, 'DomainErrorType.BUSINESS_RULE');
    content = content.replace(/HttpStatus\.FORBIDDEN/g, 'DomainErrorType.BUSINESS_RULE');
    
    // strip HttpStatus
    content = content.replace(/HttpStatus\s*,?\s*/g, '');
    content = content.replace(/HttpException\s*,?\s*/g, '');
    
    if (!content.includes("from '../../../shared/errors/domain.error'")) {
         content = `import { DomainError, DomainErrorType } from '../../../shared/errors/domain.error';\n` + content;
    }
    fs.writeFileSync(full, content);
    console.log(`Fixed rules in ${rule}`);
}

// 5. usecases importing incorrect names
const pUsecase = path.join(process.cwd(), 'src/modules/projects/application/usecases/update-status.usecase.ts');
if (fs.existsSync(pUsecase)) {
    let content = fs.readFileSync(pUsecase, 'utf8');
    content = content.replace(/import\s*\{\s*Project\s*\}\s*from\s*['"]\.\.\/\.\.\/domain\/project\.rules['"];?/g, '');
    fs.writeFileSync(pUsecase, content);
}

const tUsecase = path.join(process.cwd(), 'src/modules/tickets/application/usecases/update-ticket-status.usecase.ts');
if (fs.existsSync(tUsecase)) {
    let content = fs.readFileSync(tUsecase, 'utf8');
    content = content.replace(/import\s*\{\s*Ticket\s*\}\s*from\s*['"]\.\.\/\.\.\/domain\/ticket\.rules['"];?/g, '');
    fs.writeFileSync(tUsecase, content);
}

// 6. fix the bad extend for ClientNotFoundException -> should be NotFoundError not DomainError
if (fs.existsSync(clientsServicePath)) {
    let content = fs.readFileSync(clientsServicePath, 'utf8');
    content = content.replace(/class ClientNotFoundException extends DomainError/g, 'class ClientNotFoundException extends NotFoundError');
    fs.writeFileSync(clientsServicePath, content);
}
