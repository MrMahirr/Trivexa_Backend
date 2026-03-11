const fs = require('fs');

let out = '';
try {
  const eslintData = JSON.parse(fs.readFileSync('eslint.json', 'utf8'));
  const eslintErrors = eslintData.filter(file => file.errorCount > 0);
  
  out += `--- ESLINT ERRORS (${eslintErrors.length} files) ---\n`;
  eslintErrors.forEach(file => {
    out += `\nFile: ${file.filePath}\n`;
    file.messages.filter(m => m.severity === 2).forEach(msg => {
      out += `  Line ${msg.line}:${msg.column} - ${msg.message} (${msg.ruleId})\n`;
    });
  });
} catch(e) {
  out += 'ESLint JSON not ready or failed to parse.\n';
}

try {
  const jestData = JSON.parse(fs.readFileSync('jest-report.json', 'utf8'));
  const failedSuites = jestData.testResults.filter(suite => suite.status === 'failed');
  
  out += `\n\n--- JEST ERRORS (${failedSuites.length} suites failed) ---\n`;
  failedSuites.forEach(suite => {
    out += `\nSuite: ${suite.name}\n`;
    out += `Message: ${suite.message.split('\\n').slice(0, 50).join('\\n')}\n`;
  });
} catch(e) {
  out += 'Jest JSON not ready or failed to parse.\n';
}

fs.writeFileSync('errors_readable.txt', out);
console.log('Done reading to errors_readable.txt');
