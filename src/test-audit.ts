import * as http from 'http';
import * as fs from 'fs';

function request(options: any, postData?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function run() {
  try {
    const loginData = JSON.stringify({ email: 'admin@trivexa.com', password: 'password123' });
    const loginRes = await request({
      hostname: 'localhost',
      port: 3500,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    }, loginData);

    const token = JSON.parse(loginRes.data).data.accessToken;

    const auditRes = await request({
      hostname: 'localhost',
      port: 3500,
      path: '/api/v1/audit?page=1&limit=15',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Status:', auditRes.status);
    fs.writeFileSync('audit-error.json', auditRes.data);
    console.log('Wrote to audit-error.json');
  } catch (e: any) {
    console.error(e.message);
  }
}
run();
