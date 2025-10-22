/**
 * Hover Test Page
 * Tests hover interactions for GSAP Kit testing system
 */

// Import testing functions
import { createReport, runTestsFromFile, setupGlobalAutomation, simulateHover, testRunner } from '../../lib/testing';

// Tooltip test
const tooltipTrigger = document.getElementById('tooltip-trigger');
const tooltip = document.getElementById('tooltip');

if (tooltipTrigger && tooltip) {
  tooltipTrigger.addEventListener('mouseenter', () => {
    tooltip.classList.add('visible');
  });

  tooltipTrigger.addEventListener('mouseleave', () => {
    tooltip.classList.remove('visible');
  });
}

// Hover box test
const hoverBox = document.getElementById('hover-box');

if (hoverBox) {
  hoverBox.addEventListener('mouseenter', () => {
    hoverBox.classList.add('hovered');
  });

  hoverBox.addEventListener('mouseleave', () => {
    hoverBox.classList.remove('hovered');
  });
}

// Scale animation test
const hoverScale = document.getElementById('hover-scale');

if (hoverScale) {
  hoverScale.addEventListener('mouseenter', () => {
    hoverScale.classList.add('scaled');
  });

  hoverScale.addEventListener('mouseleave', () => {
    hoverScale.classList.remove('scaled');
  });
}

// Export state for testing
export const getState = () => ({
  tooltipVisible: tooltip?.classList.contains('visible') ?? false,
  hoverBoxHovered: hoverBox?.classList.contains('hovered') ?? false,
  hoverScaleScaled: hoverScale?.classList.contains('scaled') ?? false,
});

// Expose functions globally for Playwright tests
(window as any).simulateHover = simulateHover;
(window as any).runTestsFromFile = runTestsFromFile;
(window as any).getState = getState;
(window as any).createReport = createReport;

// Initialize automation
setupGlobalAutomation(testRunner, {
  autoStart: false,
});
