const fs = require('fs');
const lines = fs.readFileSync('fresh_ts_errors_utf8.txt', 'utf8').split('\n');
const out = lines.map((line, i) => `[${i}] ${line.trim()}`).join('\n');
fs.writeFileSync('errors_readable.txt', out, 'utf8');
console.log('Done. ' + lines.length + ' lines.');
