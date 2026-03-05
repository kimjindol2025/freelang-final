/**
 * FreeLang Phase 2 Quick Tests (40 tests, timeout-safe)
 */

const FreeLangInterpreter = require('./src/interpreter');

let passed = 0;
let failed = 0;

function test(name, code, expected) {
  try {
    const interp = new FreeLangInterpreter();
    const result = interp.execute(code);
    if (result.success && result.result === expected) {
      console.log(`✓ ${name}`);
      passed++;
    } else {
      console.log(`✗ ${name}`);
      if (result.error) console.log(`  Error: ${result.error}`);
      else console.log(`  Expected: ${expected}, Got: ${result.result}`);
      failed++;
    }
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Exception: ${error.message}`);
    failed++;
  }
}

console.log('📝 PHASE 2 QUICK TESTS\n');

// LEXER & BASIC VALUES
console.log('--- LEXER ---');
test('Numbers', '42', 42);
test('Strings', '"hello"', 'hello');
test('Booleans', 'true', true);
test('Null', 'null', null);

// ARITHMETIC
console.log('\n--- ARITHMETIC ---');
test('Addition', '1 + 2', 3);
test('Subtraction', '5 - 3', 2);
test('Multiplication', '4 * 5', 20);
test('Division', '20 / 4', 5);
test('Modulo', '17 % 5', 2);
test('Power', '2 ** 10', 1024);
test('Precedence', '2 + 3 * 4', 14);
test('Parentheses', '(2 + 3) * 4', 20);

// VARIABLES
console.log('\n--- VARIABLES ---');
test('Let declaration', 'let x = 42; x', 42);
test('Const declaration', 'const y = 100; y', 100);
test('Var declaration', 'var z = 50; z', 50);
test('Reassignment', 'let x = 10; x = 20; x', 20);
test('Compound +=', 'let x = 10; x += 5; x', 15);
test('Compound -=', 'let x = 10; x -= 3; x', 7);

// FUNCTIONS
console.log('\n--- FUNCTIONS ---');
test('Simple function', 'fn add(a,b){return a+b;} add(3,4)', 7);
test('Recursive factorial', 'fn f(n){if(n<=1)return 1;return n*f(n-1);} f(5)', 120);
test('Function expression', 'let d=fn(x){return x*2;}; d(21)', 42);

// CONTROL FLOW
console.log('\n--- CONTROL FLOW ---');
test('If true', 'let x=5; if(x>3){x=10;} x', 10);
test('If false', 'let x=5; if(x>10){x=10;} x', 5);
test('If-else', 'let x=5; if(x>10){x=1;}else{x=2;} x', 2);

// LOOPS
console.log('\n--- LOOPS ---');
test('While loop', 'let x=0; while(x<5){x=x+1;} x', 5);
test('For loop', 'let s=0; for(let i=0;i<5;i=i+1){s=s+i;} s', 10);
test('For-in array', 'let a=[1,2,3]; let s=0; for i in a{s=s+i;} s', 6);

// ARRAYS
console.log('\n--- ARRAYS ---');
test('Array literal', 'len([1,2,3])', 3);
test('Array indexing', '[1,2,3][1]', 2);
test('Array push', 'let a=[1,2]; push(a,3); len(a)', 3);

// OBJECTS
console.log('\n--- OBJECTS ---');
test('Object literal', 'len(keys({"x":10,"y":20}))', 2);
test('Object property', '{"name":"Alice"}.name', 'Alice');

// BUILT-INS
console.log('\n--- BUILT-INS ---');
test('upper()', 'upper("hello")', 'HELLO');
test('lower()', 'lower("HELLO")', 'hello');
test('sqrt()', 'sqrt(16)', 4);
test('abs()', 'abs(-42)', 42);
test('len() array', 'len([1,2,3,4,5])', 5);
test('len() string', 'len("hello")', 5);

// LOGICAL
console.log('\n--- LOGICAL ---');
test('AND operator', 'true && false', false);
test('OR operator', 'true || false', true);
test('Equality ==', '5 == 5', true);
test('Inequality !=', '5 != 3', true);
test('Less than <', '3 < 5', true);

console.log('\n' + '='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total: ${passed + failed}`);
console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
console.log('='.repeat(50));

process.exit(failed > 0 ? 1 : 0);
