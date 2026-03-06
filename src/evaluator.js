/**
 * FreeLang Evaluator (JavaScript)
 * Abstract Syntax Tree (AST) 실행
 */

const runtime = require('./runtime');
const moduleLoader = require('./module-loader');
const {
  Program, VariableDeclaration, FunctionDeclaration, BlockStatement, ExpressionStatement,
  IfStatement, WhileStatement, ForStatement, ForInStatement, ReturnStatement,
  BreakStatement, ContinueStatement, BinaryExpression, UnaryExpression, LogicalExpression,
  CallExpression, MemberExpression, AssignmentExpression, ConditionalExpression,
  ArrayExpression, ObjectExpression, Property, FunctionExpression, Identifier, Literal,
  TryCatchStatement, CatchClause, ThrowStatement, FStringLiteral
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

class FreeLangFunction {
  constructor(params, body, closure, name) {
    this.params = params;
    this.body = body;
    this.closure = closure;
    this.name = name || '<anonymous>';
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
        const fn = new FreeLangFunction(node.params, node.body, env, node.name);
        env.define(node.name, fn);
        return fn;
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

      if (node instanceof TryCatchStatement) {
        let result = null;
        let caught = false;

        try {
          result = this.eval(node.tryBlock, env);
        } catch (e) {
          if (node.catchClause) {
            // Create a new environment for the catch block
            const catchEnv = new Environment(env);
            catchEnv.define(node.catchClause.param, e.message || e);
            try {
              result = this.eval(node.catchClause.body, catchEnv);
              caught = true;
            } catch (innerE) {
              if (innerE.isReturn || innerE.isBreak || innerE.isContinue) {
                throw innerE;
              }
              throw innerE;
            }
          } else {
            throw e;
          }
        } finally {
          if (node.finallyBlock) {
            this.eval(node.finallyBlock, env);
          }
        }

        return result;
      }

      if (node instanceof ThrowStatement) {
        const value = this.eval(node.argument, env);
        const error = new Error(value);
        error.thrownValue = value;
        throw error;
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
        // Handle ? operator (error propagation)
        if (node.operator === '?') {
          const arg = this.eval(node.argument, env);
          // Check if arg is an error-like object (Result type)
          if (arg && typeof arg === 'object' && arg.isErr) {
            // Propagate error by returning it
            throw new Error(`Error: ${arg.value || 'unknown error'}`);
          }
          return arg;
        }

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
        return new FreeLangFunction(node.params, node.body, env, node.name);
      }

      if (node instanceof Identifier) {
        return env.get(node.name);
      }

      if (node instanceof FStringLiteral) {
        let result = '';
        for (const part of node.parts) {
          if (part.type === 'string') {
            result += part.value;
          } else if (part.type === 'expression') {
            // Evaluate the expression and convert to string
            const exprValue = this.eval(part.value, env);
            result += String(exprValue);
          }
        }
        return result;
      }

      if (node instanceof Literal) {
        return node.value;
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
}

module.exports = { Evaluator, Environment, FreeLangFunction };
