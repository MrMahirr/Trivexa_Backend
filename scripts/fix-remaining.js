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

  // 1. Fix HttpException with double quotes or template literals
  content = content.replace(/new\s+HttpException\(\s*["`]([^"`]+)["`]\s*,\s*HttpStatus\.NOT_FOUND\s*\)/g, 'new NotFoundError(\'$1\')');
  content = content.replace(/new\s+HttpException\(\s*["`]([^"`]+)["`]\s*,\s*HttpStatus\.BAD_REQUEST\s*\)/g, 'new DomainError(\'$1\', DomainErrorType.BUSINESS_RULE)');
  content = content.replace(/new\s+HttpException\(\s*["`]([^"`]+)["`]\s*,\s*HttpStatus\.CONFLICT\s*\)/g, 'new ConflictError(\'$1\')');
  content = content.replace(/new\s+HttpException\(\s*["`]([^"`]+)["`]\s*,\s*HttpStatus\.INTERNAL_SERVER_ERROR\s*\)/g, 'new DomainError(\'$1\', DomainErrorType.INTERNAL_ERROR)');
  
  // Clean up unused imports of HttpException/HttpStatus if there are no more throw new HttpException
  if (!content.includes('new HttpException')) {
     content = content.replace(/HttpException\s*,\s*/g, '');
     content = content.replace(/,\s*HttpException/g, '');
     content = content.replace(/HttpStatus\s*,\s*/g, '');
     content = content.replace(/,\s*HttpStatus/g, '');
  }

  // 2. Fix the 5 level deep relative paths
  content = content.replace(/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/shared/g, '../../../../shared');
  content = content.replace(/\.\.\/\.\.\/\.\.\/\.\.\/shared\/errors\/domain\.error/g, '../../../shared/errors/domain.error'); // For landing.service.ts which is depth 3

  // 3. Fix corrupted custom exception names
  content = content.replace(/ClientClientAlreadyExistsException/g, 'ClientAlreadyExistsException');
  content = content.replace(/TaskAssigneeNotMemberException/g, 'AssigneeNotMemberException');
  content = content.replace(/TaskBlockerNotCompletedException/g, 'BlockerNotCompletedException');
  content = content.replace(/TimeEntryTimeEntryAlreadyApprovedException/g, 'TimeEntryAlreadyApprovedException');
  content = content.replace(/UserCannotDeactivateSelfException/g, 'CannotDeactivateSelfException');
  content = content.replace(/UserUserAlreadyExistsException/g, 'UserAlreadyExistsException');

  // Fix Missing ClientNotFoundException etc by checking if its used but not imported
  const ensureImported = (excName) => {
     if (content.includes(`new ${excName}`) && !content.includes(`import { ${excName}`)) {
         // Try to find the local exception import to inject alongside it
         // Specifically for update-client.usecase.ts etc
         const importMatch = content.match(new RegExp(`import\\s*\\{[^}]*?(ClientAlreadyExistsException|AssigneeNotMemberException|BlockerNotCompletedException|TimeEntryAlreadyApprovedException|CannotDeactivateSelfException|UserAlreadyExistsException)[^}]*\\}\\s*from\\s*['"]([^'"]+)['"]`));
         if (importMatch) {
             const fromPath = importMatch[2];
             content = content.replace(new RegExp(`\\}\\s*from\\s*['"]${fromPath}['"]`), `, ${excName} } from '${fromPath}'`);
         }
     }
  };
  
  ensureImported('ClientNotFoundException');
  ensureImported('ProjectNotFoundException');
  ensureImported('MemberAlreadyExistsException');
  ensureImported('TaskNotFoundException');
  ensureImported('TicketNotFoundException');
  ensureImported('TimeEntryNotFoundException');
  ensureImported('UserNotFoundException');

  // Also auth/refresh-token.usecase.ts
  if (file.includes('refresh-token.usecase.ts') || file.includes('force-change-password.usecase.ts')) {
     content = content.replace(/import\s*\{\s*UnauthorizedException\s*\}\s*from\s*['"]@nestjs\/common['"];?/g, '');
     content = content.replace(/UnauthorizedException/g, 'DomainError');
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Patched ${file}`);
  }
}
