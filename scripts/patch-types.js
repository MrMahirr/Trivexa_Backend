const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, files);
    } else if (file.endsWith('.ts')) {
      files.push(fullPath);
    }
  });
  return files;
}

const files = getFiles(path.join(process.cwd(), 'src', 'modules'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Fix the `super('string'.NOT_FOUND)` in constructors
  content = content.replace(/super\(([^)]+)\.NOT_FOUND\)/g, 'super($1)');
  content = content.replace(/super\(([^)]+)\.CONFLICT\)/g, 'super($1)');
  content = content.replace(/super\(([^)]+)\.BAD_REQUEST\)/g, 'super($1, DomainErrorType.BUSINESS_RULE)');
  content = content.replace(/super\(([^)]+)\.FORBIDDEN\)/g, 'super($1)');
  content = content.replace(/super\(([^)]+)\.INTERNAL_SERVER_ERROR\)/g, 'super($1, DomainErrorType.INTERNAL_ERROR)');

  // 2. Fix HttpException -> NotFoundError or DomainError in service usages
  content = content.replace(/throw\s+new\s+HttpException\(\s*([^,]+?)\.NOT_FOUND\s*\)/g, 'throw new NotFoundError($1)');
  content = content.replace(/throw\s+new\s+HttpException\(\s*([^,]+?)\.BAD_REQUEST\s*\)/g, 'throw new DomainError($1, DomainErrorType.BUSINESS_RULE)');
  content = content.replace(/throw\s+new\s+HttpException\(\s*([^,]+?)\.CONFLICT\s*\)/g, 'throw new ConflictError($1)');
  content = content.replace(/throw\s+new\s+HttpException\(\s*([^,]+?)\.INTERNAL_SERVER_ERROR\s*\)/g, 'throw new DomainError($1, DomainErrorType.INTERNAL_ERROR)');

  // 3. projects.service.ts fixes
  if (file.includes('projects.service.ts')) {
     content = content.replace(/ProjectNotFoundException/g, 'NotFoundError');
     content = content.replace(/ProjectMemberAlreadyExistsException/g, 'MemberAlreadyExistsException');
  }

  // 4. projects update-status.usecase.ts fix
  if (file.includes('update-status.usecase.ts') && file.includes('projects')) {
     content = content.replace(/ProjectNotFoundException/g, 'NotFoundError');
     content = content.replace(/import\s*\{\s*Project\s*\}\s*from\s*['"]\.\.\/\.\.\/domain\/project\.rules['"]\s*;/g, '');
  }

  // 5. tickets update-ticket-status.usecase.ts fix
  if (file.includes('update-ticket-status.usecase.ts') && file.includes('tickets')) {
     content = content.replace(/TicketNotFoundException/g, 'NotFoundError');
     content = content.replace(/import\s*\{\s*Ticket\s*\}\s*from\s*['"]\.\.\/\.\.\/domain\/ticket\.rules['"]\s*;/g, '');
  }
  
  // 6. Fix for auth force-change-password.usecase.ts
  if (file.includes('force-change-password.usecase.ts') && file.includes('auth')) {
     if (!content.includes('import { NotFoundError }')) {
         content = `import { NotFoundError } from '../../../../shared/errors/not-found.error';\n` + content;
     }
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Patched ${file}`);
  }
}
