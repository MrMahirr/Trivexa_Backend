const fs = require('fs');
const path = require('path');
const { Project, SyntaxKind } = require('ts-morph');

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

const run = () => {
    const project = new Project();
    project.addSourceFilesAtPaths("src/**/*.ts");

    // 1. Fix HttpStatus in API controllers
    const controllers = [
        'src/modules/auth/api/auth.controller.ts',
        'src/modules/clients/api/client-portal.controller.ts',
        'src/modules/landing/api/landing.controller.ts'
    ];
    controllers.forEach(ctrl => {
        const file = project.getSourceFile(path.join(process.cwd(), ctrl));
        if (file) {
            const nestjsImport = file.getImportDeclaration(d => d.getModuleSpecifierValue() === '@nestjs/common');
            if (nestjsImport && !nestjsImport.getNamedImports().some(n => n.getName() === 'HttpStatus')) {
                nestjsImport.addNamedImport('HttpStatus');
            }
        }
    });

    // 2. Refactor domain/*.errors.ts away from HttpException
    const domainFiles = getFiles(path.join(process.cwd(), 'src', 'modules')).filter(f => f.includes('domain') && f.endsWith('.errors.ts'));
    
    domainFiles.forEach(fullPath => {
        const file = project.getSourceFile(fullPath);
        if (!file) return;

        let modified = false;

        // Try to replace 'extends HttpException' with 'extends DomainError' or 'NotFoundError' based on content
        const classes = file.getClasses();
        classes.forEach(cls => {
            const baseClass = cls.getBaseClass();
            if (cls.getExtends() && cls.getExtends().getText() === 'HttpException') {
                const text = cls.getText();
                
                let replacement = 'DomainError';
                if (text.includes('NOT_FOUND')) replacement = 'NotFoundError';
                else if (text.includes('CONFLICT')) replacement = 'ConflictError';
                else if (text.includes('FORBIDDEN') || text.includes('UNAUTHORIZED')) replacement = 'ForbiddenError';

                cls.setExtends(replacement);

                // Fix constructors: super("Message", HttpStatus.NOT_FOUND) -> super("Message", DomainErrorType.NOT_FOUND... wait no)
                // For NotFoundError: super("Message")
                const ctors = cls.getConstructors();
                ctors.forEach(ctor => {
                     ctor.getStatements().forEach(stmt => {
                         if (stmt.getText().startsWith('super(')) {
                             const match = stmt.getText().match(/super\(\s*(.*?)\s*,/);
                             if (match) {
                                  if (replacement === 'DomainError') {
                                       stmt.replaceWithText(`super(${match[1]}, ${text.includes('BAD_REQUEST') ? 'DomainErrorType.BUSINESS_RULE' : 'DomainErrorType.INTERNAL_ERROR'});`);
                                  } else {
                                       stmt.replaceWithText(`super(${match[1]});`);
                                  }
                             }
                         }
                     });
                });

                modified = true;
            }
        });

        // Strip HttpException and HttpStatus imports
        const httpExcImport = file.getImportDeclaration(d => d.getModuleSpecifierValue() === '@nestjs/common');
        if (httpExcImport) {
            const named = httpExcImport.getNamedImports();
            const toRemove = named.filter(n => n.getName() === 'HttpException' || n.getName() === 'HttpStatus');
            toRemove.forEach(n => n.remove());
            if (httpExcImport.getNamedImports().length === 0) {
                httpExcImport.remove();
            }
            modified = true;
        }

        // Add correct domain imports
        if (modified) {
            const relativeModule = (target) => {
                const targetPath = path.join(process.cwd(), 'src', 'shared', 'errors', target);
                let rel = path.relative(path.dirname(fullPath), targetPath).replace(/\\/g, '/');
                if (!rel.startsWith('.')) rel = './' + rel;
                return rel.replace(/\.ts$/, '');
            };

            const addImportFor = (exc, moduleFile) => {
                if (file.getText().includes(exc) && !file.getImportDeclaration(d => d.getModuleSpecifierValue().includes(moduleFile.replace('.ts', '')))) {
                    file.addImportDeclaration({
                        namedImports: [exc],
                        moduleSpecifier: relativeModule(moduleFile)
                    });
                }
            };
            
            addImportFor('DomainError', 'domain.error.ts');
            addImportFor('DomainErrorType', 'domain.error.ts');
            addImportFor('NotFoundError', 'not-found.error.ts');
            addImportFor('ConflictError', 'conflict.error.ts');
            addImportFor('ForbiddenError', 'forbidden.error.ts');
        }
    });

    // 3. Fix broken Relative Paths for 'shared' imports across the whole project
    const allFiles = project.getSourceFiles();
    allFiles.forEach(file => {
        let modified = false;
        const imports = file.getImportDeclarations();
        imports.forEach(imp => {
            const val = imp.getModuleSpecifierValue();
            if (val.includes('shared/') && !val.includes('@nestjs')) {
                // If it fails to resolve, the path is wrong.
                const absoluteTargetObj = imp.getModuleSpecifierSourceFile(); 
                if (!absoluteTargetObj) {
                    // It's a broken path. Let's redirect it to the actual absolute path in src/shared/
                    const parts = val.split('shared/');
                    const suffix = parts[1]; // e.g. "errors/domain.error"
                    const targetPath = path.join(process.cwd(), 'src', 'shared', suffix);
                    
                    if (fs.existsSync(targetPath + '.ts')) {
                        let rel = path.relative(path.dirname(file.getFilePath()), targetPath).replace(/\\/g, '/');
                        if (!rel.startsWith('.')) rel = './' + rel;
                        imp.setModuleSpecifier(rel);
                        modified = true;
                    }
                }
            }
        });
        
        // Fix TS2307 for event.constants.ts missing
        if (file.getText().includes('event.constants') && file.getText().includes("Cannot find module")) {
             // Let the absolute target obj block above fix it.
        }
    });

    project.saveSync();
    console.log("AST Recovery Script Completed");
};

run();
