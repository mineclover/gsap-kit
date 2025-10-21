/**
 * GSAP Kit - Testing Module
 * 인터렉션 자동화 테스트 시스템
 */

// Mouse Simulator
export {
  MouseSimulator,
  type MouseSimulatorOptions,
  type Point,
  simulateClick,
  simulateDrag,
} from './mouse-simulator';

// Path Visualizer
export {
  PathVisualizer,
  type VisualizerOptions,
  visualizePath,
} from './path-visualizer';
// Reporter
export {
  createReport,
  type ReporterOptions,
  TestReporter,
} from './reporter';
// Test Runner
export {
  describe,
  type TestCase,
  type TestCaseType,
  type TestResult,
  TestRunner,
  type TestSuite,
  testClick,
  testDrag,
  testRunner,
} from './test-runner';
