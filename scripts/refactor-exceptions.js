const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, files);
    } else if (file.match(/\.(service|usecase)\.ts$/) && fullPath.includes('application')) {
      files.push(fullPath);
    }
  }
  return files;
}

function run() {
  const files = getFiles(path.join(process.cwd(), 'src/modules'));
  if (!files || files.length === 0) {
      console.log('No files found');
      return;
  }

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    const needsNotFound = content.includes('NotFoundException');
    const needsDomainError = content.includes('BadRequestException') || content.includes('UnauthorizedException') || content.includes('HttpException') || content.includes('HttpStatus');
    const needsForbidden = content.includes('ForbiddenException');
    const needsConflict = content.includes('ConflictException');

    if (!needsNotFound && !needsDomainError && !needsForbidden && !needsConflict) continue;

    content = content.replace(/new\s+NotFoundException\(([^)]+)\)/g, 'new NotFoundError($1)');
    content = content.replace(/new\s+BadRequestException\(([^)]+)\)/g, 'new DomainError($1, DomainErrorType.BUSINESS_RULE)');
    content = content.replace(/new\s+UnauthorizedException\(([^)]+)\)/g, 'new DomainError($1, DomainErrorType.UNAUTHORIZED)');
    content = content.replace(/new\s+ForbiddenException\(([^)]+)\)/g, 'new ForbiddenError($1)');
    content = content.replace(/new\s+ConflictException\(([^)]+)\)/g, 'new ConflictError($1)');
    
    content = content.replace(/new\s+HttpException\(\s*'([^']+)'\s*,\s*HttpStatus\.(NOT_FOUND)\s*\)/g, 'new NotFoundError(\'$1\')');
    content = content.replace(/new\s+HttpException\(\s*'([^']+)'\s*,\s*HttpStatus\.(BAD_REQUEST)\s*\)/g, 'new DomainError(\'$1\', DomainErrorType.BUSINESS_RULE)');
    content = content.replace(/new\s+HttpException\([^,]+,\s*HttpStatus\.[A-Z_]+\)/g, 'new DomainError(\'An error occurred\', DomainErrorType.INTERNAL_ERROR)');
    content = content.replace(/new\s+HttpException\(\s*([^,]+),\s*HttpStatus\.(BAD_REQUEST)\s*\)/g, 'new DomainError($1, DomainErrorType.BUSINESS_RULE)');

    ['NotFoundException', 'BadRequestException', 'UnauthorizedException', 'ForbiddenException', 'ConflictException', 'HttpException', 'HttpStatus'].forEach(exc => {
        content = content.replace(new RegExp(exc + '\\s*,\\s*', 'g'), '');
        content = content.replace(new RegExp(',\\s*' + exc, 'g'), '');
        content = content.replace(new RegExp('\\{\\s*' + exc + '\\s*\\}', 'g'), '{}');
    });
    
    content = content.replace(/import\s+\{\s*\}\s+from\s+['"]@nestjs\/common['"];?\r?\n/g, '');

    if (content !== original) {
      // Calculate depth dynamically based on 'src/modules/FEATURE/application/... 
      // Depth to src/ = length of string after 'src/' split by '/' minus 1
      const afterSrc = file.split(/src[\/\\]/)[1];
      const depth = afterSrc ? afterSrc.split(/[\/\\]/).length : 5;
      const upPath = Array(depth).fill('..').join('/');

      let newImports = '';
      if (needsNotFound && !content.includes('NotFoundError')) newImports += `import { NotFoundError } from '${upPath}/shared/errors/not-found.error';\n`;
      if (needsForbidden && !content.includes('ForbiddenError')) newImports += `import { ForbiddenError } from '${upPath}/shared/errors/forbidden.error';\n`;
      if (needsConflict && !content.includes('ConflictError')) newImports += `import { ConflictError } from '${upPath}/shared/errors/conflict.error';\n`;
      if (needsDomainError && !content.includes('DomainError')) newImports += `import { DomainError, DomainErrorType } from '${upPath}/shared/errors/domain.error';\n`;
      
      const match = content.match(/^import.*?;/m);
      if (match) {
         content = content.slice(0, match.index + match[0].length + 1) + '\n' + newImports + content.slice(match.index + match[0].length + 1);
      } else {
         content = newImports + content;
      }
      
      fs.writeFileSync(file, content);
      console.log('Fixed ' + file);
    }
  }
}

run();
