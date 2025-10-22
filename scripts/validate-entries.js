#!/usr/bin/env node

/**
 * 진입점 검증 스크립트
 *
 * 검증 항목:
 * 1. build.config.js의 모든 input 파일이 실제 존재하는지
 * 2. src/lib에 있는 파일이 build.config.js에 누락되지 않았는지
 * 3. src/index.ts의 export와 실제 파일 간 동기화
 * 4. 중복 진입점 확인
 */

import fs from 'fs';
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig } from '../build.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  error: msg => console.error(`${colors.red}❌ ${msg}${colors.reset}`),
  warn: msg => console.warn(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  success: msg => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  info: msg => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  section: _msg => console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`),
};

let hasErrors = false;
let hasWarnings = false;

// 1. build.config.js의 모든 input 파일 존재 확인
function validateConfigInputs() {
  log.section();
  log.info('1. build.config.js 진입점 검증');
  log.section();

  const missingFiles = [];
  const existingFiles = [];

  buildConfig.cdnEntries.forEach(entry => {
    const filePath = path.resolve(rootDir, entry.input);
    if (fs.existsSync(filePath)) {
      existingFiles.push(entry.input);
    } else {
      missingFiles.push(entry.input);
      hasErrors = true;
    }
  });

  if (missingFiles.length > 0) {
    log.error(`build.config.js에 정의되었지만 존재하지 않는 파일 (${missingFiles.length}개):`);
    missingFiles.forEach(file => console.log(`  - ${file}`));
  }

  log.success(`build.config.js에 정의된 진입점: ${buildConfig.cdnEntries.length}개`);
  log.success(`실제 존재하는 파일: ${existingFiles.length}개`);

  return { missingFiles, existingFiles };
}

// 2. src/lib의 파일들이 build.config.js에 누락되지 않았는지 확인
function validateLibFiles() {
  log.section();
  log.info('2. src/lib 파일 누락 검증');
  log.section();

  // src/lib의 모든 .ts 파일 찾기 (index.ts 제외)
  const libFiles = glob.sync('src/lib/**/*.ts', {
    cwd: rootDir,
    ignore: ['**/index.ts'], // index.ts는 재export용이므로 제외
  });

  // build.config.js에 정의된 input 파일들
  const configuredInputs = new Set(buildConfig.cdnEntries.map(entry => entry.input));

  // 누락된 파일 찾기
  const unregisteredFiles = libFiles.filter(file => !configuredInputs.has(file));

  if (unregisteredFiles.length > 0) {
    log.warn(`build.config.js에 등록되지 않은 src/lib 파일 (${unregisteredFiles.length}개):`);
    unregisteredFiles.forEach(file => console.log(`  - ${file}`));
    log.info('👉 의도적으로 제외된 파일이라면 무시하세요.');
    hasWarnings = true;
  } else {
    log.success('모든 src/lib 파일이 build.config.js에 등록되어 있습니다.');
  }

  log.info(`src/lib 총 파일 개수: ${libFiles.length}개 (index.ts 제외)`);
  log.info(`build.config.js 등록 파일: ${configuredInputs.size}개`);

  return { libFiles, unregisteredFiles };
}

// 3. 중복 진입점 확인
function validateDuplicates() {
  log.section();
  log.info('3. 중복 진입점 검증');
  log.section();

  const inputCounts = {};
  const outputCounts = {};

  buildConfig.cdnEntries.forEach(entry => {
    inputCounts[entry.input] = (inputCounts[entry.input] || 0) + 1;
    outputCounts[entry.output] = (outputCounts[entry.output] || 0) + 1;
  });

  const duplicateInputs = Object.entries(inputCounts).filter(([, count]) => count > 1);
  const duplicateOutputs = Object.entries(outputCounts).filter(([, count]) => count > 1);

  if (duplicateInputs.length > 0) {
    log.error(`중복된 input 진입점 (${duplicateInputs.length}개):`);
    duplicateInputs.forEach(([input, count]) => console.log(`  - ${input} (${count}회)`));
    hasErrors = true;
  }

  if (duplicateOutputs.length > 0) {
    log.error(`중복된 output 경로 (${duplicateOutputs.length}개):`);
    duplicateOutputs.forEach(([output, count]) => console.log(`  - ${output} (${count}회)`));
    hasErrors = true;
  }

  if (duplicateInputs.length === 0 && duplicateOutputs.length === 0) {
    log.success('중복된 진입점이 없습니다.');
  }

  return { duplicateInputs, duplicateOutputs };
}

// 4. src/index.ts의 export 검증
function validateBundleEntry() {
  log.section();
  log.info('4. Bundle 진입점 (src/index.ts) 검증');
  log.section();

  const indexPath = path.resolve(rootDir, 'src/index.ts');
  if (!fs.existsSync(indexPath)) {
    log.error('src/index.ts 파일이 존재하지 않습니다!');
    hasErrors = true;
    return;
  }

  const indexContent = fs.readFileSync(indexPath, 'utf-8');

  // export * from './lib/...' 패턴 추출
  const exportRegex = /export \* from ['"](.+?)['"];?/g;
  const exports = [];
  let match;

  while ((match = exportRegex.exec(indexContent)) !== null) {
    exports.push(match[1]);
  }

  log.info(`src/index.ts에서 export하는 모듈: ${exports.length}개`);

  // 각 export 경로가 실제 존재하는지 확인
  const missingExports = [];
  exports.forEach(exportPath => {
    // './lib/...' 형태를 'src/lib/...'로 변환
    const filePath = exportPath.replace(/^\.\//, 'src/');

    // .ts 또는 /index.ts로 확인
    const possiblePaths = [path.resolve(rootDir, `${filePath}.ts`), path.resolve(rootDir, `${filePath}/index.ts`)];

    const exists = possiblePaths.some(p => fs.existsSync(p));

    if (!exists) {
      missingExports.push(exportPath);
      hasErrors = true;
    }
  });

  if (missingExports.length > 0) {
    log.error(`src/index.ts에서 export하지만 존재하지 않는 모듈 (${missingExports.length}개):`);
    missingExports.forEach(exp => console.log(`  - ${exp}`));
  } else {
    log.success('src/index.ts의 모든 export가 유효합니다.');
  }

  return { exports, missingExports };
}

// 5. 페이지 진입점 검증
function validatePageEntries() {
  log.section();
  log.info('5. 페이지 진입점 검증');
  log.section();

  const pageEntries = glob.sync('src/pages/**/main.ts', { cwd: rootDir });

  log.success(`자동 탐색된 페이지 진입점: ${pageEntries.length}개`);

  if (pageEntries.length > 0) {
    console.log('페이지 목록:');
    pageEntries.forEach(page => {
      const pageName = path.basename(path.dirname(page));
      console.log(`  - ${pageName} (${page})`);
    });
  }

  return { pageEntries };
}

// 6. 빌드 출력 디렉토리 확인
function validateOutputDirectories() {
  log.section();
  log.info('6. 빌드 출력 디렉토리 검증');
  log.section();

  const outputs = buildConfig.cdnEntries.map(entry => entry.output);
  const outputDirs = new Set(outputs.map(output => path.dirname(output)));

  log.info(`빌드 출력 디렉토리: ${outputDirs.size}개`);
  outputDirs.forEach(dir => console.log(`  - ${dir}`));

  return { outputDirs };
}

// 메인 실행
function main() {
  console.log(`\n${colors.cyan}${'='.repeat(60)}`);
  console.log('🔍 GSAP Kit - 진입점 검증 시작');
  console.log(`${'='.repeat(60)}${colors.reset}\n`);

  const results = {
    configInputs: validateConfigInputs(),
    libFiles: validateLibFiles(),
    duplicates: validateDuplicates(),
    bundleEntry: validateBundleEntry(),
    pageEntries: validatePageEntries(),
    outputDirs: validateOutputDirectories(),
  };

  // 최종 결과
  log.section();
  console.log(`\n${colors.cyan}${'='.repeat(60)}`);
  console.log('📊 검증 결과 요약');
  console.log(`${'='.repeat(60)}${colors.reset}\n`);

  console.log(`CDN 진입점: ${buildConfig.cdnEntries.length}개`);
  console.log(`페이지 진입점: ${results.pageEntries.pageEntries.length}개`);
  console.log(`Bundle 진입점: 1개 (src/index.ts)`);
  console.log(`총 진입점: ${buildConfig.cdnEntries.length + results.pageEntries.pageEntries.length + 1}개\n`);

  if (hasErrors) {
    log.error('검증 실패! 위의 에러를 수정해주세요.');
    process.exit(1);
  } else if (hasWarnings) {
    log.warn('검증 완료 (경고 있음). 위의 경고를 확인해주세요.');
    process.exit(0);
  } else {
    log.success('모든 검증을 통과했습니다! 🎉');
    process.exit(0);
  }
}

main();
