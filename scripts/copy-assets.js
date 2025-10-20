import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SRC_PAGES = join(__dirname, '../src/pages');
const DIST_PAGES = join(__dirname, '../dist/pages');

function copyDir(src, dest) {
  try {
    mkdirSync(dest, { recursive: true });

    const entries = readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);

      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else if (entry.name.endsWith('.html') || entry.name.endsWith('.css')) {
        copyFileSync(srcPath, destPath);
        console.log(`✓ ${entry.name} → ${destPath}`);
      }
    }
  } catch (error) {
    console.error(`Error copying ${src}:`, error.message);
  }
}

console.log('📦 Copying HTML and CSS files...');
copyDir(SRC_PAGES, DIST_PAGES);
console.log('✅ Assets copied successfully!');
