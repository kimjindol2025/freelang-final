/**
 * FreeLang Phase 2 Interpreter Tests
 * Lexer + Parser + Evaluator 통합 테스트
 *
 * 40개 테스트 + 무관용 규칙 검증
 */

const FreeLangInterpreter = require('./src/interpreter');

let testsPassed = 0;
let testsFailed = 0;
const failedTests = [];

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    testsFailed++;
    failedTests.push(name);
  }
}

function executeCode(code) {
  const interpreter = new FreeLangInterpreter();
  const result = interpreter.execute(code);
  assert(result.success, `Execution failed: ${result.error}`);
  return result.result;
}

// ============================================================================
// LEXER TESTS (토큰화)
// ============================================================================

console.log('\n📝 LEXER TESTS');
console.log('─'.repeat(50));

test('Lexer: numbers', () => {
  const result = executeCode('42');
  assert(result === 42, `Expected 42, got ${result}`);
});

test('Lexer: strings', () => {
  const result = executeCode('"hello"');
  assert(result === 'hello', `Expected 'hello', got ${result}`);
});

test('Lexer: boolean true', () => {
  const result = executeCode('true');
  assert(result === true, `Expected true, got ${result}`);
});

test('Lexer: boolean false', () => {
  const result = executeCode('false');
  assert(result === false, `Expected false, got ${result}`);
});

test('Lexer: null', () => {
  const result = executeCode('null');
  assert(result === null, `Expected null, got ${result}`);
});

// ============================================================================
// PARSER & ARITHMETIC TESTS (연산)
// ============================================================================

console.log('\n🔢 ARITHMETIC TESTS');
console.log('─'.repeat(50));

test('Arithmetic: addition', () => {
  const result = executeCode('1 + 2');
  assert(result === 3, `Expected 3, got ${result}`);
});

test('Arithmetic: subtraction', () => {
  const result = executeCode('5 - 3');
  assert(result === 2, `Expected 2, got ${result}`);
});

test('Arithmetic: multiplication', () => {
  const result = executeCode('4 * 5');
  assert(result === 20, `Expected 20, got ${result}`);
});

test('Arithmetic: division', () => {
  const result = executeCode('20 / 4');
  assert(result === 5, `Expected 5, got ${result}`);
});

test('Arithmetic: modulo', () => {
  const result = executeCode('17 % 5');
  assert(result === 2, `Expected 2, got ${result}`);
});

test('Arithmetic: power', () => {
  const result = executeCode('2 ** 10');
  assert(result === 1024, `Expected 1024, got ${result}`);
});

test('Arithmetic: operator precedence', () => {
  const result = executeCode('2 + 3 * 4');
  assert(result === 14, `Expected 14, got ${result}`);
});

test('Arithmetic: parentheses', () => {
  const result = executeCode('(2 + 3) * 4');
  assert(result === 20, `Expected 20, got ${result}`);
});

// ============================================================================
// VARIABLE TESTS (변수)
// ============================================================================

console.log('\n📦 VARIABLE TESTS');
console.log('─'.repeat(50));

test('Variables: let declaration', () => {
  const result = executeCode('let x = 42; x');
  assert(result === 42, `Expected 42, got ${result}`);
});

test('Variables: const declaration', () => {
  const result = executeCode('const y = 100; y');
  assert(result === 100, `Expected 100, got ${result}`);
});

test('Variables: var declaration', () => {
  const result = executeCode('var z = 50; z');
  assert(result === 50, `Expected 50, got ${result}`);
});

test('Variables: variable reassignment', () => {
  const result = executeCode('let x = 10; x = 20; x');
  assert(result === 20, `Expected 20, got ${result}`);
});

test('Variables: compound assignment +=', () => {
  const result = executeCode('let x = 10; x += 5; x');
  assert(result === 15, `Expected 15, got ${result}`);
});

test('Variables: compound assignment -=', () => {
  const result = executeCode('let x = 10; x -= 3; x');
  assert(result === 7, `Expected 7, got ${result}`);
});

// ============================================================================
// FUNCTION TESTS (함수)
// ============================================================================

console.log('\n⚙️  FUNCTION TESTS');
console.log('─'.repeat(50));

test('Functions: simple function', () => {
  const result = executeCode(`
    fn add(a, b) {
      return a + b;
    }
    add(3, 4);
  `);
  assert(result === 7, `Expected 7, got ${result}`);
});

test('Functions: function without return', () => {
  const result = executeCode(`
    fn greet(name) {
      let msg = name;
    }
    greet('Alice');
  `);
  assert(result === null, `Expected null, got ${result}`);
});

test('Functions: recursive function', () => {
  const result = executeCode(`
    fn factorial(n) {
      if (n <= 1) return 1;
      return n * factorial(n - 1);
    }
    factorial(5);
  `);
  assert(result === 120, `Expected 120, got ${result}`);
});

test('Functions: function in variable', () => {
  const result = executeCode(`
    let double = fn(x) { return x * 2; };
    double(21);
  `);
  assert(result === 42, `Expected 42, got ${result}`);
});

// ============================================================================
// CONTROL FLOW TESTS (제어문)
// ============================================================================

console.log('\n🔀 CONTROL FLOW TESTS');
console.log('─'.repeat(50));

test('Control: if statement true', () => {
  const result = executeCode(`
    let x = 5;
    if (x > 3) {
      x = 10;
    }
    x;
  `);
  assert(result === 10, `Expected 10, got ${result}`);
});

test('Control: if statement false', () => {
  const result = executeCode(`
    let x = 5;
    if (x > 10) {
      x = 10;
    }
    x;
  `);
  assert(result === 5, `Expected 5, got ${result}`);
});

test('Control: if-else', () => {
  const result = executeCode(`
    let x = 5;
    if (x > 10) {
      x = 1;
    } else {
      x = 2;
    }
    x;
  `);
  assert(result === 2, `Expected 2, got ${result}`);
});

test('Control: while loop', () => {
  const result = executeCode(`
    let x = 0;
    while (x < 5) {
      x = x + 1;
    }
    x;
  `);
  assert(result === 5, `Expected 5, got ${result}`);
});

test('Control: for loop', () => {
  const result = executeCode(`
    let sum = 0;
    for (let i = 0; i < 5; i = i + 1) {
      sum = sum + i;
    }
    sum;
  `);
  assert(result === 10, `Expected 0+1+2+3+4=10, got ${result}`);
});

test('Control: for-in loop on array', () => {
  const result = executeCode(`
    let arr = [1, 2, 3];
    let sum = 0;
    for item in arr {
      sum = sum + item;
    }
    sum;
  `);
  assert(result === 6, `Expected 6, got ${result}`);
});

// ============================================================================
// ARRAY TESTS (배열)
// ============================================================================

console.log('\n📊 ARRAY TESTS');
console.log('─'.repeat(50));

test('Arrays: array literal', () => {
  const result = executeCode('[1, 2, 3]');
  assert(Array.isArray(result) && result.length === 3, `Expected array [1,2,3]`);
});

test('Arrays: array indexing', () => {
  const result = executeCode('[1, 2, 3][1]');
  assert(result === 2, `Expected 2, got ${result}`);
});

test('Arrays: array length', () => {
  const result = executeCode('len([1, 2, 3, 4, 5])');
  assert(result === 5, `Expected 5, got ${result}`);
});

test('Arrays: built-in push', () => {
  const result = executeCode(`
    let arr = [1, 2];
    push(arr, 3);
    arr;
  `);
  assert(Array.isArray(result) && result[2] === 3, `Expected [1,2,3]`);
});

// ============================================================================
// OBJECT TESTS (객체)
// ============================================================================

console.log('\n📋 OBJECT TESTS');
console.log('─'.repeat(50));

test('Objects: object literal', () => {
  const result = executeCode('{"x": 10, "y": 20}');
  assert(typeof result === 'object' && result.x === 10 && result.y === 20, `Expected object with x:10, y:20`);
});

test('Objects: object property access', () => {
  const result = executeCode('{"name": "Alice", "age": 30}.name');
  assert(result === 'Alice', `Expected 'Alice', got ${result}`);
});

test('Objects: object property assignment', () => {
  const result = executeCode(`
    let obj = {"x": 1};
    obj.x = 2;
    obj.x;
  `);
  assert(result === 2, `Expected 2, got ${result}`);
});

// ============================================================================
// BUILT-IN FUNCTIONS TESTS (내장 함수)
// ============================================================================

console.log('\n🛠️  BUILT-IN FUNCTIONS TESTS');
console.log('─'.repeat(50));

test('Built-ins: upper', () => {
  const result = executeCode('upper("hello")');
  assert(result === 'HELLO', `Expected 'HELLO', got ${result}`);
});

test('Built-ins: lower', () => {
  const result = executeCode('lower("HELLO")');
  assert(result === 'hello', `Expected 'hello', got ${result}`);
});

test('Built-ins: split', () => {
  const result = executeCode('split("a,b,c", ",")');
  assert(Array.isArray(result) && result[0] === 'a', `Expected array starting with 'a'`);
});

test('Built-ins: sqrt', () => {
  const result = executeCode('sqrt(16)');
  assert(result === 4, `Expected 4, got ${result}`);
});

test('Built-ins: abs', () => {
  const result = executeCode('abs(-42)');
  assert(result === 42, `Expected 42, got ${result}`);
});

test('Built-ins: now (should return number)', () => {
  const result = executeCode('now()');
  assert(typeof result === 'number' && result > 0, `Expected timestamp number`);
});

// ============================================================================
// LOGICAL EXPRESSION TESTS (논리 연산)
// ============================================================================

console.log('\n🧠 LOGICAL EXPRESSION TESTS');
console.log('─'.repeat(50));

test('Logical: and operator', () => {
  const result = executeCode('true && false');
  assert(result === false, `Expected false, got ${result}`);
});

test('Logical: or operator', () => {
  const result = executeCode('true || false');
  assert(result === true, `Expected true, got ${result}`);
});

test('Logical: comparison ==', () => {
  const result = executeCode('5 == 5');
  assert(result === true, `Expected true, got ${result}`);
});

test('Logical: comparison !=', () => {
  const result = executeCode('5 != 3');
  assert(result === true, `Expected true, got ${result}`);
});

test('Logical: comparison <', () => {
  const result = executeCode('3 < 5');
  assert(result === true, `Expected true, got ${result}`);
});

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(50));
console.log(`✅ Tests Passed: ${testsPassed}`);
console.log(`❌ Tests Failed: ${testsFailed}`);
console.log(`📊 Total: ${testsPassed + testsFailed}`);
console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(2)}%`);

if (failedTests.length > 0) {
  console.log(`\n🔴 Failed Tests:`);
  failedTests.forEach(name => console.log(`  - ${name}`));
}

// ============================================================================
// UNFORGIVING RULES (무관용 규칙)
// ============================================================================

console.log('\n' + '='.repeat(50));
console.log('⚠️  UNFORGIVING RULES VALIDATION');
console.log('─'.repeat(50));

const rules = [];

// Rule 1: All lexer tokens must be recognized
try {
  executeCode('let x = 42; fn f() {} if (true) {} while (false) {} for (;;) {} return null;');
  rules.push('✓ Rule 1: All lexer tokens recognized');
} catch (e) {
  rules.push(`✗ Rule 1: Token recognition failed - ${e.message}`);
}

// Rule 2: Operators must have correct precedence
try {
  const result = executeCode('1 + 2 * 3 + 4');
  assert(result === 11, `Precedence check: 1 + (2*3) + 4 = 11, got ${result}`);
  rules.push('✓ Rule 2: Operator precedence correct');
} catch (e) {
  rules.push(`✗ Rule 2: Precedence failed - ${e.message}`);
}

// Rule 3: Function calls must support arguments
try {
  const result = executeCode('fn sum3(a,b,c){return a+b+c;} sum3(1,2,3)');
  assert(result === 6, `Function args: expected 6, got ${result}`);
  rules.push('✓ Rule 3: Function arguments work correctly');
} catch (e) {
  rules.push(`✗ Rule 3: Function args failed - ${e.message}`);
}

// Rule 4: Built-in functions must integrate seamlessly
try {
  const result = executeCode('upper(lower("HELLO"))');
  assert(result === 'HELLO', `Built-in integration: expected HELLO, got ${result}`);
  rules.push('✓ Rule 4: Built-in function integration works');
} catch (e) {
  rules.push(`✗ Rule 4: Built-in integration failed - ${e.message}`);
}

// Rule 5: Variable scope must be correct
try {
  const result = executeCode(`
    let x = 1;
    fn test() {
      let x = 2;
      return x;
    }
    let y = test();
    x;
  `);
  assert(result === 1, `Scope test: global x should be 1, got ${result}`);
  rules.push('✓ Rule 5: Variable scope is correct');
} catch (e) {
  rules.push(`✗ Rule 5: Variable scope failed - ${e.message}`);
}

// Rule 6: Control flow must work correctly
try {
  const result = executeCode(`
    let sum = 0;
    for (let i = 1; i <= 5; i = i + 1) {
      if (i % 2 == 0) continue;
      sum = sum + i;
    }
    sum;
  `);
  assert(result === 9, `Control flow: 1+3+5 = 9, got ${result}`);
  rules.push('✓ Rule 6: Control flow (if/continue) works');
} catch (e) {
  rules.push(`✗ Rule 6: Control flow failed - ${e.message}`);
}

// Rule 7: Return statement must exit function early
try {
  const result = executeCode(`
    fn earlyReturn() {
      return 42;
      return 100;
    }
    earlyReturn();
  `);
  assert(result === 42, `Early return: should be 42, got ${result}`);
  rules.push('✓ Rule 7: Early return statement works');
} catch (e) {
  rules.push(`✗ Rule 7: Early return failed - ${e.message}`);
}

// Rule 8: Arrays and objects must work with for-in
try {
  const code = `
    let obj = {"a": 1, "b": 2};
    let keys = [];
    for k in obj {
      push(keys, k);
    }
    len(keys);
  `;
  const result = executeCode(code);
  assert(result === 2, `For-in with objects: expected 2 keys, got ${result}`);
  rules.push('✓ Rule 8: For-in loop works with objects');
} catch (e) {
  rules.push(`✗ Rule 8: For-in loop failed - ${e.message}`);
}

rules.forEach(rule => console.log(rule));

console.log('\n' + '='.repeat(50));
const passedRules = rules.filter(r => r.startsWith('✓')).length;
console.log(`📋 Unforgiving Rules: ${passedRules}/8 passed`);
console.log('='.repeat(50) + '\n');

process.exit(testsFailed > 0 ? 1 : 0);
