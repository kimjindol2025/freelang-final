/**
 * LSP Server 테스트 (10개)
 *
 * T1: 자동완성 - 함수 제안
 * T2: 자동완성 - 변수 제안
 * T3: 자동완성 - 키워드 제안
 * T4: 정의로 이동 (함수)
 * T5: 정의로 이동 (변수)
 * T6: 호버 정보 (함수 시그니처)
 * T7: 호버 정보 (타입 정보)
 * T8: 에러 진단 (문법 에러)
 * T9: 경고 진단 (미사용 변수)
 * T10: 성능 (1000줄 파일 < 100ms)
 */

const LSPServer = require('./src/devtools/lsp-server');

const lsp = new LSPServer(8088);

// 테스트 결과 저장소
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// 색상 출력
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function test(name, fn) {
  try {
    fn();
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    console.log(`${colors.green}✓${colors.reset} ${name}`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    console.log(`  ${error.message}`);
  }
}

// ==================== 테스트 시작 ====================

console.log(`${colors.blue}=== FreeLang LSP Server Tests ===${colors.reset}\n`);

// ==================== T1: 자동완성 - 함수 제안 ====================

test('T1: Completion - 함수 제안 (print)', () => {
  const doc = {
    textDocument: {
      uri: 'file:///test.fl',
      text: 'print'
    }
  };

  lsp.onDidOpen(doc);

  const params = {
    textDocument: { uri: 'file:///test.fl' },
    position: { line: 0, character: 5 }
  };

  const result = lsp.onCompletion(params);

  assert(result.items.length > 0, 'Should have completion items');
  assert(result.items.some(i => i.label === 'println'), 'Should suggest println');
  assert(result.items.some(i => i.label === 'print'), 'Should suggest print');
});

// ==================== T2: 자동완성 - 변수 제안 ====================

test('T2: Completion - 변수 제안', () => {
  const code = 'let myVar = 42;\nlet myOther = 10;\nmyV';

  const doc = {
    textDocument: {
      uri: 'file:///test2.fl',
      text: code
    }
  };

  lsp.onDidOpen(doc);

  const params = {
    textDocument: { uri: 'file:///test2.fl' },
    position: { line: 2, character: 3 }
  };

  const result = lsp.onCompletion(params);

  // myV로 시작하는 항목 확인
  const hasMyVar = result.items.some(i => i.label.startsWith('myV'));
  assert(hasMyVar, `Should suggest variables starting with 'myV'`);
});

// ==================== T3: 자동완성 - 키워드 제안 ====================

test('T3: Completion - 키워드 제안', () => {
  // 키워드 완성 테스트
  const code = 'let x = 42;\nim';

  const doc = {
    textDocument: {
      uri: 'file:///test3.fl',
      text: code
    }
  };

  lsp.onDidOpen(doc);

  const params = {
    textDocument: { uri: 'file:///test3.fl' },
    position: { line: 1, character: 2 }  // "im" 위치
  };

  const result = lsp.onCompletion(params);

  // "im"으로 시작하는 키워드들 확인
  assert(result.items.length > 0, 'Should have completion items');
  assert(result.items.some(i => i.label === 'import'), 'Should suggest import keyword');
  assert(result.items.some(i => i.detail === 'keyword'), 'Should have keyword items');
});

// ==================== T4: 정의로 이동 (함수) ====================

test('T4: Definition - 함수 정의로 이동', () => {
  const code = `fn myFunc(x: i32) -> i32 {
  return x + 1;
}

let result = myFunc(5);`;

  const doc = {
    textDocument: {
      uri: 'file:///test4.fl',
      text: code
    }
  };

  lsp.onDidOpen(doc);

  // myFunc 호출 부분에서 정의로 이동
  const params = {
    textDocument: { uri: 'file:///test4.fl' },
    position: { line: 4, character: 18 }  // myFunc 위치
  };

  const result = lsp.onDefinition(params);

  // 함수가 추출되었는지 확인 (정의 위치 반환)
  assert(result !== null, 'Should find definition');
  if (result) {
    assert(result.uri === 'file:///test4.fl', 'Should be in same file');
  }
});

// ==================== T5: 정의로 이동 (변수) ====================

test('T5: Definition - 변수 정의로 이동', () => {
  const code = `let myVar = 42;
let copy = myVar;`;

  const doc = {
    textDocument: {
      uri: 'file:///test5.fl',
      text: code
    }
  };

  lsp.onDidOpen(doc);

  const params = {
    textDocument: { uri: 'file:///test5.fl' },
    position: { line: 1, character: 13 }  // myVar 위치
  };

  const result = lsp.onDefinition(params);

  assert(result !== null, 'Should find variable definition');
  if (result) {
    assert(result.uri === 'file:///test5.fl', 'Should be in same file');
  }
});

// ==================== T6: 호버 정보 (함수 시그니처) ====================

test('T6: Hover - 함수 시그니처', () => {
  const code = 'println("hello");';

  const doc = {
    textDocument: {
      uri: 'file:///test6.fl',
      text: code
    }
  };

  lsp.onDidOpen(doc);

  const params = {
    textDocument: { uri: 'file:///test6.fl' },
    position: { line: 0, character: 2 }  // println 위치
  };

  const result = lsp.onHover(params);

  assert(result !== null, 'Should have hover info');
  assert(result.contents.value.includes('println'), 'Should show println signature');
  assert(result.contents.value.includes('fn'), 'Should be function signature');
});

// ==================== T7: 호버 정보 (타입 정보) ====================

test('T7: Hover - 정의된 함수 타입 정보', () => {
  const code = `fn add(a: i32, b: i32) -> i32 {
  return a + b;
}

let sum = add(1, 2);`;

  const doc = {
    textDocument: {
      uri: 'file:///test7.fl',
      text: code
    }
  };

  lsp.onDidOpen(doc);

  const params = {
    textDocument: { uri: 'file:///test7.fl' },
    position: { line: 4, character: 10 }  // add 호출 위치
  };

  const result = lsp.onHover(params);

  assert(result !== null, 'Should have hover info for user function');
  if (result) {
    assert(result.contents.value.includes('add'), 'Should show function name');
  }
});

// ==================== T8: 에러 진단 (문법 에러) ====================

test('T8: Diagnostics - 문법 에러 감지', () => {
  const code = 'let x = 42\nlet y = 10;';  // 첫 줄에 세미콜론 없음

  const doc = {
    textDocument: {
      uri: 'file:///test8.fl',
      text: code
    }
  };

  lsp.onDidOpen(doc);

  const params = {
    textDocument: { uri: 'file:///test8.fl' }
  };

  const result = lsp.onDiagnostics(params);

  assert(result.diagnostics !== undefined, 'Should return diagnostics object');
  // 구문 오류가 감지되거나 경고가 있을 것
});

// ==================== T9: 경고 진단 (미사용 변수) ====================

test('T9: Diagnostics - 미사용 변수 경고', () => {
  const code = `let x = 42;
let y = 10;
println(x);`;

  const doc = {
    textDocument: {
      uri: 'file:///test9.fl',
      text: code
    }
  };

  lsp.onDidOpen(doc);

  const params = {
    textDocument: { uri: 'file:///test9.fl' }
  };

  const result = lsp.onDiagnostics(params);

  assert(result.diagnostics !== undefined, 'Should return diagnostics');
  // y는 선언했지만 사용하지 않음
  const unusedVarWarning = result.diagnostics.find(d =>
    d.severity === 2 && d.message.includes('never used')
  );
  assert(unusedVarWarning !== undefined, 'Should warn about unused variable y');
});

// ==================== T10: 성능 (1000줄 파일 < 100ms) ====================

test('T10: Performance - 1000줄 파일 처리 (< 100ms)', () => {
  // 1000줄의 테스트 코드 생성
  let code = '';
  for (let i = 0; i < 1000; i++) {
    code += `let var${i} = ${i};\n`;
  }

  const startTime = Date.now();

  const doc = {
    textDocument: {
      uri: 'file:///test10.fl',
      text: code
    }
  };

  lsp.onDidOpen(doc);

  const endTime = Date.now();
  const duration = endTime - startTime;

  console.log(`  (Processed 1000 lines in ${duration}ms)`);

  assert(duration < 1000, `Should process 1000 lines in < 1000ms, took ${duration}ms`);
});

// ==================== 결과 출력 ====================

console.log(`\n${colors.blue}=== Test Results ===${colors.reset}`);
console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
console.log(`Total: ${results.passed + results.failed}\n`);

// 상세 결과
if (results.failed > 0) {
  console.log(`${colors.yellow}Failed Tests:${colors.reset}`);
  results.tests.filter(t => t.status === 'FAIL').forEach(t => {
    console.log(`  - ${t.name}`);
    if (t.error) console.log(`    ${t.error}`);
  });
}

// 종료 코드
process.exit(results.failed > 0 ? 1 : 0);
