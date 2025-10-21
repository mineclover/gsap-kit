/**
 * GSAP Kit 빌드 설정
 *
 * - cdn: 각 모듈을 개별 파일로 빌드 (CDN script 태그 사용)
 * - bundle: 모든 모듈을 하나의 main.js로 번들링 (NPM import 사용)
 */

export const buildConfig = {
  // CDN 방식으로 빌드할 라이브러리 목록
  cdnEntries: [
    // Core System
    {
      input: 'src/lib/core/validator.ts',
      output: 'dist/lib/core/validator.js',
      name: 'DOMValidator',
    },
    {
      input: 'src/lib/core/builder.ts',
      output: 'dist/lib/core/builder.js',
      name: 'InteractionBuilder',
    },

    // Advanced Features
    {
      input: 'src/lib/advanced/line-matching.ts',
      output: 'dist/lib/line-matching.min.js',
      name: 'createLineMatching',
      minify: true,
    },

    // Animations
    {
      input: 'src/lib/animations/fade.ts',
      output: 'dist/lib/animations/fade.js',
      name: null,
    },
    {
      input: 'src/lib/animations/slide.ts',
      output: 'dist/lib/animations/slide.js',
      name: null,
    },
    {
      input: 'src/lib/animations/rotate.ts',
      output: 'dist/lib/animations/rotate.js',
      name: null,
    },
    {
      input: 'src/lib/animations/scroll.ts',
      output: 'dist/lib/animations/scroll.js',
      name: null,
    },

    // Draggable
    {
      input: 'src/lib/draggable/basic.ts',
      output: 'dist/lib/draggable/basic.js',
      name: null,
    },
    {
      input: 'src/lib/draggable/advanced.ts',
      output: 'dist/lib/draggable/advanced.js',
      name: null,
    },

    // Types & Utilities
    {
      input: 'src/lib/types.ts',
      output: 'dist/lib/types.js',
      name: null,
    },

    // Testing
    {
      input: 'src/lib/testing/mouse-simulator.ts',
      output: 'dist/lib/testing/mouse-simulator.js',
      name: 'MouseSimulator',
    },
    {
      input: 'src/lib/testing/path-visualizer.ts',
      output: 'dist/lib/testing/path-visualizer.js',
      name: 'PathVisualizer',
    },
    {
      input: 'src/lib/testing/test-runner.ts',
      output: 'dist/lib/testing/test-runner.js',
      name: 'TestRunner',
    },
    {
      input: 'src/lib/testing/reporter.ts',
      output: 'dist/lib/testing/reporter.js',
      name: 'TestReporter',
    },
    {
      input: 'src/lib/testing/index.ts',
      output: 'dist/lib/testing/index.js',
      name: 'GSAPKitTesting',
    },
  ],

  // Bundle 방식의 진입점
  bundleEntry: {
    input: 'src/index.ts',
    output: 'dist/main.js',
    name: 'GSAPKit',
  },
};
