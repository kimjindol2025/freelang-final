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
  constructor(name, params, body, isAsync = false) {
    super('FunctionDeclaration');
    this.name = name;
    this.params = params;
    this.body = body;
    this.isAsync = isAsync;
  }
}

class StructDeclaration extends ASTNode {
  constructor(name, fields) {
    super('StructDeclaration');
    this.name = name;
    this.fields = fields;
  }
}

class TypeDeclaration extends ASTNode {
  constructor(name, typeExpression) {
    super('TypeDeclaration');
    this.name = name;
    this.typeExpression = typeExpression;
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

// ConstraintDeclaration for Static-Guard validation
class ConstraintDeclaration extends ASTNode {
  constructor(name, args, kwargs = {}) {
    super('ConstraintDeclaration');
    this.name = name;      // 'required', 'min_len', 'pattern', 'range', etc.
    this.args = args;      // Array of constraint arguments
    this.kwargs = kwargs;  // Additional metadata (future use)
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

class TryStatement extends ASTNode {
  constructor(body, handler, finalizer) {
    super('TryStatement');
    this.body = body;
    this.handler = handler;
    this.finalizer = finalizer;
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

class AwaitExpression extends ASTNode {
  constructor(argument) {
    super('AwaitExpression');
    this.argument = argument;
  }
}

class QuestionOp extends ASTNode {
  constructor(operand) {
    super('QuestionOp');
    this.operand = operand;
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

class FStringExpression extends ASTNode {
  constructor(parts) {
    super('FStringExpression');
    this.parts = parts; // Array of {type: 'text'|'expr', value/expr, format?}
  }
}

class ImportDeclaration extends ASTNode {
  constructor(specifiers, source) {
    super('ImportDeclaration');
    this.specifiers = specifiers;
    this.source = source;
  }
}

class ImportSpecifier extends ASTNode {
  constructor(imported, local) {
    super('ImportSpecifier');
    this.imported = imported;
    this.local = local;
  }
}

class ImportDefaultSpecifier extends ASTNode {
  constructor(local) {
    super('ImportDefaultSpecifier');
    this.local = local;
  }
}

class ImportNamespaceSpecifier extends ASTNode {
  constructor(local) {
    super('ImportNamespaceSpecifier');
    this.local = local;
  }
}

class ExportDeclaration extends ASTNode {
  constructor(declaration, isDefault) {
    super('ExportDeclaration');
    this.declaration = declaration;
    this.isDefault = isDefault || false;
  }
}

class ExportNamedDeclaration extends ASTNode {
  constructor(declaration, specifiers, source) {
    super('ExportNamedDeclaration');
    this.declaration = declaration;
    this.specifiers = specifiers;
    this.source = source;
  }
}

class ExportSpecifier extends ASTNode {
  constructor(exported, local) {
    super('ExportSpecifier');
    this.exported = exported;
    this.local = local;
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
    // Collect constraints (@required, @min_len, etc.)
    let constraints = [];
    while (this.peek().type === TokenType.AT) {
      constraints.push(this.parseConstraint());
    }

    // Import declaration
    if (this.peek().type === TokenType.IMPORT) {
      this.advance(); // consume 'import'
      const stmt = this.parseImportDeclaration();
      if (constraints.length > 0) stmt.constraints = constraints;
      return stmt;
    }

    // Export declaration
    if (this.peek().type === TokenType.EXPORT) {
      this.advance(); // consume 'export'
      const stmt = this.parseExportDeclaration();
      if (constraints.length > 0) stmt.constraints = constraints;
      return stmt;
    }

    // Variable declaration
    if (this.match(TokenType.LET, TokenType.CONST, TokenType.VAR)) {
      const stmt = this.variableDeclaration();
      if (constraints.length > 0) stmt.constraints = constraints;
      return stmt;
    }

    // Struct declaration
    if (this.match(TokenType.STRUCT)) {
      const stmt = this.structDeclaration();
      if (constraints.length > 0) stmt.constraints = constraints;
      return stmt;
    }

    // Type declaration
    if (this.match(TokenType.TYPE)) {
      const stmt = this.typeDeclaration();
      if (constraints.length > 0) stmt.constraints = constraints;
      return stmt;
    }

    // Function declaration (with optional async)
    // Check for async before fn
    let isAsync = false;
    if (this.peek().type === TokenType.ASYNC) {
      isAsync = true;
      this.advance(); // consume async
    }

    if (this.match(TokenType.FN)) {
      const decl = this.functionDeclaration();
      decl.isAsync = isAsync;
      if (constraints.length > 0) decl.constraints = constraints;
      return decl;
    } else if (isAsync) {
      // async without fn is an error
      throw new Error('Expected "fn" after "async"');
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

    // Try statement
    if (this.match(TokenType.TRY)) {
      return this.tryStatement();
    }

    // Throw statement
    if (this.match(TokenType.THROW)) {
      return this.throwStatement();
    }

    // Expression statement
    return this.expressionStatement();
  }

  parseConstraint() {
    // @ token already verified by caller
    this.advance(); // consume @

    const name = this.consume(TokenType.IDENTIFIER, 'Expected constraint name').value;
    const args = [];

    // Parse constraint arguments if present
    if (this.peek().type === TokenType.LPAREN) {
      this.advance(); // consume (

      while (this.peek().type !== TokenType.RPAREN && this.peek().type !== TokenType.EOF) {
        // Parse argument (number, string, or identifier)
        const token = this.peek();

        if (token.type === TokenType.NUMBER) {
          args.push(parseInt(token.value));
          this.advance();
        } else if (token.type === TokenType.STRING) {
          args.push(token.value);
          this.advance();
        } else if (token.type === TokenType.IDENTIFIER) {
          args.push(token.value);
          this.advance();
        } else {
          throw new Error(`Unexpected token in constraint argument: ${token.type}`);
        }

        // Handle comma separator
        if (this.peek().type === TokenType.COMMA) {
          this.advance(); // consume ,
        } else if (this.peek().type !== TokenType.RPAREN) {
          throw new Error('Expected comma or ) in constraint arguments');
        }
      }

      this.consume(TokenType.RPAREN, 'Expected ) after constraint arguments');
    }

    return new ConstraintDeclaration(name, args);
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
    let isAsync = false;

    // fn 키워드는 statement()에서 이미 consume됨
    // isAsync 플래그 처리는 필요 없음 (fn은 이미 진행됨)

    const name = this.consume(TokenType.IDENTIFIER, 'Expected function name').value;
    this.consume(TokenType.LPAREN, 'Expected ( after function name');

    const params = [];
    if (this.peek().type !== TokenType.RPAREN) {
      do {
        const paramName = this.consume(TokenType.IDENTIFIER, 'Expected parameter name').value;

        // Optional type annotation: name: Type
        if (this.match(TokenType.COLON)) {
          // Skip the type annotation (just consume it without storing)
          if (this.peek().type === TokenType.IDENTIFIER) {
            this.advance();
          }
        }

        params.push(paramName);
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RPAREN, 'Expected ) after parameters');

    // Optional return type annotation: -> ReturnType
    let returnType = null;
    if (this.peek().type === TokenType.MINUS) {
      this.advance(); // consume -
      if (this.peek().type === TokenType.GT) {
        this.advance(); // consume >
        returnType = this.consume(TokenType.IDENTIFIER, 'Expected return type after ->').value;
      } else {
        throw new Error('Expected > after - in return type');
      }
    }

    this.consume(TokenType.LBRACE, 'Expected { before function body');

    const statements = this.blockStatementBody();
    const body = new BlockStatement(statements);

    const decl = new FunctionDeclaration(name, params, body, isAsync);
    if (returnType) {
      decl.returnType = returnType;
    }
    return decl;
  }

  structDeclaration() {
    // struct 키워드는 statement()에서 이미 consume됨
    const name = this.consume(TokenType.IDENTIFIER, 'Expected struct name').value;
    this.consume(TokenType.LBRACE, 'Expected { after struct name');

    const fields = [];
    if (this.peek().type !== TokenType.RBRACE) {
      do {
        // Collect constraints for the field
        let constraints = [];
        while (this.peek().type === TokenType.AT) {
          constraints.push(this.parseConstraint());
        }

        const fieldName = this.consume(TokenType.IDENTIFIER, 'Expected field name').value;
        this.consume(TokenType.COLON, 'Expected : after field name');

        // Parse type annotation (can be function type or simple identifier)
        let fieldType = 'any';
        if (this.peek().type === TokenType.FN) {
          // Parse function type as string representation
          const fnStart = this.current;
          this.advance(); // consume 'fn'
          this.consume(TokenType.LPAREN, 'Expected ( after fn');

          const paramTypes = [];
          if (this.peek().type !== TokenType.RPAREN) {
            do {
              paramTypes.push(this.advance().value);
            } while (this.match(TokenType.COMMA));
          }

          this.consume(TokenType.RPAREN, 'Expected ) after parameters');

          // Handle ->
          if (this.peek().type === TokenType.MINUS) {
            this.advance();
            this.consume(TokenType.GT, 'Expected > after -');
          }

          const returnType = this.advance().value;
          fieldType = `fn(${paramTypes.join(',')}) -> ${returnType}`;
        } else if (this.peek().type === TokenType.IDENTIFIER ||
            this.peek().type === TokenType.LET ||
            this.peek().type === TokenType.CONST) {
          fieldType = this.advance().value;
        }

        const field = { name: fieldName, type: fieldType };
        if (constraints.length > 0) {
          field.constraints = constraints;
        }
        fields.push(field);
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RBRACE, 'Expected } after struct fields');

    return new StructDeclaration(name, fields);
  }

  typeDeclaration() {
    // type 키워드는 statement()에서 이미 consume됨
    const name = this.consume(TokenType.IDENTIFIER, 'Expected type name').value;
    this.consume(TokenType.EQ, 'Expected = after type name');

    // Parse the type expression (simplified: can be function type, identifier, etc.)
    const typeExpr = this.parseTypeExpression();

    // Consume optional semicolon
    this.match(TokenType.SEMICOLON);

    return new TypeDeclaration(name, typeExpr);
  }

  parseTypeExpression() {
    // Handle function types: fn(Type, Type) -> ReturnType
    if (this.peek().type === TokenType.FN) {
      this.advance(); // consume 'fn'
      this.consume(TokenType.LPAREN, 'Expected ( after fn');

      const paramTypes = [];
      if (this.peek().type !== TokenType.RPAREN) {
        do {
          paramTypes.push(this.advance().value);
        } while (this.match(TokenType.COMMA));
      }

      this.consume(TokenType.RPAREN, 'Expected ) after parameters');

      // Handle -> (MINUS followed by GT)
      if (this.peek().type === TokenType.MINUS) {
        this.advance(); // consume -
        if (this.peek().type !== TokenType.GT) {
          throw new Error('Expected > after - in type expression');
        }
        this.advance(); // consume >
      } else {
        throw new Error('Expected -> for return type');
      }

      const returnType = this.advance().value;

      return {
        kind: 'FunctionType',
        paramTypes,
        returnType
      };
    }

    // Simple type identifier
    const typeId = this.consume(TokenType.IDENTIFIER, 'Expected type identifier').value;
    return { kind: 'TypeIdentifier', name: typeId };
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

  expressionStatement() {
    const expr = this.expression();
    this.match(TokenType.SEMICOLON);
    return new ExpressionStatement(expr);
  }

  tryStatement() {
    // try { ... }
    this.consume(TokenType.LBRACE, 'Expected { after try');
    const body = new BlockStatement(this.blockStatementBody());

    let handler = null;
    // catch (e) { ... }
    if (this.match(TokenType.CATCH)) {
      this.consume(TokenType.LPAREN, 'Expected ( after catch');
      const param = this.consume(TokenType.IDENTIFIER, 'Expected parameter name').value;
      this.consume(TokenType.RPAREN, 'Expected ) after catch parameter');
      this.consume(TokenType.LBRACE, 'Expected { before catch body');
      const catchBody = new BlockStatement(this.blockStatementBody());
      handler = new CatchClause(param, catchBody);
    }

    let finalizer = null;
    // finally { ... }
    if (this.match(TokenType.FINALLY)) {
      this.consume(TokenType.LBRACE, 'Expected { after finally');
      finalizer = new BlockStatement(this.blockStatementBody());
    }

    if (!handler && !finalizer) {
      throw new Error('try statement must have catch or finally block');
    }

    return new TryStatement(body, handler, finalizer);
  }

  throwStatement() {
    const argument = this.expression();
    this.match(TokenType.SEMICOLON);
    return new ThrowStatement(argument);
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
    // Handle await expression
    if (this.match(TokenType.AWAIT)) {
      const argument = this.unary();
      return new AwaitExpression(argument);
    }

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

    // ? operator (postfix error propagation)
    if (this.match(TokenType.QUESTION)) {
      expr = new QuestionOp(expr);
    }

    return expr;
  }

  call() {
    let expr = this.member();

    while (true) {
      if (this.match(TokenType.LPAREN)) {
        // Handle function call
        const args = [];
        if (this.peek().type !== TokenType.RPAREN) {
          do {
            args.push(this.assignment());
          } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RPAREN, 'Expected ) after arguments');
        expr = new CallExpression(expr, args);

        // After call, handle member access (for method chaining)
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
      return new Literal(this.tokens[this.current - 1].value, `"${this.tokens[this.current - 1].value}"`);
    }

    // F-string
    if (this.match(TokenType.FSTRING)) {
      const partsJson = this.tokens[this.current - 1].value;
      const parts = JSON.parse(partsJson);

      // Convert parts: text parts as strings, expr parts as parsed expressions
      const processedParts = parts.map(part => {
        if (part.type === 'text') {
          return {
            type: 'text',
            value: part.value
          };
        } else {
          // Parse the expression string
          const exprLexer = new (require('./lexer')).Lexer(part.expr);
          const exprTokens = exprLexer.tokenize();
          const exprParser = new Parser(exprTokens);
          const exprAst = exprParser.expression();
          return {
            type: 'expr',
            expr: exprAst,
            format: part.format
          };
        }
      });

      return new FStringExpression(processedParts);
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

    // Function expression (with optional async)
    let isAsync = false;
    if (this.peek().type === TokenType.ASYNC) {
      isAsync = true;
      this.advance(); // consume async
    }

    if (this.match(TokenType.FN)) {
      let name = null;
      if (this.peek().type === TokenType.IDENTIFIER) {
        name = this.advance().value;
      }
      this.consume(TokenType.LPAREN, 'Expected ( after fn');
      const params = [];
      if (this.peek().type !== TokenType.RPAREN) {
        do {
          const paramName = this.consume(TokenType.IDENTIFIER, 'Expected parameter name').value;

          // Optional type annotation: name: Type
          if (this.match(TokenType.COLON)) {
            // Skip the type annotation (just consume it without storing)
            if (this.peek().type === TokenType.IDENTIFIER) {
              this.advance();
            }
          }

          params.push(paramName);
        } while (this.match(TokenType.COMMA));
      }
      this.consume(TokenType.RPAREN, 'Expected ) after parameters');
      this.consume(TokenType.LBRACE, 'Expected { before function body');
      const body = this.blockStatementBody();
      const expr = new FunctionExpression(name, params, new BlockStatement(body));
      expr.isAsync = isAsync;
      return expr;
    } else if (isAsync) {
      // async without fn is error
      throw new Error('Expected "fn" after "async"');
    }

    // Parenthesized expression
    if (this.match(TokenType.LPAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RPAREN, 'Expected ) after expression');
      return expr;
    }

    throw new Error(`Unexpected token: ${this.peek().type}`);
  }

  /**
   * Parse import declaration
   * import { a, b } from "module"
   * import * as alias from "module"
   * import defaultName from "module"
   */
  parseImportDeclaration() {
    // 'import' token already consumed by statement()
    const specifiers = [];

    if (this.peek().type === TokenType.STAR) {
      // import * as alias from "module"
      this.advance(); // consume '*'
      this.consume(TokenType.AS, 'Expected "as" after *');
      const alias = this.advance();
      specifiers.push(new ImportNamespaceSpecifier(new Identifier(alias.value)));
    } else if (this.peek().type === TokenType.LBRACE) {
      // import { a, b, c } from "module"
      this.advance(); // consume '{'
      while (this.peek().type !== TokenType.RBRACE) {
        const imported = this.advance();
        let local = imported;
        if (this.peek().type === TokenType.AS) {
          this.advance(); // consume 'as'
          local = this.advance();
        }
        specifiers.push(
          new ImportSpecifier(
            new Identifier(imported.value),
            new Identifier(local.value)
          )
        );
        if (this.peek().type === TokenType.COMMA) {
          this.advance(); // consume ','
        }
      }
      this.consume(TokenType.RBRACE, 'Expected } after imports');
    } else if (this.peek().type === TokenType.IDENTIFIER) {
      // import defaultName from "module"
      const defaultName = this.advance();
      specifiers.push(new ImportDefaultSpecifier(new Identifier(defaultName.value)));
    }

    this.consume(TokenType.FROM, 'Expected "from" after import specifiers');
    const source = this.consume(TokenType.STRING, 'Expected string literal for module source');
    this.match(TokenType.SEMICOLON);

    return new ImportDeclaration(specifiers, new Literal(source.value, source.value));
  }

  /**
   * Parse export declaration
   * export fn foo() { ... }
   * export let x = 10
   * export default fn main() { ... }
   */
  parseExportDeclaration() {
    // 'export' token already consumed by statement()
    let isDefault = false;

    if (this.peek().type === TokenType.DEFAULT) {
      isDefault = true;
      this.advance(); // consume 'default'
    }

    // Parse the declaration (function, variable, etc.)
    let declaration = null;

    if (this.match(TokenType.FN)) {
      // FN consumed by match(), now call functionDeclaration
      declaration = this.functionDeclaration();
    } else if (this.match(TokenType.LET, TokenType.CONST, TokenType.VAR)) {
      // Var type already consumed, variableDeclaration expects that
      declaration = this.variableDeclaration();
    } else {
      throw new Error('Expected function or variable declaration after export');
    }

    return new ExportDeclaration(declaration, isDefault);
  }
}

module.exports = {
  Parser,
  Program, VariableDeclaration, FunctionDeclaration, StructDeclaration, TypeDeclaration, BlockStatement, ExpressionStatement,
  IfStatement, WhileStatement, ForStatement, ForInStatement, ReturnStatement,
  BreakStatement, ContinueStatement, TryStatement, CatchClause, ThrowStatement, QuestionOp,
  AwaitExpression,
  BinaryExpression, UnaryExpression, LogicalExpression,
  CallExpression, MemberExpression, AssignmentExpression, ConditionalExpression,
  ArrayExpression, ObjectExpression, Property, FunctionExpression, ArrowFunctionExpression,
  Identifier, Literal, FStringExpression,
  ImportDeclaration, ImportSpecifier, ImportDefaultSpecifier, ImportNamespaceSpecifier,
  ExportDeclaration, ExportNamedDeclaration, ExportSpecifier,
  ConstraintDeclaration
};
