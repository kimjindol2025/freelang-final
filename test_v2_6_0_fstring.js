/**
 * FreeLang v2.6.0 F-String Testing
 *
 * Test categories:
 * T1: Simple variable interpolation
 * T2: Expression interpolation
 * T3: Nested function calls
 * T4: Format specifiers
 * T5: Escaped braces
 * T6: Performance benchmark
 */

const { FreeLangInterpreter } = require('./src/interpreter');

const tests = [
  // T1: Simple variable interpolation
  {
    name: 'T1: Simple string variable',
    code: `
      let name = "Alice"
      println(f"Hello, {name}!")
    `,
    expected: 'Hello, Alice!'
  },

  {
    name: 'T1: Simple number variable',
    code: `
      let age = 30
      println(f"Age: {age}")
    `,
    expected: 'Age: 30'
  },

  {
    name: 'T1: Multiple variables',
    code: `
      let name = "Bob"
      let age = 25
      println(f"Name: {name}, Age: {age}")
    `,
    expected: 'Name: Bob, Age: 25'
  },

  // T2: Expression interpolation
  {
    name: 'T2: Arithmetic expression',
    code: `
      println(f"Sum: {10 + 20}")
    `,
    expected: 'Sum: 30'
  },

  {
    name: 'T2: Boolean expression',
    code: `
      println(f"Is 5 > 3? {5 > 3}")
    `,
    expected: 'Is 5 > 3? true'
  },

  {
    name: 'T2: String concatenation',
    code: `
      let x = "Hello"
      let y = "World"
      println(f"{x} {y}")
    `,
    expected: 'Hello World'
  },

  {
    name: 'T2: Complex expression',
    code: `
      let a = 5
      let b = 10
      println(f"Result: {(a + b) * 2}")
    `,
    expected: 'Result: 30'
  },

  // T3: Nested function calls
  {
    name: 'T3: String function (str)',
    code: `
      let num = 42
      println(f"String: {str(num)}")
    `,
    expected: 'String: 42'
  },

  {
    name: 'T3: Array length',
    code: `
      let arr = [1, 2, 3, 4, 5]
      println(f"Length: {len(arr)}")
    `,
    expected: 'Length: 5'
  },

  {
    name: 'T3: Nested function call',
    code: `
      let x = 42
      println(f"Type: {type(x)}")
    `,
    expected: 'Type: number'
  },

  // T4: Format specifiers
  {
    name: 'T4: Float format :.2f',
    code: `
      let pi = 3.14159
      println(f"Pi: {pi:.2f}")
    `,
    expected: 'Pi: 3.14'
  },

  {
    name: 'T4: Hexadecimal format :x',
    code: `
      let num = 255
      println(f"Hex: {num:x}")
    `,
    expected: 'Hex: ff'
  },

  {
    name: 'T4: Octal format :o',
    code: `
      let num = 64
      println(f"Octal: {num:o}")
    `,
    expected: 'Octal: 100'
  },

  {
    name: 'T4: Binary format :b',
    code: `
      let num = 8
      println(f"Binary: {num:b}")
    `,
    expected: 'Binary: 1000'
  },

  {
    name: 'T4: Decimal format :d',
    code: `
      let num = 3.7
      println(f"Int: {num:d}")
    `,
    expected: 'Int: 3'
  },

  {
    name: 'T4: String format :s',
    code: `
      let x = 42
      println(f"String: {x:s}")
    `,
    expected: 'String: 42'
  },

  // T5: Escaped braces
  {
    name: 'T5: Escaped left brace {{',
    code: `
      println(f"{{literal}}")
    `,
    expected: '{literal}'
  },

  {
    name: 'T5: Escaped right brace }}',
    code: `
      let x = 5
      println(f"Set {{x}} = {x}}")
    `,
    expected: 'Set {x} = 5}'
  },

  // Additional edge cases
  {
    name: 'Edge: Empty f-string',
    code: `
      println(f"")
    `,
    expected: ''
  },

  {
    name: 'Edge: Text only f-string',
    code: `
      println(f"Hello World")
    `,
    expected: 'Hello World'
  },

  {
    name: 'Edge: Null and undefined',
    code: `
      let x = null
      println(f"Value: {x}")
    `,
    expected: 'Value: null'
  },

  {
    name: 'Edge: Multiple expressions in one f-string',
    code: `
      println(f"{1} + {2} = {1 + 2}")
    `,
    expected: '1 + 2 = 3'
  }
];

// Run tests
let passed = 0;
let failed = 0;
const failedTests = [];

console.log('🧪 FreeLang v2.6.0 F-String Tests\n');
console.log('=' .repeat(50));

for (const test of tests) {
  const interpreter = new FreeLangInterpreter();

  // Capture output
  let output = '';
  const originalLog = console.log;
  console.log = (...args) => {
    output += args.join(' ') + '\n';
  };

  try {
    const result = interpreter.execute(test.code);

    if (result.success) {
      const actual = output.trim();
      const expected = test.expected;

      if (actual === expected) {
        console.log = originalLog;
        console.log(`✅ ${test.name}`);
        passed++;
      } else {
        console.log = originalLog;
        console.log(`❌ ${test.name}`);
        console.log(`   Expected: "${expected}"`);
        console.log(`   Got:      "${actual}"`);
        failed++;
        failedTests.push(test.name);
      }
    } else {
      console.log = originalLog;
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${result.error}`);
      failed++;
      failedTests.push(test.name);
    }
  } catch (error) {
    console.log = originalLog;
    console.log(`❌ ${test.name}`);
    console.log(`   Exception: ${error.message}`);
    failed++;
    failedTests.push(test.name);
  }
}

console.log('=' .repeat(50));
console.log(`\n📊 Results: ${passed}/${tests.length} passed\n`);

if (failed > 0) {
  console.log(`❌ Failed tests (${failed}):`);
  failedTests.forEach(name => console.log(`  - ${name}`));
} else {
  console.log('🎉 All tests passed!');
}

// Performance test
console.log('\n⏱️  Performance Test');
console.log('=' .repeat(50));

const perfCode = `
  let x = 42
  let result = ""
  let i = 0
  while (i < 1000) {
    result = f"Value: {x}, Iteration: {i}"
    i = i + 1
  }
  result
`;

const interpreter = new FreeLangInterpreter();
const startTime = process.hrtime.bigint();
const result = interpreter.execute(perfCode);
const endTime = process.hrtime.bigint();

const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

console.log(`⏱️  1000 f-string interpolations: ${duration.toFixed(2)}ms`);
console.log(`📈 Target: < 100ms (for 1000 iterations)`);

if (duration < 100) {
  console.log('✅ Performance test passed!');
} else {
  console.log('⚠️  Performance test exceeded target');
}

console.log('\n' + '=' .repeat(50));
console.log('Test suite complete!');
