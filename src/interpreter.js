/**
 * FreeLang Interpreter (Main)
 * Lexer → Parser → Evaluator 파이프라인
 */

const { Lexer } = require('./lexer');
const { Parser } = require('./parser');
const { Evaluator } = require('./evaluator');

class FreeLangInterpreter {
  constructor() {
    this.evaluator = new Evaluator();
  }

  /**
   * 주어진 FreeLang 소스 코드를 실행
   * @param {string} source - FreeLang 소스 코드
   * @returns {*} 프로그램 실행 결과
   */
  execute(source) {
    try {
      // Step 1: Lexical analysis (소스 → 토큰)
      const lexer = new Lexer(source);
      const tokens = lexer.tokenize();

      // Step 2: Syntax analysis (토큰 → AST)
      const parser = new Parser(tokens);
      const ast = parser.parse();

      // Step 3: Evaluation (AST → 실행)
      const result = this.evaluator.evaluate(ast);

      return {
        success: true,
        result: result,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        result: null,
        error: error.message || String(error)
      };
    }
  }

  /**
   * REPL (Read-Eval-Print-Loop) 모드로 인터프리터 시작
   */
  repl() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'freeLang> '
    });

    console.log('FreeLang Interpreter v2.6.0');
    console.log('Type "exit" to quit');
    console.log('---');

    rl.prompt();

    rl.on('line', (input) => {
      if (input.toLowerCase() === 'exit') {
        console.log('Goodbye!');
        process.exit(0);
      }

      if (input.trim()) {
        const result = this.execute(input);
        if (result.success) {
          if (result.result !== null && result.result !== undefined) {
            console.log(result.result);
          }
        } else {
          console.error(`Error: ${result.error}`);
        }
      }

      rl.prompt();
    });

    rl.on('close', () => {
      console.log('\nGoodbye!');
      process.exit(0);
    });
  }

  /**
   * 파일에서 FreeLang 코드를 로드하고 실행
   * @param {string} filePath - .fl 파일 경로
   */
  executeFile(filePath) {
    const fs = require('fs');
    try {
      const source = fs.readFileSync(filePath, 'utf8');
      return this.execute(source);
    } catch (error) {
      return {
        success: false,
        result: null,
        error: `File error: ${error.message}`
      };
    }
  }
}

module.exports = FreeLangInterpreter;
