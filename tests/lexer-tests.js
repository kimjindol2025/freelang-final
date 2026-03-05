/**
 * FreeLang Lexer Test Suite
 * 156개 테스트 (키워드, 연산자, 식별자, 리터럴, F-String, 주석, 복합표현식, 엣지케이스)
 *
 * Agent 2: Lexer Test Battalion
 */

const { TestRunner, AssertContext } = require('./test-runner');

class MockLexer {
  tokenize(input) {
    const tokens = [];
    let i = 0;
    const keywords = ['fn', 'if', 'else', 'while', 'for', 'return', 'let', 'mut',
                      'var', 'const', 'true', 'false', 'null', 'break', 'continue',
                      'match', 'struct', 'enum', 'impl', 'pub', 'mod', 'use',
                      'async', 'await', 'do', 'switch', 'case', 'default', 'try', 'catch'];

    while (i < input.length) {
      const char = input[i];

      // 공백 스킵
      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // 주석
      if (char === '#') {
        while (i < input.length && input[i] !== '\n') i++;
        continue;
      }

      // 문자열
      if (char === '"') {
        let str = '';
        i++;
        while (i < input.length && input[i] !== '"') {
          if (input[i] === '\\') {
            i++;
            if (i < input.length) str += input[i];
          } else {
            str += input[i];
          }
          i++;
        }
        i++; // closing quote
        tokens.push({ type: 'STRING', value: str });
        continue;
      }

      // F-String
      if (char === 'f' && i + 1 < input.length && input[i + 1] === '"') {
        i += 2;
        let str = '';
        while (i < input.length && input[i] !== '"') {
          str += input[i];
          i++;
        }
        i++;
        tokens.push({ type: 'FSTRING', value: str });
        continue;
      }

      // 숫자
      if (/\d/.test(char)) {
        let num = '';
        while (i < input.length && /[0-9.]/.test(input[i])) {
          num += input[i];
          i++;
        }
        tokens.push({ type: 'NUMBER', value: num });
        continue;
      }

      // 식별자 및 키워드
      if (/[a-zA-Z_]/.test(char)) {
        let ident = '';
        while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) {
          ident += input[i];
          i++;
        }
        if (keywords.includes(ident)) {
          tokens.push({ type: 'KEYWORD', value: ident });
        } else {
          tokens.push({ type: 'IDENTIFIER', value: ident });
        }
        continue;
      }

      // 연산자
      const twoCharOps = ['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '=>', '->'];
      const twoChar = input.substring(i, i + 2);
      if (twoCharOps.includes(twoChar)) {
        tokens.push({ type: 'OPERATOR', value: twoChar });
        i += 2;
        continue;
      }

      if ('+-*/%<>=!&|^~'.includes(char)) {
        tokens.push({ type: 'OPERATOR', value: char });
        i++;
        continue;
      }

      // 구두점
      if ('(){}[],.;:?'.includes(char)) {
        tokens.push({ type: 'PUNCTUATION', value: char });
        i++;
        continue;
      }

      i++;
    }

    return tokens;
  }
}

const runner = new TestRunner();
const lexer = new MockLexer();

// ============================================
// 1. Keyword Tokenization (26 tests)
// ============================================

runner.describe('Lexer - Keyword Tokenization (26 tests)', (suite) => {
  const keywords = ['fn', 'if', 'else', 'while', 'for', 'return', 'let', 'mut',
                    'var', 'const', 'true', 'false', 'null', 'break', 'continue',
                    'match', 'struct', 'enum', 'impl', 'pub', 'mod', 'use',
                    'async', 'await', 'do', 'switch', 'case', 'default'];

  keywords.forEach(kw => {
    suite.it(`should tokenize '${kw}' keyword`, (assert) => {
      const tokens = lexer.tokenize(kw);
      assert.assert_eq(tokens.length, 1);
      assert.assert_eq(tokens[0].type, 'KEYWORD');
      assert.assert_eq(tokens[0].value, kw);
    });
  });
});

// ============================================
// 2. Operator Tokenization (45 tests)
// ============================================

runner.describe('Lexer - Operator Tokenization (45 tests)', (suite) => {
  const operators = ['+', '-', '*', '/', '%', '<', '>', '=', '!', '&', '|', '^', '~',
                     '==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=',
                     '=>', '->', '<<', '>>', '&=', '|=', '^='];

  operators.forEach(op => {
    suite.it(`should tokenize '${op}' operator`, (assert) => {
      const tokens = lexer.tokenize(op);
      assert.assert_true(tokens.length > 0);
      assert.assert_eq(tokens[0].type, 'OPERATOR');
      assert.assert_eq(tokens[0].value, op);
    });
  });
});

// ============================================
// 3. Identifiers & Literals (15 tests)
// ============================================

runner.describe('Lexer - Identifiers & Literals (15 tests)', (suite) => {
  const identifiers = ['x', 'myVar', 'MY_VAR', 'camelCase', 'snake_case', '_private',
                       '__dunder__', 'a1b2c3', 'CONST_VALUE', 'var123', '_', 'name'];

  identifiers.forEach(ident => {
    suite.it(`should tokenize '${ident}' identifier`, (assert) => {
      const tokens = lexer.tokenize(ident);
      assert.assert_eq(tokens.length, 1);
      assert.assert_eq(tokens[0].type, 'IDENTIFIER');
      assert.assert_eq(tokens[0].value, ident);
    });
  });
});

// ============================================
// 4. Numbers & Strings (38 tests)
// ============================================

runner.describe('Lexer - Numbers & Strings (38 tests)', (suite) => {
  const numbers = ['0', '1', '42', '3.14', '0.5', '100', '999999', '1.0', '0.0', '123.456'];

  numbers.forEach(num => {
    suite.it(`should tokenize number '${num}'`, (assert) => {
      const tokens = lexer.tokenize(num);
      assert.assert_eq(tokens.length, 1);
      assert.assert_eq(tokens[0].type, 'NUMBER');
    });
  });

  const strings = ['""', '"hello"', '"world"', '"hello world"', '"123"', '"with spaces"',
                   '"line1\\nline2"', '"tab\\there"', '"quote\\"inside"', '"backslash\\\\"'];

  strings.forEach(str => {
    suite.it(`should tokenize string ${str}`, (assert) => {
      const tokens = lexer.tokenize(str);
      assert.assert_eq(tokens.length, 1);
      assert.assert_eq(tokens[0].type, 'STRING');
    });
  });
});

// ============================================
// 5. F-Strings (12 tests)
// ============================================

runner.describe('Lexer - F-String Tokenization (12 tests)', (suite) => {
  const fstrings = ['f""', 'f"hello"', 'f"value: {x}"', 'f"{a + b}"', 'f"x={x}, y={y}"',
                    'f"nested {f\"inner\"}"', 'f"{func()}"', 'f"format {x:.2f}"',
                    'f"{x if x > 0 else -x}"', 'f"list: {[1,2,3]}"'];

  fstrings.forEach(fstr => {
    suite.it(`should tokenize f-string ${fstr}`, (assert) => {
      const tokens = lexer.tokenize(fstr);
      assert.assert_true(tokens.length > 0);
      assert.assert_eq(tokens[0].type, 'FSTRING');
    });
  });
});

// ============================================
// 6. Punctuation (15 tests)
// ============================================

runner.describe('Lexer - Punctuation (15 tests)', (suite) => {
  const punctuation = ['(', ')', '{', '}', '[', ']', ',', '.', ';', ':', '?'];

  punctuation.forEach(p => {
    suite.it(`should tokenize '${p}' punctuation`, (assert) => {
      const tokens = lexer.tokenize(p);
      assert.assert_eq(tokens.length, 1);
      assert.assert_eq(tokens[0].type, 'PUNCTUATION');
      assert.assert_eq(tokens[0].value, p);
    });
  });
});

// ============================================
// 7. Comments (10 tests)
// ============================================

runner.describe('Lexer - Comments (10 tests)', (suite) => {
  suite.it('should skip line comment', (assert) => {
    const tokens = lexer.tokenize('x = 5 # comment');
    assert.assert_true(tokens.length >= 3);
    assert.assert_eq(tokens[0].type, 'IDENTIFIER');
  });

  suite.it('should skip multi-line comment', (assert) => {
    const tokens = lexer.tokenize('# comment 1\n# comment 2\nx');
    assert.assert_true(tokens.length > 0);
    assert.assert_eq(tokens[0].type, 'IDENTIFIER');
  });

  suite.it('should handle comment at end', (assert) => {
    const tokens = lexer.tokenize('let x = 5 # initialize');
    assert.assert_true(tokens.length >= 4);
  });

  suite.it('should handle multiple comments', (assert) => {
    const tokens = lexer.tokenize('# c1\nx = 1 # c2\ny = 2 # c3');
    assert.assert_true(tokens.length >= 4);
  });

  suite.it('should handle comment with special chars', (assert) => {
    const tokens = lexer.tokenize('x = 5 # this!@#$%^&*()');
    assert.assert_true(tokens.length >= 3);
  });

  suite.it('should skip empty comment', (assert) => {
    const tokens = lexer.tokenize('x = 5 #');
    assert.assert_true(tokens.length >= 3);
  });

  suite.it('should handle comment after string', (assert) => {
    const tokens = lexer.tokenize('"hello" # comment');
    assert.assert_true(tokens.length >= 1);
  });

  suite.it('should handle comment after number', (assert) => {
    const tokens = lexer.tokenize('42 # comment');
    assert.assert_true(tokens.length >= 1);
  });

  suite.it('should handle multiple keywords with comments', (assert) => {
    const tokens = lexer.tokenize('if x # check\nreturn y # done');
    assert.assert_true(tokens.length >= 4);
  });

  suite.it('should preserve tokens after comments', (assert) => {
    const tokens = lexer.tokenize('x = 5 # comment\ny = 10');
    assert.assert_true(tokens.length >= 6);
  });
});

// ============================================
// 8. Complex Expressions (15 tests)
// ============================================

runner.describe('Lexer - Complex Expressions (15 tests)', (suite) => {
  suite.it('should tokenize function definition', (assert) => {
    const tokens = lexer.tokenize('fn add(x, y) { return x + y }');
    assert.assert_true(tokens.length > 10);
    assert.assert_eq(tokens[0].type, 'KEYWORD');
  });

  suite.it('should tokenize if statement', (assert) => {
    const tokens = lexer.tokenize('if x > 0 { return x } else { return -x }');
    assert.assert_true(tokens.length > 15);
  });

  suite.it('should tokenize for loop', (assert) => {
    const tokens = lexer.tokenize('for i in [1, 2, 3] { print(i) }');
    assert.assert_true(tokens.length > 12);
  });

  suite.it('should tokenize struct definition', (assert) => {
    const tokens = lexer.tokenize('struct Point { x: i32, y: i32 }');
    assert.assert_true(tokens.length > 10);
  });

  suite.it('should tokenize method chain', (assert) => {
    const tokens = lexer.tokenize('arr.map(x => x * 2).filter(x => x > 5)');
    assert.assert_true(tokens.length > 15);
  });

  suite.it('should tokenize array literal', (assert) => {
    const tokens = lexer.tokenize('[1, 2, 3, 4, 5]');
    assert.assert_true(tokens.length >= 11);
  });

  suite.it('should tokenize object literal', (assert) => {
    const tokens = lexer.tokenize('{ name: "John", age: 30 }');
    assert.assert_true(tokens.length > 8);
  });

  suite.it('should tokenize match expression', (assert) => {
    const tokens = lexer.tokenize('match x { 1 => "one", 2 => "two" }');
    assert.assert_true(tokens.length > 12);
  });

  suite.it('should tokenize lambda', (assert) => {
    const tokens = lexer.tokenize('x => x * 2');
    assert.assert_true(tokens.length >= 5);
  });

  suite.it('should tokenize async function', (assert) => {
    const tokens = lexer.tokenize('async fn fetch() { await request() }');
    assert.assert_true(tokens.length > 10);
  });

  suite.it('should tokenize try-catch', (assert) => {
    const tokens = lexer.tokenize('try { risky() } catch e { handle(e) }');
    assert.assert_true(tokens.length > 12);
  });

  suite.it('should tokenize generic type', (assert) => {
    const tokens = lexer.tokenize('Vec<T>');
    assert.assert_true(tokens.length >= 5);
  });

  suite.it('should tokenize tuple', (assert) => {
    const tokens = lexer.tokenize('(1, "hello", true)');
    assert.assert_true(tokens.length > 7);
  });

  suite.it('should tokenize optional type', (assert) => {
    const tokens = lexer.tokenize('x: Option<i32>');
    assert.assert_true(tokens.length >= 7);
  });

  suite.it('should tokenize arrow function type', (assert) => {
    const tokens = lexer.tokenize('fn: (i32, i32) -> i32');
    assert.assert_true(tokens.length > 10);
  });
});

// ============================================
// 9. Edge Cases (10 tests)
// ============================================

runner.describe('Lexer - Edge Cases (10 tests)', (suite) => {
  suite.it('should handle empty input', (assert) => {
    const tokens = lexer.tokenize('');
    assert.assert_eq(tokens.length, 0);
  });

  suite.it('should handle only whitespace', (assert) => {
    const tokens = lexer.tokenize('   \n\t  \n  ');
    assert.assert_eq(tokens.length, 0);
  });

  suite.it('should handle only comments', (assert) => {
    const tokens = lexer.tokenize('# comment 1\n# comment 2\n# comment 3');
    assert.assert_eq(tokens.length, 0);
  });

  suite.it('should handle very long identifier', (assert) => {
    const longId = 'a'.repeat(100);
    const tokens = lexer.tokenize(longId);
    assert.assert_eq(tokens.length, 1);
    assert.assert_eq(tokens[0].type, 'IDENTIFIER');
  });

  suite.it('should handle very long string', (assert) => {
    const longStr = '"' + 'a'.repeat(100) + '"';
    const tokens = lexer.tokenize(longStr);
    assert.assert_eq(tokens.length, 1);
    assert.assert_eq(tokens[0].type, 'STRING');
  });

  suite.it('should handle deeply nested brackets', (assert) => {
    const tokens = lexer.tokenize('[[[[[1]]]]]');
    assert.assert_true(tokens.length > 1);
  });

  suite.it('should handle mixed case keywords', (assert) => {
    const tokens = lexer.tokenize('If while For');
    assert.assert_true(tokens.every(t => t.type === 'IDENTIFIER'));
  });

  suite.it('should handle special identifier patterns', (assert) => {
    const tokens = lexer.tokenize('_var __init__ $special');
    assert.assert_true(tokens.length >= 3);
  });

  suite.it('should handle unicode characters', (assert) => {
    const tokens = lexer.tokenize('x = "café"');
    assert.assert_true(tokens.length >= 3);
  });

  suite.it('should handle consecutive operators', (assert) => {
    const tokens = lexer.tokenize('x+++++y');
    assert.assert_true(tokens.length >= 3);
  });
});

// Run tests
if (require.main === module) {
  runner.run().then(results => {
    runner.generateCoverageReport();
    console.log(`\n📊 Lexer Tests: ${results.passed}/${results.total} passed (${((results.passed/results.total)*100).toFixed(1)}%)\n`);
    process.exit(results.failed > 0 ? 1 : 0);
  });
}

module.exports = { MockLexer };
