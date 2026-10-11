import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';
import { marked } from 'marked';
import { execSync } from 'child_process';

async function generateDocs() {
  try {
    console.log(
      '⏳ Adım 1: NestJS uygulaması başlatılıyor ve Swagger spec alınıyor...',
    );
    const app = await NestFactory.create(AppModule, { logger: false });
    app.setGlobalPrefix('api/v1');

    const config = new DocumentBuilder()
      .setTitle('Trivexa API')
      .setDescription('Trivexa backend API dokümantasyonu')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
        'access-token',
      )
      .addTag('Auth', 'Kimlik doğrulama işlemleri')
      .addTag('Users', 'Kullanıcı yönetimi')
      .addTag('Clients', 'Müşteri (Firma) yönetimi')
      .addTag('Projects', 'Proje yönetimi')
      .addTag('Tasks', 'Görev yönetimi')
      .addTag('TimeTracking', 'Zaman takibi ve Worklog')
      .addTag('Tickets', 'Destek talepleri')
      .addTag('Invoices', 'Faturalar')
      .addTag('Expenses', 'Giderler')
      .addTag('Payments', 'Ödemeler')
      .addTag('Contracts', 'Sözleşmeler')
      .addTag('Meetings', 'Toplantı yönetimi')
      .addTag('Departments', 'Departman yönetimi')
      .addTag('Roles', 'Görev/Rol yetkilendirmeleri')
      .addTag('Reports', 'Raporlama sistemi')
      .addTag('Notifications', 'Bildirim yönetimi')
      .addTag('Files', 'Dosya yükleme & storage')
      .addTag('Audit', 'Denetim kayıtları')
      .addTag('Health', 'Sistem durumu')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    const docsDir = path.resolve(__dirname, '../docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    const swaggerSpecPath = path.join(docsDir, 'swagger-spec.json');
    fs.writeFileSync(swaggerSpecPath, JSON.stringify(document, null, 2));

    const endpointCount = Object.keys(document.paths).reduce(
      (acc, currentPath) =>
        acc + Object.keys(document.paths[currentPath]).length,
      0,
    );
    console.log(`✅ Swagger spec alındı (${endpointCount} endpoint)`);

    await app.close();

    console.log('⏳ Adım 2: Redoc ile HTML üretiliyor...');
    const redocHtmlPath = path.join(docsDir, 'redoc.html');
    execSync(
      `npx redoc-cli bundle ${swaggerSpecPath} -o ${redocHtmlPath} --title "Trivexa API Dokümantasyonu" --disableSearch`,
      { stdio: 'inherit' },
    );
    console.log('✅ HTML oluşturuldu');

    console.log(
      '⏳ Adım 3 & 5 & 6: Markdown dosyaları ekleniyor ve Cover Page oluşturuluyor...',
    );

    // Create cover page and TOC HTML
    const dateStr = new Date().toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
    });
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'),
    );

    // Generate TOC from Swagger Tags
    let tocHtml = `<h2 style="margin-top:20px;">İçindekiler Tablosu / Hedef Modüller</h2><ul>`;
    for (const tag of document.tags || []) {
      const endpointsInTag = Object.values(document.paths).flatMap((pathItem) =>
        Object.values(pathItem).filter(
          (operation: any) =>
            operation.tags && operation.tags.includes(tag.name),
        ),
      ).length;
      tocHtml += `<li><strong>${tag.name}</strong>: ${tag.description} <i>(${endpointsInTag} endpoint)</i></li>`;
    }
    tocHtml += `</ul>`;

    let customHtml = `
      <div style="page-break-after: always; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; font-family: Inter, system-ui, sans-serif; text-align: center;">
        <h1 style="font-size: 48px; margin-bottom: 10px;">Trivexa API Dokümantasyonu</h1>
        <p style="font-size: 24px; color: #555;">Versiyon ${pkg.version}</p>
        <p style="font-size: 18px; color: #777;">Ortam: ${process.env.NODE_ENV || 'development'}</p>
        <p style="font-size: 16px; color: #999; margin-top: 50px;">Oluşturulma Tarihi: ${dateStr}</p>
      </div>
      <div style="page-break-after: always; padding: 40px; font-family: Inter, system-ui, sans-serif;">
        ${tocHtml}
      </div>
    `;

    const mdFiles = ['README.md', 'ARCHITECTURE.md', 'AUTH.md', 'DATABASE.md'];
    for (const file of mdFiles) {
      const filePath = path.join(docsDir, file);
      if (fs.existsSync(filePath)) {
        const mdContent = fs.readFileSync(filePath, 'utf-8');
        customHtml += `<div style="page-break-after: always; padding: 40px; font-family: Inter, system-ui, sans-serif;">\n`;
        customHtml += await marked.parse(mdContent);
        customHtml += `</div>\n`;
      }
    }
    console.log('✅ Markdown dosyaları eklendi');

    console.log('⏳ Adım 4 & 5: Puppeteer ile PDF oluşturuluyor...');
    let finalHtml = fs.readFileSync(redocHtmlPath, 'utf-8');

    // Inject our custom HTML right after <body>
    finalHtml = finalHtml.replace('<body>', `<body>\n${customHtml}`);

    // Ensure redoc container has pagebreaks where needed if we want, but redoc handles its own print styles.
    const tempHtmlPath = path.join(docsDir, 'final.html');
    fs.writeFileSync(tempHtmlPath, finalHtml);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Load the HTML file via file:// protocol so local assets load correctly if any
    await page.goto('file://' + tempHtmlPath, { waitUntil: 'networkidle0' });

    const pdfPath = path.join(docsDir, 'trivexa-api-docs.pdf');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      displayHeaderFooter: true,
      headerTemplate: `<div style="font-size:9px; width:100%; text-align:center; color:#666;">
        Trivexa API Dokümantasyonu
      </div>`,
      footerTemplate: `<div style="font-size:9px; width:100%; text-align:center; color:#666;">
        Sayfa <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>`,
    });

    await browser.close();

    // Clean up temp files
    fs.unlinkSync(swaggerSpecPath);
    fs.unlinkSync(redocHtmlPath);
    fs.unlinkSync(tempHtmlPath);

    const stats = fs.statSync(pdfPath);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`✅ ${pdfPath} kaydedildi (${sizeMb} MB)`);
  } catch (error) {
    console.error('❌ PDF oluşturma işlemi sırasında bir hata oluştu:', error);
    process.exit(1);
  }
}

generateDocs();
