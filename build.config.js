/**
 * GSAP Kit 빌드 설정 (자동 탐색 모드)
 *
 * 🚀 자동 탐색:
 * - src/lib/**\/*.ts 파일이 자동으로 진입점에 추가됩니다 (index.ts 제외)
 * - 새 파일 추가 시 수동 등록 불필요
 *
 * 🎯 Override로 세밀한 제어 가능:
 * - name 변경
 * - minify 옵션
 * - output 경로 변경
 * - 특정 파일 제외 (false 설정)
 *
 * @example
 * overrides: {
 *   'src/lib/animations/fade.ts': { name: 'FadeAnimations', minify: true },
 *   'src/lib/utils/old.ts': false, // 빌드에서 제외
 * }
 */

import { glob } from 'glob';
import path from 'path';

/**
 * src/lib의 모든 TypeScript 파일 자동 탐색
 */
function discoverLibraryEntries() {
  const files = glob.sync('src/lib/**/*.ts', {
    ignore: ['**/index.ts'],
  });

  return files.map(input => {
    const output = input.replace(/^src\//, 'dist/').replace(/\.ts$/, '.js');
    const basename = path.basename(input, '.ts');
    const category = path.dirname(input).split('/').pop();

    // name 자동 추론
    let name = null;
    if (category === 'advanced') {
      // advanced/line-matching.ts → createLineMatching
      const words = basename.split('-');
      const functionName = words.map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))).join('');
      name = `create${functionName.charAt(0).toUpperCase() + functionName.slice(1)}`;
    } else if (category === 'core') {
      // core/validator.ts → DOMValidator
      const className = basename.charAt(0).toUpperCase() + basename.slice(1);
      name = basename === 'validator' ? 'DOMValidator' : `${className}`;
      if (basename === 'builder') name = 'InteractionBuilder';
    } else if (category === 'testing' && basename !== 'index') {
      // testing/mouse-simulator.ts → MouseSimulator
      name = basename
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');
    } else if (category === 'utils') {
      // utils/helpers.ts → GSAPKitHelpers
      name = `GSAPKit${basename.charAt(0).toUpperCase() + basename.slice(1)}`;
    }

    // minify 규칙: advanced만
    const minify = category === 'advanced';

    return { input, output, name, minify };
  });
}

/**
 * Override 적용
 */
function applyOverrides(entries, overrides = {}) {
  const result = [];
  const overrideMap = new Map(Object.entries(overrides));

  entries.forEach(entry => {
    const override = overrideMap.get(entry.input);

    // false면 제외
    if (override === false) {
      return;
    }

    // Override 병합
    if (override) {
      result.push({ ...entry, ...override });
      overrideMap.delete(entry.input);
    } else {
      result.push(entry);
    }
  });

  // Override에만 있는 추가 항목
  overrideMap.forEach((config, input) => {
    if (config !== false) {
      result.push({ input, ...config });
    }
  });

  return result;
}

// 자동 탐색
const autoEntries = discoverLibraryEntries();

// Override 설정
const overrides = {
  // 예시: 특정 파일 제외
  // 'src/lib/utils/old.ts': false,
  // 예시: name 변경
  // 'src/lib/animations/fade.ts': { name: 'FadeAnimations' },
};

// 최종 진입점 (자동 + Override)
const cdnEntries = applyOverrides(autoEntries, overrides);

export const buildConfig = {
  cdnEntries,

  bundleEntry: {
    input: 'src/index.ts',
    output: 'dist/main.js',
    name: 'GSAPKit',
  },
};
