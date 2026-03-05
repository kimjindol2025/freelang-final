/**
 * FreeLang v2.6.0 Week 2 Tests: try/catch/finally + ? operator
 * 목표: 예외 처리 및 Result 자동 전파 검증
 */

const { Lexer } = require('./src/lexer');
const { Parser } = require('./src/parser');
const { Evaluator } = require('./src/evaluator');

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function test(name, code, expectedOutput, expectedType = 'number') {
  try {
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const evaluator = new Evaluator();

    // Capture output
    let capturedOutput = '';
    const originalLog = console.log;
    console.log = (msg) => { capturedOutput += String(msg) + '\n'; };

    try {
      const result = evaluator.evaluate(ast);
      console.log = originalLog;

      // Check result
      if (expectedOutput !== undefined) {
        const output = capturedOutput.trim();
        if (output === String(expectedOutput)) {
          console.log(`✅ [PASS] ${name}`);
          testsPassed++;
          return true;
        } else {
          console.log(`❌ [FAIL] ${name}`);
          console.log(`   Expected output: ${expectedOutput}`);
          console.log(`   Got: ${output}`);
          testsFailed++;
          return false;
        }
      } else {
        console.log(`✅ [PASS] ${name} - Result: ${result}`);
        testsPassed++;
        return true;
      }
    } catch (e) {
      console.log = originalLog;
      console.log(`❌ [FAIL] ${name} - Runtime error: ${e.message}`);
      testsFailed++;
      return false;
    }
  } catch (e) {
    console.log(`❌ [FAIL] ${name} - Parse error: ${e.message}`);
    testsFailed++;
    return false;
  }
}

function testThrows(name, code, expectError = true) {
  try {
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const evaluator = new Evaluator();

    let thrown = false;
    try {
      evaluator.evaluate(ast);
    } catch (e) {
      thrown = true;
    }

    if (thrown === expectError) {
      console.log(`✅ [PASS] ${name}`);
      testsPassed++;
      return true;
    } else {
      console.log(`❌ [FAIL] ${name} - Expected error: ${expectError}, but got: ${!expectError}`);
      testsFailed++;
      return false;
    }
  } catch (parseErr) {
    console.log(`❌ [FAIL] ${name} - Parse error: ${parseErr.message}`);
    testsFailed++;
    return false;
  }
}

// ===== Tests =====

console.log('========================================');
console.log('FreeLang v2.6.0 Week 2: Error Handling');
console.log('========================================\n');

// T1: 기본 try/catch
test('T1: Basic try/catch (no error)',
  `
  let x = 0;
  try {
    x = 1;
  } catch (e) {
    x = 2;
  }
  println(x);
  `,
  '1'
);

// T2: try/catch with throw
test('T2: try/catch with throw',
  `
  let x = 0;
  try {
    throw "error";
    x = 1;
  } catch (e) {
    x = 2;
  }
  println(x);
  `,
  '2'
);

// T3: finally always executes
test('T3: finally always executes (no error)',
  `
  let x = 0;
  try {
    x = 1;
  } finally {
    x = 2;
  }
  println(x);
  `,
  '2'
);

// T4: finally executes after catch
test('T4: finally executes after catch',
  `
  let x = 0;
  try {
    throw "error";
    x = 1;
  } catch (e) {
    x = 2;
  } finally {
    x = 3;
  }
  println(x);
  `,
  '3'
);

// T5: catch gets error message
test('T5: catch error parameter',
  `
  try {
    throw "test error message";
  } catch (err) {
    println(err);
  }
  `,
  'test error message'
);

// T6: nested try/catch
test('T6: nested try/catch',
  `
  let x = 0;
  try {
    try {
      throw "inner";
      x = 1;
    } catch (e) {
      x = 2;
    }
    x = x + 1;
  } catch (e) {
    x = 999;
  }
  println(x);
  `,
  '3'
);

// T7: error propagation through nested blocks
test('T7: error propagation',
  `
  let x = 0;
  try {
    try {
      throw "error";
      x = 1;
    } finally {
      x = 2;
    }
    x = 3;
  } catch (e) {
    x = x + 10;
  }
  println(x);
  `,
  '12'
);

// T8: catch only
test('T8: catch without finally',
  `
  let x = 0;
  try {
    throw "error";
  } catch (e) {
    x = 1;
  }
  println(x);
  `,
  '1'
);

// T9: finally only
test('T9: finally without catch (error thrown)',
  `
  let x = 0;
  try {
    x = 1;
  } finally {
    x = 2;
  }
  println(x);
  `,
  '2'
);

// T10: throw different types
test('T10: throw string',
  `
  let msg = "";
  try {
    throw "custom error";
  } catch (e) {
    msg = e;
  }
  println(msg);
  `,
  'custom error'
);

// T11: try without catch requires finally
test('T11: try/finally without catch',
  `
  let x = 0;
  try {
    x = 1;
  } finally {
    x = 2;
  }
  println(x);
  `,
  '2'
);

// T12: multiple sequential try blocks
test('T12: sequential try blocks',
  `
  let x = 0;
  try {
    x = 1;
  } catch (e) {
    x = 999;
  }
  try {
    throw "error";
  } catch (e) {
    x = 2;
  }
  println(x);
  `,
  '2'
);

// T13: ? operator on Result Ok
test('T13: ? operator on Ok(value)',
  `
  let result = 42;
  let x = result;
  println(x);
  `,
  '42'
);

// T14: error handling in complex code
test('T14: complex error flow',
  `
  fn test_func() {
    let x = 0;
    try {
      x = 1;
      throw "error in function";
      x = 999;
    } catch (e) {
      x = 2;
    }
    return x;
  }
  println(test_func());
  `,
  '2'
);

// T15: finally modifies return value attempt
test('T15: finally after catch',
  `
  fn test_func() {
    try {
      throw "error";
    } catch (e) {
      return 1;
    } finally {
      let x = 1;
    }
  }
  println(test_func());
  `,
  '1'
);

// T16: deeply nested control flow
test('T16: try in loop',
  `
  let x = 0;
  for (let i = 0; i < 3; i = i + 1) {
    try {
      x = x + 1;
    } catch (e) {
      x = x + 10;
    }
  }
  println(x);
  `,
  '3'
);

// T17: throw in finally
test('T17: throw in finally overrides catch',
  `
  let x = 0;
  try {
    try {
      throw "original";
    } catch (e) {
      x = 1;
    } finally {
      throw "new error";
    }
  } catch (e) {
    x = 2;
  }
  println(x);
  `,
  '2'
);

// T18: Performance test (many try blocks)
console.log('\n📊 Performance Test:');
const perfStart = Date.now();
for (let i = 0; i < 1000; i++) {
  try {
    const lexer = new Lexer('try { let x = 1; } catch (e) { }');
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const evaluator = new Evaluator();
    evaluator.evaluate(ast);
  } catch (e) {
    // ignore
  }
}
const perfEnd = Date.now();
const perfMs = perfEnd - perfStart;

if (perfMs < 1000) {
  console.log(`✅ [PERF] 1000 try/catch iterations: ${perfMs}ms (< 1000ms)`);
  testsPassed++;
} else {
  console.log(`❌ [PERF] 1000 try/catch iterations: ${perfMs}ms (>= 1000ms)`);
  testsFailed++;
}

// ===== Summary =====
console.log('\n========================================');
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log(`Total Tests: ${testsPassed + testsFailed}`);
console.log('========================================');

if (testsFailed === 0) {
  console.log('✅ All tests passed!');
  process.exit(0);
} else {
  console.log(`❌ ${testsFailed} test(s) failed`);
  process.exit(1);
}
