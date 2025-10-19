#!/usr/bin/env node

/**
 * 빌드된 JS 파일에서 'export {};' 구문 제거
 * ES6 모듈을 브라우저 전역 스크립트로 변환
 */

const fs = require('fs');
const path = require('path');

function removeExportsFromFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // 'export {};' 라인 제거
    content = content.replace(/^export\s*\{\s*\}\s*;?\s*$/gm, '');

    // 파일 끝의 불필요한 빈 줄 제거
    content = content.replace(/\n\n+$/g, '\n');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Removed exports from: ${filePath}`);
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.isFile() && file.name.endsWith('.js')) {
      removeExportsFromFile(fullPath);
    }
  }
}

// dist 디렉토리 처리
const distPath = path.join(__dirname, '..', 'dist');

if (fs.existsSync(distPath)) {
  console.log('Removing export statements from compiled files...');
  processDirectory(distPath);
  console.log('Done!');
} else {
  console.error('dist directory not found!');
  process.exit(1);
}
