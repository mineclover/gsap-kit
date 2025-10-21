import { existsSync, mkdirSync, readdirSync, writeFileSync, watch } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SRC_PAGES = join(__dirname, '../src/pages');
const DIST_PAGES = join(__dirname, '../dist/pages');

// 페이지 폴더 스캔 (자동 감지)
function scanPages() {
  const pages = [];

  if (!existsSync(SRC_PAGES)) {
    console.error('❌ src/pages directory not found!');
    return pages;
  }

  const entries = readdirSync(SRC_PAGES, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const pageName = entry.name;
      const indexPath = join(SRC_PAGES, pageName, 'index.html');

      if (existsSync(indexPath)) {
        pages.push({
          name: pageName,
          title: pageName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
        });
      }
    }
  }

  // 알파벳 순 정렬
  return pages.sort((a, b) => a.name.localeCompare(b.name));
}

// 간단한 HTML 생성 (그루핑 없이)
function generateIndexHTML(pages) {
  const linksHTML = pages
    .map(
      page => `      <li>
        <a href="${page.name}/index.html" class="page-link">
          <span class="page-name">${page.title}</span>
          <span class="arrow">→</span>
        </a>
      </li>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GSAP Kit - Pages</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
      color: #333;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    h1 {
      text-align: center;
      color: white;
      font-size: 2.5rem;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }

    .subtitle {
      text-align: center;
      color: rgba(255, 255, 255, 0.9);
      font-size: 1.1rem;
      margin-bottom: 40px;
    }

    .page-list {
      background: white;
      border-radius: 15px;
      padding: 30px 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    ul {
      list-style: none;
    }

    li {
      margin-bottom: 10px;
    }

    .page-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 20px;
      background: #f8f9fa;
      border-radius: 8px;
      text-decoration: none;
      color: #333;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .page-link:hover {
      background: #667eea;
      color: white;
      border-color: #667eea;
      transform: translateX(5px);
    }

    .page-name {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .arrow {
      font-size: 1.3rem;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .page-link:hover .arrow {
      opacity: 1;
    }

    .footer {
      text-align: center;
      color: rgba(255, 255, 255, 0.9);
      margin-top: 40px;
      font-size: 0.9rem;
    }

    .count {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 5px 15px;
      border-radius: 20px;
      margin-top: 10px;
      font-weight: 600;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    li {
      animation: fadeIn 0.5s ease-out backwards;
    }

    ${pages.map((_, i) => `li:nth-child(${i + 1}) { animation-delay: ${i * 0.05}s; }`).join('\n    ')}
  </style>
</head>
<body>
  <div class="container">
    <h1>🎯 GSAP Kit</h1>
    <p class="subtitle">Available Pages</p>

    <div class="page-list">
      <ul>
${linksHTML}
      </ul>
    </div>

    <div class="footer">
      <p><strong>GSAP Kit</strong> - Animation Library</p>
      <p class="count">${pages.length} pages available</p>
      <p style="margin-top: 10px; opacity: 0.8;">
        Generated on ${new Date().toLocaleString('ko-KR')}
      </p>
    </div>
  </div>
</body>
</html>
`;
}

// 인덱스 생성
function generateIndex() {
  console.log('🔍 Scanning pages...');
  const pages = scanPages();

  if (pages.length === 0) {
    console.error('❌ No pages found!');
    return false;
  }

  console.log(`✅ Found ${pages.length} pages:`);
  for (const page of pages) {
    console.log(`   - ${page.title} (${page.name})`);
  }

  console.log('\n📝 Generating index.html...');
  const html = generateIndexHTML(pages);

  // dist/pages 디렉토리 확인 및 생성
  if (!existsSync(DIST_PAGES)) {
    mkdirSync(DIST_PAGES, { recursive: true });
  }

  const outputPath = join(DIST_PAGES, 'index.html');
  writeFileSync(outputPath, html, 'utf-8');

  console.log(`✅ Index generated at: ${outputPath}`);
  console.log(`🎉 Done!\n`);
  return true;
}

// Watch 모드
function startWatchMode() {
  console.log('👀 Watch mode started...');
  console.log(`📁 Watching: ${SRC_PAGES}\n`);

  // 초기 생성
  generateIndex();

  // 디렉토리 변경 감지
  const watcher = watch(
    SRC_PAGES,
    { recursive: true },
    (eventType, filename) => {
      if (filename) {
        console.log(`📝 File changed: ${filename}`);
        console.log(`🔄 Regenerating index...\n`);
        generateIndex();
      }
    }
  );

  // Ctrl+C 처리
  process.on('SIGINT', () => {
    console.log('\n👋 Stopping watch mode...');
    watcher.close();
    process.exit(0);
  });
}

// CLI 실행
const args = process.argv.slice(2);
const isWatchMode = args.includes('--watch') || args.includes('-w');

if (isWatchMode) {
  startWatchMode();
} else {
  generateIndex();
}
