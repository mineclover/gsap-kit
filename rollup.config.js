import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

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
      declarationMap: false
    }),
    ...(minify ? [terser()] : [])
  ]
});

export default [
  // Line Matching (minified)
  createConfig(
    'src-ts/advanced/line-matching.ts',
    'dist/line-matching.min.js',
    'createLineMatching',
    true
  ),

  // Animations
  createConfig(
    'src-ts/animations/fade.ts',
    'dist/animations/fade.js',
    null // 함수들을 전역으로 직접 노출
  ),
  createConfig(
    'src-ts/animations/slide.ts',
    'dist/animations/slide.js',
    null
  ),
  createConfig(
    'src-ts/animations/rotate.ts',
    'dist/animations/rotate.js',
    null
  ),
  createConfig(
    'src-ts/animations/scroll.ts',
    'dist/animations/scroll.js',
    null
  ),

  // Draggable
  createConfig(
    'src-ts/draggable/basic.ts',
    'dist/draggable/basic.js',
    null
  ),
  createConfig(
    'src-ts/draggable/advanced.ts',
    'dist/draggable/advanced.js',
    null
  ),

  // Types (유틸리티 함수들)
  createConfig(
    'src-ts/types.ts',
    'dist/types.js',
    null
  )
];
