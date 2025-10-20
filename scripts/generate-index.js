import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SRC_PAGES = join(__dirname, '../src/pages');
const DIST_PAGES = join(__dirname, '../dist/pages');

// 페이지 메타데이터 설정 (아이콘, 태그 등)
const PAGE_METADATA = {
  'basic': {
    icon: '✨',
    title: '기본 애니메이션',
    description: 'Fade, Slide, Rotate 등 기본 애니메이션 효과를 테스트할 수 있습니다.',
    tags: ['Fade', 'Slide', 'Rotate']
  },
  'draggable': {
    icon: '🎯',
    title: '드래그 & 인터랙션',
    description: 'GSAP Draggable 플러그인을 활용한 다양한 드래그 기능을 체험할 수 있습니다.',
    tags: ['Draggable', 'Snap', 'Slider']
  },
  'scroll': {
    icon: '📜',
    title: '스크롤 애니메이션',
    description: 'ScrollTrigger 플러그인을 활용한 스크롤 기반 애니메이션 효과입니다.',
    tags: ['ScrollTrigger', 'Parallax', 'Pin']
  },
  'line-matching': {
    icon: '🔗',
    title: '선 연결 매칭',
    description: 'SVG 기반 포인트 간 선 연결 매칭 게임입니다. 드래그 앤 드롭으로 선을 연결하고 정답/오답 피드백을 받을 수 있습니다.',
    tags: ['SVG', 'Matching', 'Interactive'],
    badge: 'NEW'
  },
  'custom-cursor': {
    icon: '🎨',
    title: 'SVG Marker-End 데모',
    description: 'SVG marker-end 속성을 활용한 화살표 렌더링 데모입니다. 실시간으로 파라미터를 조정하고 결과를 확인할 수 있습니다.',
    tags: ['SVG', 'Marker', 'Interactive'],
    badge: 'NEW'
  },
  'stroke-preview': {
    icon: '✏️',
    title: 'Stroke 프리뷰',
    description: '다양한 선 스타일(solid, dashed, dotted, animated-dash, arrow)을 비교하고 테스트할 수 있는 페이지입니다.',
    tags: ['SVG', 'Stroke', 'Styles']
  },
  'preview': {
    icon: '👁️',
    title: '개발 프리뷰',
    description: 'TypeScript 개발용 라이브 프리뷰 페이지입니다. 코드 변경사항을 실시간으로 확인할 수 있습니다.',
    tags: ['Dev', 'Preview', 'TypeScript']
  }
};

// 페이지 폴더 스캔
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
        const metadata = PAGE_METADATA[pageName] || {
          icon: '📄',
          title: pageName.charAt(0).toUpperCase() + pageName.slice(1),
          description: `${pageName} 페이지입니다.`,
          tags: ['Demo']
        };

        pages.push({
          name: pageName,
          ...metadata
        });
      }
    }
  }

  return pages;
}

// HTML 생성
function generateIndexHTML(pages) {
  const cardsHTML = pages.map((page, index) => {
    const badgeHTML = page.badge ? `<span class="new-badge">${page.badge}</span>` : '';
    const tagsHTML = page.tags.map(tag => `<span class="example-tag">${tag}</span>`).join('\n        ');

    return `      <a href="${page.name}/index.html" class="example-card" style="animation-delay: ${(index + 1) * 0.1}s;">
        <div class="example-icon">${page.icon}</div>
        <div class="example-title">${page.title}${badgeHTML}</div>
        <div class="example-description">
          ${page.description}
        </div>
        ${tagsHTML}
      </a>`;
  }).join('\n\n');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GSAP Kit - Examples</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
      color: #333;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      text-align: center;
      color: white;
      font-size: 3rem;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }

    .subtitle {
      text-align: center;
      color: rgba(255, 255, 255, 0.9);
      font-size: 1.2rem;
      margin-bottom: 50px;
    }

    .examples-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 30px;
      margin-bottom: 40px;
    }

    .example-card {
      background: white;
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      display: block;
    }

    .example-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    }

    .example-icon {
      font-size: 3rem;
      margin-bottom: 15px;
    }

    .example-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 10px;
    }

    .example-description {
      font-size: 1rem;
      color: #666;
      line-height: 1.6;
      margin-bottom: 15px;
    }

    .example-tag {
      display: inline-block;
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: bold;
      margin-right: 8px;
      margin-top: 8px;
    }

    .new-badge {
      background: #4CAF50;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: bold;
      margin-left: 10px;
    }

    .footer {
      text-align: center;
      color: rgba(255, 255, 255, 0.9);
      margin-top: 50px;
      padding: 20px;
    }

    .footer a {
      color: white;
      text-decoration: none;
      font-weight: bold;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    .build-info {
      text-align: center;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
      margin-top: 20px;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .example-card {
      animation: fadeInUp 0.6s ease-out backwards;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎯 GSAP Kit Examples</h1>
    <p class="subtitle">순수 JavaScript와 GSAP CDN을 사용하는 재사용 가능한 인터랙션 함수 라이브러리</p>

    <div class="examples-grid">
${cardsHTML}
    </div>

    <div class="footer">
      <p>
        <strong>GSAP Kit</strong> - 순수 JavaScript로 만드는 아름다운 인터랙션 ✨
      </p>
      <p style="margin-top: 10px;">
        <a href="https://github.com/mineclover/gsap-kit" target="_blank">GitHub</a> |
        <a href="https://gsap.com/docs/" target="_blank">GSAP Docs</a>
      </p>
      <p class="build-info">
        Generated on ${new Date().toLocaleString('ko-KR')} | ${pages.length} pages
      </p>
    </div>
  </div>
</body>
</html>
`;
}

// 메인 실행
console.log('🔍 Scanning pages...');
const pages = scanPages();

if (pages.length === 0) {
  console.error('❌ No pages found!');
  process.exit(1);
}

console.log(`✅ Found ${pages.length} pages:`);
pages.forEach(page => console.log(`   - ${page.icon} ${page.title} (${page.name})`));

console.log('\n📝 Generating index.html...');
const html = generateIndexHTML(pages);

// dist/pages 디렉토리 확인 및 생성
if (!existsSync(DIST_PAGES)) {
  mkdirSync(DIST_PAGES, { recursive: true });
}

const outputPath = join(DIST_PAGES, 'index.html');
writeFileSync(outputPath, html, 'utf-8');

console.log(`✅ Index generated at: ${outputPath}`);
console.log(`🎉 Done! You can now open dist/pages/index.html to view all examples.`);
