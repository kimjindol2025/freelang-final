/**
 * FreeLang Parser (JavaScript)
 * 토큰 → Abstract Syntax Tree (AST) 변환
 */

const { TokenType } = require('./lexer');

// AST Node types
class ASTNode {
  constructor(type) {
    this.type = type;
  }
}

class Program extends ASTNode {
  constructor(statements) {
    super('Program');
    this.statements = statements;
  }
}

class VariableDeclaration extends ASTNode {
  constructor(kind, name, init) {
    super('VariableDeclaration');
    this.kind = kind; // let, const, var
    this.name = name;
    this.init = init;
  }
}

class FunctionDeclaration extends ASTNode {
  constructor(name, params, body) {
    super('FunctionDeclaration');
    this.name = name;
    this.params = params;
    this.body = body;
  }
}

class BlockStatement extends ASTNode {
  constructor(statements) {
    super('BlockStatement');
    this.statements = statements;
  }
}

class ExpressionStatement extends ASTNode {
  constructor(expression) {
    super('ExpressionStatement');
    this.expression = expression;
  }
}

class IfStatement extends ASTNode {
  constructor(test, consequent, alternate) {
    super('IfStatement');
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
}

class WhileStatement extends ASTNode {
  constructor(test, body) {
    super('WhileStatement');
    this.test = test;
    this.body = body;
  }
}

class ForStatement extends ASTNode {
  constructor(init, test, update, body) {
    super('ForStatement');
    this.init = init;
    this.test = test;
    this.update = update;
    this.body = body;
  }
}

class ForInStatement extends ASTNode {
  constructor(left, right, body) {
    super('ForInStatement');
    this.left = left;
    this.right = right;
    this.body = body;
  }
}

class ReturnStatement extends ASTNode {
  constructor(argument) {
    super('ReturnStatement');
    this.argument = argument;
  }
}

class BreakStatement extends ASTNode {
  constructor() {
    super('BreakStatement');
  }
}

class ContinueStatement extends ASTNode {
  constructor() {
    super('ContinueStatement');
  }
}

class BinaryExpression extends ASTNode {
  constructor(left, operator, right) {
    super('BinaryExpression');
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
}

class UnaryExpression extends ASTNode {
  constructor(operator, argument, prefix) {
    super('UnaryExpression');
    this.operator = operator;
    this.argument = argument;
    this.prefix = prefix;
  }
}

class LogicalExpression extends ASTNode {
  constructor(left, operator, right) {
    super('LogicalExpression');
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
}

class CallExpression extends ASTNode {
  constructor(callee, args) {
    super('CallExpression');
    this.callee = callee;
    this.args = args;
  }
}

class MemberExpression extends ASTNode {
  constructor(object, property, computed) {
    super('MemberExpression');
    this.object = object;
    this.property = property;
    this.computed = computed;
  }
}

class AssignmentExpression extends ASTNode {
  constructor(left, operator, right) {
    super('AssignmentExpression');
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
}

class ConditionalExpression extends ASTNode {
  constructor(test, consequent, alternate) {
    super('ConditionalExpression');
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
}

class ArrayExpression extends ASTNode {
  constructor(elements) {
    super('ArrayExpression');
    this.elements = elements;
  }
}

class ObjectExpression extends ASTNode {
  constructor(properties) {
    super('ObjectExpression');
    this.properties = properties;
  }
}

class Property extends ASTNode {
  constructor(key, value) {
    super('Property');
    this.key = key;
    this.value = value;
  }
}

class FunctionExpression extends ASTNode {
  constructor(name, params, body) {
    super('FunctionExpression');
    this.name = name;
    this.params = params;
    this.body = body;
  }
}

class ArrowFunctionExpression extends ASTNode {
  constructor(params, body) {
    super('ArrowFunctionExpression');
    this.params = params;
    this.body = body;
  }
}

class Identifier extends ASTNode {
  constructor(name) {
    super('Identifier');
    this.name = name;
  }
}

class Literal extends ASTNode {
  constructor(value, raw) {
    super('Literal');
    this.value = value;
    this.raw = raw;
  }
}

class TryCatchStatement extends ASTNode {
  constructor(tryBlock, catchClause, finallyBlock) {
    super('TryCatchStatement');
    this.tryBlock = tryBlock;
    this.catchClause = catchClause;
    this.finallyBlock = finallyBlock;
  }
}

class CatchClause extends ASTNode {
  constructor(param, body) {
    super('CatchClause');
    this.param = param;
    this.body = body;
  }
}

class ThrowStatement extends ASTNode {
  constructor(argument) {
    super('ThrowStatement');
    this.argument = argument;
  }
}

class FStringLiteral extends ASTNode {
  constructor(parts) {
    super('FStringLiteral');
    this.parts = parts; // Array of { type: 'string'|'expression', value: string|expression }
  }
}

// Parser class
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  peek(offset = 0) {
    const pos = this.current + offset;
    if (pos >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1]; // EOF
    }
    return this.tokens[pos];
  }

  advance() {
    if (this.current < this.tokens.length) {
      this.current++;
    }
    return this.tokens[this.current - 1];
  }

  match(...types) {
    for (const type of types) {
      if (this.peek().type === type) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  consume(type, message) {
    if (this.peek().type === type) {
      return this.advance();
    }
    throw new Error(`${message} at line ${this.peek().line}`);
  }

  isAtEnd() {
    return this.peek().type === TokenType.EOF;
  }

  parse() {
    const statements = [];
    while (!this.isAtEnd()) {
      const stmt = this.statement();
      if (stmt) {
        statements.push(stmt);
      }
    }
    return new Program(statements);
  }

  statement() {
    // Variable declaration
    if (this.match(TokenType.LET, TokenType.CONST, TokenType.VAR)) {
      return this.variableDeclaration();
    }

    // Function declaration
    if (this.match(TokenType.FN)) {
      return this.functionDeclaration();
    }

    // If statement
    if (this.match(TokenType.IF)) {
      return this.ifStatement();
    }

    // While loop
    if (this.match(TokenType.WHILE)) {
      return this.whileStatement();
    }

    // For loop
    if (this.match(TokenType.FOR)) {
      return this.forStatement();
    }

    // Block statement
    if (this.peek().type === TokenType.LBRACE) {
      return this.blockStatement();
    }

    // Return statement
    if (this.match(TokenType.RETURN)) {
      return this.returnStatement();
    }

    // Break statement
    if (this.match(TokenType.BREAK)) {
      this.match(TokenType.SEMICOLON);
      return new BreakStatement();
    }

    // Continue statement
    if (this.match(TokenType.CONTINUE)) {
      this.match(TokenType.SEMICOLON);
      return new ContinueStatement();
    }

    // Try-catch statement
    if (this.match(TokenType.TRY)) {
      return this.tryCatchStatement();
    }

    // Throw statement
    if (this.match(TokenType.THROW)) {
      return this.throwStatement();
    }

    // Expression statement
    return this.expressionStatement();
  }

  variableDeclaration(consumeSemicolon = true) {
    const kind = this.tokens[this.current - 1].value;
    const name = this.consume(TokenType.IDENTIFIER, 'Expected variable name').value;

    let init = null;
    if (this.match(TokenType.EQ)) {
      init = this.expression();
    }

    if (consumeSemicolon) {
      this.match(TokenType.SEMICOLON);
    }
    return new VariableDeclaration(kind, name, init);
  }

  functionDeclaration() {
    const name = this.consume(TokenType.IDENTIFIER, 'Expected function name').value;
    this.consume(TokenType.LPAREN, 'Expected ( after function name');

    const params = [];
    if (this.peek().type !== TokenType.RPAREN) {
      do {
        params.push(this.consume(TokenType.IDENTIFIER, 'Expected parameter name').value);
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RPAREN, 'Expected ) after parameters');
    this.consume(TokenType.LBRACE, 'Expected { before function body');

    const statements = this.blockStatementBody();
    const body = new BlockStatement(statements);

    return new FunctionDeclaration(name, params, body);
  }

  ifStatement() {
    this.consume(TokenType.LPAREN, 'Expected ( after if');
    const test = this.expression();
    this.consume(TokenType.RPAREN, 'Expected ) after condition');

    const consequent = this.statement();
    let alternate = null;

    if (this.match(TokenType.ELSE)) {
      alternate = this.statement();
    }

    return new IfStatement(test, consequent, alternate);
  }

  whileStatement() {
    this.consume(TokenType.LPAREN, 'Expected ( after while');
    const test = this.expression();
    this.consume(TokenType.RPAREN, 'Expected ) after condition');

    const body = this.statement();

    return new WhileStatement(test, body);
  }

  forStatement() {
    // Check for for-in loop (no parentheses)
    if (this.peek().type === TokenType.IDENTIFIER) {
      const checkpoint = this.current;
      const name = this.advance().value;
      if (this.match(TokenType.IN)) {
        // for-in loop: for item in arr { ... }
        const iterable = this.expression();
        const body = this.statement();
        return new ForInStatement(name, iterable, body);
      }
      // Not for-in, restore position for regular for loop
      this.current = checkpoint;
    }

    // Regular for loop: for (init; test; update) { ... }
    this.consume(TokenType.LPAREN, 'Expected ( after for');
    let init = null;
    if (!this.match(TokenType.SEMICOLON)) {
      if (this.peek().type === TokenType.LET || this.peek().type === TokenType.VAR) {
        this.advance(); // consume let/const/var
        init = this.variableDeclaration(false);
        this.consume(TokenType.SEMICOLON, 'Expected ; after for loop init');
      } else {
        init = this.expression();
        this.consume(TokenType.SEMICOLON, 'Expected ; after for loop init');
      }
    }

    let test = null;
    if (this.peek().type !== TokenType.SEMICOLON) {
      test = this.expression();
    }
    this.consume(TokenType.SEMICOLON, 'Expected ; after for loop test');

    let update = null;
    if (this.peek().type !== TokenType.RPAREN) {
      update = this.expression();
    }
    this.consume(TokenType.RPAREN, 'Expected ) after for clauses');

    const body = this.statement();

    return new ForStatement(init, test, update, body);
  }

  blockStatement() {
    this.consume(TokenType.LBRACE, 'Expected {');
    return new BlockStatement(this.blockStatementBody());
  }

  blockStatementBody() {
    const statements = [];
    while (this.peek().type !== TokenType.RBRACE && !this.isAtEnd()) {
      const stmt = this.statement();
      if (stmt) {
        statements.push(stmt);
      }
    }
    this.consume(TokenType.RBRACE, 'Expected }');
    return statements;
  }

  returnStatement() {
    let argument = null;
    if (this.peek().type !== TokenType.SEMICOLON && !this.isAtEnd()) {
      argument = this.expression();
    }
    this.match(TokenType.SEMICOLON);
    return new ReturnStatement(argument);
  }

  tryCatchStatement() {
    const tryBlock = this.blockStatement();
    let catchClause = null;
    let finallyBlock = null;

    if (this.match(TokenType.CATCH)) {
      this.consume(TokenType.LPAREN, 'Expected ( after catch');
      const param = this.consume(TokenType.IDENTIFIER, 'Expected parameter name').value;
      this.consume(TokenType.RPAREN, 'Expected ) after catch parameter');
      const body = this.blockStatement();
      catchClause = new CatchClause(param, body);
    }

    if (this.match(TokenType.FINALLY)) {
      finallyBlock = this.blockStatement();
    }

    if (!catchClause && !finallyBlock) {
      throw new Error('try statement must have catch or finally block');
    }

    return new TryCatchStatement(tryBlock, catchClause, finallyBlock);
  }

  throwStatement() {
    const argument = this.expression();
    this.match(TokenType.SEMICOLON);
    return new ThrowStatement(argument);
  }

  expressionStatement() {
    const expr = this.expression();
    this.match(TokenType.SEMICOLON);
    return new ExpressionStatement(expr);
  }

  expression() {
    return this.assignment();
  }

  assignment() {
    let expr = this.conditional();

    if (this.match(TokenType.EQ, TokenType.PLUSEQ, TokenType.MINUSEQ,
                   TokenType.STAREQ, TokenType.SLASHEQ)) {
      const operator = this.tokens[this.current - 1].value;
      const right = this.assignment();
      return new AssignmentExpression(expr, operator, right);
    }

    return expr;
  }

  conditional() {
    let expr = this.logicalOr();

    if (this.match(TokenType.QUESTION)) {
      const consequent = this.expression();
      this.consume(TokenType.COLON, 'Expected : in ternary expression');
      const alternate = this.conditional();
      return new ConditionalExpression(expr, consequent, alternate);
    }

    return expr;
  }

  logicalOr() {
    let expr = this.logicalAnd();

    while (this.match(TokenType.OR)) {
      const operator = this.tokens[this.current - 1].value;
      const right = this.logicalAnd();
      expr = new LogicalExpression(expr, operator, right);
    }

    return expr;
  }

  logicalAnd() {
    let expr = this.bitwiseOr();

    while (this.match(TokenType.AND)) {
      const operator = this.tokens[this.current - 1].value;
      const right = this.bitwiseOr();
      expr = new LogicalExpression(expr, operator, right);
    }

    return expr;
  }

  bitwiseOr() {
    let expr = this.bitwiseXor();

    while (this.match(TokenType.PIPE)) {
      const operator = this.tokens[this.current - 1].value;
      const right = this.bitwiseXor();
      expr = new BinaryExpression(expr, operator, right);
    }

    return expr;
  }

  bitwiseXor() {
    let expr = this.bitwiseAnd();

    while (this.match(TokenType.CARET)) {
      const operator = this.tokens[this.current - 1].value;
      const right = this.bitwiseAnd();
      expr = new BinaryExpression(expr, operator, right);
    }

    return expr;
  }

  bitwiseAnd() {
    let expr = this.equality();

    while (this.match(TokenType.AMPERSAND)) {
      const operator = this.tokens[this.current - 1].value;
      const right = this.equality();
      expr = new BinaryExpression(expr, operator, right);
    }

    return expr;
  }

  equality() {
    let expr = this.comparison();

    while (this.match(TokenType.EQEQ, TokenType.NOTEQ,
                      TokenType.EQEQEQ, TokenType.NOTEQUALEQ)) {
      const operator = this.tokens[this.current - 1].value;
      const right = this.comparison();
      expr = new BinaryExpression(expr, operator, right);
    }

    return expr;
  }

  comparison() {
    let expr = this.shift();

    while (this.match(TokenType.LT, TokenType.LTEQ, TokenType.GT, TokenType.GTEQ)) {
      const operator = this.tokens[this.current - 1].value;
      const right = this.shift();
      expr = new BinaryExpression(expr, operator, right);
    }

    return expr;
  }

  shift() {
    let expr = this.additive();

    while (this.match(TokenType.LSHIFT, TokenType.RSHIFT)) {
      const operator = this.tokens[this.current - 1].value;
      const right = this.additive();
      expr = new BinaryExpression(expr, operator, right);
    }

    return expr;
  }

  additive() {
    let expr = this.multiplicative();

    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.tokens[this.current - 1].value;
      const right = this.multiplicative();
      expr = new BinaryExpression(expr, operator, right);
    }

    return expr;
  }

  multiplicative() {
    let expr = this.exponentiation();

    while (this.match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT)) {
      const operator = this.tokens[this.current - 1].value;
      const right = this.exponentiation();
      expr = new BinaryExpression(expr, operator, right);
    }

    return expr;
  }

  exponentiation() {
    let expr = this.unary();

    if (this.match(TokenType.POWER)) {
      const operator = this.tokens[this.current - 1].value;
      const right = this.exponentiation();
      expr = new BinaryExpression(expr, operator, right);
    }

    return expr;
  }

  unary() {
    if (this.match(TokenType.NOT, TokenType.MINUS, TokenType.PLUS,
                   TokenType.TILDE)) {
      const operator = this.tokens[this.current - 1].value;
      const argument = this.unary();
      return new UnaryExpression(operator, argument, true);
    }

    return this.postfix();
  }

  postfix() {
    let expr = this.call();

    // Handle ? operator (error propagation)
    while (this.match(TokenType.QUESTION)) {
      expr = new UnaryExpression('?', expr, false);
    }

    return expr;
  }

  call() {
    let expr = this.member();

    while (true) {
      if (this.match(TokenType.LPAREN)) {
        const args = [];
        if (this.peek().type !== TokenType.RPAREN) {
          do {
            args.push(this.assignment());
          } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RPAREN, 'Expected ) after arguments');
        expr = new CallExpression(expr, args);
      } else {
        break;
      }
    }

    return expr;
  }

  member() {
    let expr = this.primary();

    while (true) {
      if (this.match(TokenType.DOT)) {
        const property = this.consume(TokenType.IDENTIFIER, 'Expected property name').value;
        expr = new MemberExpression(expr, new Identifier(property), false);
      } else if (this.match(TokenType.LBRACKET)) {
        const property = this.expression();
        this.consume(TokenType.RBRACKET, 'Expected ] after computed member');
        expr = new MemberExpression(expr, property, true);
      } else {
        break;
      }
    }

    return expr;
  }

  primary() {
    // Literals
    if (this.match(TokenType.TRUE)) {
      return new Literal(true, 'true');
    }

    if (this.match(TokenType.FALSE)) {
      return new Literal(false, 'false');
    }

    if (this.match(TokenType.NULL)) {
      return new Literal(null, 'null');
    }

    if (this.match(TokenType.NUMBER)) {
      const value = parseFloat(this.tokens[this.current - 1].value);
      return new Literal(value, this.tokens[this.current - 1].value);
    }

    if (this.match(TokenType.STRING)) {
      const token = this.tokens[this.current - 1];
      const value = token.value;

      // Check if it's an f-string
      try {
        const parsed = JSON.parse(value);
        if (parsed && parsed.fstring) {
          // Parse f-string parts
          const parts = parsed.parts.map(part => {
            if (part.type === 'string') {
              return { type: 'string', value: part.value };
            } else {
              // For expressions, we need to create a mini-parser
              const Lexer = require('./lexer').Lexer;
              const exprLexer = new Lexer(part.value);
              const exprTokens = exprLexer.tokenize();
              const exprParser = new Parser(exprTokens);
              const exprAst = exprParser.expression();
              return { type: 'expression', value: exprAst };
            }
          });
          return new FStringLiteral(parts);
        }
      } catch (e) {
        // Not an f-string, treat as regular string
      }

      return new Literal(value, `"${value}"`);
    }

    // Identifier
    if (this.match(TokenType.IDENTIFIER)) {
      return new Identifier(this.tokens[this.current - 1].value);
    }

    // Array literal
    if (this.match(TokenType.LBRACKET)) {
      const elements = [];
      if (this.peek().type !== TokenType.RBRACKET) {
        do {
          if (this.peek().type === TokenType.COMMA) {
            elements.push(null);
          } else {
            elements.push(this.assignment());
          }
        } while (this.match(TokenType.COMMA) && this.peek().type !== TokenType.RBRACKET);
      }
      this.consume(TokenType.RBRACKET, 'Expected ]');
      return new ArrayExpression(elements);
    }

    // Object literal
    if (this.match(TokenType.LBRACE)) {
      const properties = [];
      if (this.peek().type !== TokenType.RBRACE) {
        do {
          let key;
          if (this.peek().type === TokenType.STRING) {
            key = this.advance().value;
          } else if (this.peek().type === TokenType.IDENTIFIER) {
            key = this.advance().value;
          } else {
            key = this.consume(TokenType.NUMBER, 'Expected property key').value;
          }
          this.consume(TokenType.COLON, 'Expected : after property key');
          const value = this.assignment();
          properties.push(new Property(new Literal(key, key), value));
        } while (this.match(TokenType.COMMA) && this.peek().type !== TokenType.RBRACE);
      }
      this.consume(TokenType.RBRACE, 'Expected }');
      return new ObjectExpression(properties);
    }

    // Function expression
    if (this.match(TokenType.FN)) {
      let name = null;
      if (this.peek().type === TokenType.IDENTIFIER) {
        name = this.advance().value;
      }
      this.consume(TokenType.LPAREN, 'Expected ( after fn');
      const params = [];
      if (this.peek().type !== TokenType.RPAREN) {
        do {
          params.push(this.consume(TokenType.IDENTIFIER, 'Expected parameter name').value);
        } while (this.match(TokenType.COMMA));
      }
      this.consume(TokenType.RPAREN, 'Expected ) after parameters');
      this.consume(TokenType.LBRACE, 'Expected { before function body');
      const body = this.blockStatementBody();
      return new FunctionExpression(name, params, new BlockStatement(body));
    }

    // Parenthesized expression
    if (this.match(TokenType.LPAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RPAREN, 'Expected ) after expression');
      return expr;
    }

    throw new Error(`Unexpected token: ${this.peek().type}`);
  }
}

module.exports = {
  Parser,
  Program, VariableDeclaration, FunctionDeclaration, BlockStatement, ExpressionStatement,
  IfStatement, WhileStatement, ForStatement, ForInStatement, ReturnStatement,
  BreakStatement, ContinueStatement, BinaryExpression, UnaryExpression, LogicalExpression,
  CallExpression, MemberExpression, AssignmentExpression, ConditionalExpression,
  ArrayExpression, ObjectExpression, Property, FunctionExpression, ArrowFunctionExpression,
  Identifier, Literal, TryCatchStatement, CatchClause, ThrowStatement, FStringLiteral
};
