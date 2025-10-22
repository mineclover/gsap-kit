import { copyFileSync, mkdirSync, readdirSync, watch } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SRC_PAGES = join(__dirname, '../src/pages');
const DIST_PAGES = join(__dirname, '../dist/pages');
const TEST_SPECS = join(__dirname, '../test-specs');
const DIST_TEST_SPECS = join(__dirname, '../dist/test-specs');

function copyDir(src, dest, extensions = ['.html', '.css']) {
  try {
    mkdirSync(dest, { recursive: true });

    const entries = readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);

      if (entry.isDirectory()) {
        copyDir(srcPath, destPath, extensions);
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        copyFileSync(srcPath, destPath);
        console.log(`✓ ${entry.name} → ${destPath}`);
      }
    }
  } catch (error) {
    console.error(`Error copying ${src}:`, error.message);
  }
}

function copyAssets() {
  console.log('📦 Copying HTML and CSS files...');
  copyDir(SRC_PAGES, DIST_PAGES);
  console.log('📦 Copying test specs...');
  copyDir(TEST_SPECS, DIST_TEST_SPECS, ['.json']);
  console.log('✅ Assets copied successfully!\n');
}

// Watch 모드
function startWatchMode() {
  console.log('👀 Assets watch mode started...');
  console.log(`📁 Watching: ${SRC_PAGES}\n`);

  // 초기 복사
  copyAssets();

  // 디렉토리 변경 감지
  const watcher = watch(SRC_PAGES, { recursive: true }, (eventType, filename) => {
    if (filename && (filename.endsWith('.html') || filename.endsWith('.css'))) {
      console.log(`📝 Asset changed: ${filename}`);
      console.log(`🔄 Copying assets...\n`);
      copyAssets();
    }
  });

  // Ctrl+C 처리
  process.on('SIGINT', () => {
    console.log('\n👋 Stopping assets watch mode...');
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
  copyAssets();
}
