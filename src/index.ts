/**
 * GSAP Kit - Main Entry Point (Bundle Mode)
 * NPM 번들러 사용 시 모든 모듈을 하나의 파일로 제공
 *
 * 사용법:
 * import { fadeIn, slideInLeft, createDraggable } from 'gsap-kit';
 */

// Advanced Features
export * from './lib/advanced/line-matching';
// Animations
export * from './lib/animations/fade';
export * from './lib/animations/rotate';
export * from './lib/animations/scroll';
export * from './lib/animations/slide';
// Core System (Validator & Builder)
export * from './lib/core';
export * from './lib/draggable/advanced';
// Draggable
export * from './lib/draggable/basic';

// Types
export * from './lib/types';

// Utils
export * from './lib/utils/helpers';
