#!/usr/bin/env node

/**
 * Task 4: Interpreter async/await 실행 로직 테스트
 * async/await 구문을 실제로 실행하는 로직 검증
 */

const { Lexer } = require('./src/lexer');
const { Parser } = require('./src/parser');
const { Evaluator } = require('./src/evaluator');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

let passCount = 0;
let failCount = 0;

function runTest(code, expectedResult = null, testName = '') {
  try {
    const tokens = new Lexer(code).tokenize();
    const ast = new Parser(tokens).parse();
    const evaluator = new Evaluator();
    return evaluator.evaluate(ast);
  } catch (error) {
    console.error(`${colors.red}Error in test "${testName}":${colors.reset}`, error.message);
    failCount++;
    return null;
  }
}

function assert(condition, message) {
  if (condition) {
    console.log(`${colors.green}✅ ${message}${colors.reset}`);
    passCount++;
  } else {
    console.log(`${colors.red}❌ ${message}${colors.reset}`);
    failCount++;
  }
}

async function runAsyncTest(code, expectedResult, testName) {
  try {
    const tokens = new Lexer(code).tokenize();
    const ast = new Parser(tokens).parse();
    const evaluator = new Evaluator();
    const result = evaluator.evaluate(ast);

    if (result instanceof Promise) {
      const resolvedValue = await result;
      assert(resolvedValue === expectedResult, `${testName} (async) = ${expectedResult}`);
    } else {
      assert(result === expectedResult, `${testName} (sync) = ${expectedResult}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error in async test "${testName}":${colors.reset}`, error.message);
    failCount++;
  }
}

// Test suite
async function runTests() {
  console.log(`\n${colors.blue}=== Task 4: Interpreter async/await 실행 로직 테스트 ===${colors.reset}\n`);

  // Test 1: async 함수 기본 선언 및 호출
  console.log(`\n${colors.yellow}Test 1: async 함수 기본 실행${colors.reset}`);
  try {
    const tokens = new Lexer(`
      async fn test() {
        return 42
      }
      let result = test()
    `).tokenize();
    const ast = new Parser(tokens).parse();
    const evaluator = new Evaluator();
    const result = evaluator.evaluate(ast);

    if (result instanceof require('./src/promise')) {
      console.log(`${colors.green}✅ T1: async 함수가 Promise 반환${colors.reset}`);
      passCount++;

      result.then(val => {
        assert(val === 42, 'T1: async 함수 반환값 = 42');
      }).catch(err => {
        console.error('T1 Promise error:', err);
        failCount++;
      });
    } else {
      console.log(`${colors.red}❌ T1: async 함수가 Promise를 반환하지 않음${colors.reset}`);
      failCount++;
    }
  } catch (error) {
    console.error(`${colors.red}T1 Error:${colors.reset}`, error.message);
    failCount++;
  }

  // Test 2: 동기 함수 (기본 동작 확인)
  console.log(`\n${colors.yellow}Test 2: 동기 함수 기본 실행${colors.reset}`);
  const syncResult = runTest(`
    fn test() {
      return 42
    }
    test()
  `, 42, 'sync function');
  assert(syncResult === 42, 'T2: 동기 함수 반환값 = 42');

  // Test 3: await 동기 값
  console.log(`\n${colors.yellow}Test 3: await 동기 값${colors.reset}`);
  try {
    const tokens = new Lexer(`
      async fn test() {
        let x = await 123
        return x
      }
      let result = test()
    `).tokenize();
    const ast = new Parser(tokens).parse();
    const evaluator = new Evaluator();
    const result = evaluator.evaluate(ast);

    if (result instanceof require('./src/promise')) {
      result.then(val => {
        assert(val === 123, 'T3: await 동기 값 = 123');
      }).catch(err => {
        console.error('T3 Promise error:', err);
        failCount++;
      });
    }
  } catch (error) {
    console.error(`${colors.red}T3 Error:${colors.reset}`, error.message);
    failCount++;
  }

  // Test 4: 여러 await
  console.log(`\n${colors.yellow}Test 4: 여러 await 값${colors.reset}`);
  try {
    const tokens = new Lexer(`
      async fn test() {
        let x = await 1
        let y = await 2
        return x + y
      }
      let result = test()
    `).tokenize();
    const ast = new Parser(tokens).parse();
    const evaluator = new Evaluator();
    const result = evaluator.evaluate(ast);

    if (result instanceof require('./src/promise')) {
      result.then(val => {
        assert(val === 3, 'T4: await x + await y = 3');
      }).catch(err => {
        console.error('T4 Promise error:', err);
        failCount++;
      });
    }
  } catch (error) {
    console.error(`${colors.red}T4 Error:${colors.reset}`, error.message);
    failCount++;
  }

  // Test 5: Promise.resolve와 await
  console.log(`\n${colors.yellow}Test 5: Promise.resolve와 await${colors.reset}`);
  try {
    const tokens = new Lexer(`
      async fn test() {
        let p = Promise.resolve(456)
        let x = await p
        return x
      }
      let result = test()
    `).tokenize();
    const ast = new Parser(tokens).parse();
    const evaluator = new Evaluator();
    const result = evaluator.evaluate(ast);

    if (result instanceof require('./src/promise')) {
      result.then(val => {
        assert(val === 456, 'T5: Promise.resolve(456) await = 456');
      }).catch(err => {
        console.error('T5 Promise error:', err);
        failCount++;
      });
    }
  } catch (error) {
    console.error(`${colors.red}T5 Error:${colors.reset}`, error.message);
    failCount++;
  }

  // Test 6: try/catch + await
  console.log(`\n${colors.yellow}Test 6: try/catch + await${colors.reset}`);
  try {
    const tokens = new Lexer(`
      async fn test() {
        try {
          let x = await Promise.reject("error")
          return x
        } catch (e) {
          return "caught: " + e
        }
      }
      let result = test()
    `).tokenize();
    const ast = new Parser(tokens).parse();
    const evaluator = new Evaluator();
    const result = evaluator.evaluate(ast);

    if (result instanceof require('./src/promise')) {
      result.then(val => {
        assert(val === "caught: error", 'T6: try/catch로 Promise 에러 처리');
      }).catch(err => {
        console.error('T6 Promise error:', err);
        failCount++;
      });
    }
  } catch (error) {
    console.error(`${colors.red}T6 Error:${colors.reset}`, error.message);
    failCount++;
  }

  // Test 7: async 함수 체이닝 (Promise 반환)
  console.log(`\n${colors.yellow}Test 7: async 함수 체이닝${colors.reset}`);
  try {
    const tokens = new Lexer(`
      async fn getNumber() {
        return 10
      }

      async fn double() {
        let n = await getNumber()
        return n * 2
      }

      let result = double()
    `).tokenize();
    const ast = new Parser(tokens).parse();
    const evaluator = new Evaluator();
    const result = evaluator.evaluate(ast);

    if (result instanceof require('./src/promise')) {
      result.then(val => {
        assert(val === 20, 'T7: async 함수 체이닝 = 20');
      }).catch(err => {
        console.error('T7 Promise error:', err);
        failCount++;
      });
    }
  } catch (error) {
    console.error(`${colors.red}T7 Error:${colors.reset}`, error.message);
    failCount++;
  }

  // Test 8: await Promise.all
  console.log(`\n${colors.yellow}Test 8: await Promise.all${colors.reset}`);
  try {
    const tokens = new Lexer(`
      async fn test() {
        let results = await Promise.all([
          Promise.resolve(1),
          Promise.resolve(2),
          Promise.resolve(3)
        ])
        return results
      }
      let result = test()
    `).tokenize();
    const ast = new Parser(tokens).parse();
    const evaluator = new Evaluator();
    const result = evaluator.evaluate(ast);

    if (result instanceof require('./src/promise')) {
      result.then(val => {
        const isArray = Array.isArray(val);
        const sumCorrect = isArray && val[0] === 1 && val[1] === 2 && val[2] === 3;
        assert(sumCorrect, 'T8: Promise.all 배열 반환 = [1, 2, 3]');
      }).catch(err => {
        console.error('T8 Promise error:', err);
        failCount++;
      });
    }
  } catch (error) {
    console.error(`${colors.red}T8 Error:${colors.reset}`, error.message);
    failCount++;
  }

  // Test 9: Parser AwaitExpression 확인
  console.log(`\n${colors.yellow}Test 9: Parser AwaitExpression 파싱${colors.reset}`);
  try {
    const tokens = new Lexer(`await x`).tokenize();
    const ast = new Parser(tokens).parse();
    const hasAwaitExpr = ast.statements.some(stmt =>
      stmt.expression && stmt.expression.type === 'AwaitExpression'
    );
    assert(hasAwaitExpr, 'T9: AwaitExpression 파싱 성공');
  } catch (error) {
    console.error(`${colors.red}T9 Error:${colors.reset}`, error.message);
    failCount++;
  }

  // Test 10: Parser async 함수 확인
  console.log(`\n${colors.yellow}Test 10: Parser async 함수 파싱${colors.reset}`);
  try {
    const tokens = new Lexer(`async fn test() { return 1 }`).tokenize();
    const ast = new Parser(tokens).parse();
    const asyncFn = ast.statements[0];
    assert(asyncFn.isAsync === true, 'T10: async 함수의 isAsync = true');
  } catch (error) {
    console.error(`${colors.red}T10 Error:${colors.reset}`, error.message);
    failCount++;
  }

  // 대기하여 모든 Promise 완료
  setTimeout(() => {
    console.log(`\n${colors.blue}========================================${colors.reset}`);
    console.log(`${colors.green}✅ 통과: ${passCount}${colors.reset}`);
    console.log(`${colors.red}❌ 실패: ${failCount}${colors.reset}`);
    console.log(`${colors.blue}========================================${colors.reset}\n`);

    if (failCount === 0) {
      console.log(`${colors.green}🎉 모든 async/await 테스트 통과!${colors.reset}\n`);
      process.exit(0);
    } else {
      process.exit(1);
    }
  }, 1000);
}

// 테스트 실행
runTests().catch(err => {
  console.error(`${colors.red}Test suite error:${colors.reset}`, err);
  process.exit(1);
});
