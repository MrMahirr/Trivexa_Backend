const fs = require('fs');
const data = JSON.parse(fs.readFileSync('jest-report.json', 'utf8'));
const errors = [];
data.testResults.forEach((res) => {
  res.assertionResults.forEach((a) => {
    if (a.status === 'failed') {
      errors.push(
        `[${res.name.split('/').pop()}] ${a.title}\n${a.failureMessages.join('\n')}`,
      );
    }
  });
});
fs.writeFileSync('extracted_test_errors.txt', errors.join('\n\n---\n\n'));
