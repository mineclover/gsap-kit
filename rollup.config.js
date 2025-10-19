import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src-ts/advanced/line-matching.ts',
  output: {
    file: 'dist/line-matching.min.js',
    format: 'iife',
    name: 'GSAPKit',
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
    terser()
  ]
};
