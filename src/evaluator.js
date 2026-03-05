/**
 * FreeLang Evaluator (JavaScript)
 * Abstract Syntax Tree (AST) 실행
 */

const runtime = require('./runtime');
const extendedBuiltins = require('./extended-builtins');
const moduleLoader = require('./module-loader');
const Promise = require('./promise');
const { getGlobalEventLoop } = require('./event-loop');
const {
  Program, VariableDeclaration, FunctionDeclaration, BlockStatement, ExpressionStatement,
  IfStatement, WhileStatement, ForStatement, ForInStatement, ReturnStatement,
  BreakStatement, ContinueStatement, TryStatement, CatchClause, ThrowStatement, QuestionOp,
  BinaryExpression, UnaryExpression, LogicalExpression,
  CallExpression, MemberExpression, AssignmentExpression, ConditionalExpression,
  ArrayExpression, ObjectExpression, Property, FunctionExpression, Identifier, Literal, FStringExpression,
  ImportDeclaration, ImportSpecifier, ImportDefaultSpecifier, ImportNamespaceSpecifier,
  ExportDeclaration, ExportNamedDeclaration, ExportSpecifier, AwaitExpression
} = require('./parser');

// Control flow signals
const ControlSignal = {
  RETURN: 'return',
  BREAK: 'break',
  CONTINUE: 'continue'
};

class Environment {
  constructor(parent = null) {
    this.parent = parent;
    this.vars = new Map();
  }

  define(name, value) {
    this.vars.set(name, value);
  }

  get(name) {
    if (this.vars.has(name)) {
      return this.vars.get(name);
    }
    if (this.parent) {
      return this.parent.get(name);
    }
    throw new Error(`Undefined variable: ${name}`);
  }

  set(name, value) {
    if (this.vars.has(name)) {
      this.vars.set(name, value);
      return;
    }
    if (this.parent) {
      this.parent.set(name, value);
      return;
    }
    throw new Error(`Undefined variable: ${name}`);
  }

  has(name) {
    if (this.vars.has(name)) return true;
    if (this.parent) return this.parent.has(name);
    return false;
  }
}

class ReturnValue extends Error {
  constructor(value) {
    super();
    this.value = value;
    this.isReturn = true;
  }
}

class BreakException extends Error {
  constructor() {
    super();
    this.isBreak = true;
  }
}

class ContinueException extends Error {
  constructor() {
    super();
    this.isContinue = true;
  }
}

class FreeLangError extends Error {
  constructor(message) {
    super(message);
    this.isFreeLangError = true;
    this.__error = true;
    this.message = message;
    this.stack = new Error(message).stack;
    this.name = 'Error';
  }
}

class FreeLangFunction {
  constructor(params, body, closure, name, isAsync = false) {
    this.params = params;
    this.body = body;
    this.closure = closure;
    this.name = name || '<anonymous>';
    this.isAsync = isAsync;
  }

  call(evaluator, args) {
    const localEnv = new Environment(this.closure);
    for (let i = 0; i < this.params.length; i++) {
      localEnv.define(this.params[i], args[i] || null);
    }

    try {
      evaluator.executeBlock(this.body.statements || [this.body], localEnv);
      return null;
    } catch (e) {
      if (e.isReturn) {
        return e.value;
      }
      throw e;
    }
  }

  toString() {
    return `[Function: ${this.name}]`;
  }
}

class Evaluator {
  constructor() {
    this.globalEnv = new Environment();
    this.currentEnv = this.globalEnv;

    // Inject built-in functions from runtime
    for (const [name, fn] of Object.entries(runtime)) {
      if (typeof fn === 'function') {
        this.globalEnv.define(name, fn);
      }
    }

    // Inject extended built-in functions (HTTP, Database, Utilities)
    for (const [name, fn] of Object.entries(extendedBuiltins)) {
      if (typeof fn === 'function') {
        this.globalEnv.define(name, fn);
      }
    }

    // Inject require() function for module loading
    this.globalEnv.define('require', (moduleName) => {
      return moduleLoader.require(moduleName);
    });
  }

  evaluate(ast) {
    return this.eval(ast, this.globalEnv);
  }

  eval(node, env) {
    const prevEnv = this.currentEnv;
    this.currentEnv = env;

    try {
      if (node instanceof Program) {
        let result = null;
        for (const stmt of node.statements) {
          result = this.eval(stmt, env);
        }
        return result;
      }

      if (node instanceof VariableDeclaration) {
        let value = null;
        if (node.init) {
          value = this.eval(node.init, env);
        }
        env.define(node.name, value);
        return value;
      }

      if (node instanceof FunctionDeclaration) {
        const fn = new FreeLangFunction(node.params, node.body, env, node.name, node.isAsync);
        env.define(node.name, fn);
        return fn;
      }

      if (node instanceof ImportDeclaration) {
        return this.evalImportDeclaration(node, env);
      }

      if (node instanceof ExportDeclaration) {
        return this.evalExportDeclaration(node, env);
      }

      if (node instanceof BlockStatement) {
        this.executeBlock(node.statements, env);
        return null;
      }

      if (node instanceof ExpressionStatement) {
        return this.eval(node.expression, env);
      }

      if (node instanceof IfStatement) {
        const test = this.isTruthy(this.eval(node.test, env));
        if (test) {
          return this.eval(node.consequent, env);
        } else if (node.alternate) {
          return this.eval(node.alternate, env);
        }
        return null;
      }

      if (node instanceof WhileStatement) {
        let result = null;
        while (this.isTruthy(this.eval(node.test, env))) {
          try {
            result = this.eval(node.body, env);
          } catch (e) {
            if (e.isBreak) break;
            if (e.isContinue) continue;
            throw e;
          }
        }
        return result;
      }

      if (node instanceof ForStatement) {
        const loopEnv = new Environment(env);
        if (node.init) {
          this.eval(node.init, loopEnv);
        }

        let result = null;
        while (!node.test || this.isTruthy(this.eval(node.test, loopEnv))) {
          try {
            result = this.eval(node.body, loopEnv);
          } catch (e) {
            if (e.isBreak) break;
            if (e.isContinue) {
              if (node.update) {
                this.eval(node.update, loopEnv);
              }
              continue;
            }
            throw e;
          }

          if (node.update) {
            this.eval(node.update, loopEnv);
          }
        }
        return result;
      }

      if (node instanceof ForInStatement) {
        const iterable = this.eval(node.right, env);
        let result = null;
        const loopEnv = new Environment(env);

        if (Array.isArray(iterable)) {
          for (const item of iterable) {
            loopEnv.define(node.left, item);
            try {
              result = this.eval(node.body, loopEnv);
            } catch (e) {
              if (e.isBreak) break;
              if (e.isContinue) continue;
              throw e;
            }
          }
        } else if (typeof iterable === 'object' && iterable !== null) {
          for (const key of Object.keys(iterable)) {
            loopEnv.define(node.left, key);
            try {
              result = this.eval(node.body, loopEnv);
            } catch (e) {
              if (e.isBreak) break;
              if (e.isContinue) continue;
              throw e;
            }
          }
        }
        return result;
      }

      if (node instanceof ReturnStatement) {
        let value = null;
        if (node.argument) {
          value = this.eval(node.argument, env);
        }
        throw new ReturnValue(value);
      }

      if (node instanceof BreakStatement) {
        throw new BreakException();
      }

      if (node instanceof ContinueStatement) {
        throw new ContinueException();
      }

      if (node instanceof BinaryExpression) {
        const left = this.eval(node.left, env);
        const right = this.eval(node.right, env);

        switch (node.operator) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/': return left / right;
          case '%': return left % right;
          case '**': return Math.pow(left, right);
          case '==': return left == right;
          case '===': return left === right;
          case '!=': return left != right;
          case '!==': return left !== right;
          case '<': return left < right;
          case '<=': return left <= right;
          case '>': return left > right;
          case '>=': return left >= right;
          case '&': return left & right;
          case '|': return left | right;
          case '^': return left ^ right;
          case '<<': return left << right;
          case '>>': return left >> right;
          default:
            throw new Error(`Unknown binary operator: ${node.operator}`);
        }
      }

      if (node instanceof UnaryExpression) {
        const arg = this.eval(node.argument, env);

        switch (node.operator) {
          case '+': return +arg;
          case '-': return -arg;
          case '!': return !this.isTruthy(arg);
          case '~': return ~arg;
          default:
            throw new Error(`Unknown unary operator: ${node.operator}`);
        }
      }

      if (node instanceof LogicalExpression) {
        const left = this.eval(node.left, env);

        if (node.operator === '||' || node.operator === 'or') {
          return this.isTruthy(left) ? left : this.eval(node.right, env);
        }
        if (node.operator === '&&' || node.operator === 'and') {
          return this.isTruthy(left) ? this.eval(node.right, env) : left;
        }

        throw new Error(`Unknown logical operator: ${node.operator}`);
      }

      if (node instanceof ConditionalExpression) {
        const test = this.isTruthy(this.eval(node.test, env));
        return test ? this.eval(node.consequent, env) : this.eval(node.alternate, env);
      }

      if (node instanceof CallExpression) {
        const callee = this.eval(node.callee, env);
        const args = node.args.map(arg => this.eval(arg, env));

        if (callee instanceof FreeLangFunction) {
          // async 함수면 Promise 반환
          if (callee.isAsync) {
            return new Promise((resolve, reject) => {
              try {
                const localEnv = new Environment(callee.closure);
                for (let i = 0; i < callee.params.length; i++) {
                  localEnv.define(callee.params[i], args[i] || null);
                }

                let result = null;
                try {
                  this.executeBlock(callee.body.statements || [callee.body], localEnv);
                } catch (e) {
                  if (e.isReturn) {
                    result = e.value;
                  } else {
                    throw e;
                  }
                }

                // Promise면 연쇄, 아니면 resolve
                if (result instanceof Promise) {
                  result.then(resolve, reject);
                } else {
                  resolve(result);
                }
              } catch (error) {
                reject(error);
              }
            });
          }
          return callee.call(this, args);
        } else if (typeof callee === 'function') {
          // Native function
          return callee(...args);
        }

        throw new Error(`Not a function: ${typeof callee}`);
      }

      if (node instanceof MemberExpression) {
        const object = this.eval(node.object, env);

        if (node.computed) {
          const property = this.eval(node.property, env);
          return object[property];
        } else {
          const property = node.property.name;
          return object[property];
        }
      }

      if (node instanceof AssignmentExpression) {
        const value = this.eval(node.right, env);

        if (node.left instanceof Identifier) {
          const name = node.left.name;

          switch (node.operator) {
            case '=':
              env.set(name, value);
              break;
            case '+=':
              env.set(name, env.get(name) + value);
              break;
            case '-=':
              env.set(name, env.get(name) - value);
              break;
            case '*=':
              env.set(name, env.get(name) * value);
              break;
            case '/=':
              env.set(name, env.get(name) / value);
              break;
            default:
              throw new Error(`Unknown assignment operator: ${node.operator}`);
          }

          return value;
        }

        if (node.left instanceof MemberExpression) {
          const object = this.eval(node.left.object, env);
          const property = node.left.computed
            ? this.eval(node.left.property, env)
            : node.left.property.name;

          switch (node.operator) {
            case '=':
              object[property] = value;
              break;
            case '+=':
              object[property] = object[property] + value;
              break;
            case '-=':
              object[property] = object[property] - value;
              break;
            case '*=':
              object[property] = object[property] * value;
              break;
            case '/=':
              object[property] = object[property] / value;
              break;
          }

          return value;
        }

        throw new Error('Invalid assignment target');
      }

      if (node instanceof ArrayExpression) {
        return node.elements.map(elem => elem ? this.eval(elem, env) : null);
      }

      if (node instanceof ObjectExpression) {
        const obj = {};
        for (const prop of node.properties) {
          const key = prop.key.value;
          const value = this.eval(prop.value, env);
          obj[key] = value;
        }
        return obj;
      }

      if (node instanceof FunctionExpression) {
        return new FreeLangFunction(node.params, node.body, env, node.name, node.isAsync);
      }

      if (node instanceof Identifier) {
        return env.get(node.name);
      }

      if (node instanceof Literal) {
        return node.value;
      }

      if (node instanceof FStringExpression) {
        return this.evalFString(node, env);
      }

      if (node instanceof TryStatement) {
        return this.evalTryStatement(node, env);
      }

      if (node instanceof ThrowStatement) {
        return this.evalThrowStatement(node, env);
      }

      if (node instanceof AwaitExpression) {
        return this.evalAwaitExpression(node, env);
      }

      if (node instanceof QuestionOp) {
        return this.evalQuestionOp(node, env);
      }

      throw new Error(`Unknown node type: ${node.type || node.constructor.name}`);
    } finally {
      this.currentEnv = prevEnv;
    }
  }

  executeBlock(statements, env) {
    let result = null;
    for (const stmt of statements) {
      result = this.eval(stmt, env);
    }
    return result;
  }

  isTruthy(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value.length > 0;
    return true;
  }

  evalTryStatement(node, env) {
    let result = null;
    let caughtError = null;

    // Execute try block
    try {
      result = this.eval(node.body, env);
    } catch (e) {
      // If it's a control flow signal (return/break/continue), re-throw
      if (e.isReturn || e.isBreak || e.isContinue) {
        throw e;
      }

      // Catch other errors
      caughtError = e;

      // Execute catch block if present
      if (node.handler) {
        const catchEnv = new Environment(env);
        // Store error message as string in catch variable
        const errorMsg = e instanceof FreeLangError
          ? e.message
          : (e.message || String(e));
        catchEnv.define(node.handler.param, errorMsg);

        try {
          result = this.eval(node.handler.body, catchEnv);
          // If catch block succeeds, clear the error
          caughtError = null;
        } catch (catchErr) {
          // Control flow in catch block
          if (catchErr.isReturn || catchErr.isBreak || catchErr.isContinue) {
            throw catchErr;
          }
          // New error in catch block
          caughtError = catchErr;
        }
      }
    }

    // Execute finally block regardless of error
    if (node.finalizer) {
      try {
        this.eval(node.finalizer, env);
      } catch (finallyErr) {
        // Control flow in finally block
        if (finallyErr.isReturn || finallyErr.isBreak || finallyErr.isContinue) {
          throw finallyErr;
        }
        // Error in finally block overrides previous error
        caughtError = finallyErr;
      }
    }

    // If there was an uncaught error, throw it
    if (caughtError) {
      throw caughtError;
    }

    return result;
  }

  evalThrowStatement(node, env) {
    const value = this.eval(node.argument, env);

    // If value is already an error object, throw it
    if (value instanceof FreeLangError) {
      throw value;
    }

    // If value is a string, create error with that message
    if (typeof value === 'string') {
      throw new FreeLangError(value);
    }

    // If value is an object with message property
    if (typeof value === 'object' && value !== null && value.message) {
      throw new FreeLangError(value.message);
    }

    // Otherwise throw as is
    throw new FreeLangError(String(value));
  }

  evalAwaitExpression(node, env) {
    // await의 대상 평가
    let value = this.eval(node.argument, env);

    // Promise가 아니면 값 그대로 반환
    if (!(value instanceof Promise)) {
      return value;
    }

    // Promise인 경우 값을 동기적으로 추출
    // 마이크로태스크 큐에서 처리
    let result = undefined;
    let error = undefined;
    let completed = false;

    // Promise 완료 시 값 저장
    value
      .then((val) => {
        result = val;
        completed = true;
      })
      .catch((reason) => {
        error = reason;
        completed = true;
      });

    // 마이크로태스크 실행 (즉시 완료되지 않으면 에러)
    const eventLoop = getGlobalEventLoop();

    // 마이크로태스크만 실행 (마크로태스크는 실행 안 함)
    let iterations = 0;
    const maxIterations = 1000;
    while (!completed && iterations < maxIterations) {
      eventLoop.tick();
      iterations++;
    }

    // 에러가 있으면 throw
    if (error !== undefined) {
      throw error;
    }

    // 결과 반환 (undefined일 수 있음)
    return result;
  }

  evalQuestionOp(node, env) {
    const operand = this.eval(node.operand, env);

    // Check if operand is a Result type
    if (typeof operand === 'object' && operand !== null) {
      // Ok(val) pattern
      if (operand.__ok === true) {
        return operand.value;
      }
      // Err(msg) pattern - propagate error
      if (operand.__err === true) {
        throw new FreeLangError(operand.message || operand.value);
      }
    }

    // For non-Result types, just return the value
    return operand;
  }

  evalFString(node, env) {
    let result = '';

    for (const part of node.parts) {
      if (part.type === 'text') {
        result += part.value;
      } else if (part.type === 'expr') {
        // Evaluate the expression
        const value = this.eval(part.expr, env);

        // Apply formatting if specified
        const formatted = this.formatValue(value, part.format);
        result += formatted;
      }
    }

    return result;
  }

  formatValue(value, format) {
    if (!format) {
      // Default: convert to string
      if (value === null) return 'null';
      if (value === undefined) return 'undefined';
      return String(value);
    }

    // Parse format specifier (don't lowercase yet to preserve case for hex)
    const formatStr = format.trim();
    const formatLower = formatStr.toLowerCase();

    if (formatLower.startsWith('.') && formatLower.endsWith('f')) {
      // :.2f format - floating point with decimal places
      const decimalPlaces = parseInt(formatStr.substring(1, formatStr.length - 1), 10);
      if (typeof value === 'number') {
        return value.toFixed(decimalPlaces);
      }
      return String(value);
    }

    if (formatLower === 'x') {
      // :x format - lowercase hexadecimal
      if (typeof value === 'number') {
        return Math.floor(value).toString(16);
      }
      return String(value);
    }

    if (formatStr === 'X') {
      // :X format - uppercase hexadecimal
      if (typeof value === 'number') {
        return Math.floor(value).toString(16).toUpperCase();
      }
      return String(value);
    }

    if (formatLower === 'o') {
      // :o format - octal
      if (typeof value === 'number') {
        return Math.floor(value).toString(8);
      }
      return String(value);
    }

    if (formatLower === 'b') {
      // :b format - binary
      if (typeof value === 'number') {
        return Math.floor(value).toString(2);
      }
      return String(value);
    }

    if (formatLower === 'd') {
      // :d format - decimal (integer)
      if (typeof value === 'number') {
        return Math.floor(value).toString();
      }
      return String(value);
    }

    if (formatLower === 's') {
      // :s format - string
      return String(value);
    }

    // Unknown format, just return string representation
    return String(value);
  }

  /**
   * Evaluate import declaration
   * import { a, b } from "module"
   * import * as alias from "module"
   * import defaultName from "module"
   */
  evalImportDeclaration(node, env) {
    const moduleName = node.source.value;
    let moduleExports;

    try {
      moduleExports = moduleLoader.require(moduleName);
    } catch (error) {
      throw new FreeLangError(`Failed to import module '${moduleName}': ${error.message}`);
    }

    // Track imported modules for circular dependency detection
    if (!this.importedModules) {
      this.importedModules = new Set();
    }

    // Detect circular imports
    if (this.importedModules.has(moduleName)) {
      throw new FreeLangError(`Circular import detected: '${moduleName}'`);
    }

    this.importedModules.add(moduleName);

    try {
      // Process each specifier
      for (const specifier of node.specifiers) {
        if (specifier instanceof ImportDefaultSpecifier) {
          // import defaultName from "module"
          if (moduleExports.default) {
            env.define(specifier.local.name, moduleExports.default);
          } else {
            env.define(specifier.local.name, moduleExports);
          }
        } else if (specifier instanceof ImportNamespaceSpecifier) {
          // import * as alias from "module"
          env.define(specifier.local.name, moduleExports);
        } else if (specifier instanceof ImportSpecifier) {
          // import { a, b } from "module"
          const importedName = specifier.imported.name;
          const localName = specifier.local.name;

          if (!(importedName in moduleExports)) {
            throw new FreeLangError(`Export '${importedName}' not found in module '${moduleName}'`);
          }

          env.define(localName, moduleExports[importedName]);
        }
      }
    } finally {
      this.importedModules.delete(moduleName);
    }

    return null;
  }

  /**
   * Evaluate export declaration
   * export fn foo() { ... }
   * export let x = 10
   * export default fn main() { ... }
   */
  evalExportDeclaration(node, env) {
    // Initialize module exports if not exists
    if (!this.moduleExports) {
      this.moduleExports = {};
    }

    // First, evaluate the declaration (function or variable)
    const declarationResult = this.eval(node.declaration, env);

    // For named exports
    if (node.declaration instanceof FunctionDeclaration) {
      const name = node.declaration.name;
      if (node.isDefault) {
        this.moduleExports.default = env.get(name);
      } else {
        this.moduleExports[name] = env.get(name);
      }
    } else if (node.declaration instanceof VariableDeclaration) {
      const name = node.declaration.name;
      if (node.isDefault) {
        this.moduleExports.default = env.get(name);
      } else {
        this.moduleExports[name] = env.get(name);
      }
    }

    return null;
  }

  /**
   * Get module exports (for use with require)
   */
  getModuleExports() {
    return this.moduleExports || {};
  }
}

module.exports = { Evaluator, Environment, FreeLangFunction, FreeLangError };
