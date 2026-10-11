const { Project } = require('ts-morph');
const fs = require('fs');
const path = require('path');

function run() {
  const log = fs.readFileSync('ts_errors_utf8.log', 'utf8');
  const lines = log.split('\n');

  const missingImports = {};

  for (const line of lines) {
    const fileMatch = line.match(/^([a-zA-Z0-9_.\-\/\\]+\.ts)[\(:]/);
    if (!fileMatch) continue;
    
    // Normalize to POSIX for consistency
    const file = fileMatch[1].replace(/\\/g, '/');
    if (!missingImports[file]) missingImports[file] = new Set();
    
    if (line.match(/'NotFoundError'/)) missingImports[file].add('NotFoundError');
    if (line.match(/'DomainError'/)) missingImports[file].add('DomainError');
    if (line.match(/'ForbiddenError'/)) missingImports[file].add('ForbiddenError');
    if (line.match(/'ConflictError'/)) missingImports[file].add('ConflictError');
    if (line.match(/'DomainErrorType'/)) missingImports[file].add('DomainErrorType');
  }

  const project = new Project();
  project.addSourceFilesAtPaths("src/**/*.ts");

  let modifiedCount = 0;
  
  const rootSrc = path.join(process.cwd(), 'src');

  for (const [fileRelPath, imports] of Object.entries(missingImports)) {
    if (imports.size === 0) continue;
    
    // We already read the file path from the TS log, e.g., 'src/modules/auth/application/usecases/register.usecase.ts'
    const fullSourcePath = path.join(process.cwd(), fileRelPath);
    const sourceDir = path.dirname(fullSourcePath);
    
    const sourceFile = project.getSourceFile(fullSourcePath);
    
    if (!sourceFile) {
        console.log(`Could not load source file: ${fullSourcePath}`);
        continue;
    }

    const calculateRelativeModule = (targetFileName) => {
        const targetPath = path.join(rootSrc, 'shared', 'errors', targetFileName);
        let rel = path.relative(sourceDir, targetPath).replace(/\\/g, '/');
        if (!rel.startsWith('.')) rel = './' + rel;
        // Strip the .ts extension
        return rel.replace(/\.ts$/, '');
    };

    if (imports.has('NotFoundError') && !sourceFile.getImportDeclaration(d => d.getModuleSpecifierValue().includes('not-found.error'))) {
        sourceFile.addImportDeclaration({
            namedImports: ['NotFoundError'],
            moduleSpecifier: calculateRelativeModule('not-found.error.ts')
        });
    }
    
    if (imports.has('ForbiddenError') && !sourceFile.getImportDeclaration(d => d.getModuleSpecifierValue().includes('forbidden.error'))) {
        sourceFile.addImportDeclaration({
            namedImports: ['ForbiddenError'],
            moduleSpecifier: calculateRelativeModule('forbidden.error.ts')
        });
    }

    if (imports.has('ConflictError') && !sourceFile.getImportDeclaration(d => d.getModuleSpecifierValue().includes('conflict.error'))) {
        sourceFile.addImportDeclaration({
            namedImports: ['ConflictError'],
            moduleSpecifier: calculateRelativeModule('conflict.error.ts')
        });
    }

    const domainImpParts = [];
    if (imports.has('DomainError')) domainImpParts.push('DomainError');
    if (imports.has('DomainErrorType')) domainImpParts.push('DomainErrorType');
    
    if (domainImpParts.length > 0) {
        const existingDomainImport = sourceFile.getImportDeclaration(d => d.getModuleSpecifierValue().includes('domain.error'));
        
        if (existingDomainImport) {
             for(const imp of domainImpParts) {
                 if (!existingDomainImport.getNamedImports().some(n => n.getName() === imp)) {
                     existingDomainImport.addNamedImport(imp);
                 }
             }
        } else {
             sourceFile.addImportDeclaration({
                namedImports: domainImpParts,
                moduleSpecifier: calculateRelativeModule('domain.error.ts')
            });
        }
    }
    
    sourceFile.saveSync();
    console.log(`Injected AST imports into ${fileRelPath}`);
    modifiedCount++;
  }
  
  console.log(`Total files modified: ${modifiedCount}`);
}

run();
