const fs = require('fs');
const path = require('path');

function run() {
  if (!fs.existsSync('ts_errors.log')) {
    console.log('ts_errors.log not found.');
    return;
  }
  const log = fs.readFileSync('ts_errors.log', 'utf8');
  const lines = log.split('\n');

  const missingImports = {};

  for (const line of lines) {
    const fileMatch = line.match(/^([a-zA-Z0-9_.\-\/\\]+\.ts):\d+:\d+ - error/);
    if (!fileMatch) continue;
    
    const file = fileMatch[1].replace(/\\/g, '/');
    if (!missingImports[file]) missingImports[file] = new Set();
    
    if (line.includes("Cannot find name 'NotFoundError'") || line.includes("'NotFoundError' only refers to a type")) {
      missingImports[file].add('NotFoundError');
    }
    if (line.includes("Cannot find name 'DomainError'") || line.includes("'DomainError' only refers to a type")) {
      missingImports[file].add('DomainError');
    }
    if (line.includes("Cannot find name 'ForbiddenError'") || line.includes("'ForbiddenError' only refers to a type")) {
      missingImports[file].add('ForbiddenError');
    }
    if (line.includes("Cannot find name 'ConflictError'") || line.includes("'ConflictError' only refers to a type")) {
      missingImports[file].add('ConflictError');
    }
    if (line.includes("Cannot find name 'DomainErrorType'") || line.includes("has no exported member 'DomainErrorType'")) {
      missingImports[file].add('DomainErrorType');
    }
  }

  for (const [file, imports] of Object.entries(missingImports)) {
    if (imports.size === 0) continue;
    
    const fullPath = path.join(process.cwd(), file);
    if (!fs.existsSync(fullPath)) continue;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    const parts = file.split('/');
    const srcIndex = parts.indexOf('src');
    const nestDepth = parts.length - srcIndex - 1;
    const upPath = Array(nestDepth - 1).fill('..').join('/');
    
    let newLines = '';
    
    if (imports.has('NotFoundError') && !content.includes('NotFoundError')) {
        newLines += `import { NotFoundError } from '${upPath}/shared/errors/not-found.error';\n`;
    }
    if (imports.has('ForbiddenError') && !content.includes('ForbiddenError')) {
        newLines += `import { ForbiddenError } from '${upPath}/shared/errors/forbidden.error';\n`;
    }
    if (imports.has('ConflictError') && !content.includes('ConflictError')) {
        newLines += `import { ConflictError } from '${upPath}/shared/errors/conflict.error';\n`;
    }
    
    const domainImpParts = [];
    if (imports.has('DomainError') && !content.includes('{ DomainError')) domainImpParts.push('DomainError');
    if (imports.has('DomainErrorType') && !content.includes('DomainErrorType')) domainImpParts.push('DomainErrorType');
    
    if (domainImpParts.length > 0) {
        newLines += `import { ${domainImpParts.join(', ')} } from '${upPath}/shared/errors/domain.error';\n`;
    }
    
    if (newLines) {
       const matchLines = content.match(/^import.*?['"];?\r?\n/m);
       if (matchLines) {
           content = content.slice(0, matchLines.index + matchLines[0].length) + newLines + content.slice(matchLines.index + matchLines[0].length);
       } else {
           content = newLines + content;
       }
       fs.writeFileSync(fullPath, content);
       console.log('Injected imports to ' + file);
    }
  }
}

run();
