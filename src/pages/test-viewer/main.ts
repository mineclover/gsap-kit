/**
 * Test Results Viewer
 * 테스트 결과를 시각화하고 재생하는 뷰어
 */

interface TestSummary {
  scenario: string;
  timestamp: string;
  total: number;
  passed: number;
  failed: number;
  error: number;
  results: TestResult[];
}

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'error';
  duration: number;
  error?: string;
  assertions?: AssertionResult[];
  screenshots?: {
    start?: string;
    middle?: string;
    end?: string;
  };
}

interface AssertionResult {
  eval: string;
  result: boolean;
  actual?: any;
  expected?: any;
}

// Global state
let currentSummary: TestSummary | null = null;
let currentResultDir = '';

// DOM Elements
const resultsContainer = document.getElementById('results-container')!;
const loadResultsBtn = document.getElementById('loadResults')!;
const refreshResultsBtn = document.getElementById('refreshResults')!;
const filterPassed = document.getElementById('filterPassed') as HTMLInputElement;
const filterFailed = document.getElementById('filterFailed') as HTMLInputElement;
const filterError = document.getElementById('filterError') as HTMLInputElement;
const replayModal = document.getElementById('replayModal')!;
const replayFrame = document.getElementById('replayFrame') as HTMLIFrameElement;
const closeModalBtn = document.getElementById('closeModalBtn')!;
const closeModal = document.getElementById('closeModal')!;
const modalTitle = document.getElementById('modalTitle')!;

// Load results
async function loadResults(file: File) {
  try {
    const text = await file.text();
    const summary: TestSummary = JSON.parse(text);

    currentSummary = summary;
    currentResultDir = file.webkitRelativePath.replace('/summary.json', '') || '';

    renderResults();
  } catch (error) {
    alert('결과 파일을 불러오는데 실패했습니다: ' + (error instanceof Error ? error.message : String(error)));
  }
}

// Render results
function renderResults() {
  if (!currentSummary) return;

  resultsContainer.innerHTML = '';

  // Summary Card
  const summaryCard = createSummaryCard(currentSummary);
  resultsContainer.appendChild(summaryCard);

  // Test Grid
  const testGrid = document.createElement('div');
  testGrid.className = 'test-grid';

  const filteredResults = currentSummary.results.filter(result => {
    if (result.status === 'passed' && !filterPassed.checked) return false;
    if (result.status === 'failed' && !filterFailed.checked) return false;
    if (result.status === 'error' && !filterError.checked) return false;
    return true;
  });

  for (const result of filteredResults) {
    const card = createTestCard(result);
    testGrid.appendChild(card);
  }

  resultsContainer.appendChild(testGrid);
}

// Create summary card
function createSummaryCard(summary: TestSummary): HTMLElement {
  const card = document.createElement('div');
  card.className = 'summary-card';

  const date = new Date(summary.timestamp);
  const dateStr = date.toLocaleString('ko-KR');

  card.innerHTML = `
    <h2>${summary.scenario}</h2>
    <p style="color: #718096; margin-bottom: 10px;">${dateStr}</p>
    <div class="summary-stats">
      <div class="stat-box">
        <div class="label">Total Tests</div>
        <div class="value">${summary.total}</div>
      </div>
      <div class="stat-box passed">
        <div class="label">Passed</div>
        <div class="value">${summary.passed}</div>
      </div>
      <div class="stat-box failed">
        <div class="label">Failed</div>
        <div class="value">${summary.failed}</div>
      </div>
      <div class="stat-box error">
        <div class="label">Error</div>
        <div class="value">${summary.error}</div>
      </div>
    </div>
  `;

  return card;
}

// Create test card
function createTestCard(result: TestResult): HTMLElement {
  const card = document.createElement('div');
  card.className = `test-card ${result.status}`;

  const statusIcon = {
    passed: '✓',
    failed: '✗',
    error: '⚠',
  };

  const statusColor = {
    passed: '#48bb78',
    failed: '#f56565',
    error: '#ed8936',
  };

  let screenshotsHTML = '';
  if (result.screenshots) {
    screenshotsHTML = `
      <div class="screenshots">
        ${
          result.screenshots.start
            ? `
          <div class="screenshot" onclick="viewScreenshot('${result.screenshots.start}')">
            <img src="../../../test-results/${currentResultDir}/${result.screenshots.start}" alt="Start">
            <div class="screenshot-label">Start</div>
          </div>
        `
            : '<div class="screenshot"></div>'
        }
        ${
          result.screenshots.middle
            ? `
          <div class="screenshot" onclick="viewScreenshot('${result.screenshots.middle}')">
            <img src="../../../test-results/${currentResultDir}/${result.screenshots.middle}" alt="Middle">
            <div class="screenshot-label">Middle</div>
          </div>
        `
            : '<div class="screenshot"></div>'
        }
        ${
          result.screenshots.end
            ? `
          <div class="screenshot" onclick="viewScreenshot('${result.screenshots.end}')">
            <img src="../../../test-results/${currentResultDir}/${result.screenshots.end}" alt="End">
            <div class="screenshot-label">End</div>
          </div>
        `
            : '<div class="screenshot"></div>'
        }
      </div>
    `;
  }

  let assertionsHTML = '';
  if (result.assertions && result.assertions.length > 0) {
    assertionsHTML = `
      <div class="assertions">
        <h4>Assertions</h4>
        ${result.assertions
          .map(
            a => `
          <div class="assertion ${a.result ? 'passed' : 'failed'}">
            ${a.result ? '✓' : '✗'} ${a.eval}
            ${a.expected !== undefined ? ` (expected: ${JSON.stringify(a.expected)}, actual: ${JSON.stringify(a.actual)})` : ''}
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  let errorHTML = '';
  if (result.error) {
    errorHTML = `
      <div style="margin-top: 15px; padding: 12px; background: #fed7d7; border-radius: 6px; font-size: 12px; color: #742a2a;">
        <strong>Error:</strong> ${result.error}
      </div>
    `;
  }

  card.innerHTML = `
    <div class="test-card-header">
      <h3>
        <span style="color: ${statusColor[result.status]};">${statusIcon[result.status]}</span>
        ${result.name}
      </h3>
      <div class="meta">
        <span>ID: ${result.id}</span>
        <span>Status: ${result.status}</span>
      </div>
    </div>
    <div class="test-card-body">
      ${screenshotsHTML}
      ${assertionsHTML}
      ${errorHTML}
    </div>
    <div class="test-card-footer">
      <button class="btn-replay" onclick="replayTest('${result.id}')">
        ▶ Replay
      </button>
      <div class="duration">${result.duration}ms</div>
    </div>
  `;

  return card;
}

// View screenshot in full size
(window as any).viewScreenshot = (path: string) => {
  const fullPath = `../../../test-results/${currentResultDir}/${path}`;
  window.open(fullPath, '_blank');
};

// Replay test
(window as any).replayTest = (testId: string) => {
  if (!currentSummary) return;

  const test = currentSummary.results.find(r => r.id === testId);
  if (!test) return;

  modalTitle.textContent = `Replay: ${test.name}`;

  // 시나리오 경로 추출 (예: line-matching)
  const scenarioName = currentResultDir.split('/')[0];
  const examplePath = `../../../examples/${scenarioName}/index.html`;

  replayFrame.src = examplePath;
  replayModal.classList.add('active');
};

// Close modal
function closeReplayModal() {
  replayModal.classList.remove('active');
  replayFrame.src = '';
}

// Event Listeners
loadResultsBtn.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.webkitdirectory = true;
  input.multiple = true;

  input.addEventListener('change', e => {
    const files = (e.target as HTMLInputElement).files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      if (files[i].name === 'summary.json') {
        loadResults(files[i]);
        break;
      }
    }
  });

  input.click();
});

refreshResultsBtn.addEventListener('click', () => {
  if (currentSummary) {
    renderResults();
  }
});

filterPassed.addEventListener('change', renderResults);
filterFailed.addEventListener('change', renderResults);
filterError.addEventListener('change', renderResults);

closeModalBtn.addEventListener('click', closeReplayModal);
closeModal.addEventListener('click', closeReplayModal);

replayModal.addEventListener('click', e => {
  if (e.target === replayModal) {
    closeReplayModal();
  }
});

// Drag & Drop
resultsContainer.addEventListener('dragover', e => {
  e.preventDefault();
  resultsContainer.style.opacity = '0.7';
});

resultsContainer.addEventListener('dragleave', () => {
  resultsContainer.style.opacity = '1';
});

resultsContainer.addEventListener('drop', e => {
  e.preventDefault();
  resultsContainer.style.opacity = '1';

  const files = e.dataTransfer?.files;
  if (!files) return;

  for (let i = 0; i < files.length; i++) {
    if (files[i].name === 'summary.json') {
      loadResults(files[i]);
      break;
    }
  }
});

console.log('✓ Test Viewer initialized');
