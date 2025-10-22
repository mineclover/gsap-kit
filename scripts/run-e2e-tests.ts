#!/usr/bin/env ts-node

/**
 * GSAP Kit - E2E Test Runner
 * Playwright를 사용하여 자동화된 E2E 테스트 실행
 */

import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TestResult {
  passed: number;
  failed: number;
  total: number;
  duration: number;
}

async function runTests(options: {
  browser?: string;
  headed?: boolean;
  debug?: boolean;
  update?: boolean;
}): Promise<void> {
  console.log('🧪 Starting E2E tests...\n');

  // Build project first
  console.log('📦 Building project...');
  try {
    await execAsync('npm run build:cdn');
    console.log('✅ Build completed\n');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }

  // Prepare Playwright command
  const args: string[] = ['npx', 'playwright', 'test'];

  if (options.browser) {
    args.push('--project', options.browser);
  }

  if (options.headed) {
    args.push('--headed');
  }

  if (options.debug) {
    args.push('--debug');
  }

  if (options.update) {
    args.push('--update-snapshots');
  }

  console.log('🎭 Running Playwright tests...');
  console.log(`Command: ${args.join(' ')}\n`);

  try {
    const { stdout, stderr } = await execAsync(args.join(' '));

    if (stdout) {
      console.log(stdout);
    }

    if (stderr) {
      console.error(stderr);
    }

    console.log('\n✅ All tests passed!');

    // Parse and display results
    await displayResults();
  } catch (error: any) {
    console.error('\n❌ Tests failed!');

    if (error.stdout) {
      console.log(error.stdout);
    }

    if (error.stderr) {
      console.error(error.stderr);
    }

    await displayResults();
    process.exit(1);
  }
}

async function displayResults(): Promise<void> {
  const resultsPath = path.join(process.cwd(), 'test-results', 'results.json');

  if (!fs.existsSync(resultsPath)) {
    console.log('No results file found');
    return;
  }

  try {
    const resultsData = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));

    console.log('\n📊 Test Results Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const stats = resultsData.stats || {};
    console.log(`Total:    ${stats.expected || 0}`);
    console.log(`Passed:   ${(stats.expected || 0) - (stats.unexpected || 0)}`);
    console.log(`Failed:   ${stats.unexpected || 0}`);
    console.log(`Skipped:  ${stats.skipped || 0}`);
    console.log(`Duration: ${((stats.duration || 0) / 1000).toFixed(2)}s`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('Failed to parse results:', error);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  browser: args.includes('--chromium')
    ? 'chromium'
    : args.includes('--firefox')
      ? 'firefox'
      : args.includes('--webkit')
        ? 'webkit'
        : undefined,
  headed: args.includes('--headed'),
  debug: args.includes('--debug'),
  update: args.includes('--update-snapshots'),
};

// Help message
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
GSAP Kit E2E Test Runner

Usage: npm run test:e2e [options]

Options:
  --chromium          Run tests in Chromium only
  --firefox           Run tests in Firefox only
  --webkit            Run tests in WebKit only
  --headed            Run tests in headed mode (visible browser)
  --debug             Run tests in debug mode
  --update-snapshots  Update visual snapshots
  -h, --help          Show this help message

Examples:
  npm run test:e2e                    # Run all tests in all browsers
  npm run test:e2e -- --chromium      # Run tests in Chromium only
  npm run test:e2e -- --headed        # Run tests with visible browser
  npm run test:e2e -- --debug         # Run tests in debug mode
`);
  process.exit(0);
}

// Run tests
runTests(options).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
