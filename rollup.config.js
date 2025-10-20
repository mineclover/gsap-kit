import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { glob } from 'glob';
import path from 'path';

// 페이지별 엔트리 자동 탐색
const pageEntries = glob.sync('src/pages/**/main.ts').reduce((entries, file) => {
  const pageName = path.basename(path.dirname(file));
  entries[pageName] = file;
  return entries;
}, {});

console.log('📦 페이지 번들링 목록:', Object.keys(pageEntries));

// 공통 설정
const createConfig = (input, output, name, minify = false) => ({
  input,
  output: {
    file: output,
    format: 'iife',
    name: name || undefined,
    sourcemap: true,
    globals: {
      'gsap': 'gsap'
    }
  },
  external: ['gsap'],
  plugins: [
    nodeResolve(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      declarationMap: false,
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        moduleResolution: 'node'
      }
    }),
    ...(minify ? [terser()] : [])
  ]
});

// 페이지별 번들 생성
const pageConfigs = Object.entries(pageEntries).map(([pageName, entryFile]) =>
  createConfig(
    entryFile,
    `dist/pages/${pageName}/main.js`,
    null
  )
);

export default [
  // 라이브러리 번들 (기존 방식 유지)
  // Line Matching (minified)
  createConfig(
    'src/lib/advanced/line-matching.ts',
    'dist/lib/line-matching.min.js',
    'createLineMatching',
    true
  ),

  // Animations
  createConfig(
    'src/lib/animations/fade.ts',
    'dist/lib/animations/fade.js',
    null
  ),
  createConfig(
    'src/lib/animations/slide.ts',
    'dist/lib/animations/slide.js',
    null
  ),
  createConfig(
    'src/lib/animations/rotate.ts',
    'dist/lib/animations/rotate.js',
    null
  ),
  createConfig(
    'src/lib/animations/scroll.ts',
    'dist/lib/animations/scroll.js',
    null
  ),

  // Draggable
  createConfig(
    'src/lib/draggable/basic.ts',
    'dist/lib/draggable/basic.js',
    null
  ),
  createConfig(
    'src/lib/draggable/advanced.ts',
    'dist/lib/draggable/advanced.js',
    null
  ),

  // Types (유틸리티 함수들)
  createConfig(
    'src/lib/types.ts',
    'dist/lib/types.js',
    null
  ),

  // 페이지별 번들
  ...pageConfigs
];
