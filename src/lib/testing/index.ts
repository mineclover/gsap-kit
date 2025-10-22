/**
 * GSAP Kit - Testing Module
 * 인터렉션 자동화 테스트 시스템
 */

// Automation
export {
  type AutomationOptions,
  type AutomationResult,
  setupGlobalAutomation,
  TestAutomation,
  waitForTestCompletion,
} from './automation';
// GSAP Assertions
export {
  checkDuration,
  checkProgress,
  checkPropertyValue,
  checkTransformValue,
  type GSAPAssertionOptions,
  type GSAPAssertionType,
  getDuration,
  getProgress,
  getPropertyValue,
  getTransformValue,
  isAnimating,
  isPaused,
  type TransformProperty,
  validateGSAPAssertion,
  waitForAnimation,
} from './gsap-assertions';
// Mouse Simulator
export {
  type HoverSimulatorOptions,
  MouseSimulator,
  type MouseSimulatorOptions,
  type Point,
  type PositionType,
  simulateClick,
  simulateDrag,
  simulateHover,
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
// Spec Loader
export {
  AssertionValidator,
  type TestFileSpec,
  type TestSpec,
  TestSpecLoader,
  type TestSuiteSpec,
} from './spec-loader';
// Spec Runner
export {
  runTestsFromFile,
  runTestsFromObject,
  SpecRunner,
} from './spec-runner';
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
