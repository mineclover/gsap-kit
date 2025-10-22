#!/usr/bin/env node

/**
 * 컨벤션 단일 원천 검증 스크립트
 *
 * CONVENTIONS.md가 유일한 컨벤션 문서임을 보장합니다.
 * - docs/CONVENTIONS.md는 deprecated 상태여야 함
 * - 다른 위치에 컨벤션 문서가 없어야 함
 * - CONVENTIONS.md가 최신 상태여야 함
 */

import fs from 'fs';
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

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
  section: () => console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}\n`),
};

let hasErrors = false;
let hasWarnings = false;

/**
 * 1. 루트 CONVENTIONS.md 존재 확인
 */
function validateRootConventions() {
  log.section();
  log.info('1. 루트 CONVENTIONS.md 존재 확인');
  log.section();

  const conventionsPath = path.resolve(rootDir, 'CONVENTIONS.md');

  if (!fs.existsSync(conventionsPath)) {
    log.error('CONVENTIONS.md가 프로젝트 루트에 없습니다!');
    hasErrors = true;
    return null;
  }

  const content = fs.readFileSync(conventionsPath, 'utf-8');
  const lines = content.split('\n').length;
  const size = (fs.statSync(conventionsPath).size / 1024).toFixed(1);

  log.success('CONVENTIONS.md가 존재합니다');
  log.info(`  - 줄 수: ${lines}줄`);
  log.info(`  - 크기: ${size}KB`);

  return { path: conventionsPath, content };
}

/**
 * 2. 단일 원천 표시 확인
 */
function validateSingleSourceOfTruth(conventionsData) {
  log.section();
  log.info('2. "단일 원천" 명시 확인');
  log.section();

  if (!conventionsData) {
    log.error('CONVENTIONS.md를 먼저 확인하세요');
    hasErrors = true;
    return;
  }

  const { content } = conventionsData;

  const keywords = ['Single Source of Truth', '단일 원천', '유일한 공식 문서'];

  const found = keywords.some(keyword => content.includes(keyword));

  if (!found) {
    log.warn('CONVENTIONS.md에 "단일 원천" 명시가 없습니다');
    log.info('다음 중 하나를 포함하세요:');
    keywords.forEach(k => console.log(`  - "${k}"`));
    hasWarnings = true;
  } else {
    log.success('단일 원천(Single Source of Truth) 명시됨');
  }
}

/**
 * 3. 중복 컨벤션 문서 확인
 */
function validateNoDuplicates() {
  log.section();
  log.info('3. 중복 컨벤션 문서 확인');
  log.section();

  // CONVENTIONS*.md 패턴으로 검색 (node_modules 제외)
  const conventionFiles = glob.sync('**/CONVENTION*.md', {
    cwd: rootDir,
    ignore: ['node_modules/**', 'CONVENTIONS.md'], // 루트는 제외
  });

  if (conventionFiles.length === 0) {
    log.success('중복 컨벤션 문서가 없습니다');
    return;
  }

  log.warn(`중복 가능성이 있는 파일 (${conventionFiles.length}개):`);
  conventionFiles.forEach(file => {
    const fullPath = path.resolve(rootDir, file);
    const content = fs.readFileSync(fullPath, 'utf-8');

    // DEPRECATED 표시가 있는지 확인
    if (content.includes('DEPRECATED') || content.includes('deprecated')) {
      console.log(`  ✅ ${file} (DEPRECATED 표시됨)`);
    } else {
      console.log(`  ⚠️  ${file} (DEPRECATED 표시 필요!)`);
      hasWarnings = true;
    }
  });
}

/**
 * 4. docs/CONVENTIONS.md deprecated 확인
 */
function validateDocsDeprecated() {
  log.section();
  log.info('4. docs/CONVENTIONS.md deprecated 확인');
  log.section();

  const docsPath = path.resolve(rootDir, 'docs/CONVENTIONS.md');

  if (!fs.existsSync(docsPath)) {
    log.info('docs/CONVENTIONS.md가 없습니다 (문제없음)');
    return;
  }

  const content = fs.readFileSync(docsPath, 'utf-8');

  if (!content.includes('DEPRECATED')) {
    log.error('docs/CONVENTIONS.md가 DEPRECATED 표시되지 않았습니다!');
    hasErrors = true;
  } else {
    log.success('docs/CONVENTIONS.md가 DEPRECATED 표시됨');
  }
}

/**
 * 5. 다른 문서에서 컨벤션 참조 확인
 */
function validateReferences() {
  log.section();
  log.info('5. 다른 문서의 CONVENTIONS.md 참조 확인');
  log.section();

  const markdownFiles = glob.sync('*.md', {
    cwd: rootDir,
    ignore: ['CONVENTIONS.md', 'node_modules/**'],
  });

  let referencesFound = 0;

  markdownFiles.forEach(file => {
    const fullPath = path.resolve(rootDir, file);
    const content = fs.readFileSync(fullPath, 'utf-8');

    if (content.includes('CONVENTIONS.md') || content.includes('컨벤션')) {
      referencesFound++;
      console.log(`  - ${file}: CONVENTIONS.md 참조함`);
    }
  });

  if (referencesFound > 0) {
    log.success(`${referencesFound}개 문서에서 CONVENTIONS.md 참조`);
  } else {
    log.info('다른 문서에서 컨벤션 참조 없음');
  }
}

/**
 * 6. 버전 정보 확인
 */
function validateVersionInfo(conventionsData) {
  log.section();
  log.info('6. 버전 및 최종 수정일 확인');
  log.section();

  if (!conventionsData) {
    return;
  }

  const { content } = conventionsData;

  // 버전 정보 추출
  const versionMatch = content.match(/\*\*버전\*\*:\s*([^\n]+)/);
  const dateMatch = content.match(/\*\*최종 수정\*\*:\s*([^\n]+)/);

  if (versionMatch) {
    log.success(`버전: ${versionMatch[1]}`);
  } else {
    log.warn('버전 정보가 명시되지 않았습니다');
    hasWarnings = true;
  }

  if (dateMatch) {
    log.success(`최종 수정: ${dateMatch[1]}`);
  } else {
    log.warn('최종 수정일이 명시되지 않았습니다');
    hasWarnings = true;
  }
}

/**
 * 메인 실행
 */
function main() {
  console.log(`\n${colors.cyan}${'='.repeat(60)}`);
  console.log('🔍 컨벤션 단일 원천 검증');
  console.log(`${'='.repeat(60)}${colors.reset}\n`);

  const conventionsData = validateRootConventions();
  validateSingleSourceOfTruth(conventionsData);
  validateNoDuplicates();
  validateDocsDeprecated();
  validateReferences();
  validateVersionInfo(conventionsData);

  // 최종 결과
  log.section();
  console.log(`\n${colors.cyan}${'='.repeat(60)}`);
  console.log('📊 검증 결과');
  console.log(`${'='.repeat(60)}${colors.reset}\n`);

  if (hasErrors) {
    log.error('검증 실패! 위의 에러를 수정해주세요.');
    process.exit(1);
  } else if (hasWarnings) {
    log.warn('검증 완료 (경고 있음). 위의 경고를 확인해주세요.');
    process.exit(0);
  } else {
    log.success('모든 검증을 통과했습니다! 🎉');
    log.info('CONVENTIONS.md가 단일 원천(Single Source of Truth)입니다.');
    process.exit(0);
  }
}

main();
