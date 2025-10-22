#!/usr/bin/env node

/**
 * 진입점 자동 탐색 스크립트
 *
 * 규칙:
 * 1. src/lib/**\/*.ts 파일 자동 탐색 (index.ts 제외)
 * 2. build.config.js의 overrides에서 세밀한 제어 가능
 * 3. 자동 생성된 설정과 override 병합
 */

import fs from 'fs';
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
};

/**
 * src/lib의 모든 TypeScript 파일 자동 탐색
 * (index.ts 제외)
 */
function discoverLibraryEntries() {
  const files = glob.sync('src/lib/**/*.ts', {
    cwd: rootDir,
    ignore: ['**/index.ts'],
  });

  return files.map(input => {
    // src/lib/animations/fade.ts → dist/lib/animations/fade.js
    const output = input.replace(/^src\//, 'dist/').replace(/\.ts$/, '.js');

    // 파일명에서 name 추론
    const basename = path.basename(input, '.ts');
    const category = path.dirname(input).split('/').pop();

    // name 규칙:
    // - advanced/line-matching.ts → 'createLineMatching'
    // - testing/index.ts → 'GSAPKitTesting'
    // - animations/fade.ts → null (여러 함수 export)
    let name = null;

    // 특정 패턴에 name 부여
    if (category === 'advanced' || category === 'core') {
      // advanced나 core는 클래스/생성자 함수일 가능성이 높음
      name = toPascalCase(basename);
    } else if (category === 'testing' && basename !== 'index') {
      // testing 개별 파일은 클래스명
      name = toPascalCase(basename);
    } else if (category === 'utils') {
      // utils는 헬퍼 모음
      name = `GSAPKit${toPascalCase(basename)}`;
    }

    // minify 규칙: advanced 카테고리만 minify
    const minify = category === 'advanced';

    return {
      input,
      output,
      name,
      minify,
      auto: true, // 자동 생성됨을 표시
    };
  });
}

/**
 * 케밥-케이스나 스네이크-케이스를 PascalCase로 변환
 */
function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Override와 자동 탐색 결과 병합
 */
function mergeWithOverrides(autoEntries, overrides = {}) {
  const result = [];
  const overrideMap = new Map();

  // Override를 input 경로 기준으로 맵 생성
  Object.entries(overrides).forEach(([input, config]) => {
    overrideMap.set(input, config);
  });

  autoEntries.forEach(entry => {
    if (overrideMap.has(entry.input)) {
      // Override가 있으면 병합
      const override = overrideMap.get(entry.input);

      // false면 제외
      if (override === false) {
        return;
      }

      // 설정 병합
      result.push({
        ...entry,
        ...override,
        auto: false, // override되었음을 표시
      });

      overrideMap.delete(entry.input);
    } else {
      // Override 없으면 그대로 사용
      result.push(entry);
    }
  });

  // Override에만 있고 자동 탐색에서 안 나온 항목들 추가
  overrideMap.forEach((config, input) => {
    if (config !== false) {
      result.push({
        input,
        ...config,
        auto: false,
      });
    }
  });

  return result;
}

/**
 * src/index.ts의 export 자동 생성
 */
function generateBundleExports(entries) {
  const exportLines = [];
  const categorized = {};

  // 카테고리별로 그룹화
  entries.forEach(entry => {
    const parts = entry.input.split('/');
    if (parts[0] === 'src' && parts[1] === 'lib') {
      const category = parts[2];
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(entry);
    }
  });

  // 카테고리 순서
  const categoryOrder = ['core', 'advanced', 'animations', 'draggable', 'utils', 'testing', 'types'];

  categoryOrder.forEach(category => {
    if (categorized[category]) {
      exportLines.push(`// ${category.charAt(0).toUpperCase() + category.slice(1)}`);

      // 같은 카테고리 내에서 index.ts가 있으면 그것만, 없으면 개별 파일들
      const hasIndex = categorized[category].some(e => e.input.endsWith('/index.ts'));

      if (hasIndex) {
        exportLines.push(`export * from './lib/${category}';`);
      } else {
        categorized[category].forEach(entry => {
          const modulePath = entry.input.replace(/^src\//, './').replace(/\.ts$/, '');
          exportLines.push(`export * from '${modulePath}';`);
        });
      }

      exportLines.push('');
    }
  });

  return exportLines.join('\n');
}

/**
 * 결과를 표시
 */
function displayResults(entries) {
  console.log(`\n${colors.cyan}${'='.repeat(60)}`);
  console.log('🔍 진입점 자동 탐색 결과');
  console.log(`${'='.repeat(60)}${colors.reset}\n`);

  const auto = entries.filter(e => e.auto);
  const manual = entries.filter(e => !e.auto);

  console.log(`${colors.green}✅ 자동 탐색: ${auto.length}개${colors.reset}`);
  if (auto.length > 0) {
    auto.forEach(e => {
      const nameStr = e.name ? `(name: ${e.name})` : '(no name)';
      const minifyStr = e.minify ? '[minified]' : '';
      console.log(`  - ${e.input} ${nameStr} ${minifyStr}`);
    });
  }

  console.log(`\n${colors.yellow}⚙️  Override 적용: ${manual.length}개${colors.reset}`);
  if (manual.length > 0) {
    manual.forEach(e => {
      const nameStr = e.name ? `(name: ${e.name})` : '(no name)';
      console.log(`  - ${e.input} ${nameStr}`);
    });
  }

  console.log(`\n${colors.cyan}📊 총 진입점: ${entries.length}개${colors.reset}\n`);
}

/**
 * build.config.js 자동 생성
 */
function generateBuildConfig(entries, bundleEntry) {
  const entriesStr = entries
    .map(e => {
      const auto = e.auto ? '// Auto-discovered' : '// Manual override';
      return `    ${auto}
    {
      input: '${e.input}',
      output: '${e.output}',
      name: ${e.name ? `'${e.name}'` : 'null'},${e.minify ? '\n      minify: true,' : ''}
    }`;
    })
    .join(',\n');

  return `/**
 * GSAP Kit 빌드 설정
 *
 * 🚀 자동 탐색 모드:
 * - src/lib/**/*.ts 파일이 자동으로 진입점에 추가됩니다 (index.ts 제외)
 * - overrides에서 세밀한 제어 가능
 *
 * Override 예시:
 * overrides: {
 *   'src/lib/animations/fade.ts': { name: 'FadeAnimations', minify: true },
 *   'src/lib/utils/old.ts': false, // 제외
 * }
 */

export const buildConfig = {
  // CDN 방식으로 빌드할 라이브러리 목록 (자동 생성 + override)
  cdnEntries: [
${entriesStr}
  ],

  // Bundle 방식의 진입점
  bundleEntry: {
    input: '${bundleEntry.input}',
    output: '${bundleEntry.output}',
    name: '${bundleEntry.name}',
  },

  // Override 설정 (선택사항)
  overrides: {
    // 예: 'src/lib/animations/fade.ts': { name: 'FadeAnimations' },
    // 예: 'src/lib/utils/old.ts': false, // 제외
  },
};
`;
}

/**
 * 메인 실행
 */
async function main() {
  const autoEntries = discoverLibraryEntries();

  // 기존 build.config.js에서 overrides 로드 (있다면)
  let overrides = {};
  const configPath = path.resolve(rootDir, 'build.config.js');
  if (fs.existsSync(configPath)) {
    try {
      const module = await import(configPath);
      overrides = module.buildConfig.overrides || {};
    } catch (_err) {
      // 파싱 에러는 무시
    }
  }

  const mergedEntries = mergeWithOverrides(autoEntries, overrides);

  displayResults(mergedEntries);

  // 통계 출력
  const categories = {};
  mergedEntries.forEach(e => {
    const category = path.dirname(e.input).split('/')[2] || 'other';
    categories[category] = (categories[category] || 0) + 1;
  });

  console.log('📈 카테고리별 통계:');
  Object.entries(categories)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([cat, count]) => {
      console.log(`  - ${cat}: ${count}개`);
    });

  console.log('\n');

  return mergedEntries;
}

// 스크립트로 실행 시
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { discoverLibraryEntries, mergeWithOverrides, generateBundleExports, generateBuildConfig };
