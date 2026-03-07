// Complete FreeLang Lexer
// Source code → Tokens
// Status: PRODUCTION READY
// Written: 2026-03-07

// ============================================
// Token Types
// ============================================

const TokenType = {
  NUMBER: 'number',
  STRING: 'string',
  IDENTIFIER: 'identifier',
  KEYWORD: 'keyword',
  OPERATOR: 'operator',
  PUNCTUATION: 'punctuation',
  COMMENT: 'comment',
  WHITESPACE: 'whitespace',
  EOF: 'eof'
};

// ============================================
// Keywords
// ============================================

const KEYWORDS = new Set([
  'fn', 'if', 'else', 'while', 'for', 'in', 'return',
  'true', 'false', 'null', 'struct', 'import', 'export',
  'let', 'const', 'var', 'class', 'extends', 'this',
  'and', 'or', 'not', 'break', 'continue'
]);

// ============================================
// Lexer
// ============================================

class Lexer {
  constructor(source) {
    this.source = source;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
    this.errors = [];
  }

  currentChar() {
    if (this.position < this.source.length) {
      return this.source[this.position];
    }
    return null;
  }

  peekChar(offset = 1) {
    const pos = this.position + offset;
    if (pos < this.source.length) {
      return this.source[pos];
    }
    return null;
  }

  advance() {
    const char = this.currentChar();
    this.position++;

    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }

    return char;
  }

  addToken(type, value) {
    this.tokens.push({
      type,
      value,
      line: this.line,
      column: this.column
    });
  }

  skipWhitespace() {
    while (this.currentChar() && /\s/.test(this.currentChar())) {
      this.advance();
    }
  }

  skipLineComment() {
    if (this.currentChar() === '/' && this.peekChar() === '/') {
      this.advance();
      this.advance();
      while (this.currentChar() && this.currentChar() !== '\n') {
        this.advance();
      }
    }
  }

  skipBlockComment() {
    if (this.currentChar() === '/' && this.peekChar() === '*') {
      this.advance();
      this.advance();

      while (this.currentChar()) {
        if (this.currentChar() === '*' && this.peekChar() === '/') {
          this.advance();
          this.advance();
          break;
        }
        this.advance();
      }
    }
  }

  readNumber() {
    let num = '';
    while (this.currentChar() && /[0-9.]/.test(this.currentChar())) {
      num += this.currentChar();
      this.advance();
    }
    return num;
  }

  readString(quote) {
    let str = '';
    this.advance();

    while (this.currentChar() && this.currentChar() !== quote) {
      if (this.currentChar() === '\\') {
        this.advance();
        const next = this.currentChar();
        if (next === 'n') str += '\n';
        else if (next === 't') str += '\t';
        else if (next === 'r') str += '\r';
        else if (next === '\\') str += '\\';
        else str += next;
        this.advance();
      } else {
        str += this.currentChar();
        this.advance();
      }
    }

    if (this.currentChar() === quote) {
      this.advance();
    } else {
      this.errors.push(`Unterminated string at line ${this.line}`);
    }

    return str;
  }

  readIdentifier() {
    let id = '';
    while (this.currentChar() && /[a-zA-Z0-9_]/.test(this.currentChar())) {
      id += this.currentChar();
      this.advance();
    }
    return id;
  }

  tokenize() {
    while (this.position < this.source.length) {
      this.skipWhitespace();

      if (this.position >= this.source.length) break;

      if (this.currentChar() === '/' && (this.peekChar() === '/' || this.peekChar() === '*')) {
        if (this.peekChar() === '/') {
          this.skipLineComment();
        } else {
          this.skipBlockComment();
        }
        continue;
      }

      const char = this.currentChar();

      if (/[0-9]/.test(char)) {
        const num = this.readNumber();
        this.addToken(TokenType.NUMBER, num);
        continue;
      }

      if (char === '"' || char === '\'') {
        const str = this.readString(char);
        this.addToken(TokenType.STRING, str);
        continue;
      }

      if (/[a-zA-Z_]/.test(char)) {
        const id = this.readIdentifier();
        if (KEYWORDS.has(id)) {
          this.addToken(TokenType.KEYWORD, id);
        } else {
          this.addToken(TokenType.IDENTIFIER, id);
        }
        continue;
      }

      const twoChar = char + (this.peekChar() || '');
      if (['==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/='].includes(twoChar)) {
        this.addToken(TokenType.OPERATOR, twoChar);
        this.advance();
        this.advance();
        continue;
      }

      if ('+-*/%<>=!&|^'.includes(char)) {
        this.addToken(TokenType.OPERATOR, char);
        this.advance();
        continue;
      }

      if ('()[]{}.,;:?'.includes(char)) {
        this.addToken(TokenType.PUNCTUATION, char);
        this.advance();
        continue;
      }

      this.errors.push(`Unexpected character '${char}' at line ${this.line}, column ${this.column}`);
      this.advance();
    }

    this.addToken(TokenType.EOF, '');
    return { tokens: this.tokens, errors: this.errors };
  }
}

module.exports = {
  Lexer,
  TokenType,
  KEYWORDS
};
