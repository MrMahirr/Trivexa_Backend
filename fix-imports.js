const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('src/modules');
let changed = 0;

files.forEach((f) => {
  let content = fs.readFileSync(f, 'utf8');
  let newContent = content;

  const fUnix = f.replace(/\\/g, '/');

  // Controllers under finance (5 levels: src/modules/finance/x/api/x.controller.ts)
  if (fUnix.match(/finance\/.*?\/api\/.*?\.controller\.ts/)) {
    newContent = newContent.replace(
      /'\.\.\/\.\.\/\.\.\/\.\.\/shared\/dto\/api-response\.dto'/g,
      "'../../../../../shared/dto/api-response.dto'",
    );
  }
  // DTOs under finance (6 levels: src/modules/finance/x/api/dto/response/*.ts)
  else if (fUnix.match(/finance\/.*?\/api\/dto\/response/)) {
    newContent = newContent.replace(
      /'\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/shared\/dto\/api-response\.dto'/g,
      "'../../../../../../shared/dto/api-response.dto'",
    );
  }
  // DTOs under other modules (5 levels: src/modules/x/api/dto/response/*.ts)
  else if (fUnix.match(/api\/dto\/response/)) {
    if (content.includes("'../../../../shared/dto/api-response.dto'")) {
      newContent = newContent.replace(
        /'\.\.\/\.\.\/\.\.\/\.\.\/shared\/dto\/api-response\.dto'/g,
        "'../../../../../shared/dto/api-response.dto'",
      );
    }
  }

  if (content !== newContent) {
    fs.writeFileSync(f, newContent, 'utf8');
    changed++;
  }
});

console.log('Fixed ' + changed + ' files.');
