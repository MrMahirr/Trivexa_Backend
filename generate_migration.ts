import * as fs from 'fs';
import * as path from 'path';

const initDir = path.join(__dirname, 'docker/postgres/init');
const migrationsDir = path.join(__dirname, 'src/database/migrations');

if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
}

const files = fs.readdirSync(initDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

let combinedSql = '';
for (const file of files) {
    const content = fs.readFileSync(path.join(initDir, file), 'utf8');
    combinedSql += `-- File: ${file}\n${content}\n\n`;
}

// Escape backticks and ${} for template literal
const escapedSql = combinedSql
    .replace(/\\/g, '\\\\') // Escape backslashes first
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${');

const ts = Date.now();
const fileName = `${ts}_initial_schema.js`; // Keep output as .js for node-pg-migrate compatibility in standard mode

const migrationContent = `exports.shorthands = undefined;

exports.up = pgm => {
    pgm.sql(\`
${escapedSql}
    \`);
};

exports.down = pgm => {
    pgm.sql(\`
        DROP SCHEMA public CASCADE;
        CREATE SCHEMA public;
    \`);
};
`;

fs.writeFileSync(path.join(migrationsDir, fileName), migrationContent);
console.log(`Created migration: ${fileName}`);
