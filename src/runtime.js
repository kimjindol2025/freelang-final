/**
 * FreeLang Runtime - JavaScript Implementation of Built-in Functions
 *
 * This module provides 10+ core built-in functions for FreeLang,
 * allowing FreeLang code to interact with the Node.js environment.
 *
 * Implements:
 * 1. I/O Functions: print, println, read_file, write_file, getline
 * 2. Network: fetch (HTTP client)
 * 3. JSON: json_parse, json_stringify
 * 4. System: get_env, get_argv, now, sleep, exit
 * 5. Process: spawn, exec
 */

'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { execSync } = require('child_process');

// ============================================================================
// I/O Functions
// ============================================================================

/**
 * print(value: any): null
 * Writes value to stdout without newline
 */
function print(value) {
  process.stdout.write(String(value));
  return null;
}

/**
 * println(value: any): null
 * Writes value to stdout with newline
 */
function println(value) {
  console.log(String(value));
  return null;
}

/**
 * read_file(path: string): {ok: boolean, value?: string, error?: string}
 * Reads file contents, returns Result<string>
 */
function read_file(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    return { ok: true, value: content, error: null };
  } catch (err) {
    return { ok: false, value: null, error: err.message };
  }
}

/**
 * write_file(path: string, content: string): {ok: boolean, error?: string}
 * Writes content to file, returns Result<null>
 */
function write_file(filepath, content) {
  try {
    fs.writeFileSync(filepath, content, 'utf8');
    return { ok: true, value: null, error: null };
  } catch (err) {
    return { ok: false, value: null, error: err.message };
  }
}

/**
 * append_file(path: string, content: string): {ok: boolean, error?: string}
 * Appends content to file, returns Result<null>
 */
function append_file(filepath, content) {
  try {
    fs.appendFileSync(filepath, content, 'utf8');
    return { ok: true, value: null, error: null };
  } catch (err) {
    return { ok: false, value: null, error: err.message };
  }
}

/**
 * getline(): string
 * Reads a line from stdin (blocking)
 * For now returns empty string - requires async support
 */
function getline() {
  // TODO: Implement proper synchronous stdin reading
  return '';
}

// ============================================================================
// Network Functions
// ============================================================================

/**
 * fetch(url: string, method?: string): {ok: boolean, status?: i32, body?: string, error?: string}
 * Performs HTTP request, returns Result<{status, body}>
 * Simple synchronous implementation for GET/POST
 */
function fetch_http(url, method = 'GET', options = {}) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const useHttps = parsed.protocol === 'https:';
      const client = useHttps ? https : http;

      const reqOptions = {
        hostname: parsed.hostname,
        port: parsed.port || (useHttps ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: method,
        headers: options.headers || { 'User-Agent': 'FreeLang/2.5.0' },
        timeout: 5000,
      };

      let body = '';
      const req = client.request(reqOptions, (res) => {
        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          resolve({
            ok: true,
            status: res.statusCode,
            body: body,
            error: null,
          });
        });
      });

      req.on('error', (err) => {
        resolve({
          ok: false,
          status: 0,
          body: null,
          error: err.message,
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          ok: false,
          status: 0,
          body: null,
          error: 'Request timeout',
        });
      });

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    } catch (err) {
      resolve({
        ok: false,
        status: 0,
        body: null,
        error: err.message,
      });
    }
  });
}

// Synchronous wrapper for fetch (blocks until response)
function fetch(url, method = 'GET', options = {}) {
  // Note: This requires await in FreeLang or callbacks
  // For now, return a promise-like object
  return fetch_http(url, method, options);
}

// ============================================================================
// JSON Functions
// ============================================================================

/**
 * json_parse(text: string): {ok: boolean, value?: any, error?: string}
 * Parses JSON string, returns Result<any>
 */
function json_parse(text) {
  try {
    const value = JSON.parse(text);
    return { ok: true, value: value, error: null };
  } catch (err) {
    return { ok: false, value: null, error: err.message };
  }
}

/**
 * json_stringify(obj: any, pretty?: bool): {ok: boolean, value?: string, error?: string}
 * Converts object to JSON string, returns Result<string>
 */
function json_stringify(obj, pretty = false) {
  try {
    const indent = pretty ? 2 : 0;
    const value = JSON.stringify(obj, null, indent);
    return { ok: true, value: value, error: null };
  } catch (err) {
    return { ok: false, value: null, error: err.message };
  }
}

// ============================================================================
// System Functions
// ============================================================================

/**
 * get_env(key: string): string
 * Gets environment variable, returns empty string if not found
 */
function get_env(key) {
  return process.env[key] || '';
}

/**
 * set_env(key: string, value: string): null
 * Sets environment variable
 */
function set_env(key, value) {
  process.env[key] = String(value);
  return null;
}

/**
 * get_argv(): [string]
 * Gets command-line arguments (excluding node path and script)
 */
function get_argv() {
  return process.argv.slice(2);
}

/**
 * now(): f64
 * Returns current timestamp in milliseconds
 */
function now() {
  return Date.now();
}

/**
 * sleep(ms: i32): Promise<null>
 * Sleeps for specified milliseconds
 */
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, ms);
  });
}

/**
 * exit(code?: i32): null
 * Exits the process with exit code
 */
function exit(code = 0) {
  process.exit(code);
  return null;
}

// ============================================================================
// Process Functions
// ============================================================================

/**
 * exec(command: string): {ok: boolean, stdout?: string, stderr?: string, code?: i32, error?: string}
 * Executes shell command synchronously, returns Result<{stdout, stderr, code}>
 */
function exec(command) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    return {
      ok: true,
      stdout: result,
      stderr: '',
      code: 0,
      error: null,
    };
  } catch (err) {
    return {
      ok: false,
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      code: err.status || 1,
      error: err.message,
    };
  }
}

// ============================================================================
// File System Utilities
// ============================================================================

/**
 * file_exists(path: string): bool
 * Checks if file exists
 */
function file_exists(filepath) {
  try {
    fs.statSync(filepath);
    return true;
  } catch {
    return false;
  }
}

/**
 * is_file(path: string): bool
 * Checks if path is a regular file
 */
function is_file(filepath) {
  try {
    return fs.statSync(filepath).isFile();
  } catch {
    return false;
  }
}

/**
 * is_dir(path: string): bool
 * Checks if path is a directory
 */
function is_dir(filepath) {
  try {
    return fs.statSync(filepath).isDirectory();
  } catch {
    return false;
  }
}

/**
 * mkdir(path: string): {ok: boolean, error?: string}
 * Creates directory (recursive)
 */
function mkdir(filepath) {
  try {
    fs.mkdirSync(filepath, { recursive: true });
    return { ok: true, error: null };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * remove_file(path: string): {ok: boolean, error?: string}
 * Removes a file
 */
function remove_file(filepath) {
  try {
    fs.unlinkSync(filepath);
    return { ok: true, error: null };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * list_dir(path: string): {ok: boolean, files?: [string], error?: string}
 * Lists files in directory
 */
function list_dir(dirpath) {
  try {
    const files = fs.readdirSync(dirpath);
    return { ok: true, files: files, error: null };
  } catch (err) {
    return { ok: false, files: null, error: err.message };
  }
}

// ============================================================================
// Path Utilities
// ============================================================================

/**
 * path_join(...parts: string): string
 * Joins path components
 */
function path_join(...parts) {
  return path.join(...parts);
}

/**
 * path_basename(filepath: string): string
 * Gets filename from path
 */
function path_basename(filepath) {
  return path.basename(filepath);
}

/**
 * path_dirname(filepath: string): string
 * Gets directory from path
 */
function path_dirname(filepath) {
  return path.dirname(filepath);
}

/**
 * path_extname(filepath: string): string
 * Gets file extension
 */
function path_extname(filepath) {
  return path.extname(filepath);
}

/**
 * path_resolve(filepath: string): string
 * Resolves absolute path
 */
function path_resolve(filepath) {
  return path.resolve(filepath);
}

/**
 * cwd(): string
 * Gets current working directory
 */
function cwd() {
  return process.cwd();
}

/**
 * chdir(path: string): {ok: boolean, error?: string}
 * Changes working directory
 */
function chdir(dirpath) {
  try {
    process.chdir(dirpath);
    return { ok: true, error: null };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ============================================================================
// String Functions (Additional)
// ============================================================================

/**
 * upper(s: string): string
 * Converts string to uppercase
 */
function upper(s) {
  return String(s).toUpperCase();
}

/**
 * lower(s: string): string
 * Converts string to lowercase
 */
function lower(s) {
  return String(s).toLowerCase();
}

/**
 * capitalize(s: string): string
 * Capitalizes first character, rest lowercase
 */
function capitalize(s) {
  const str = String(s);
  if (str.length === 0) return str;
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * reverse(s: string): string
 * Reverses a string
 */
function reverse(s) {
  return String(s).split('').reverse().join('');
}

/**
 * charAt(s: string, index: i32): string
 * Gets character at index
 */
function charAt(s, index) {
  const str = String(s);
  if (index < 0 || index >= str.length) return '';
  return str[index];
}

/**
 * indexOf(s: string, search: string): i32
 * Finds first occurrence of substring
 */
function indexOf(s, search) {
  const str = String(s);
  const search_str = String(search);
  const idx = str.indexOf(search_str);
  return idx;
}

/**
 * lastIndexOf(s: string, search: string): i32
 * Finds last occurrence of substring
 */
function lastIndexOf(s, search) {
  const str = String(s);
  const search_str = String(search);
  const idx = str.lastIndexOf(search_str);
  return idx;
}

/**
 * includes(s: string, search: string): bool
 * Checks if string contains substring
 */
function includes(s, search) {
  return String(s).includes(String(search));
}

/**
 * startsWith(s: string, prefix: string): bool
 * Checks if string starts with prefix
 */
function startsWith(s, prefix) {
  return String(s).startsWith(String(prefix));
}

/**
 * endsWith(s: string, suffix: string): bool
 * Checks if string ends with suffix
 */
function endsWith(s, suffix) {
  return String(s).endsWith(String(suffix));
}

/**
 * trim(s: string): string
 * Removes whitespace from both ends
 */
function trim(s) {
  return String(s).trim();
}

/**
 * split(s: string, sep: string): [string]
 * Splits string by separator
 */
function split(s, sep) {
  const str = String(s);
  const sep_str = String(sep);
  if (sep_str.length === 0) {
    return str.split('');
  }
  return str.split(sep_str);
}

/**
 * join(arr: [string], sep: string): string
 * Joins array elements with separator
 */
function join(arr, sep) {
  if (!Array.isArray(arr)) arr = [arr];
  return arr.map(String).join(String(sep));
}

/**
 * replace(s: string, search: string, replacement: string): string
 * Replaces first occurrence
 */
function replace(s, search, replacement) {
  const str = String(s);
  const search_str = String(search);
  const repl_str = String(replacement);
  const idx = str.indexOf(search_str);
  if (idx === -1) return str;
  return str.slice(0, idx) + repl_str + str.slice(idx + search_str.length);
}

/**
 * replaceAll(s: string, search: string, replacement: string): string
 * Replaces all occurrences
 */
function replaceAll(s, search, replacement) {
  const str = String(s);
  const search_str = String(search);
  const repl_str = String(replacement);
  return str.split(search_str).join(repl_str);
}

// ============================================================================
// Math Functions (Additional)
// ============================================================================

/**
 * floor(x: f64): i32
 * Rounds down to nearest integer
 */
function floor(x) {
  return Math.floor(Number(x));
}

/**
 * ceil(x: f64): i32
 * Rounds up to nearest integer
 */
function ceil(x) {
  return Math.ceil(Number(x));
}

/**
 * round(x: f64): i32
 * Rounds to nearest integer
 */
function round(x) {
  return Math.round(Number(x));
}

/**
 * sqrt(x: f64): f64
 * Square root
 */
function sqrt(x) {
  return Math.sqrt(Number(x));
}

/**
 * pow(x: f64, y: f64): f64
 * Power function
 */
function pow(x, y) {
  return Math.pow(Number(x), Number(y));
}

/**
 * abs(x: f64): f64
 * Absolute value
 */
function abs(x) {
  return Math.abs(Number(x));
}

/**
 * min(a: f64, b: f64): f64
 * Minimum of two numbers
 */
function min(a, b) {
  return Math.min(Number(a), Number(b));
}

/**
 * max(a: f64, b: f64): f64
 * Maximum of two numbers
 */
function max(a, b) {
  return Math.max(Number(a), Number(b));
}

/**
 * sin(x: f64): f64
 * Sine function (radians)
 */
function sin(x) {
  return Math.sin(Number(x));
}

/**
 * cos(x: f64): f64
 * Cosine function (radians)
 */
function cos(x) {
  return Math.cos(Number(x));
}

/**
 * tan(x: f64): f64
 * Tangent function (radians)
 */
function tan(x) {
  return Math.tan(Number(x));
}

/**
 * exp(x: f64): f64
 * Exponential function (e^x)
 */
function exp(x) {
  return Math.exp(Number(x));
}

/**
 * log(x: f64): f64
 * Natural logarithm
 */
function log(x) {
  return Math.log(Number(x));
}

/**
 * log10(x: f64): f64
 * Base-10 logarithm
 */
function log10(x) {
  return Math.log10(Number(x));
}

/**
 * random(): f64
 * Random number between 0 and 1
 */
function random() {
  return Math.random();
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * typeof(value: any): string
 * Returns the type of a value
 */
function typeof_(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object' && value.ok !== undefined && value.error !== undefined)
    return 'result';
  return typeof value;
}

/**
 * len(value: any): i32
 * Returns length of value (string, array, or object)
 */
function len(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'string') return value.length;
  if (Array.isArray(value)) return value.length;
  if (typeof value === 'object') return Object.keys(value).length;
  return 0;
}

/**
 * to_string(value: any): string
 * Converts value to string
 */
function to_string(value) {
  return String(value);
}

// ============================================================================
// Module Exports
// ============================================================================

module.exports = {
  // I/O
  print,
  println,
  read_file,
  write_file,
  append_file,
  getline,

  // Network
  fetch,

  // JSON
  json_parse,
  json_stringify,

  // System
  get_env,
  set_env,
  get_argv,
  now,
  sleep,
  exit,

  // Process
  exec,

  // File System
  file_exists,
  is_file,
  is_dir,
  mkdir,
  remove_file,
  list_dir,

  // Path
  path_join,
  path_basename,
  path_dirname,
  path_extname,
  path_resolve,
  cwd,
  chdir,

  // String Functions
  upper,
  lower,
  capitalize,
  reverse,
  charAt,
  indexOf,
  lastIndexOf,
  includes,
  startsWith,
  endsWith,
  trim,
  split,
  join,
  replace,
  replaceAll,

  // Math Functions
  floor,
  ceil,
  round,
  sqrt,
  pow,
  abs,
  min,
  max,
  sin,
  cos,
  tan,
  exp,
  log,
  log10,
  random,

  // Utilities
  typeof: typeof_,
  len,
  to_string,
};
