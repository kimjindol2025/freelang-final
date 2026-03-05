/**
 * FreeLang Language Server Protocol (LSP) Implementation
 *
 * JSON-RPC 기반 LSP 서버
 * - 자동완성 (Completion)
 * - 정의로 이동 (Definition)
 * - 호버 정보 (Hover)
 * - 에러 진단 (Diagnostics)
 * - 코드 포맷팅 (Formatting)
 */

const net = require('net');
const { Lexer, TokenType } = require('../lexer');
const Parser = require('../parser');

// ==================== LSP Server ====================

class LSPServer {
  constructor(port = 8088) {
    this.port = port;
    this.server = null;
    this.documents = new Map(); // URI -> {code, ast, tokens}
    this.symbols = new Map();   // URI -> [symbol definitions]
    this.definitions = {};      // symbol -> {file, line, character}

    // 내장 함수 목록 (시그니처 포함)
    this.builtinFunctions = {
      'println': { signature: 'fn println(value: any) -> void', doc: 'Print value with newline' },
      'print': { signature: 'fn print(value: any) -> void', doc: 'Print value without newline' },
      'read_file': { signature: 'fn read_file(path: string) -> string', doc: 'Read file contents' },
      'write_file': { signature: 'fn write_file(path: string, content: string) -> void', doc: 'Write to file' },
      'append_file': { signature: 'fn append_file(path: string, content: string) -> void', doc: 'Append to file' },
      'fetch': { signature: 'fn fetch(url: string, method?: string, options?: object) -> string', doc: 'HTTP request' },
      'json_parse': { signature: 'fn json_parse(text: string) -> object', doc: 'Parse JSON' },
      'json_stringify': { signature: 'fn json_stringify(obj: object, pretty?: bool) -> string', doc: 'Stringify to JSON' },
      'upper': { signature: 'fn upper(s: string) -> string', doc: 'Convert to uppercase' },
      'lower': { signature: 'fn lower(s: string) -> string', doc: 'Convert to lowercase' },
      'trim': { signature: 'fn trim(s: string) -> string', doc: 'Remove leading/trailing whitespace' },
      'split': { signature: 'fn split(s: string, sep: string) -> array', doc: 'Split string' },
      'join': { signature: 'fn join(arr: array, sep: string) -> string', doc: 'Join array elements' },
      'length': { signature: 'fn length(val: any) -> i32', doc: 'Get length' },
      'type_of': { signature: 'fn type_of(val: any) -> string', doc: 'Get type name' },
      'now': { signature: 'fn now() -> i64', doc: 'Current timestamp' },
      'sleep': { signature: 'fn sleep(ms: i32) -> void', doc: 'Sleep for milliseconds' },
      'exit': { signature: 'fn exit(code?: i32) -> void', doc: 'Exit program' },
    };

    // 키워드
    this.keywords = [
      'let', 'const', 'var', 'fn', 'if', 'else', 'while', 'for', 'in',
      'return', 'true', 'false', 'null', 'struct', 'enum', 'break',
      'continue', 'try', 'catch', 'finally', 'throw', 'import', 'from',
      'export', 'default', 'as', 'async', 'await', 'match'
    ];
  }

  /**
   * JSON-RPC 메시지 파싱 및 처리
   */
  onMessage(messageStr) {
    try {
      const message = JSON.parse(messageStr);
      const { method, params, id } = message;

      let result = null;

      switch (method) {
        case 'initialize':
          result = this.onInitialize(params);
          break;
        case 'textDocument/didOpen':
          result = this.onDidOpen(params);
          break;
        case 'textDocument/didChange':
          result = this.onDidChange(params);
          break;
        case 'textDocument/completion':
          result = this.onCompletion(params);
          break;
        case 'textDocument/definition':
          result = this.onDefinition(params);
          break;
        case 'textDocument/hover':
          result = this.onHover(params);
          break;
        case 'textDocument/diagnostic':
          result = this.onDiagnostics(params);
          break;
        case 'textDocument/formatting':
          result = this.onFormat(params);
          break;
        default:
          result = { error: 'Unknown method' };
      }

      return {
        jsonrpc: '2.0',
        id,
        result
      };
    } catch (error) {
      return {
        jsonrpc: '2.0',
        error: { code: -32700, message: error.message }
      };
    }
  }

  // ==================== Lifecycle ====================

  onInitialize(params) {
    return {
      capabilities: {
        completionProvider: { resolveProvider: true },
        definitionProvider: true,
        hoverProvider: true,
        diagnosticProvider: { interFileDependencies: false, workspaceDiagnostics: false },
        documentFormattingProvider: true,
        textDocumentSync: 1 // Full
      },
      serverInfo: {
        name: 'FreeLang LSP',
        version: '1.0.0'
      }
    };
  }

  onDidOpen(params) {
    const uri = params.textDocument.uri;
    const code = params.textDocument.text;
    this.documents.set(uri, { code, ast: null, tokens: [] });
    this.updateDocument(uri, code);
    return null;
  }

  onDidChange(params) {
    const uri = params.textDocument.uri;
    const changes = params.contentChanges;

    let code = '';
    if (this.documents.has(uri)) {
      code = this.documents.get(uri).code;
    }

    // Full document sync
    if (changes.length > 0 && !changes[0].range) {
      code = changes[0].text;
    } else {
      // Incremental updates
      for (const change of changes) {
        if (change.range) {
          const { start, end } = change.range;
          const lines = code.split('\n');
          // Simple implementation
          code = code.substring(0, code.indexOf('\n') * start.line + start.character) +
                 change.text +
                 code.substring(code.indexOf('\n') * end.line + end.character);
        }
      }
    }

    this.updateDocument(uri, code);
    return null;
  }

  updateDocument(uri, code) {
    try {
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      this.documents.set(uri, { code, ast, tokens });
      this.extractSymbols(uri, ast);
    } catch (error) {
      // 파싱 실패: 토큰 정보만 유지
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      this.documents.set(uri, { code, ast: null, tokens });
    }
  }

  // ==================== 자동완성 (Completion) ====================

  onCompletion(params) {
    const uri = params.textDocument.uri;
    const { line, character } = params.position;
    const doc = this.documents.get(uri);

    if (!doc) return { isIncomplete: false, items: [] };

    // 현재 단어 추출
    const lines = doc.code.split('\n');
    const currentLine = lines[line] || '';
    const wordStart = this.getWordStartPos(currentLine, character);
    const prefix = currentLine.substring(wordStart, character).toLowerCase();

    const completions = [];

    // 1. 키워드 제안
    for (const keyword of this.keywords) {
      if (keyword.startsWith(prefix)) {
        completions.push({
          label: keyword,
          kind: 14, // Keyword
          detail: 'keyword',
          insertText: keyword
        });
      }
    }

    // 2. 내장 함수 제안
    for (const [name, info] of Object.entries(this.builtinFunctions)) {
      if (name.startsWith(prefix)) {
        completions.push({
          label: name,
          kind: 3, // Function
          detail: info.signature,
          documentation: info.doc,
          insertText: name + '()'
        });
      }
    }

    // 3. 정의된 변수/함수 제안
    const symbols = this.symbols.get(uri) || [];
    for (const sym of symbols) {
      if (sym.name.startsWith(prefix)) {
        completions.push({
          label: sym.name,
          kind: sym.kind === 'function' ? 12 : 13,
          detail: sym.kind,
          insertText: sym.name
        });
      }
    }

    // 중복 제거 및 정렬
    const seen = new Set();
    const unique = completions.filter(c => {
      if (seen.has(c.label)) return false;
      seen.add(c.label);
      return true;
    });

    return {
      isIncomplete: false,
      items: unique.sort((a, b) => a.label.localeCompare(b.label))
    };
  }

  // ==================== 정의로 이동 (Definition) ====================

  onDefinition(params) {
    const uri = params.textDocument.uri;
    const { line, character } = params.position;
    const doc = this.documents.get(uri);

    if (!doc) return null;

    // 현재 단어 추출
    const lines = doc.code.split('\n');
    const currentLine = lines[line] || '';
    const { start, end } = this.getWordRange(currentLine, character);
    const symbol = currentLine.substring(start, end);

    if (!symbol) return null;

    // 현재 파일의 심볼 검색
    const symbols = this.symbols.get(uri) || [];
    const found = symbols.find(s => s.name === symbol);

    if (found) {
      return {
        uri,
        range: {
          start: { line: found.line, character: found.character },
          end: { line: found.line, character: found.character + symbol.length }
        }
      };
    }

    return null;
  }

  // ==================== 호버 정보 (Hover) ====================

  onHover(params) {
    const uri = params.textDocument.uri;
    const { line, character } = params.position;
    const doc = this.documents.get(uri);

    if (!doc) return null;

    // 현재 단어 추출
    const lines = doc.code.split('\n');
    const currentLine = lines[line] || '';
    const { start, end } = this.getWordRange(currentLine, character);
    const symbol = currentLine.substring(start, end);

    if (!symbol) return null;

    // 1. 내장 함수 검색
    if (this.builtinFunctions[symbol]) {
      const info = this.builtinFunctions[symbol];
      return {
        contents: {
          language: 'freelang',
          value: info.signature
        },
        range: {
          start: { line, character: start },
          end: { line, character: end }
        }
      };
    }

    // 2. 정의된 심볼 검색
    const symbols = this.symbols.get(uri) || [];
    const sym = symbols.find(s => s.name === symbol);

    if (sym) {
      const sig = sym.kind === 'function' ?
        `fn ${sym.name}(${sym.params ? sym.params.join(', ') : ''})` :
        `${sym.kind} ${sym.name}`;

      return {
        contents: {
          language: 'freelang',
          value: sig
        },
        range: {
          start: { line, character: start },
          end: { line, character: end }
        }
      };
    }

    return null;
  }

  // ==================== 에러 진단 (Diagnostics) ====================

  onDiagnostics(params) {
    const uri = params.textDocument.uri;
    const doc = this.documents.get(uri);

    if (!doc) return { diagnostics: [] };

    const diagnostics = [];

    // 1. 파싱 에러 검사
    try {
      const lexer = new Lexer(doc.code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      parser.parse();
    } catch (error) {
      diagnostics.push({
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 10 }
        },
        severity: 1, // Error
        message: `Parse error: ${error.message}`,
        source: 'freelang'
      });
    }

    // 2. 미사용 변수 경고
    const code = doc.code;
    const lines = code.split('\n');

    // 간단한 정규표현식 기반 검사
    const varRegex = /\b(let|const|var)\s+(\w+)/g;
    const usageRegex = /\b(\w+)\b/g;

    const variables = new Map();
    let match;

    // 변수 선언 수집
    while ((match = varRegex.exec(code)) !== null) {
      const varName = match[2];
      const pos = this.getLineCharacter(code, match.index);
      variables.set(varName, { ...pos, used: false });
    }

    // 사용 확인
    usageRegex.lastIndex = 0;
    while ((match = usageRegex.exec(code)) !== null) {
      const varName = match[1];
      if (variables.has(varName)) {
        const variable = variables.get(varName);
        variable.used = true;
      }
    }

    // 미사용 변수 경고
    for (const [name, info] of variables) {
      if (!info.used) {
        diagnostics.push({
          range: {
            start: { line: info.line, character: info.character },
            end: { line: info.line, character: info.character + name.length }
          },
          severity: 2, // Warning
          message: `Variable '${name}' is defined but never used`,
          source: 'freelang'
        });
      }
    }

    return { diagnostics };
  }

  // ==================== 코드 포맷팅 (Formatting) ====================

  onFormat(params) {
    const uri = params.textDocument.uri;
    const doc = this.documents.get(uri);

    if (!doc) return [];

    const code = doc.code;
    const formatted = this.formatCode(code);

    // 변경사항이 있으면 전체 파일 교체
    if (formatted !== code) {
      return [{
        range: {
          start: { line: 0, character: 0 },
          end: { line: code.split('\n').length, character: 0 }
        },
        newText: formatted
      }];
    }

    return [];
  }

  // ==================== 유틸리티 메서드 ====================

  /**
   * 심볼 추출 (변수, 함수 정의)
   */
  extractSymbols(uri, ast) {
    const symbols = [];

    if (!ast) return;

    const extract = (node, depth = 0) => {
      if (!node) return;

      if (node.type === 'function') {
        symbols.push({
          name: node.name,
          kind: 'function',
          line: node.line || 0,
          character: node.character || 0,
          params: node.params ? node.params.map(p => p.name || p) : []
        });
      } else if (node.type === 'variable' || node.type === 'let' || node.type === 'const') {
        symbols.push({
          name: node.name,
          kind: 'variable',
          line: node.line || 0,
          character: node.character || 0
        });
      }

      // 재귀적으로 처리
      if (node.body) {
        if (Array.isArray(node.body)) {
          node.body.forEach(b => extract(b, depth + 1));
        } else {
          extract(node.body, depth + 1);
        }
      }
      if (node.params && Array.isArray(node.params)) {
        node.params.forEach(p => {
          if (p.name) {
            symbols.push({
              name: p.name,
              kind: 'parameter',
              line: node.line || 0,
              character: node.character || 0
            });
          }
        });
      }
    };

    if (Array.isArray(ast)) {
      ast.forEach(node => extract(node));
    } else {
      extract(ast);
    }

    this.symbols.set(uri, symbols);
  }

  /**
   * 어휘 분석 (토큰 생성)
   */
  tokenize(code) {
    try {
      const lexer = new Lexer(code);
      return lexer.tokenize();
    } catch (error) {
      return [];
    }
  }

  /**
   * 정의 찾기
   */
  findDefinition(symbol) {
    for (const [uri, symbols] of this.symbols) {
      const found = symbols.find(s => s.name === symbol);
      if (found) {
        return { uri, ...found };
      }
    }
    return null;
  }

  /**
   * 호버 정보 조회
   */
  getHoverInfo(symbol) {
    if (this.builtinFunctions[symbol]) {
      return this.builtinFunctions[symbol];
    }

    const def = this.findDefinition(symbol);
    if (def) {
      return {
        signature: `${def.kind} ${def.name}`,
        doc: `Defined at line ${def.line + 1}`
      };
    }

    return null;
  }

  /**
   * 현재 위치의 단어 범위 계산
   */
  getWordRange(line, character) {
    let start = character;
    let end = character;

    // 단어 시작 찾기
    while (start > 0 && /\w/.test(line[start - 1])) {
      start--;
    }

    // 단어 끝 찾기
    while (end < line.length && /\w/.test(line[end])) {
      end++;
    }

    return { start, end };
  }

  /**
   * 단어 시작 위치
   */
  getWordStartPos(line, character) {
    let pos = character;
    while (pos > 0 && /[\w]/.test(line[pos - 1])) {
      pos--;
    }
    return pos;
  }

  /**
   * 코드 내 위치 -> 라인/문자 변환
   */
  getLineCharacter(code, index) {
    const lines = code.substring(0, index).split('\n');
    const line = lines.length - 1;
    const character = lines[lines.length - 1].length;
    return { line, character };
  }

  /**
   * 코드 포맷팅
   */
  formatCode(code) {
    const lines = code.split('\n');
    const formatted = lines.map(line => {
      // 들여쓰기 정규화
      const trimmed = line.trim();
      if (!trimmed) return '';

      // 들여쓰기 레벨 계산
      let indent = 0;
      for (let i = 0; i < lines.indexOf(line); i++) {
        const c = lines[i].trim();
        if (c.includes('{')) indent++;
        if (c.includes('}')) indent = Math.max(0, indent - 1);
      }

      return '  '.repeat(indent) + trimmed;
    }).join('\n');

    return formatted;
  }

  /**
   * 서버 시작
   */
  start() {
    this.server = net.createServer((socket) => {
      let buffer = '';

      socket.on('data', (chunk) => {
        buffer += chunk.toString();

        // 메시지 경계 찾기 (엔터라인)
        const lines = buffer.split('\r\n');

        for (let i = 0; i < lines.length - 1; i++) {
          if (lines[i].trim() === '') {
            // 빈 줄 다음이 메시지
            if (i + 1 < lines.length) {
              const response = this.onMessage(lines[i + 1]);
              socket.write(JSON.stringify(response) + '\r\n\r\n');
            }
          }
        }

        // 남은 데이터 보관
        buffer = lines[lines.length - 1];
      });

      socket.on('end', () => {
        socket.destroy();
      });

      socket.on('error', (err) => {
        console.error('Socket error:', err);
      });
    });

    this.server.listen(this.port, '127.0.0.1', () => {
      console.log(`LSP Server listening on port ${this.port}`);
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log('LSP Server stopped');
    }
  }
}

// ==================== Exports ====================

module.exports = LSPServer;
