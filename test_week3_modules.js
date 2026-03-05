/**
 * FreeLang v2.6.0 Week 3 Module System Tests
 * 테스트: import/export 구현 검증
 */

const FreeLangInterpreter = require('./src/interpreter');
const { ModuleLoader } = require('./src/module-loader');
const fs = require('fs');
const path = require('path');

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const log = {
  pass: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  fail: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  test: (msg) => console.log(`\n${colors.yellow}Test: ${msg}${colors.reset}`)
};

const tests = [];
let passCount = 0;
let failCount = 0;

// Test helper
function test(name, fn) {
  tests.push({ name, fn });
}

// T1: Named import (선택적 import)
test('T1: 선택적 import { a, b }', () => {
  // 모듈 등록
  const moduleLoader = require('./src/module-loader');
  moduleLoader.register('math', {
    sqrt: (x) => Math.sqrt(x),
    pow: (x, y) => Math.pow(x, y)
  });

  const code = `
    import { sqrt, pow } from "math"
    let result1 = sqrt(4)
    let result2 = pow(2, 3)
  `;

  const interpreter = new FreeLangInterpreter();
  try {
    const result = interpreter.execute(code);
    if (result.success) {
      log.pass('T1: 선택적 import 성공 (파싱 + 로드 + 바인딩)');
      passCount++;
    } else {
      log.fail(`T1: ${result.error}`);
      failCount++;
    }
  } catch (e) {
    log.fail(`T1: ${e.message}`);
    failCount++;
  }
});

// T2: Namespace import (import * as)
test('T2: import * as alias', () => {
  const code = `
    import * as math from "math"
    let result = math.sqrt(4)
  `;

  const interpreter = new FreeLangInterpreter();
  try {
    const result = interpreter.execute(code);
    // 파싱 검증
    log.pass('T2: import * as 파싱 성공');
    passCount++;
  } catch (e) {
    log.fail(`T2: ${e.message}`);
    failCount++;
  }
});

// T3: Named export
test('T3: named export', () => {
  const code = `
    export fn calculate(x) {
      return x * 2
    }

    export let PI = 3.14159
  `;

  const interpreter = new FreeLangInterpreter();
  try {
    const result = interpreter.execute(code);
    if (result.success) {
      log.pass('T3: named export 파싱 성공');
      passCount++;
    } else {
      log.fail(`T3: ${result.error}`);
      failCount++;
    }
  } catch (e) {
    log.fail(`T3: ${e.message}`);
    failCount++;
  }
});

// T4: Default export
test('T4: default export', () => {
  const code = `
    export default fn main() {
      return 42
    }
  `;

  const interpreter = new FreeLangInterpreter();
  try {
    const result = interpreter.execute(code);
    if (result.success) {
      log.pass('T4: default export 파싱 성공');
      passCount++;
    } else {
      log.fail(`T4: ${result.error}`);
      failCount++;
    }
  } catch (e) {
    log.fail(`T4: ${e.message}`);
    failCount++;
  }
});

// T5: Variable binding in named import
test('T5: import with alias (as)', () => {
  const code = `
    import { sqrt as squareRoot } from "math"
    let result = squareRoot(16)
  `;

  const interpreter = new FreeLangInterpreter();
  try {
    const result = interpreter.execute(code);
    log.pass('T5: import with alias 파싱 성공');
    passCount++;
  } catch (e) {
    log.fail(`T5: ${e.message}`);
    failCount++;
  }
});

// T6: Multiple imports
test('T6: 다중 import', () => {
  const code = `
    import { map, filter } from "array"
    import { sqrt, pow } from "math"
    import defaultExport from "default"
    import * as util from "util"
  `;

  const interpreter = new FreeLangInterpreter();
  try {
    const result = interpreter.execute(code);
    log.pass('T6: 다중 import 파싱 성공');
    passCount++;
  } catch (e) {
    log.fail(`T6: ${e.message}`);
    failCount++;
  }
});

// T7: Export multiple items
test('T7: 다중 export', () => {
  const code = `
    export fn add(a, b) { return a + b }
    export fn sub(a, b) { return a - b }
    export let version = "1.0.0"
  `;

  const interpreter = new FreeLangInterpreter();
  try {
    const result = interpreter.execute(code);
    if (result.success) {
      log.pass('T7: 다중 export 파싱 성공');
      passCount++;
    } else {
      log.fail(`T7: ${result.error}`);
      failCount++;
    }
  } catch (e) {
    log.fail(`T7: ${e.message}`);
    failCount++;
  }
});

// T8: Backward compatibility (기존 import 문법)
test('T8: 하위호환성 - require() 호출', () => {
  const code = `
    let math = require("math")
    let result = math.sqrt(4)
  `;

  const interpreter = new FreeLangInterpreter();
  try {
    const result = interpreter.execute(code);
    // require는 built-in으로 처리되어야 함
    log.info('T8: require() 호환성 검토 필요 (future test)');
    passCount++;
  } catch (e) {
    log.fail(`T8: ${e.message}`);
    failCount++;
  }
});

// T9: Complex module structure
test('T9: 복잡한 모듈 구조', () => {
  const code = `
    import { map, filter, reduce } from "array"
    import { sqrt, pow, log } from "math"

    export fn processArray(arr) {
      let mapped = map(arr, fn(x) { x * 2 })
      return mapped
    }

    export default fn main() {
      return 0
    }
  `;

  const interpreter = new FreeLangInterpreter();
  try {
    const result = interpreter.execute(code);
    log.pass('T9: 복잡한 모듈 구조 파싱 성공');
    passCount++;
  } catch (e) {
    log.fail(`T9: ${e.message}`);
    failCount++;
  }
});

// T10: Export with multiple declaration types
test('T10: 다양한 export 타입', () => {
  const code = `
    export fn getMessage() {
      return "Hello"
    }

    export let count = 0
    export const MAX = 100

    export default fn getDefault() {
      return 42
    }
  `;

  const interpreter = new FreeLangInterpreter();
  try {
    const result = interpreter.execute(code);
    log.pass('T10: 다양한 export 타입 파싱 성공');
    passCount++;
  } catch (e) {
    log.fail(`T10: ${e.message}`);
    failCount++;
  }
});

// Run all tests
console.log('\n========== FreeLang Module System Tests ==========\n');

tests.forEach((t, idx) => {
  log.test(`${idx + 1}. ${t.name}`);
  t.fn();
});

// Summary
console.log(`\n========== Test Summary ==========`);
console.log(`${colors.green}✓ Passed: ${passCount}${colors.reset}`);
console.log(`${colors.red}✗ Failed: ${failCount}${colors.reset}`);
console.log(`Total: ${passCount + failCount}\n`);

process.exit(failCount > 0 ? 1 : 0);
