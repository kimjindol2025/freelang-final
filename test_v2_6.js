#!/usr/bin/env node

/**
 * Test Runner for v2.6.0 features (? operator + f-string)
 */

const fs = require('fs');
const path = require('path');

// Import components
const { Lexer } = require('./src/lexer');
const { Parser } = require('./src/parser');
const { Evaluator } = require('./src/evaluator');

// Read test file
const testCode = fs.readFileSync(path.join(__dirname, 'v2_6_tests.fl'), 'utf8');

console.log('🧪 FreeLang v2.6.0 Test Suite');
console.log('========================================');
console.log('Testing: ? operator + try/catch/throw + f-string');
console.log('');

// Tokenize
console.log('📝 Tokenizing...');
const lexer = new Lexer(testCode);
const tokens = lexer.tokenize();
console.log(`✓ Generated ${tokens.length} tokens`);

// Parse
console.log('🔨 Parsing...');
const parser = new Parser(tokens);
const ast = parser.parse();
console.log(`✓ Generated AST with ${ast.statements.length} statements`);

// Evaluate
console.log('⚙️ Evaluating...');
const evaluator = new Evaluator();

// Track test results
let testsPassed = 0;
let testsFailed = 0;
const failedTests = [];

// Override assert_eq to track results
const originalAssertEq = evaluator.globalEnv.get('assert_eq');
evaluator.globalEnv.define('assert_eq', (actual, expected, message) => {
  // Use the same logic as runtime.js assert_eq
  const passed = actual === expected ||
                 JSON.stringify(actual) === JSON.stringify(expected) ||
                 actual == expected;

  if (passed) {
    testsPassed++;
    console.log(`  ✅ ${message}`);
  } else {
    testsFailed++;
    failedTests.push(`${message}: expected ${expected}, got ${actual}`);
    console.log(`  ❌ ${message}`);
  }
});

// Run the evaluation
try {
  evaluator.evaluate(ast);
} catch (error) {
  console.error('\n❌ Execution error:', error.message);
  process.exit(1);
}

// Print summary
console.log('');
console.log('========================================');
console.log('📊 Test Results:');
console.log(`   Passed: ${testsPassed}`);
console.log(`   Failed: ${testsFailed}`);
console.log(`   Total:  ${testsPassed + testsFailed}`);
console.log('========================================');

if (testsFailed > 0) {
  console.log('\n❌ Failed Tests:');
  failedTests.forEach(test => {
    console.log(`   - ${test}`);
  });
  process.exit(1);
} else {
  console.log('\n✅ All tests passed!');
  process.exit(0);
}
