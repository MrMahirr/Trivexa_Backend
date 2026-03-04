import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const ENV_PATH = path.resolve(__dirname, '..', '.env');

const SECRET_KEYS = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const;

function generateSecret(): string {
  return crypto.randomBytes(64).toString('hex');
}

function main(): void {
  if (!fs.existsSync(ENV_PATH)) {
    console.warn('[!] .env dosyasi bulunamadi, olusturuluyor...');
    fs.writeFileSync(ENV_PATH, '', 'utf-8');
  }

  let content = fs.readFileSync(ENV_PATH, 'utf-8');
  const generated: string[] = [];
  const skipped: string[] = [];

  for (const key of SECRET_KEYS) {
    const regex = new RegExp('^' + key + '=(.*)$', 'm');
    const match = content.match(regex);

    if (match) {
      const currentValue = match[1].trim();
      if (currentValue.length > 0) {
        skipped.push(key);
        continue;
      }
      // Key exists but value is empty — fill it
      const secret = generateSecret();
      content = content.replace(regex, key + '=' + secret);
      generated.push(key);
    } else {
      // Key is missing entirely — append it
      const secret = generateSecret();
      const newline = content.endsWith('\n') ? '' : '\n';
      content += newline + key + '=' + secret + '\n';
      generated.push(key);
    }
  }

  fs.writeFileSync(ENV_PATH, content, 'utf-8');

  if (generated.length > 0) {
    console.log('Generated JWT secrets: ' + generated.join(', '));
  }
  if (skipped.length > 0) {
    console.log('Existing secrets preserved: ' + skipped.join(', '));
  }
  if (generated.length === 0) {
    console.log('All JWT secrets already exist, no changes made.');
  }
}

main();
