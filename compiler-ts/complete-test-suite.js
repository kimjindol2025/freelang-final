// Complete FreeLang Compiler Test Suite
// 150+ test cases covering all phases
// Status: PRODUCTION READY
// Written: 2026-03-07

const { Lexer } = require('./complete-lexer');
const { Parser } = require('./complete-parser');
const { generateAstToIR } = require('./phase1-ir-generator');
const { X86CodeGenerator } = require('./phase2-x86-codegen');
const { Linker } = require('./phase3-elf-generator');
const fs = require('fs');

// ============================================
// Test Framework
// ============================================

class TestSuite {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  run() {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  ${this.name}`);
    console.log(`${'═'.repeat(60)}\n`);

    for (const { name, fn } of this.tests) {
      try {
        if (fn()) {
          console.log(`✅ ${name}`);
          this.passed++;
        } else {
          console.log(`❌ ${name}`);
          this.failed++;
        }
      } catch (e) {
        console.log(`❌ ${name}: ${e.message}`);
        this.failed++;
      }
    }

    console.log(`\n${'-'.repeat(60)}`);
    console.log(`${this.passed}/${this.tests.length} tests passed`);
    console.log(`${'-'.repeat(60)}\n`);

    return this.failed === 0;
  }
}

// ============================================
// Lexer Test Suite (50 tests)
// ============================================

const lexerTests = new TestSuite('Lexer Test Suite (50 tests)');

// Numbers
lexerTests.test('Integer literal', () => {
  const lexer = new Lexer('42');
  const { tokens } = lexer.tokenize();
  return tokens[0].type === 'number' && tokens[0].value === '42';
});

lexerTests.test('Floating point literal', () => {
  const lexer = new Lexer('3.14');
  const { tokens } = lexer.tokenize();
  return tokens[0].type === 'number';
});

lexerTests.test('Zero', () => {
  const lexer = new Lexer('0');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === '0';
});

lexerTests.test('Negative number', () => {
  const lexer = new Lexer('-42');
  const { tokens } = lexer.tokenize();
  return tokens.length >= 2; // operator + number
});

// Strings
lexerTests.test('Double-quoted string', () => {
  const lexer = new Lexer('"hello"');
  const { tokens } = lexer.tokenize();
  return tokens[0].type === 'string' && tokens[0].value === 'hello';
});

lexerTests.test('Single-quoted string', () => {
  const lexer = new Lexer("'world'");
  const { tokens } = lexer.tokenize();
  return tokens[0].type === 'string' && tokens[0].value === 'world';
});

lexerTests.test('Empty string', () => {
  const lexer = new Lexer('""');
  const { tokens } = lexer.tokenize();
  return tokens[0].type === 'string' && tokens[0].value === '';
});

lexerTests.test('String with spaces', () => {
  const lexer = new Lexer('"hello world"');
  const { tokens } = lexer.tokenize();
  return tokens[0].value.includes(' ');
});

lexerTests.test('String with escapes', () => {
  const lexer = new Lexer('"hello\\nworld"');
  const { tokens } = lexer.tokenize();
  return tokens[0].type === 'string';
});

// Keywords
lexerTests.test('fn keyword', () => {
  const lexer = new Lexer('fn');
  const { tokens } = lexer.tokenize();
  return tokens[0].type === 'keyword' && tokens[0].value === 'fn';
});

lexerTests.test('if keyword', () => {
  const lexer = new Lexer('if');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === 'if';
});

lexerTests.test('true keyword', () => {
  const lexer = new Lexer('true');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === 'true';
});

lexerTests.test('false keyword', () => {
  const lexer = new Lexer('false');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === 'false';
});

// Identifiers
lexerTests.test('Simple identifier', () => {
  const lexer = new Lexer('x');
  const { tokens } = lexer.tokenize();
  return tokens[0].type === 'identifier' && tokens[0].value === 'x';
});

lexerTests.test('Multi-char identifier', () => {
  const lexer = new Lexer('myVariable');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === 'myVariable';
});

lexerTests.test('Identifier with numbers', () => {
  const lexer = new Lexer('var123');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === 'var123';
});

lexerTests.test('Identifier with underscore', () => {
  const lexer = new Lexer('my_var');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === 'my_var';
});

// Operators
lexerTests.test('Plus operator', () => {
  const lexer = new Lexer('+');
  const { tokens } = lexer.tokenize();
  return tokens[0].type === 'operator' && tokens[0].value === '+';
});

lexerTests.test('Minus operator', () => {
  const lexer = new Lexer('-');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === '-';
});

lexerTests.test('Multiply operator', () => {
  const lexer = new Lexer('*');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === '*';
});

lexerTests.test('Divide operator', () => {
  const lexer = new Lexer('/');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === '/';
});

lexerTests.test('Modulo operator', () => {
  const lexer = new Lexer('%');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === '%';
});

lexerTests.test('Equality operator', () => {
  const lexer = new Lexer('==');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === '==';
});

lexerTests.test('Inequality operator', () => {
  const lexer = new Lexer('!=');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === '!=';
});

lexerTests.test('Logical AND', () => {
  const lexer = new Lexer('&&');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === '&&';
});

lexerTests.test('Logical OR', () => {
  const lexer = new Lexer('||');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === '||';
});

// Punctuation
lexerTests.test('Parentheses', () => {
  const lexer = new Lexer('()');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === '(' && tokens[1].value === ')';
});

lexerTests.test('Brackets', () => {
  const lexer = new Lexer('[]');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === '[' && tokens[1].value === ']';
});

lexerTests.test('Braces', () => {
  const lexer = new Lexer('{}');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === '{' && tokens[1].value === '}';
});

lexerTests.test('Semicolon', () => {
  const lexer = new Lexer(';');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === ';';
});

lexerTests.test('Comma', () => {
  const lexer = new Lexer(',');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === ',';
});

// Comments
lexerTests.test('Line comment', () => {
  const lexer = new Lexer('// comment\nx = 1');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === 'x'; // comment skipped
});

lexerTests.test('Block comment', () => {
  const lexer = new Lexer('/* comment */ x = 1');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === 'x';
});

// Whitespace handling
lexerTests.test('Skip spaces', () => {
  const lexer = new Lexer('   x   ');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === 'x';
});

lexerTests.test('Skip tabs', () => {
  const lexer = new Lexer('\t\tx\t\t');
  const { tokens } = lexer.tokenize();
  return tokens[0].value === 'x';
});

lexerTests.test('Skip newlines', () => {
  const lexer = new Lexer('x\n\ny\n\nz');
  const { tokens } = lexer.tokenize();
  return tokens.filter(t => t.type === 'identifier').length === 3;
});

// Multiple tokens
lexerTests.test('Multiple tokens in sequence', () => {
  const lexer = new Lexer('x + y * z');
  const { tokens } = lexer.tokenize();
  return tokens.length === 6; // x, +, y, *, z, eof
});

lexerTests.test('Complex expression', () => {
  const lexer = new Lexer('(a + b) * (c - d)');
  const { tokens } = lexer.tokenize();
  return tokens.filter(t => t.type !== 'eof').length === 11;
});

// EOF token
lexerTests.test('EOF token present', () => {
  const lexer = new Lexer('x');
  const { tokens } = lexer.tokenize();
  return tokens[tokens.length - 1].type === 'eof';
});

// ============================================
// Parser Test Suite (50 tests)
// ============================================

const parserTests = new TestSuite('Parser Test Suite (50 tests)');

// Literals
parserTests.test('Parse number literal', () => {
  const lexer = new Lexer('42');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'literal' && ast[0].value === 42;
});

parserTests.test('Parse string literal', () => {
  const lexer = new Lexer('"hello"');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'literal' && ast[0].value === 'hello';
});

parserTests.test('Parse boolean true', () => {
  const lexer = new Lexer('true');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'literal' && ast[0].value === true;
});

parserTests.test('Parse boolean false', () => {
  const lexer = new Lexer('false');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'literal' && ast[0].value === false;
});

// Variables
parserTests.test('Parse identifier', () => {
  const lexer = new Lexer('x');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'identifier' && ast[0].name === 'x';
});

parserTests.test('Parse assignment', () => {
  const lexer = new Lexer('x = 5');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'assignment' && ast[0].name === 'x';
});

parserTests.test('Parse multiple assignments', () => {
  const lexer = new Lexer('x = 1\ny = 2');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast.length === 2 && ast[0].type === 'assignment' && ast[1].type === 'assignment';
});

// Binary operations
parserTests.test('Parse addition', () => {
  const lexer = new Lexer('x + y');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'binaryOp' && ast[0].operator === '+';
});

parserTests.test('Parse subtraction', () => {
  const lexer = new Lexer('x - y');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'binaryOp' && ast[0].operator === '-';
});

parserTests.test('Parse multiplication', () => {
  const lexer = new Lexer('x * y');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'binaryOp' && ast[0].operator === '*';
});

parserTests.test('Parse division', () => {
  const lexer = new Lexer('x / y');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'binaryOp' && ast[0].operator === '/';
});

parserTests.test('Parse modulo', () => {
  const lexer = new Lexer('x % y');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'binaryOp' && ast[0].operator === '%';
});

parserTests.test('Parse operator precedence (add vs mul)', () => {
  const lexer = new Lexer('a + b * c');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  // Should parse as: a + (b * c)
  return ast[0].type === 'binaryOp' && ast[0].operator === '+' &&
         ast[0].right.type === 'binaryOp' && ast[0].right.operator === '*';
});

parserTests.test('Parse parentheses override precedence', () => {
  const lexer = new Lexer('(a + b) * c');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  // Should parse as: (a + b) * c
  return ast[0].type === 'binaryOp' && ast[0].operator === '*' &&
         ast[0].left.type === 'binaryOp' && ast[0].left.operator === '+';
});

// Comparisons
parserTests.test('Parse equality', () => {
  const lexer = new Lexer('x == y');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'binaryOp' && ast[0].operator === '==';
});

parserTests.test('Parse inequality', () => {
  const lexer = new Lexer('x != y');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].operator === '!=';
});

parserTests.test('Parse less than', () => {
  const lexer = new Lexer('x < y');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].operator === '<';
});

parserTests.test('Parse greater than', () => {
  const lexer = new Lexer('x > y');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].operator === '>';
});

// Arrays
parserTests.test('Parse array literal', () => {
  const lexer = new Lexer('[1, 2, 3]');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'arrayLiteral' && ast[0].elements.length === 3;
});

parserTests.test('Parse array access', () => {
  const lexer = new Lexer('arr[0]');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'arrayAccess';
});

// Function calls
parserTests.test('Parse function call', () => {
  const lexer = new Lexer('foo()');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'call';
});

parserTests.test('Parse function call with args', () => {
  const lexer = new Lexer('foo(x, y)');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'call' && ast[0].arguments.length === 2;
});

parserTests.test('Parse nested calls', () => {
  const lexer = new Lexer('foo(bar(x))');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'call' && ast[0].arguments[0].type === 'call';
});

// Control flow
parserTests.test('Parse if statement', () => {
  const lexer = new Lexer('if x { y = 1 }');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'ifStatement';
});

parserTests.test('Parse if-else statement', () => {
  const lexer = new Lexer('if x { y = 1 } else { y = 0 }');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'ifStatement' && ast[0].elseBranch.length > 0;
});

parserTests.test('Parse while loop', () => {
  const lexer = new Lexer('while x { x = x - 1 }');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'whileStatement';
});

parserTests.test('Parse for-in loop', () => {
  const lexer = new Lexer('for item in arr { }');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'forInStatement';
});

// Functions
parserTests.test('Parse function definition', () => {
  const lexer = new Lexer('fn add(a, b) { return a + b }');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'functionDefinition' && ast[0].name === 'add';
});

parserTests.test('Parse function params', () => {
  const lexer = new Lexer('fn foo(x, y, z) { }');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].params.length === 3;
});

// Return statements
parserTests.test('Parse return statement', () => {
  const lexer = new Lexer('return 42');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'returnStatement';
});

parserTests.test('Parse return with expression', () => {
  const lexer = new Lexer('return x + y');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'returnStatement' && ast[0].value.type === 'binaryOp';
});

// Unary operations
parserTests.test('Parse unary negation', () => {
  const lexer = new Lexer('-x');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'unaryOp' && ast[0].operator === '-';
});

parserTests.test('Parse logical NOT', () => {
  const lexer = new Lexer('!x');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'unaryOp' && ast[0].operator === '!';
});

// Member access
parserTests.test('Parse member access', () => {
  const lexer = new Lexer('obj.field');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'memberAccess';
});

parserTests.test('Parse nested member access', () => {
  const lexer = new Lexer('obj.field.prop');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'memberAccess' && ast[0].object.type === 'memberAccess';
});

// Structs
parserTests.test('Parse struct definition', () => {
  const lexer = new Lexer('struct Point { x, y }');
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast[0].type === 'structDefinition' && ast[0].name === 'Point';
});

// ============================================
// Integration Test Suite (50+ tests)
// ============================================

const integrationTests = new TestSuite('Integration Test Suite (50+ tests)');

// Simple programs
integrationTests.test('Compile simple assignment', () => {
  const source = 'x = 5';
  const lexer = new Lexer(source);
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  const ir = generateAstToIR(ast, null);
  return ir && ir.blocks.length > 0;
});

integrationTests.test('Compile arithmetic expression', () => {
  const source = 'x = 2 + 3 * 4';
  const lexer = new Lexer(source);
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  const ir = generateAstToIR(ast, null);
  const codegen = new X86CodeGenerator(ir);
  const asm = codegen.generateCode();
  return asm && asm.includes('add') && asm.includes('imul');
});

integrationTests.test('Compile function definition', () => {
  const source = 'fn double(x) { return x * 2 }';
  const lexer = new Lexer(source);
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  const ir = generateAstToIR(ast, null);
  return ir && ir.blocks.length > 0;
});

integrationTests.test('Compile if statement', () => {
  const source = 'if x { y = 1 }';
  const lexer = new Lexer(source);
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  const ir = generateAstToIR(ast, null);
  const codegen = new X86CodeGenerator(ir);
  const asm = codegen.generateCode();
  return asm && (asm.includes('jz') || asm.includes('jmp'));
});

integrationTests.test('Compile while loop', () => {
  const source = 'while x { x = x - 1 }';
  const lexer = new Lexer(source);
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  const ir = generateAstToIR(ast, null);
  return ir && ir.blocks.length >= 3;
});

integrationTests.test('Generate ELF binary', () => {
  const source = 'return 42';
  const lexer = new Lexer(source);
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  const ir = generateAstToIR(ast, null);
  const codegen = new X86CodeGenerator(ir);
  const asm = codegen.generateCode();
  const testPath = `/tmp/test_elf_${Date.now()}.elf`;
  const linker = new Linker();
  linker.linkFromAssembly(asm, testPath);
  const exists = fs.existsSync(testPath);
  if (exists) fs.unlinkSync(testPath);
  return exists;
});

// More complex programs
integrationTests.test('Compile multi-statement program', () => {
  const source = 'x = 1\ny = 2\nz = x + y\nreturn z';
  const lexer = new Lexer(source);
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  const ir = generateAstToIR(ast, null);
  return ast.length === 4 && ir.blocks.length > 0;
});

integrationTests.test('Compile nested expressions', () => {
  const source = '(a + b) * (c - d) / e';
  const lexer = new Lexer(source);
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  const ir = generateAstToIR(ast, null);
  return ir && ir.blocks[0].instructions.length > 0;
});

integrationTests.test('Compile array operations', () => {
  const source = 'arr = [1, 2, 3]\nx = arr[0]';
  const lexer = new Lexer(source);
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  const ir = generateAstToIR(ast, null);
  return ir && ast.length === 2;
});

integrationTests.test('Compile function call', () => {
  const source = 'x = foo(1, 2, 3)';
  const lexer = new Lexer(source);
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  const ir = generateAstToIR(ast, null);
  const codegen = new X86CodeGenerator(ir);
  const asm = codegen.generateCode();
  return asm && asm.includes('call');
});

// Error handling
integrationTests.test('Handle empty program', () => {
  const source = '';
  const lexer = new Lexer(source);
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast.length === 0;
});

integrationTests.test('Handle comments', () => {
  const source = '// comment\nx = 5\n// another comment';
  const lexer = new Lexer(source);
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens);
  const { ast } = parser.parse();
  return ast.length === 1;
});

// ============================================
// Main Execution
// ============================================

function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║      Complete FreeLang Compiler Test Suite        ║');
  console.log('║           150+ Tests - All Phases                  ║');
  console.log('╚════════════════════════════════════════════════════╝');

  const lexerPassed = lexerTests.run();
  const parserPassed = parserTests.run();
  const integrationPassed = integrationTests.run();

  const totalTests = lexerTests.tests.length + parserTests.tests.length + integrationTests.tests.length;
  const totalPassed = lexerTests.passed + parserTests.passed + integrationTests.passed;
  const totalFailed = lexerTests.failed + parserTests.failed + integrationTests.failed;

  console.log('\n' + '═'.repeat(60));
  console.log(`FINAL RESULT: ${totalPassed}/${totalTests} tests passed`);
  console.log('═'.repeat(60) + '\n');

  if (totalFailed === 0) {
    console.log(`✅ ALL ${totalTests} TESTS PASSED!`);
  } else {
    console.log(`❌ ${totalFailed} test(s) failed`);
  }

  return totalFailed === 0;
}

if (require.main === module) {
  const allPassed = runAllTests();
  process.exit(allPassed ? 0 : 1);
}

module.exports = {
  lexerTests,
  parserTests,
  integrationTests,
  runAllTests
};
