/**
 * Mermaid Diyagram → PDF Dönüştürücü
 * 
 * Tüm .mmd dosyalarını Puppeteer + yerel Mermaid.js kullanarak
 * çok sayfalı PDF'lere dönüştürür.
 * 
 * Kullanım: node docs/architecture/diagrams/convert-to-pdf.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DIAGRAMS_DIR = path.join(__dirname);
const DIAGRAMS_SUBDIR = path.join(__dirname, 'Diagrams');
const OUTPUT_DIR = path.join(__dirname, 'pdf');
const MERMAID_JS_PATH = path.join(__dirname, 'mermaid.min.js');

// Mermaid.js'i oku
const MERMAID_JS_CONTENT = fs.readFileSync(MERMAID_JS_PATH, 'utf-8');

// Tüm .mmd dosyalarını bul
function findMmdFiles(dir) {
    const files = [];
    if (!fs.existsSync(dir)) return files;
    for (const entry of fs.readdirSync(dir).sort()) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isFile() && entry.endsWith('.mmd')) {
            files.push(fullPath);
        }
    }
    return files;
}

// .mmd dosyasından yorum ve diyagram içeriğini ayır
function extractContent(mmdContent) {
    const lines = mmdContent.split(/\r?\n/);
    const commentLines = [];
    const diagramLines = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('%%')) {
            commentLines.push(trimmed.replace(/^%%\s*/, ''));
        } else {
            diagramLines.push(line);
        }
    }

    return {
        description: commentLines.join('\n'),
        diagram: diagramLines.join('\n').trim()
    };
}

// Mermaid diyagramını HTML'e çevir (local JS ile)
function buildHtml(title, description, mmdContent) {
    // HTML'de special karakterleri temizle
    const safeTitle = title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeDesc = description.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: white;
            padding: 25px 30px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 12px;
            border-bottom: 2px solid #3498db;
        }
        
        .header h1 {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 6px;
        }
        
        .header .description {
            font-size: 10px;
            color: #7f8c8d;
            line-height: 1.4;
            max-width: 650px;
            margin: 0 auto;
            white-space: pre-line;
        }
        
        .diagram-container {
            display: flex;
            justify-content: center;
            width: 100%;
        }
        
        .mermaid {
            width: 100%;
        }
        
        .mermaid svg {
            max-width: 100% !important;
            height: auto !important;
        }

        .footer {
            text-align: center;
            font-size: 8px;
            color: #bdc3c7;
            margin-top: 15px;
            padding-top: 8px;
            border-top: 1px solid #ecf0f1;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${safeTitle}</h1>
        ${safeDesc ? '<div class="description">' + safeDesc + '</div>' : ''}
    </div>
    
    <div class="diagram-container">
        <div class="mermaid">
${mmdContent}
        </div>
    </div>
    
    <div class="footer">
        Trivexa Ajans Yönetim Sistemi — Mimari Diyagramlar
    </div>
    
    <script>${MERMAID_JS_CONTENT}</script>
    <script>
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis',
                padding: 12
            },
            er: {
                useMaxWidth: true,
                fontSize: 11
            },
            securityLevel: 'loose',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        });
    </script>
</body>
</html>`;
}

async function convertToPdf(browser, mmdFilePath, outputDir) {
    const filename = path.basename(mmdFilePath, '.mmd');
    const pdfPath = path.join(outputDir, `${filename}.pdf`);

    process.stdout.write(`  📄 ${filename}...`);

    const mmdContent = fs.readFileSync(mmdFilePath, 'utf-8');
    const { description, diagram } = extractContent(mmdContent);

    // Başlığı dosya adından al
    const title = filename
        .replace(/^\d+\.\s*/, '')
        .replace(/-/g, ' ')
        .replace(/_/g, ' ');

    const html = buildHtml(title, description, diagram);

    const page = await browser.newPage();

    try {
        // HTML'i file:/// protokolü yerine data URL olarak yükle
        await page.setContent(html, {
            waitUntil: 'load',
            timeout: 30000
        });

        // Mermaid'in renderlamasını bekle
        await page.waitForFunction(() => {
            const svg = document.querySelector('.mermaid svg');
            return svg !== null;
        }, { timeout: 15000 });

        // Render tamamlansın
        await new Promise(r => setTimeout(r, 1500));

        // SVG boyutlarını öğren
        const dims = await page.evaluate(() => {
            const svg = document.querySelector('.mermaid svg');
            if (!svg) return { w: 800, h: 600 };
            const rect = svg.getBoundingClientRect();
            return { w: Math.ceil(rect.width), h: Math.ceil(rect.height) };
        });

        // Diyagram yataysa landscape, dikeyse portrait
        const isLandscape = dims.w > dims.h;

        // PDF oluştur - otomatik çok sayfalı
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            landscape: isLandscape,
            printBackground: true,
            margin: {
                top: '15mm',
                right: '10mm',
                bottom: '15mm',
                left: '10mm'
            },
            scale: isLandscape ? 0.65 : 0.7
        });

        const sizeMB = (fs.statSync(pdfPath).size / 1024).toFixed(0);
        console.log(` ✅ (${sizeMB} KB)`);

        return { file: filename, success: true };

    } catch (error) {
        console.log(` ❌ ${error.message.substring(0, 60)}`);
        return { file: filename, success: false, error: error.message };

    } finally {
        await page.close();
    }
}

async function main() {
    console.log('🚀 Mermaid Diyagram → PDF Dönüştürme\n');

    // Çıktı klasörlerini oluştur
    const rootPdfDir = OUTPUT_DIR;
    const subPdfDir = path.join(OUTPUT_DIR, 'Diagrams');

    fs.mkdirSync(rootPdfDir, { recursive: true });
    fs.mkdirSync(subPdfDir, { recursive: true });

    const rootFiles = findMmdFiles(DIAGRAMS_DIR);
    const subFiles = findMmdFiles(DIAGRAMS_SUBDIR);

    console.log(`📁 Toplam ${rootFiles.length + subFiles.length} dosya bulundu\n`);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const results = [];

    console.log('📂 Kök Dizin:');
    for (const file of rootFiles) {
        results.push(await convertToPdf(browser, file, rootPdfDir));
    }

    console.log('\n📂 Diagrams:');
    for (const file of subFiles) {
        results.push(await convertToPdf(browser, file, subPdfDir));
    }

    await browser.close();

    const ok = results.filter(r => r.success).length;
    const fail = results.filter(r => !r.success).length;

    console.log(`\n${'─'.repeat(50)}`);
    console.log(`✅ Başarılı: ${ok}  ❌ Başarısız: ${fail}`);
    console.log(`📁 Çıktı: ${OUTPUT_DIR}`);

    if (fail > 0) {
        console.log('\nBaşarısız dosyalar:');
        results.filter(r => !r.success).forEach(r =>
            console.log(`  - ${r.file}: ${r.error}`)
        );
    }
}

main().catch(err => {
    console.error('Kritik hata:', err);
    process.exit(1);
});
