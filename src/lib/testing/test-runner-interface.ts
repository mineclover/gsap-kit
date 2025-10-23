/**
 * GSAP Kit - Test Runner Interface
 * 범용 테스트 러너를 위한 추상 인터페이스
 */

/**
 * 테스트 실행 결과
 */
export interface TestRunResult {
  /** 전체 테스트 수 */
  total: number;
  /** 통과한 테스트 수 */
  passed: number;
  /** 실패한 테스트 수 */
  failed: number;
  /** 실행 시간 (ms) */
  duration?: number;
  /** 통과율 (0-100) */
  passRate: number;
  /** 원본 결과 데이터 (리포터가 기대하는 형식) */
  raw: Map<string, any>;
}

/**
 * 테스트 러너 인터페이스
 * - 다양한 테스트 프레임워크와 연동 가능하도록 추상화
 */
export interface ITestRunner {
  /**
   * 파일에서 테스트 로드 및 실행
   * @param filePath 테스트 스펙 파일 경로
   */
  runFromFile(filePath: string): Promise<TestRunResult>;

  /**
   * 객체에서 테스트 로드 및 실행
   * @param spec 테스트 스펙 객체
   */
  runFromObject(spec: any): Promise<TestRunResult>;
}

/**
 * 테스트 결과 리포터 인터페이스
 */
export interface ITestReporter {
  /**
   * 테스트 결과 렌더링
   * @param results 테스트 결과 Map
   * @param container 렌더링할 컨테이너
   */
  render(results: Map<string, any>, container: HTMLElement): void;
}
