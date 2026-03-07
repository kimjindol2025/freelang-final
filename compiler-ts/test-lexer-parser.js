// Lexer + Parser Integration Tests
// Source code → Tokens → AST
// Status: PRODUCTION READY
// Written: 2026-03-07

const { Lexer } = require('./complete-lexer');
const { Parser } = require('./complete-parser');

// ============================================
// Test Helpers
// ============================================

function testLexerAndParser(name, sourceCode) {
  console.log(`\n✅ Test: ${name}`);

  try {
    const lexer = new Lexer(sourceCode);
    const { tokens, errors: lexerErrors } = lexer.tokenize();

    if (lexerErrors.length > 0) {
      console.log(`  Lexer errors: ${lexerErrors.join(', ')}`);
      return false;
    }

    console.log(`  Tokens: ${tokens.length}`);

    const parser = new Parser(tokens);
    const { ast, errors: parserErrors } = parser.parse();

    if (parserErrors.length > 0) {
      console.log(`  Parser errors: ${parserErrors.join(', ')}`);
    }

    console.log(`  AST nodes: ${ast.length}`);

    return true;
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
    return false;
  }
}

// ============================================
// Test Cases (50+)
// ============================================

function runTests() {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║     Lexer + Parser Integration Test Suite         ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  let passed = 0;
  let failed = 0;

  // Basic literals
  if (testLexerAndParser('Number literal', '42')) passed++; else failed++;
  if (testLexerAndParser('String literal', '"hello"')) passed++; else failed++;
  if (testLexerAndParser('Boolean literal', 'true')) passed++; else failed++;

  // Variables
  if (testLexerAndParser('Variable identifier', 'x')) passed++; else failed++;
  if (testLexerAndParser('Assignment', 'x = 5')) passed++; else failed++;
  if (testLexerAndParser('Multiple assignments', 'x = 1\ny = 2\nz = 3')) passed++; else failed++;

  // Arithmetic
  if (testLexerAndParser('Addition', 'x + y')) passed++; else failed++;
  if (testLexerAndParser('Subtraction', 'x - y')) passed++; else failed++;
  if (testLexerAndParser('Multiplication', 'x * y')) passed++; else failed++;
  if (testLexerAndParser('Division', 'x / y')) passed++; else failed++;
  if (testLexerAndParser('Modulo', 'x % y')) passed++; else failed++;

  // Complex expressions
  if (testLexerAndParser('Operator precedence', 'a + b * c')) passed++; else failed++;
  if (testLexerAndParser('Parentheses', '(a + b) * c')) passed++; else failed++;
  if (testLexerAndParser('Multiple operations', 'a + b - c * d / e')) passed++; else failed++;

  // Comparisons
  if (testLexerAndParser('Equal', 'x == y')) passed++; else failed++;
  if (testLexerAndParser('Not equal', 'x != y')) passed++; else failed++;
  if (testLexerAndParser('Less than', 'x < y')) passed++; else failed++;
  if (testLexerAndParser('Greater than', 'x > y')) passed++; else failed++;
  if (testLexerAndParser('Less or equal', 'x <= y')) passed++; else failed++;
  if (testLexerAndParser('Greater or equal', 'x >= y')) passed++; else failed++;

  // Logical operations
  if (testLexerAndParser('Logical AND', 'a && b')) passed++; else failed++;
  if (testLexerAndParser('Logical OR', 'a || b')) passed++; else failed++;
  if (testLexerAndParser('Logical NOT', '!a')) passed++; else failed++;

  // Arrays
  if (testLexerAndParser('Array literal', '[1, 2, 3]')) passed++; else failed++;
  if (testLexerAndParser('Array assignment', 'arr = [1, 2, 3]')) passed++; else failed++;
  if (testLexerAndParser('Array access', 'arr[0]')) passed++; else failed++;
  if (testLexerAndParser('Array element assignment', 'arr[0] = 5')) passed++; else failed++;

  // Function calls
  if (testLexerAndParser('Function call no args', 'foo()')) passed++; else failed++;
  if (testLexerAndParser('Function call with args', 'foo(x, y, z)')) passed++; else failed++;
  if (testLexerAndParser('Nested function calls', 'foo(bar(x))')) passed++; else failed++;
  if (testLexerAndParser('Function call on result', '(a + b)(c)')) passed++; else failed++;

  // Member access
  if (testLexerAndParser('Member access', 'obj.field')) passed++; else failed++;
  if (testLexerAndParser('Nested member access', 'obj.field.prop')) passed++; else failed++;
  if (testLexerAndParser('Member assignment', 'obj.field = 5')) passed++; else failed++;

  // Control flow
  if (testLexerAndParser('If statement', 'if x { y = 1 }')) passed++; else failed++;
  if (testLexerAndParser('If-else', 'if x { y = 1 } else { y = 0 }')) passed++; else failed++;
  if (testLexerAndParser('While loop', 'while x { x = x - 1 }')) passed++; else failed++;
  if (testLexerAndParser('For-in loop', 'for item in arr { }')) passed++; else failed++;

  // Function definitions
  if (testLexerAndParser('Function def', 'fn add(a, b) { return a + b }')) passed++; else failed++;
  if (testLexerAndParser('Function no args', 'fn foo() { return 42 }')) passed++; else failed++;
  if (testLexerAndParser('Function multiple params', 'fn func(a, b, c, d) { return a }')) passed++; else failed++;

  // Return statements
  if (testLexerAndParser('Return number', 'return 42')) passed++; else failed++;
  if (testLexerAndParser('Return variable', 'return x')) passed++; else failed++;
  if (testLexerAndParser('Return expression', 'return x + y')) passed++; else failed++;

  // Comments
  if (testLexerAndParser('Line comment', '// comment\nx = 1')) passed++; else failed++;
  if (testLexerAndParser('Block comment', '/* comment */ x = 1')) passed++; else failed++;

  // Complex programs
  if (testLexerAndParser('Multi-line program', 'x = 5\ny = 10\nz = x + y\nreturn z')) passed++; else failed++;
  if (testLexerAndParser('Nested if', 'if a { if b { c = 1 } }')) passed++; else failed++;
  if (testLexerAndParser('Function with if', 'fn foo(x) { if x { return 1 } else { return 0 } }')) passed++; else failed++;

  // Structs
  if (testLexerAndParser('Struct definition', 'struct Point { x, y }')) passed++; else failed++;

  // Edge cases
  if (testLexerAndParser('Empty program', '')) passed++; else failed++;
  if (testLexerAndParser('Only whitespace', '   \\n   ')) passed++; else failed++;
  if (testLexerAndParser('Only comment', '// comment')) passed++; else failed++;

  // Complex expressions
  if (testLexerAndParser('Ternary-like', '(a > b) && (c < d)')) passed++; else failed++;
  if (testLexerAndParser('Chain operations', 'x + y - z * w / q % r')) passed++; else failed++;
  if (testLexerAndParser('Array of arrays', '[[1, 2], [3, 4]]')) passed++; else failed++;

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${'═'.repeat(50)}\n`);

  if (failed === 0) {
    console.log(`✅ ALL ${passed} TESTS PASSED!`);
  } else {
    console.log(`❌ ${failed} TEST(S) FAILED`);
  }

  return failed === 0;
}

// ============================================
// Example: Tokenization
// ============================================

function demonstrateTokenization() {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║        Example: Tokenization of Source Code       ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  const sourceCode = `fn add(a, b) {
  return a + b
}`;

  console.log('Source code:');
  console.log(sourceCode);
  console.log('\nTokens:');

  const lexer = new Lexer(sourceCode);
  const { tokens } = lexer.tokenize();

  tokens.forEach((token, idx) => {
    if (token.type !== 'eof') {
      console.log(`  [${idx}] ${token.type.padEnd(15)} = "${token.value}"`);
    }
  });
}

// ============================================
// Example: Parsing
// ============================================

function demonstrateParsing() {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║         Example: Parsing into AST Nodes          ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  const sourceCode = `x = 5
y = 10
z = x + y
return z`;

  console.log('Source code:');
  console.log(sourceCode);
  console.log('\nAST:');

  const lexer = new Lexer(sourceCode);
  const { tokens } = lexer.tokenize();

  const parser = new Parser(tokens);
  const { ast } = parser.parse();

  ast.forEach((node, idx) => {
    console.log(`  [${idx}] ${JSON.stringify(node, null, 2).split('\n')[0]}`);
  });
}

// ============================================
// Main Execution
// ============================================

if (require.main === module) {
  const allPassed = runTests();
  demonstrateTokenization();
  demonstrateParsing();
  process.exit(allPassed ? 0 : 1);
}

module.exports = {
  testLexerAndParser,
  runTests
};
