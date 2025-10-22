# JSON Test Specification Schema

## Overview
JSON-based declarative test specifications for UI interaction and animation testing.

## Core Concepts

### Test File Structure
```typescript
interface TestFileSpec {
  name: string;           // Test suite name
  description?: string;   // Suite description
  baseUrl?: string;       // Base URL for the test page
  suites: TestSuite[];    // Test suites
}
```

### Test Suite
```typescript
interface TestSuite {
  name: string;           // Suite name (e.g., "Hover: Tooltip Display")
  description?: string;   // Suite description
  tests: TestSpec[];      // Test cases
}
```

### Test Specification
```typescript
interface TestSpec {
  name: string;                    // Test case name
  type: 'click' | 'hover' | 'wait'; // Interaction type

  // Optional setup
  setup?: {
    executeFunction?: string;      // Function to call before test (e.g., "gsapTest.resetAllAnimations")
    wait?: number;                 // Wait time in ms after setup
  };

  // Simulation parameters
  simulation?: {
    from: string;                  // Source element selector
    to?: string;                   // Target element selector (for hover)
    duration?: number;             // Simulation duration in ms
    delay?: number;                // Delay before simulation
  };

  // Assertion
  assert: AssertionSpec;           // Validation to perform

  // Wait after simulation
  wait?: number;                   // Wait time in ms
}
```

## Assertion Types

### 1. Element Existence
```typescript
{
  type: 'selector-exists' | 'selector-not-exists';
  selector: string;
}
```

### 2. Element Visibility
```typescript
{
  type: 'element-visible' | 'element-hidden';
  selector: string;
}
```

### 3. CSS Property
```typescript
{
  type: 'css-property';
  selector: string;
  property: string;      // CSS property name (e.g., "opacity", "backgroundColor")
  expected: any;         // Expected value
  tolerance?: number;    // Numeric tolerance (for numbers)
}
```

### 4. Class List
```typescript
{
  type: 'class-contains' | 'class-not-contains';
  selector: string;
  className: string;
}
```

### 5. Attribute
```typescript
{
  type: 'attribute-equals';
  selector: string;
  attribute: string;
  expected: string;
}
```

### 6. GSAP Animation State
```typescript
{
  type: 'gsap-is-animating' | 'gsap-is-paused';
  selector: string;
  waitForAnimation?: boolean;  // Wait for animation to complete
  timeout?: number;            // Timeout in ms
}
```

### 7. GSAP Progress
```typescript
{
  type: 'gsap-progress';
  selector: string;
  minProgress?: number;    // Minimum progress (0-1)
  maxProgress?: number;    // Maximum progress (0-1)
  waitForAnimation?: boolean;
  timeout?: number;
}
```

### 8. GSAP Duration
```typescript
{
  type: 'gsap-duration';
  selector: string;
  expected: number;        // Expected duration in seconds
  tolerance?: number;      // Tolerance in seconds
}
```

### 9. GSAP Property Value
```typescript
{
  type: 'gsap-property-value';
  selector: string;
  property: string;        // CSS property (e.g., "opacity", "width")
  expected: any;
  tolerance?: number;
  waitForAnimation?: boolean;
  timeout?: number;
}
```

### 10. GSAP Transform
```typescript
{
  type: 'gsap-transform';
  selector: string;
  transformProperty: 'x' | 'y' | 'rotation' | 'scale' | 'scaleX' | 'scaleY';
  expected: number;
  tolerance?: number;
  waitForAnimation?: boolean;
  timeout?: number;
}
```

### 11. GSAP Timeline State
```typescript
{
  type: 'gsap-timeline-state';
  selector: string;
  // TODO: Define timeline state options
}
```

## Complete Example

### Hover Test Specification
```json
{
  "name": "Hover Interaction Tests",
  "description": "Test hover simulations and state changes",
  "baseUrl": "http://localhost:8000/pages/interaction-test/",
  "suites": [
    {
      "name": "Hover: Tooltip Display",
      "description": "Tooltip visibility on hover",
      "tests": [
        {
          "name": "Show tooltip on hover",
          "type": "hover",
          "simulation": {
            "from": "#hover-box",
            "duration": 100
          },
          "assert": {
            "type": "element-visible",
            "selector": "#tooltip"
          }
        },
        {
          "name": "Hide tooltip after leaving",
          "type": "hover",
          "simulation": {
            "from": "#hover-box",
            "duration": 100
          },
          "wait": 200,
          "assert": {
            "type": "element-hidden",
            "selector": "#tooltip"
          }
        }
      ]
    }
  ]
}
```

### GSAP Test Specification
```json
{
  "name": "GSAP Animation Tests",
  "description": "GSAP animation state validation",
  "baseUrl": "http://localhost:8000/pages/gsap-test/",
  "suites": [
    {
      "name": "Fade Animation Tests",
      "description": "Opacity animation validation",
      "tests": [
        {
          "name": "Fade box starts with opacity 0",
          "type": "wait",
          "setup": {
            "executeFunction": "gsapTest.resetAllAnimations",
            "wait": 500
          },
          "assert": {
            "type": "gsap-property-value",
            "selector": ".fade-box",
            "property": "opacity",
            "expected": 0,
            "tolerance": 0.1
          }
        },
        {
          "name": "Fade box animates to opacity 1",
          "type": "click",
          "simulation": {
            "from": "#fade-trigger",
            "duration": 100
          },
          "setup": {
            "executeFunction": "gsapTest.triggerFadeAnimation"
          },
          "assert": {
            "type": "gsap-property-value",
            "selector": ".fade-box",
            "property": "opacity",
            "expected": 1,
            "tolerance": 0.1,
            "waitForAnimation": true,
            "timeout": 2000
          }
        }
      ]
    }
  ]
}
```

## Execution Flow

### 1. Test Case Execution
```
1. Load JSON spec file
2. For each suite:
   3. For each test:
      4. Execute setup.executeFunction (if defined)
      5. Wait setup.wait ms (if defined)
      6. Execute simulation (click/hover/wait)
      7. Wait test.wait ms (if defined)
      8. Execute assertion
      9. Record result
```

### 2. Setup Function Execution
Setup functions are executed in the page context using `window.eval()` or direct function calls:

```typescript
// Example setup execution
if (test.setup?.executeFunction) {
  await page.evaluate((fnName) => {
    const fn = window.eval(fnName);
    if (typeof fn === 'function') {
      fn();
    }
  }, test.setup.executeFunction);
}
```

### 3. Element Selection
Elements are selected using `document.querySelector()`:

```typescript
const element = document.querySelector(selector);
if (!element) {
  throw new Error(`Element not found: ${selector}`);
}
```

## Current Issues

### Issue 1: Element Not Found
**Problem**: JSON spec tests fail with "Element not found: undefined"

**Hypothesis**:
1. Setup functions not executing properly
2. Elements not rendered before assertions
3. Selector string not passed correctly
4. Context isolation issues

**Debug Steps**:
```javascript
// In test case
const element = await page.evaluate((sel) => {
  console.log('Selector:', sel);
  const el = document.querySelector(sel);
  console.log('Element:', el);
  return el ? el.tagName : null;
}, '.fade-box');
```

### Issue 2: Setup Timing
**Problem**: Assertions may run before setup completes

**Solution**: Ensure proper async/await in setup execution
```typescript
if (test.setup?.executeFunction) {
  await page.evaluate(async (fnName) => {
    const parts = fnName.split('.');
    let fn = window;
    for (const part of parts) {
      fn = fn[part];
    }
    if (typeof fn === 'function') {
      await fn();
    }
  }, test.setup.executeFunction);

  if (test.setup?.wait) {
    await page.waitForTimeout(test.setup.wait);
  }
}
```

## Best Practices

### 1. Use Stable Selectors
```json
{
  "selector": ".fade-box"        // ✓ Good - class selector
}
```

Not:
```json
{
  "selector": "div:nth-child(3)" // ✗ Fragile
}
```

### 2. Add Setup Wait Times
```json
{
  "setup": {
    "executeFunction": "gsapTest.resetAllAnimations",
    "wait": 500  // ✓ Give time for reset to complete
  }
}
```

### 3. Use Tolerance for Numeric Comparisons
```json
{
  "type": "gsap-property-value",
  "property": "opacity",
  "expected": 1,
  "tolerance": 0.1  // ✓ Account for rendering variance
}
```

### 4. Use waitForAnimation for GSAP Tests
```json
{
  "type": "gsap-property-value",
  "waitForAnimation": true,  // ✓ Wait for animation to complete
  "timeout": 2000
}
```

## Schema Validation

### TypeScript Interfaces
Located in: `src/lib/testing/spec-loader.ts`

### Validation Rules
1. Required fields must be present
2. Assertion types must match schema
3. Selectors must be valid CSS selectors
4. Numeric values must be within valid ranges
5. Setup functions must exist in window context

---

Last Updated: 2025-01-23
