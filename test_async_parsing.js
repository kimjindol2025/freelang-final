const { Lexer, TokenType } = require('./src/lexer');
const { Parser } = require('./src/parser');

console.log('=== FreeLang Async/Await Parsing Tests ===\n');

// Test 1: 일반 함수 파싱
try {
  const code1 = 'fn test() { return 1 }';
  const tokens1 = new Lexer(code1).tokenize();
  const ast1 = new Parser(tokens1).parse();
  console.assert(ast1.statements[0].isAsync === false, 'T1 Failed: isAsync should be false');
  console.log('✅ T1: 일반 함수 파싱 (fn test() { return 1 })');
} catch (e) {
  console.log('❌ T1 Failed:', e.message);
}

// Test 2: async 함수 파싱
try {
  const code2 = 'async fn test() { return 1 }';
  const tokens2 = new Lexer(code2).tokenize();
  const ast2 = new Parser(tokens2).parse();
  console.assert(ast2.statements[0].isAsync === true, 'T2 Failed: isAsync should be true');
  console.assert(ast2.statements[0].name === 'test', 'T2 Failed: name should be "test"');
  console.log('✅ T2: async 함수 파싱 (async fn test() { return 1 })');
} catch (e) {
  console.log('❌ T2 Failed:', e.message);
}

// Test 3: await 표현식 파싱
try {
  const code3 = 'let x = await promise;';
  const tokens3 = new Lexer(code3).tokenize();
  const ast3 = new Parser(tokens3).parse();
  console.assert(ast3.statements[0].type === 'VariableDeclaration', 'T3 Failed: should be VariableDeclaration');
  console.assert(ast3.statements[0].init.type === 'AwaitExpression', 'T3 Failed: init should be AwaitExpression');
  console.assert(ast3.statements[0].init.argument.type === 'Identifier', 'T3 Failed: argument should be Identifier');
  console.assert(ast3.statements[0].init.argument.name === 'promise', 'T3 Failed: argument.name should be "promise"');
  console.log('✅ T3: await 표현식 파싱 (let x = await promise;)');
} catch (e) {
  console.log('❌ T3 Failed:', e.message);
}

// Test 4: async 함수 + await 조합
try {
  const code4 = 'async fn test() { let x = await promise; return x }';
  const tokens4 = new Lexer(code4).tokenize();
  const ast4 = new Parser(tokens4).parse();
  console.assert(ast4.statements[0].isAsync === true, 'T4a Failed: isAsync should be true');
  console.assert(ast4.statements[0].body.statements[0].type === 'VariableDeclaration', 'T4a Failed: first statement should be VariableDeclaration');
  console.assert(ast4.statements[0].body.statements[0].init.type === 'AwaitExpression', 'T4b Failed: init should be AwaitExpression');
  console.log('✅ T4: async + await 조합 (async fn test() { let x = await promise; return x })');
} catch (e) {
  console.log('❌ T4 Failed:', e.message);
}

// Test 5: 중첩 await
try {
  const code5 = 'let x = await await promise;';
  const tokens5 = new Lexer(code5).tokenize();
  const ast5 = new Parser(tokens5).parse();
  console.assert(ast5.statements[0].init.type === 'AwaitExpression', 'T5a Failed: init should be AwaitExpression');
  console.assert(ast5.statements[0].init.argument.type === 'AwaitExpression', 'T5b Failed: argument should be AwaitExpression');
  console.assert(ast5.statements[0].init.argument.argument.type === 'Identifier', 'T5c Failed: nested argument should be Identifier');
  console.log('✅ T5: 중첩 await (let x = await await promise;)');
} catch (e) {
  console.log('❌ T5 Failed:', e.message);
}

// Test 6: async 함수 표현식
try {
  const code6 = 'let f = async fn() { return 1 }';
  const tokens6 = new Lexer(code6).tokenize();
  const ast6 = new Parser(tokens6).parse();
  console.assert(ast6.statements[0].init.type === 'FunctionExpression', 'T6a Failed: init should be FunctionExpression');
  console.assert(ast6.statements[0].init.isAsync === true, 'T6b Failed: FunctionExpression.isAsync should be true');
  console.log('✅ T6: async 함수 표현식 (let f = async fn() { return 1 })');
} catch (e) {
  console.log('❌ T6 Failed:', e.message);
}

// Test 7: await in 함수 호출
try {
  const code7 = 'let result = await fetch(url);';
  const tokens7 = new Lexer(code7).tokenize();
  const ast7 = new Parser(tokens7).parse();
  console.assert(ast7.statements[0].init.type === 'AwaitExpression', 'T7a Failed: init should be AwaitExpression');
  console.assert(ast7.statements[0].init.argument.type === 'CallExpression', 'T7b Failed: argument should be CallExpression');
  console.log('✅ T7: await 함수 호출 (let result = await fetch(url);)');
} catch (e) {
  console.log('❌ T7 Failed:', e.message);
}

// Test 8: await in 멤버 표현식
try {
  const code8 = 'let val = await obj.method();';
  const tokens8 = new Lexer(code8).tokenize();
  const ast8 = new Parser(tokens8).parse();
  console.assert(ast8.statements[0].init.type === 'AwaitExpression', 'T8a Failed: init should be AwaitExpression');
  console.assert(ast8.statements[0].init.argument.type === 'CallExpression', 'T8b Failed: argument should be CallExpression');
  console.log('✅ T8: await 멤버 표현식 (let val = await obj.method();)');
} catch (e) {
  console.log('❌ T8 Failed:', e.message);
}

console.log('\n=== 모든 파싱 테스트 완료 ===');
