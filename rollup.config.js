import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { glob } from 'glob';
import path from 'path';
import { buildConfig } from './build.config.js';

/**
 * 빌드 모드
 * - cdn: CDN 방식 (개별 파일로 빌드, script 태그 사용)
 * - bundle: NPM 번들러 방식 (단일 main.js, import 사용)
 *
 * 환경
 * - development: Source map 포함, minify 없음
 * - production: Minified, optimized (기본값)
 *
 * 사용법:
 * BUILD_MODE=cdn npm run build
 * BUILD_MODE=bundle npm run build
 * NODE_ENV=development BUILD_MODE=cdn npm run build
 */
const BUILD_MODE = process.env.BUILD_MODE || 'cdn';
const NODE_ENV = process.env.NODE_ENV || 'production';
const isDev = NODE_ENV === 'development';

console.log(`🔧 빌드 모드: ${BUILD_MODE.toUpperCase()}`);
console.log(`🌍 환경: ${NODE_ENV.toUpperCase()}`);

// 페이지별 엔트리 자동 탐색 (CDN 모드에서만 사용)
const pageEntries = glob.sync('src/pages/**/main.ts').reduce((entries, file) => {
  const pageName = path.basename(path.dirname(file));
  entries[pageName] = file;
  return entries;
}, {});

if (BUILD_MODE === 'cdn') {
  console.log('📦 페이지 번들링 목록:', Object.keys(pageEntries));
}

// 공통 설정
const createConfig = (input, output, name, minify = false, format = 'iife', generateTypes = false) => ({
  input,
  output: {
    file: output,
    format,
    name: name || undefined,
    sourcemap: true,
    ...(format === 'iife' && {
      globals: {
        gsap: 'gsap',
      },
    }),
  },
  external: ['gsap'],
  plugins: [
    nodeResolve(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: generateTypes,
      declarationDir: generateTypes ? 'dist' : undefined,
      declarationMap: generateTypes,
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        moduleResolution: 'node',
      },
    }),
    // Production 모드에서만 minify (또는 명시적으로 minify=true인 경우)
    ...(minify || (!isDev && format !== 'iife') ? [terser()] : []),
  ],
});

// 빌드 설정 생성
let configs = [];

// CDN 모드: 개별 파일로 빌드
if (BUILD_MODE === 'cdn') {
  const cdnConfigs = buildConfig.cdnEntries.map(entry =>
    createConfig(entry.input, entry.output, entry.name, entry.minify || false)
  );

  const pageConfigs = Object.entries(pageEntries).map(([pageName, entryFile]) =>
    createConfig(entryFile, `dist/pages/${pageName}/main.js`, null)
  );

  console.log(`✅ CDN 빌드: ${buildConfig.cdnEntries.length}개 라이브러리 + ${pageConfigs.length}개 페이지`);

  configs = [...cdnConfigs, ...pageConfigs];
}

// Bundle 모드: 단일 main.js로 빌드
if (BUILD_MODE === 'bundle') {
  const { input, output, name } = buildConfig.bundleEntry;

  console.log(`✅ Bundle 빌드: ${output}`);

  configs = [
    // ESM 번들 (import 사용) - 타입 정의 생성
    createConfig(input, output.replace('.js', '.esm.js'), name, false, 'esm', true),
    // UMD 번들 (브라우저 + Node.js 호환)
    createConfig(input, output.replace('.js', '.umd.js'), name, false, 'umd', false),
    // Minified UMD
    createConfig(input, output.replace('.js', '.umd.min.js'), name, true, 'umd', false),
  ];
}

export default configs;
