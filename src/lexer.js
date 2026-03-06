/**
 * FreeLang Lexer (JavaScript)
 * 소스 코드 → 토큰 변환
 *
 * Token types: number, string, identifier, keyword, operator, punctuation
 */

const TokenType = {
  // Literals
  NUMBER: 'number',
  STRING: 'string',
  IDENTIFIER: 'identifier',

  // Keywords
  LET: 'let',
  CONST: 'const',
  VAR: 'var',
  FN: 'fn',
  IF: 'if',
  ELSE: 'else',
  WHILE: 'while',
  FOR: 'for',
  IN: 'in',
  RETURN: 'return',
  TRUE: 'true',
  FALSE: 'false',
  NULL: 'null',
  STRUCT: 'struct',
  ENUM: 'enum',
  BREAK: 'break',
  CONTINUE: 'continue',
  TRY: 'try',
  CATCH: 'catch',
  THROW: 'throw',
  FINALLY: 'finally',

  // Operators
  PLUS: 'plus',
  MINUS: 'minus',
  STAR: 'star',
  SLASH: 'slash',
  PERCENT: 'percent',
  POWER: 'power',
  EQ: 'eq',           // =
  EQEQ: 'eqeq',       // ==
  EQEQEQ: 'eqeqeq',   // ===
  NOT: 'not',
  NOTEQ: 'noteq',     // !=
  NOTEQUALEQ: 'notequaleq', // !==
  LT: 'lt',
  LTEQ: 'lteq',
  GT: 'gt',
  GTEQ: 'gteq',
  AND: 'and',
  OR: 'or',
  AMPERSAND: 'ampersand', // &
  PIPE: 'pipe',       // |
  CARET: 'caret',     // ^
  TILDE: 'tilde',     // ~
  LSHIFT: 'lshift',   // <<
  RSHIFT: 'rshift',   // >>
  ARROW: 'arrow',     // =>
  PLUSEQ: 'pluseq',   // +=
  MINUSEQ: 'minuseq', // -=
  STAREQ: 'stareq',   // *=
  SLASHEQ: 'slasheq', // /=
  QUESTION: 'question', // ?
  COLON: 'colon',

  // Punctuation
  LPAREN: 'lparen',
  RPAREN: 'rparen',
  LBRACE: 'lbrace',
  RBRACE: 'rbrace',
  LBRACKET: 'lbracket',
  RBRACKET: 'rbracket',
  COMMA: 'comma',
  DOT: 'dot',
  SEMICOLON: 'semicolon',
  BACKSLASH: 'backslash',
  AT: 'at',
  HASH: 'hash',
  DOLLAR: 'dollar',

  // Special
  EOF: 'eof',
  NEWLINE: 'newline'
};

const KEYWORDS = {
  let: TokenType.LET,
  const: TokenType.CONST,
  var: TokenType.VAR,
  fn: TokenType.FN,
  if: TokenType.IF,
  else: TokenType.ELSE,
  while: TokenType.WHILE,
  for: TokenType.FOR,
  in: TokenType.IN,
  return: TokenType.RETURN,
  true: TokenType.TRUE,
  false: TokenType.FALSE,
  null: TokenType.NULL,
  struct: TokenType.STRUCT,
  enum: TokenType.ENUM,
  break: TokenType.BREAK,
  continue: TokenType.CONTINUE,
  try: TokenType.TRY,
  catch: TokenType.CATCH,
  throw: TokenType.THROW,
  finally: TokenType.FINALLY,
  and: TokenType.AND,
  or: TokenType.OR
};

class Token {
  constructor(type, value, line, column) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
  }

  toString() {
    return `Token(${this.type}, ${this.value}, ${this.line}:${this.column})`;
  }
}

class Lexer {
  constructor(source) {
    this.source = source;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
  }

  peek(offset = 0) {
    const pos = this.position + offset;
    if (pos >= this.source.length) return null;
    return this.source[pos];
  }

  advance() {
    const char = this.source[this.position];
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
    this.tokens.push(new Token(type, value, this.line, this.column - value.length));
  }

  skipWhitespaceAndComments() {
    while (this.position < this.source.length) {
      const ch = this.peek();

      // Skip whitespace
      if (ch === ' ' || ch === '\t' || ch === '\r') {
        this.advance();
        continue;
      }

      // Skip newlines (but we might track them)
      if (ch === '\n') {
        this.advance();
        continue;
      }

      // Skip line comments (# or //)
      if (ch === '#' || (ch === '/' && this.peek(1) === '/')) {
        if (ch === '/') {
          this.advance(); // /
          this.advance(); // /
        } else {
          this.advance(); // #
        }
        while (this.peek() && this.peek() !== '\n') {
          this.advance();
        }
        continue;
      }

      // Skip block comments (/* ... */)
      if (ch === '/' && this.peek(1) === '*') {
        this.advance(); // /
        this.advance(); // *
        while (this.position < this.source.length) {
          if (this.peek() === '*' && this.peek(1) === '/') {
            this.advance(); // *
            this.advance(); // /
            break;
          }
          this.advance();
        }
        continue;
      }

      break;
    }
  }

  isDigit(ch) {
    return ch && ch >= '0' && ch <= '9';
  }

  isAlpha(ch) {
    return ch && ((ch >= 'a' && ch <= 'z') ||
                  (ch >= 'A' && ch <= 'Z') ||
                  ch === '_');
  }

  isAlphaNumeric(ch) {
    return this.isAlpha(ch) || this.isDigit(ch);
  }

  readNumber() {
    let num = '';
    const startCol = this.column;

    // Read integer part
    while (this.isDigit(this.peek())) {
      num += this.advance();
    }

    // Read decimal part
    if (this.peek() === '.' && this.isDigit(this.peek(1))) {
      num += this.advance(); // .
      while (this.isDigit(this.peek())) {
        num += this.advance();
      }
    }

    // Read exponent part
    if ((this.peek() === 'e' || this.peek() === 'E') &&
        (this.isDigit(this.peek(1)) ||
         ((this.peek(1) === '+' || this.peek(1) === '-') && this.isDigit(this.peek(2))))) {
      num += this.advance(); // e/E
      if (this.peek() === '+' || this.peek() === '-') {
        num += this.advance();
      }
      while (this.isDigit(this.peek())) {
        num += this.advance();
      }
    }

    this.addToken(TokenType.NUMBER, num);
  }

  readString(quote) {
    let str = '';
    this.advance(); // opening quote

    while (this.peek() && this.peek() !== quote) {
      if (this.peek() === '\\') {
        this.advance();
        const escaped = this.peek();
        if (escaped === 'n') {
          str += '\n';
          this.advance();
        } else if (escaped === 't') {
          str += '\t';
          this.advance();
        } else if (escaped === 'r') {
          str += '\r';
          this.advance();
        } else if (escaped === '\\') {
          str += '\\';
          this.advance();
        } else if (escaped === quote) {
          str += quote;
          this.advance();
        } else {
          str += escaped || '';
          this.advance();
        }
      } else {
        str += this.advance();
      }
    }

    if (this.peek() === quote) {
      this.advance(); // closing quote
    }

    this.addToken(TokenType.STRING, str);
  }

  readFString(quote) {
    this.advance(); // 'f'
    this.advance(); // opening quote

    const parts = [];
    let currentStr = '';

    while (this.peek() && this.peek() !== quote) {
      if (this.peek() === '\\') {
        this.advance();
        const escaped = this.peek();
        if (escaped === 'n') {
          currentStr += '\n';
          this.advance();
        } else if (escaped === 't') {
          currentStr += '\t';
          this.advance();
        } else if (escaped === 'r') {
          currentStr += '\r';
          this.advance();
        } else if (escaped === '\\') {
          currentStr += '\\';
          this.advance();
        } else if (escaped === quote) {
          currentStr += quote;
          this.advance();
        } else {
          currentStr += escaped || '';
          this.advance();
        }
      } else if (this.peek() === '{') {
        // Save current string part
        if (currentStr.length > 0) {
          parts.push({ type: 'string', value: currentStr });
          currentStr = '';
        }
        // Extract expression inside {}
        this.advance(); // '{'
        let exprStr = '';
        let braceCount = 1;
        while (braceCount > 0 && this.peek()) {
          const ch = this.peek();
          if (ch === '{') braceCount++;
          else if (ch === '}') braceCount--;
          if (braceCount > 0) {
            exprStr += ch;
          }
          this.advance();
        }
        parts.push({ type: 'expression', value: exprStr });
      } else {
        currentStr += this.advance();
      }
    }

    // Save final string part
    if (currentStr.length > 0) {
      parts.push({ type: 'string', value: currentStr });
    }

    if (this.peek() === quote) {
      this.advance(); // closing quote
    }

    // Store f-string as a special token with parts array
    this.tokens.push(new Token(TokenType.STRING, JSON.stringify({ fstring: true, parts }), this.line, this.column));
  }

  readIdentifierOrKeyword() {
    let ident = '';

    while (this.isAlphaNumeric(this.peek())) {
      ident += this.advance();
    }

    const tokenType = KEYWORDS[ident] || TokenType.IDENTIFIER;
    this.addToken(tokenType, ident);
  }

  readOperator() {
    const ch = this.peek();
    const next = this.peek(1);
    const next2 = this.peek(2);

    // Three-character operators
    if (ch === '=' && next === '=' && next2 === '=') {
      this.advance();
      this.advance();
      this.advance();
      this.addToken(TokenType.EQEQEQ, '===');
    } else if (ch === '!' && next === '=' && next2 === '=') {
      this.advance();
      this.advance();
      this.advance();
      this.addToken(TokenType.NOTEQUALEQ, '!==');
    } else if (ch === '<' && next === '<') {
      this.advance();
      this.advance();
      this.addToken(TokenType.LSHIFT, '<<');
    } else if (ch === '>' && next === '>') {
      this.advance();
      this.advance();
      this.addToken(TokenType.RSHIFT, '>>');
    }
    // Two-character operators
    else if (ch === '=' && next === '=') {
      this.advance();
      this.advance();
      this.addToken(TokenType.EQEQ, '==');
    } else if (ch === '!' && next === '=') {
      this.advance();
      this.advance();
      this.addToken(TokenType.NOTEQ, '!=');
    } else if (ch === '<' && next === '=') {
      this.advance();
      this.advance();
      this.addToken(TokenType.LTEQ, '<=');
    } else if (ch === '>' && next === '=') {
      this.advance();
      this.advance();
      this.addToken(TokenType.GTEQ, '>=');
    } else if (ch === '+' && next === '=') {
      this.advance();
      this.advance();
      this.addToken(TokenType.PLUSEQ, '+=');
    } else if (ch === '-' && next === '=') {
      this.advance();
      this.advance();
      this.addToken(TokenType.MINUSEQ, '-=');
    } else if (ch === '*' && next === '=') {
      this.advance();
      this.advance();
      this.addToken(TokenType.STAREQ, '*=');
    } else if (ch === '/' && next === '=') {
      this.advance();
      this.advance();
      this.addToken(TokenType.SLASHEQ, '/=');
    } else if (ch === '=' && next === '>') {
      this.advance();
      this.advance();
      this.addToken(TokenType.ARROW, '=>');
    } else if (ch === '*' && next === '*') {
      this.advance();
      this.advance();
      this.addToken(TokenType.POWER, '**');
    } else if (ch === '&' && next === '&') {
      this.advance();
      this.advance();
      this.addToken(TokenType.AND, '&&');
    } else if (ch === '|' && next === '|') {
      this.advance();
      this.advance();
      this.addToken(TokenType.OR, '||');
    }
    // Single-character operators
    else if (ch === '+') {
      this.advance();
      this.addToken(TokenType.PLUS, '+');
    } else if (ch === '-') {
      this.advance();
      this.addToken(TokenType.MINUS, '-');
    } else if (ch === '*') {
      this.advance();
      this.addToken(TokenType.STAR, '*');
    } else if (ch === '/') {
      this.advance();
      this.addToken(TokenType.SLASH, '/');
    } else if (ch === '%') {
      this.advance();
      this.addToken(TokenType.PERCENT, '%');
    } else if (ch === '=') {
      this.advance();
      this.addToken(TokenType.EQ, '=');
    } else if (ch === '!') {
      this.advance();
      this.addToken(TokenType.NOT, '!');
    } else if (ch === '<') {
      this.advance();
      this.addToken(TokenType.LT, '<');
    } else if (ch === '>') {
      this.advance();
      this.addToken(TokenType.GT, '>');
    } else if (ch === '&') {
      this.advance();
      this.addToken(TokenType.AMPERSAND, '&');
    } else if (ch === '|') {
      this.advance();
      this.addToken(TokenType.PIPE, '|');
    } else if (ch === '^') {
      this.advance();
      this.addToken(TokenType.CARET, '^');
    } else if (ch === '~') {
      this.advance();
      this.addToken(TokenType.TILDE, '~');
    } else if (ch === '?') {
      this.advance();
      this.addToken(TokenType.QUESTION, '?');
    } else {
      // Unknown operator, skip it
      this.advance();
    }
  }

  tokenize() {
    while (this.position < this.source.length) {
      this.skipWhitespaceAndComments();

      if (this.position >= this.source.length) break;

      const ch = this.peek();

      // Numbers
      if (this.isDigit(ch)) {
        this.readNumber();
      }
      // f-strings
      else if (ch === 'f' && (this.peek(1) === '"' || this.peek(1) === "'")) {
        this.readFString(this.peek(1));
      }
      // Strings
      else if (ch === '"' || ch === "'") {
        this.readString(ch);
      }
      // Identifiers and keywords
      else if (this.isAlpha(ch)) {
        this.readIdentifierOrKeyword();
      }
      // Operators
      else if ('+-*/%=!<>&|^~?'.includes(ch)) {
        this.readOperator();
      }
      // Punctuation
      else if (ch === '(') {
        this.advance();
        this.addToken(TokenType.LPAREN, '(');
      } else if (ch === ')') {
        this.advance();
        this.addToken(TokenType.RPAREN, ')');
      } else if (ch === '{') {
        this.advance();
        this.addToken(TokenType.LBRACE, '{');
      } else if (ch === '}') {
        this.advance();
        this.addToken(TokenType.RBRACE, '}');
      } else if (ch === '[') {
        this.advance();
        this.addToken(TokenType.LBRACKET, '[');
      } else if (ch === ']') {
        this.advance();
        this.addToken(TokenType.RBRACKET, ']');
      } else if (ch === ',') {
        this.advance();
        this.addToken(TokenType.COMMA, ',');
      } else if (ch === '.') {
        this.advance();
        this.addToken(TokenType.DOT, '.');
      } else if (ch === ';') {
        this.advance();
        this.addToken(TokenType.SEMICOLON, ';');
      } else if (ch === ':') {
        this.advance();
        this.addToken(TokenType.COLON, ':');
      } else if (ch === '\\') {
        this.advance();
        this.addToken(TokenType.BACKSLASH, '\\');
      } else if (ch === '@') {
        this.advance();
        this.addToken(TokenType.AT, '@');
      } else if (ch === '#') {
        this.advance();
        this.addToken(TokenType.HASH, '#');
      } else if (ch === '$') {
        this.advance();
        this.addToken(TokenType.DOLLAR, '$');
      } else {
        // Unknown character, skip
        this.advance();
      }
    }

    this.addToken(TokenType.EOF, '');
    return this.tokens;
  }
}

module.exports = { Lexer, Token, TokenType };
