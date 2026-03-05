const { Lexer } = require('./src/lexer');
const { Parser } = require('./src/parser');

console.log('=== FreeLang Async/Await AST 구조 상세 검증 ===\n');

// Utility: AST 출력
function printAST(node, indent = 0) {
  const prefix = '  '.repeat(indent);
  if (!node) return;

  if (node.type === 'Program') {
    console.log(prefix + 'Program');
    node.statements.forEach(s => printAST(s, indent + 1));
  } else if (node.type === 'VariableDeclaration') {
    console.log(prefix + `VariableDeclaration(${node.kind} ${node.name})`);
    if (node.init) {
      console.log(prefix + '  init:');
      printAST(node.init, indent + 2);
    }
  } else if (node.type === 'FunctionDeclaration') {
    console.log(prefix + `FunctionDeclaration(${node.name}, isAsync=${node.isAsync})`);
    console.log(prefix + '  body:');
    printAST(node.body, indent + 2);
  } else if (node.type === 'FunctionExpression') {
    console.log(prefix + `FunctionExpression(${node.name || 'anonymous'}, isAsync=${node.isAsync})`);
    console.log(prefix + '  body:');
    printAST(node.body, indent + 2);
  } else if (node.type === 'BlockStatement') {
    console.log(prefix + 'BlockStatement');
    node.statements.forEach(s => printAST(s, indent + 1));
  } else if (node.type === 'AwaitExpression') {
    console.log(prefix + 'AwaitExpression');
    console.log(prefix + '  argument:');
    printAST(node.argument, indent + 2);
  } else if (node.type === 'CallExpression') {
    console.log(prefix + 'CallExpression');
    console.log(prefix + '  callee:');
    printAST(node.callee, indent + 2);
    console.log(prefix + '  args:');
    node.args.forEach(a => printAST(a, indent + 2));
  } else if (node.type === 'MemberExpression') {
    console.log(prefix + `MemberExpression(computed=${node.computed})`);
    console.log(prefix + '  object:');
    printAST(node.object, indent + 2);
    console.log(prefix + '  property:');
    printAST(node.property, indent + 2);
  } else if (node.type === 'Identifier') {
    console.log(prefix + `Identifier(${node.name})`);
  } else if (node.type === 'ReturnStatement') {
    console.log(prefix + 'ReturnStatement');
    if (node.argument) {
      console.log(prefix + '  argument:');
      printAST(node.argument, indent + 2);
    }
  } else {
    console.log(prefix + node.type);
  }
}

// Test 1: async 함수의 AST 구조
console.log('--- Test 1: async 함수 AST 구조 ---');
const code1 = 'async fn getData() { let x = await fetch(url); return x }';
const tokens1 = new Lexer(code1).tokenize();
const ast1 = new Parser(tokens1).parse();
printAST(ast1);

console.log('\n--- Test 2: 함수 표현식 + async ---');
const code2 = 'let handler = async fn(data) { return await process(data) }';
const tokens2 = new Lexer(code2).tokenize();
const ast2 = new Parser(tokens2).parse();
printAST(ast2);

console.log('\n--- Test 3: 중첩 await ---');
const code3 = 'let nested = await outer(await inner())';
const tokens3 = new Lexer(code3).tokenize();
const ast3 = new Parser(tokens3).parse();
printAST(ast3);

console.log('\n--- Test 4: 일반 함수 (async 없음) ---');
const code4 = 'fn sync() { let x = 1; return x }';
const tokens4 = new Lexer(code4).tokenize();
const ast4 = new Parser(tokens4).parse();
printAST(ast4);

console.log('\n=== AST 구조 검증 완료 ===');
