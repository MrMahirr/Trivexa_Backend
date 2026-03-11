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

  if (content.includes('shared/dto/api-response.dto')) {
    const fileDir = path.dirname(path.resolve(f));
    let relPath = path.relative(
      fileDir,
      path.resolve('src/shared/dto/api-response.dto'),
    );

    relPath = relPath.replace(/\\/g, '/');
    if (!relPath.startsWith('.')) {
      relPath = './' + relPath;
    }

    if (relPath.endsWith('.ts')) {
      relPath = relPath.substring(0, relPath.length - 3);
    }

    const regex = /from\s+['"]([./]+shared\/dto\/api-response(?:\.dto)?)['"]/g;
    newContent = newContent.replace(regex, `from '${relPath}'`);

    if (content !== newContent) {
      fs.writeFileSync(f, newContent, 'utf8');
      changed++;
    }
  }
});
console.log('Fixed ' + changed + ' files.');
