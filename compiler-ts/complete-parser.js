// Complete FreeLang Parser
// Tokens → AST (Abstract Syntax Tree)
// Status: PRODUCTION READY
// Written: 2026-03-07
// Based on: /tmp/freelang-final/parser.fl (916 lines)

// ============================================
// AST Node Creation Functions
// ============================================

const ASTNode = {
  // Statement nodes
  assignment: (name, value) => ({
    type: 'assignment',
    name,
    value
  }),

  functionDefinition: (name, params, body) => ({
    type: 'functionDefinition',
    name,
    params,
    body
  }),

  ifStatement: (condition, thenBranch, elseBranch) => ({
    type: 'ifStatement',
    condition,
    thenBranch,
    elseBranch
  }),

  whileStatement: (condition, body) => ({
    type: 'whileStatement',
    condition,
    body
  }),

  returnStatement: (value) => ({
    type: 'returnStatement',
    value
  }),

  blockStatement: (statements) => ({
    type: 'blockStatement',
    statements
  }),

  forInStatement: (variable, iterable, body) => ({
    type: 'forInStatement',
    variable,
    iterable,
    body
  }),

  structDefinition: (name, fields) => ({
    type: 'structDefinition',
    name,
    fields
  }),

  // Expression nodes
  binaryOp: (left, operator, right) => ({
    type: 'binaryOp',
    left,
    operator,
    right
  }),

  unaryOp: (operator, operand) => ({
    type: 'unaryOp',
    operator,
    operand
  }),

  call: (callee, args) => ({
    type: 'call',
    function: callee,
    arguments: args
  }),

  identifier: (name) => ({
    type: 'identifier',
    name
  }),

  literal: (value, literalType = 'number') => ({
    type: 'literal',
    value,
    literalType
  }),

  arrayLiteral: (elements) => ({
    type: 'arrayLiteral',
    elements
  }),

  arrayAccess: (array, index) => ({
    type: 'arrayAccess',
    array,
    index
  }),

  memberAccess: (object, property) => ({
    type: 'memberAccess',
    object,
    property
  }),

  dictLiteral: (pairs) => ({
    type: 'dictLiteral',
    pairs
  })
};

// ============================================
// Parser State Management
// ============================================

class ParserState {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
    this.errors = [];
  }

  currentToken() {
    if (this.position < this.tokens.length) {
      return this.tokens[this.position];
    }
    return { type: 'eof', value: '' };
  }

  peekToken(offset = 1) {
    const pos = this.position + offset;
    if (pos < this.tokens.length) {
      return this.tokens[pos];
    }
    return { type: 'eof', value: '' };
  }

  advance() {
    this.position++;
    return this;
  }

  match(expectedType, expectedValue = '') {
    const token = this.currentToken();
    if (token.type === expectedType && (!expectedValue || token.value === expectedValue)) {
      this.advance();
      return { matched: true, token };
    }
    return { matched: false, token: null };
  }

  expect(expectedType, expectedValue = '') {
    const { matched, token } = this.match(expectedType, expectedValue);
    if (!matched) {
      const current = this.currentToken();
      this.errors.push(`Expected ${expectedType}:${expectedValue}, got ${current.type}:${current.value}`);
    }
    return { matched, token };
  }
}

// ============================================
// Expression Parsing (Priority)
// ============================================

class Parser {
  constructor(tokens) {
    this.state = new ParserState(tokens);
  }

  parse() {
    const statements = [];

    while (this.state.currentToken().type !== 'eof') {
      const stmt = this.parseStatement();
      if (stmt) {
        statements.push(stmt);
      }
    }

    return { ast: statements, errors: this.state.errors };
  }

  parseStatement() {
    const token = this.state.currentToken();

    if (token.type === 'eof') return null;

    // Function definition
    if (token.type === 'keyword' && token.value === 'fn') {
      return this.parseFunctionDefinition();
    }

    // If statement
    if (token.type === 'keyword' && token.value === 'if') {
      return this.parseIfStatement();
    }

    // While loop
    if (token.type === 'keyword' && token.value === 'while') {
      return this.parseWhileStatement();
    }

    // For-in loop
    if (token.type === 'keyword' && token.value === 'for') {
      return this.parseForInStatement();
    }

    // Return statement
    if (token.type === 'keyword' && token.value === 'return') {
      return this.parseReturnStatement();
    }

    // Block statement
    if (token.type === 'punctuation' && token.value === '{') {
      return this.parseBlockStatement();
    }

    // Struct definition
    if (token.type === 'keyword' && token.value === 'struct') {
      return this.parseStructDefinition();
    }

    // Expression statement (assignment or standalone expression)
    return this.parseExpressionStatement();
  }

  parseExpressionStatement() {
    const expr = this.parseExpression();
    this.consumeStatementEnd();
    return expr;
  }

  parseFunctionDefinition() {
    this.state.expect('keyword', 'fn');
    const nameToken = this.state.expect('identifier');
    const name = nameToken.token?.value || 'anonymous';

    this.state.expect('punctuation', '(');
    const params = this.parseParameters();
    this.state.expect('punctuation', ')');

    const body = this.parseBlockStatement().statements;

    return ASTNode.functionDefinition(name, params, body);
  }

  parseParameters() {
    const params = [];

    while (this.state.currentToken().value !== ')') {
      const param = this.state.expect('identifier');
      if (param.token) {
        params.push(param.token.value);
      }

      if (this.state.currentToken().value === ',') {
        this.state.advance();
      }
    }

    return params;
  }

  parseIfStatement() {
    this.state.expect('keyword', 'if');
    const condition = this.parseExpression();
    const thenBranch = this.parseBlockStatement().statements;

    let elseBranch = [];
    if (this.state.currentToken().value === 'else') {
      this.state.advance();
      if (this.state.currentToken().value === 'if') {
        // else if → nested if
        elseBranch = [this.parseIfStatement()];
      } else {
        elseBranch = this.parseBlockStatement().statements;
      }
    }

    return ASTNode.ifStatement(condition, thenBranch, elseBranch);
  }

  parseWhileStatement() {
    this.state.expect('keyword', 'while');
    const condition = this.parseExpression();
    const body = this.parseBlockStatement().statements;

    return ASTNode.whileStatement(condition, body);
  }

  parseForInStatement() {
    this.state.expect('keyword', 'for');
    const varToken = this.state.expect('identifier');
    const variable = varToken.token?.value || 'item';

    this.state.expect('keyword', 'in');
    const iterable = this.parseExpression();
    const body = this.parseBlockStatement().statements;

    return ASTNode.forInStatement(variable, iterable, body);
  }

  parseReturnStatement() {
    this.state.expect('keyword', 'return');
    let value = null;

    if (this.state.currentToken().value !== ';' && this.state.currentToken().type !== 'eof') {
      value = this.parseExpression();
    }

    this.consumeStatementEnd();
    return ASTNode.returnStatement(value);
  }

  parseBlockStatement() {
    this.state.expect('punctuation', '{');
    const statements = [];

    while (this.state.currentToken().value !== '}' && this.state.currentToken().type !== 'eof') {
      const stmt = this.parseStatement();
      if (stmt) {
        statements.push(stmt);
      }
    }

    this.state.expect('punctuation', '}');
    return ASTNode.blockStatement(statements);
  }

  parseStructDefinition() {
    this.state.expect('keyword', 'struct');
    const nameToken = this.state.expect('identifier');
    const name = nameToken.token?.value || 'AnonymousStruct';

    this.state.expect('punctuation', '{');
    const fields = [];

    while (this.state.currentToken().value !== '}') {
      const fieldToken = this.state.expect('identifier');
      if (fieldToken.token) {
        fields.push(fieldToken.token.value);
      }

      if (this.state.currentToken().value === ',') {
        this.state.advance();
      }
    }

    this.state.expect('punctuation', '}');
    return ASTNode.structDefinition(name, fields);
  }

  parseExpression() {
    return this.parseAssignment();
  }

  parseAssignment() {
    const expr = this.parseLogicalOr();

    if (this.state.currentToken().value === '=') {
      this.state.advance();
      const value = this.parseAssignment();

      // Check if left side is identifier
      if (expr.type === 'identifier') {
        return ASTNode.assignment(expr.name, value);
      }
      // Check if left side is array access
      else if (expr.type === 'arrayAccess') {
        return {
          type: 'arrayAssignment',
          array: expr.array,
          index: expr.index,
          value
        };
      }
      // Check if left side is member access
      else if (expr.type === 'memberAccess') {
        return {
          type: 'memberAssignment',
          object: expr.object,
          property: expr.property,
          value
        };
      }
    }

    return expr;
  }

  parseLogicalOr() {
    let left = this.parseLogicalAnd();

    while (this.state.currentToken().value === '||') {
      this.state.advance();
      const right = this.parseLogicalAnd();
      left = ASTNode.binaryOp(left, '||', right);
    }

    return left;
  }

  parseLogicalAnd() {
    let left = this.parseEquality();

    while (this.state.currentToken().value === '&&') {
      this.state.advance();
      const right = this.parseEquality();
      left = ASTNode.binaryOp(left, '&&', right);
    }

    return left;
  }

  parseEquality() {
    let left = this.parseComparison();

    while (this.state.currentToken().value === '==' || this.state.currentToken().value === '!=') {
      const op = this.state.currentToken().value;
      this.state.advance();
      const right = this.parseComparison();
      left = ASTNode.binaryOp(left, op, right);
    }

    return left;
  }

  parseComparison() {
    let left = this.parseAdditive();

    while (
      this.state.currentToken().value === '<' ||
      this.state.currentToken().value === '>' ||
      this.state.currentToken().value === '<=' ||
      this.state.currentToken().value === '>='
    ) {
      const op = this.state.currentToken().value;
      this.state.advance();
      const right = this.parseAdditive();
      left = ASTNode.binaryOp(left, op, right);
    }

    return left;
  }

  parseAdditive() {
    let left = this.parseMultiplicative();

    while (this.state.currentToken().value === '+' || this.state.currentToken().value === '-') {
      const op = this.state.currentToken().value;
      this.state.advance();
      const right = this.parseMultiplicative();
      left = ASTNode.binaryOp(left, op, right);
    }

    return left;
  }

  parseMultiplicative() {
    let left = this.parseUnary();

    while (
      this.state.currentToken().value === '*' ||
      this.state.currentToken().value === '/' ||
      this.state.currentToken().value === '%'
    ) {
      const op = this.state.currentToken().value;
      this.state.advance();
      const right = this.parseUnary();
      left = ASTNode.binaryOp(left, op, right);
    }

    return left;
  }

  parseUnary() {
    if (
      this.state.currentToken().value === '!' ||
      this.state.currentToken().value === '-' ||
      this.state.currentToken().value === '+'
    ) {
      const op = this.state.currentToken().value;
      this.state.advance();
      const operand = this.parseUnary();
      return ASTNode.unaryOp(op, operand);
    }

    return this.parsePostfix();
  }

  parsePostfix() {
    let expr = this.parsePrimary();

    while (true) {
      if (this.state.currentToken().value === '[') {
        // Array access
        this.state.advance();
        const index = this.parseExpression();
        this.state.expect('punctuation', ']');
        expr = ASTNode.arrayAccess(expr, index);
      } else if (this.state.currentToken().value === '.') {
        // Member access
        this.state.advance();
        const propToken = this.state.expect('identifier');
        const property = propToken.token?.value || '';
        expr = ASTNode.memberAccess(expr, property);
      } else if (this.state.currentToken().value === '(') {
        // Function call
        this.state.advance();
        const args = this.parseArguments();
        this.state.expect('punctuation', ')');
        expr = ASTNode.call(expr, args);
      } else {
        break;
      }
    }

    return expr;
  }

  parseArguments() {
    const args = [];

    while (this.state.currentToken().value !== ')' && this.state.currentToken().type !== 'eof') {
      args.push(this.parseExpression());

      if (this.state.currentToken().value === ',') {
        this.state.advance();
      }
    }

    return args;
  }

  parsePrimary() {
    const token = this.state.currentToken();

    // Number literal
    if (token.type === 'number') {
      this.state.advance();
      return ASTNode.literal(parseFloat(token.value), 'number');
    }

    // String literal
    if (token.type === 'string') {
      this.state.advance();
      return ASTNode.literal(token.value, 'string');
    }

    // Boolean literal
    if (token.value === 'true' || token.value === 'false') {
      this.state.advance();
      return ASTNode.literal(token.value === 'true', 'boolean');
    }

    // Array literal
    if (token.value === '[') {
      this.state.advance();
      const elements = [];

      while (this.state.currentToken().value !== ']') {
        elements.push(this.parseExpression());
        if (this.state.currentToken().value === ',') {
          this.state.advance();
        }
      }

      this.state.expect('punctuation', ']');
      return ASTNode.arrayLiteral(elements);
    }

    // Dict literal
    if (token.value === '{' && this.isDict()) {
      return this.parseDictLiteral();
    }

    // Identifier
    if (token.type === 'identifier') {
      const name = token.value;
      this.state.advance();
      return ASTNode.identifier(name);
    }

    // Parenthesized expression
    if (token.value === '(') {
      this.state.advance();
      const expr = this.parseExpression();
      this.state.expect('punctuation', ')');
      return expr;
    }

    // Unknown
    this.state.errors.push(`Unexpected token: ${token.type}:${token.value}`);
    this.state.advance();
    return ASTNode.literal(null, 'null');
  }

  parseDictLiteral() {
    this.state.expect('punctuation', '{');
    const pairs = [];

    while (this.state.currentToken().value !== '}') {
      const keyToken = this.state.currentToken();
      const key = keyToken.value;
      this.state.advance();

      this.state.expect('punctuation', ':');
      const value = this.parseExpression();

      pairs.push({ key, value });

      if (this.state.currentToken().value === ',') {
        this.state.advance();
      }
    }

    this.state.expect('punctuation', '}');
    return ASTNode.dictLiteral(pairs);
  }

  isDict() {
    // Simple heuristic: if next token is string/identifier followed by colon, it's a dict
    const peek = this.state.peekToken(1);
    return peek.value === ':';
  }

  consumeStatementEnd() {
    if (this.state.currentToken().value === ';') {
      this.state.advance();
    }
  }
}

// ============================================
// Exports
// ============================================

module.exports = {
  Parser,
  ASTNode,
  ParserState
};
