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
// String Functions - Advanced (25개)
// ============================================================================

/**
 * substring(s: string, start: i32, end?: i32): string
 * Extracts substring between indices
 */
function substring(s, start, end) {
  const str = String(s);
  const startIdx = Number(start);
  if (end === undefined) return str.substring(startIdx);
  return str.substring(startIdx, Number(end));
}

/**
 * substr(s: string, start: i32, length?: i32): string
 * Extracts substring from start with optional length
 */
function substr(s, start, length) {
  const str = String(s);
  const startIdx = Number(start);
  if (length === undefined) return str.substr(startIdx);
  return str.substr(startIdx, Number(length));
}

/**
 * string_slice(s: string, start: i32, end?: i32): string
 * Extracts substring slice
 */
function string_slice(s, start, end) {
  const str = String(s);
  const startIdx = Number(start);
  if (end === undefined) return str.slice(startIdx);
  return str.slice(startIdx, Number(end));
}

/**
 * charCodeAt(s: string, idx: i32): i32
 * Returns Unicode code point at index
 */
function charCodeAt(s, idx) {
  const str = String(s);
  const i = Number(idx);
  return str.charCodeAt(i) || -1;
}

/**
 * fromCharCode(...codes: i32): string
 * Creates string from Unicode code points
 */
function fromCharCode(...codes) {
  return String.fromCharCode(...codes.map(c => Number(c)));
}

/**
 * padStart(s: string, length: i32, fill?: string): string
 * Pads string to length from start
 */
function padStart(s, length, fill) {
  const str = String(s);
  const len = Number(length);
  const fillStr = fill === undefined ? ' ' : String(fill);
  return str.padStart(len, fillStr);
}

/**
 * padEnd(s: string, length: i32, fill?: string): string
 * Pads string to length from end
 */
function padEnd(s, length, fill) {
  const str = String(s);
  const len = Number(length);
  const fillStr = fill === undefined ? ' ' : String(fill);
  return str.padEnd(len, fillStr);
}

/**
 * repeat(s: string, count: i32): string
 * Repeats string count times
 */
function repeat(s, count) {
  const str = String(s);
  const c = Math.max(0, Number(count));
  return str.repeat(c);
}

/**
 * toLocaleLowerCase(s: string): string
 * Converts to lowercase (locale-aware)
 */
function toLocaleLowerCase(s) {
  return String(s).toLocaleLowerCase();
}

/**
 * toLocaleUpperCase(s: string): string
 * Converts to uppercase (locale-aware)
 */
function toLocaleUpperCase(s) {
  return String(s).toLocaleUpperCase();
}

/**
 * match(s: string, pattern: string): [string] | null
 * Matches string against regex pattern
 */
function match(s, pattern) {
  const str = String(s);
  const patStr = String(pattern);
  try {
    const regex = new RegExp(patStr, 'g');
    const result = str.match(regex);
    return result || null;
  } catch (e) {
    return null;
  }
}

/**
 * search(s: string, pattern: string): i32
 * Returns index of first regex match
 */
function search(s, pattern) {
  const str = String(s);
  const patStr = String(pattern);
  try {
    const regex = new RegExp(patStr);
    return str.search(regex);
  } catch (e) {
    return -1;
  }
}

/**
 * localeCompare(s1: string, s2: string): i32
 * Compares strings with locale awareness
 */
function localeCompare(s1, s2) {
  const str1 = String(s1);
  const str2 = String(s2);
  return str1.localeCompare(str2);
}

/**
 * codePointAt(s: string, idx: i32): i32
 * Returns Unicode code point at index
 */
function codePointAt(s, idx) {
  const str = String(s);
  const i = Number(idx);
  return str.codePointAt(i) || -1;
}

/**
 * fromCodePoint(...points: i32): string
 * Creates string from Unicode code points
 */
function fromCodePoint(...points) {
  return String.fromCodePoint(...points.map(p => Number(p)));
}

/**
 * string_concat(s1: string, s2: string): string
 * Concatenates strings
 */
function string_concat(s1, s2) {
  return String(s1).concat(String(s2));
}

/**
 * normalize(s: string, form?: string): string
 * Normalizes Unicode string
 */
function normalize(s, form) {
  const str = String(s);
  const f = form === undefined ? 'NFC' : String(form);
  return str.normalize(f);
}

/**
 * toString(s: string): string
 * Converts to string (identity)
 */
function toString(s) {
  return String(s);
}

/**
 * valueOf(s: string): string
 * Returns primitive value
 */
function valueOf(s) {
  return String(s);
}

/**
 * at(s: string, idx: i32): string | null
 * Returns character at index (negative ok)
 */
function at(s, idx) {
  const str = String(s);
  const i = Number(idx);
  const result = str.at(i);
  return result === undefined ? null : result;
}

/**
 * trimLeft(s: string): string
 * Removes whitespace from start
 */
function trimLeft(s) {
  return String(s).trimStart();
}

/**
 * trimRight(s: string): string
 * Removes whitespace from end
 */
function trimRight(s) {
  return String(s).trimEnd();
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
// Math Functions - Advanced (20개)
// ============================================================================

/**
 * asin(x: f64): f64
 * Inverse sine (radians)
 */
function asin(x) {
  return Math.asin(Number(x));
}

/**
 * acos(x: f64): f64
 * Inverse cosine (radians)
 */
function acos(x) {
  return Math.acos(Number(x));
}

/**
 * atan(x: f64): f64
 * Inverse tangent (radians)
 */
function atan(x) {
  return Math.atan(Number(x));
}

/**
 * atan2(y: f64, x: f64): f64
 * Two-argument inverse tangent
 */
function atan2(y, x) {
  return Math.atan2(Number(y), Number(x));
}

/**
 * sinh(x: f64): f64
 * Hyperbolic sine
 */
function sinh(x) {
  return Math.sinh(Number(x));
}

/**
 * cosh(x: f64): f64
 * Hyperbolic cosine
 */
function cosh(x) {
  return Math.cosh(Number(x));
}

/**
 * tanh(x: f64): f64
 * Hyperbolic tangent
 */
function tanh(x) {
  return Math.tanh(Number(x));
}

/**
 * isFinite(x: f64): bool
 * Check if number is finite
 */
function isFinite(x) {
  return Number.isFinite(Number(x));
}

/**
 * isNaN(x: f64): bool
 * Check if value is NaN
 */
function isNaN(x) {
  return Number.isNaN(Number(x));
}

/**
 * isInfinity(x: f64): bool
 * Check if value is Infinity or -Infinity
 */
function isInfinity(x) {
  const n = Number(x);
  return n === Infinity || n === -Infinity;
}

/**
 * trunc(x: f64): i32
 * Truncate to integer (towards zero)
 */
function trunc(x) {
  return Math.trunc(Number(x));
}

/**
 * sign(x: f64): i32
 * Return sign: -1, 0, or 1
 */
function sign(x) {
  return Math.sign(Number(x));
}

/**
 * cbrt(x: f64): f64
 * Cube root
 */
function cbrt(x) {
  return Math.cbrt(Number(x));
}

/**
 * hypot(a: f64, b: f64): f64
 * Euclidean distance: sqrt(a^2 + b^2)
 */
function hypot(a, b) {
  return Math.hypot(Number(a), Number(b));
}

/**
 * deg2rad(deg: f64): f64
 * Convert degrees to radians
 */
function deg2rad(deg) {
  return (Number(deg) * Math.PI) / 180;
}

/**
 * rad2deg(rad: f64): f64
 * Convert radians to degrees
 */
function rad2deg(rad) {
  return (Number(rad) * 180) / Math.PI;
}

/**
 * clamp(x: f64, min: f64, max: f64): f64
 * Clamp value between min and max
 */
function clamp(x, min, max) {
  const n = Number(x);
  const minN = Number(min);
  const maxN = Number(max);
  return Math.max(minN, Math.min(maxN, n));
}

/**
 * lerp(a: f64, b: f64, t: f64): f64
 * Linear interpolation between a and b
 */
function lerp(a, b, t) {
  return Number(a) + (Number(b) - Number(a)) * Number(t);
}

/**
 * fract(x: f64): f64
 * Fractional part (x - floor(x))
 */
function fract(x) {
  const n = Number(x);
  return n - Math.floor(n);
}

/**
 * modf(x: f64): {integer: f64, fractional: f64}
 * Split into integer and fractional parts
 */
function modf(x) {
  const n = Number(x);
  const integer = Math.floor(n);
  const fractional = n - integer;
  return {
    integer: integer,
    fractional: fractional
  };
}

// ============================================================================
// Array Functions
// ============================================================================

/**
 * push(arr: [any], item: any): [any]
 * Adds item to end of array and returns array
 */
function push(arr, item) {
  if (!Array.isArray(arr)) arr = [];
  arr.push(item);
  return arr;
}

/**
 * pop(arr: [any]): any
 * Removes and returns last element
 */
function pop(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr.pop();
}

/**
 * shift(arr: [any]): any
 * Removes and returns first element
 */
function shift(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr.shift();
}

/**
 * unshift(arr: [any], item: any): [any]
 * Adds item to beginning and returns array
 */
function unshift(arr, item) {
  if (!Array.isArray(arr)) arr = [];
  arr.unshift(item);
  return arr;
}

/**
 * slice(arr: [any], start: i32, end?: i32): [any]
 * Returns a shallow copy of a portion of array
 */
function slice(arr, start, end) {
  if (!Array.isArray(arr)) return [];
  if (end === undefined) {
    return arr.slice(start);
  }
  return arr.slice(start, end);
}

/**
 * reverse(arr: [any]): [any]
 * Reverses array in place and returns it
 */
function reverse_array(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.reverse();
}

/**
 * indexOf(arr: [any], item: any): i32
 * Returns index of item or -1 if not found
 */
function indexOf_array(arr, item) {
  if (!Array.isArray(arr)) return -1;
  return arr.indexOf(item);
}

/**
 * lastIndexOf(arr: [any], item: any): i32
 * Returns last index of item or -1
 */
function lastIndexOf_array(arr, item) {
  if (!Array.isArray(arr)) return -1;
  return arr.lastIndexOf(item);
}

/**
 * includes(arr: [any], item: any): bool
 * Checks if array contains item
 */
function includes_array(arr, item) {
  if (!Array.isArray(arr)) return false;
  return arr.includes(item);
}

/**
 * sort(arr: [any], compareFn?: fn): [any]
 * Sorts array in place. If no function, sorts numerically
 */
function sort(arr, compareFn) {
  if (!Array.isArray(arr)) return [];

  if (compareFn && typeof compareFn === 'function') {
    return arr.sort((a, b) => {
      const result = compareFn(a, b);
      return result === true ? 1 : (result === false ? -1 : 0);
    });
  } else {
    return arr.sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
      }
      return String(a).localeCompare(String(b));
    });
  }
}

/**
 * map(arr: [any], fn: function): [any]
 * Returns new array with results of calling fn on each element
 */
function map(arr, fn) {
  if (!Array.isArray(arr)) return [];
  if (typeof fn !== 'function') return arr;
  return arr.map(fn);
}

/**
 * filter(arr: [any], fn: function): [any]
 * Returns new array with elements for which fn returns true
 */
function filter(arr, fn) {
  if (!Array.isArray(arr)) return [];
  if (typeof fn !== 'function') return arr;
  return arr.filter(fn);
}

/**
 * reduce(arr: [any], fn: function, init: any): any
 * Reduces array to single value by applying fn
 */
function reduce(arr, fn, init) {
  if (!Array.isArray(arr)) return init;
  if (typeof fn !== 'function') return init;
  return arr.reduce(fn, init);
}

/**
 * forEach(arr: [any], fn: function): null
 * Executes fn for each element
 */
function forEach(arr, fn) {
  if (!Array.isArray(arr)) return null;
  if (typeof fn !== 'function') return null;
  arr.forEach(fn);
  return null;
}

/**
 * find(arr: [any], fn: function): any
 * Returns first element for which fn returns true
 */
function find(arr, fn) {
  if (!Array.isArray(arr)) return null;
  if (typeof fn !== 'function') return null;
  return arr.find(fn) || null;
}

/**
 * findIndex(arr: [any], fn: function): i32
 * Returns index of first element for which fn returns true
 */
function findIndex(arr, fn) {
  if (!Array.isArray(arr)) return -1;
  if (typeof fn !== 'function') return -1;
  return arr.findIndex(fn);
}

/**
 * some(arr: [any], fn: function): bool
 * Returns true if any element satisfies fn
 */
function some(arr, fn) {
  if (!Array.isArray(arr)) return false;
  if (typeof fn !== 'function') return false;
  return arr.some(fn);
}

/**
 * every(arr: [any], fn: function): bool
 * Returns true if all elements satisfy fn
 */
function every(arr, fn) {
  if (!Array.isArray(arr)) return true;
  if (typeof fn !== 'function') return false;
  return arr.every(fn);
}

/**
 * concat(arr1: [any], arr2: [any]): [any]
 * Concatenates two arrays
 */
function concat(arr1, arr2) {
  if (!Array.isArray(arr1)) arr1 = [];
  if (!Array.isArray(arr2)) arr2 = [];
  return arr1.concat(arr2);
}

/**
 * flatten(arr: [[any]]): [any]
 * Flattens one level of nested arrays
 */
function flatten(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.flat();
}

/**
 * unique(arr: [any]): [any]
 * Returns array with duplicate values removed
 */
function unique(arr) {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr)];
}

/**
 * compact(arr: [any]): [any]
 * Returns array with null/undefined values removed
 */
function compact(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.filter(item => item !== null && item !== undefined);
}

/**
 * chunk(arr: [any], size: i32): [[any]]
 * Breaks array into chunks of given size
 */
function chunk(arr, size) {
  if (!Array.isArray(arr) || size <= 0) return [];
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * zip(arr1: [any], arr2: [any]): [[any]]
 * Combines two arrays element-wise
 */
function zip(arr1, arr2) {
  if (!Array.isArray(arr1)) arr1 = [];
  if (!Array.isArray(arr2)) arr2 = [];
  const result = [];
  const len = Math.min(arr1.length, arr2.length);
  for (let i = 0; i < len; i++) {
    result.push([arr1[i], arr2[i]]);
  }
  return result;
}

/**
 * sum(arr: [number]): number
 * Returns sum of array elements
 */
function sum(arr) {
  if (!Array.isArray(arr)) return 0;
  return arr.reduce((acc, val) => acc + Number(val), 0);
}

/**
 * avg(arr: [number]): f64
 * Returns average of array elements
 */
function avg(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  return sum(arr) / arr.length;
}

/**
 * min_array(arr: [number]): number
 * Returns minimum value in array
 */
function min_array(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return Math.min(...arr.map(Number));
}

/**
 * max_array(arr: [number]): number
 * Returns maximum value in array
 */
function max_array(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return Math.max(...arr.map(Number));
}

// ============================================================================
// Array Functions - Advanced (30개)
// ============================================================================

/**
 * flat(arr: [any], depth?: i32): [any]
 * Flattens array to specified depth
 */
function flat(arr, depth) {
  if (!Array.isArray(arr)) return [];
  const d = depth === undefined ? 1 : Math.max(0, Number(depth));
  return arr.flat(d);
}

/**
 * flatMap(arr: [any], fn: function): [any]
 * Maps then flattens result
 */
function flatMap(arr, fn) {
  if (!Array.isArray(arr)) return [];
  if (typeof fn !== 'function') return arr;
  return arr.flatMap(fn);
}

/**
 * splice(arr: [any], start: i32, deleteCount?: i32, ...items): [any]
 * Removes/inserts elements, returns array
 */
function splice(arr, start, deleteCount, ...items) {
  if (!Array.isArray(arr)) arr = [];
  const idx = Number(start);
  const count = deleteCount === undefined ? arr.length - idx : Number(deleteCount);
  arr.splice(idx, count, ...items);
  return arr;
}

/**
 * copyWithin(arr: [any], target: i32, start?: i32, end?: i32): [any]
 * Copies array elements within array
 */
function copyWithin(arr, target, start, end) {
  if (!Array.isArray(arr)) arr = [];
  const t = Number(target);
  const s = start === undefined ? 0 : Number(start);
  arr.copyWithin(t, s, end === undefined ? undefined : Number(end));
  return arr;
}

/**
 * fill(arr: [any], value: any, start?: i32, end?: i32): [any]
 * Fills array with value
 */
function fill(arr, value, start, end) {
  if (!Array.isArray(arr)) arr = [];
  const s = start === undefined ? 0 : Number(start);
  arr.fill(value, s, end === undefined ? undefined : Number(end));
  return arr;
}

/**
 * entries_array(arr: [any]): iterator
 * Returns iterator of [index, element] pairs
 */
function entries_array(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.entries();
}

/**
 * keys_array(arr: [any]): iterator
 * Returns iterator of indices
 */
function keys_array(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.keys();
}

/**
 * values_array(arr: [any]): iterator
 * Returns iterator of values
 */
function values_array(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.values();
}

/**
 * findLast(arr: [any], fn: function): any
 * Returns last element matching predicate
 */
function findLast(arr, fn) {
  if (!Array.isArray(arr)) return null;
  if (typeof fn !== 'function') return null;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (fn(arr[i], i, arr)) return arr[i];
  }
  return null;
}

/**
 * findLastIndex(arr: [any], fn: function): i32
 * Returns index of last element matching predicate
 */
function findLastIndex(arr, fn) {
  if (!Array.isArray(arr)) return -1;
  if (typeof fn !== 'function') return -1;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (fn(arr[i], i, arr)) return i;
  }
  return -1;
}

/**
 * at_array(arr: [any], idx: i32): any
 * Returns element at index (negative ok)
 */
function at_array(arr, idx) {
  if (!Array.isArray(arr)) return null;
  const i = Number(idx);
  const result = arr.at(i);
  return result === undefined ? null : result;
}

/**
 * with_array(arr: [any], idx: i32, value: any): [any]
 * Returns new array with element replaced
 */
function with_array(arr, idx, value) {
  if (!Array.isArray(arr)) return [];
  const result = [...arr];
  const i = Number(idx);
  if (i >= -result.length && i < result.length) {
    result[i < 0 ? result.length + i : i] = value;
  }
  return result;
}

/**
 * groupBy(arr: [any], fn: function): map
 * Groups array elements by key function
 */
function groupBy(arr, fn) {
  if (!Array.isArray(arr)) return {};
  if (typeof fn !== 'function') return {};
  const result = {};
  arr.forEach((item, idx) => {
    const key = String(fn(item, idx, arr));
    if (!result[key]) result[key] = [];
    result[key].push(item);
  });
  return result;
}

/**
 * partition(arr: [any], fn: function): [[any], [any]]
 * Splits array into two by predicate
 */
function partition(arr, fn) {
  if (!Array.isArray(arr)) return [[], []];
  if (typeof fn !== 'function') return [arr, []];
  const pass = [];
  const fail = [];
  arr.forEach((item, idx) => {
    if (fn(item, idx, arr)) pass.push(item);
    else fail.push(item);
  });
  return [pass, fail];
}

/**
 * intersperse(arr: [any], sep: any): [any]
 * Adds separator between elements
 */
function intersperse(arr, sep) {
  if (!Array.isArray(arr) || arr.length === 0) return arr;
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (i > 0) result.push(sep);
    result.push(arr[i]);
  }
  return result;
}

/**
 * transpose(arr: [[any]]): [[any]]
 * Transposes 2D array
 */
function transpose(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  if (!Array.isArray(arr[0])) return arr;
  const maxLen = Math.max(...arr.map(r => Array.isArray(r) ? r.length : 0));
  const result = [];
  for (let i = 0; i < maxLen; i++) {
    const row = [];
    for (let j = 0; j < arr.length; j++) {
      if (Array.isArray(arr[j])) row.push(arr[j][i] || null);
    }
    result.push(row);
  }
  return result;
}

/**
 * combinations(arr: [any], r: i32): [[any]]
 * Returns all combinations of length r
 */
function combinations(arr, r) {
  if (!Array.isArray(arr)) return [];
  const n = arr.length;
  const k = Math.max(0, Number(r));
  if (k === 0) return [[]];
  if (k > n) return [];
  const result = [];
  const helper = (start, combo) => {
    if (combo.length === k) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < n; i++) {
      combo.push(arr[i]);
      helper(i + 1, combo);
      combo.pop();
    }
  };
  helper(0, []);
  return result;
}

/**
 * permutations(arr: [any]): [[any]]
 * Returns all permutations
 */
function permutations(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return [[]];
  const result = [];
  const helper = (remaining) => {
    if (remaining.length === 0) {
      result.push([]);
    } else {
      for (let i = 0; i < remaining.length; i++) {
        const rest = [...remaining.slice(0, i), ...remaining.slice(i + 1)];
        helper(rest);
        result[result.length - 1].unshift(remaining[i]);
      }
    }
  };
  helper(arr);
  return result;
}

/**
 * sample(arr: [any]): any
 * Returns random element
 */
function sample(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * shuffle(arr: [any]): [any]
 * Returns shuffled copy of array
 */
function shuffle(arr) {
  if (!Array.isArray(arr)) return [];
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * range(start: i32, end: i32, step?: i32): [i32]
 * Generates array of integers from start to end
 */
function range(start, end, step) {
  const s = Number(start);
  const e = Number(end);
  const st = step === undefined ? 1 : Number(step);
  if (st === 0) return [];
  const result = [];
  if (st > 0) {
    for (let i = s; i < e; i += st) result.push(i);
  } else {
    for (let i = s; i > e; i += st) result.push(i);
  }
  return result;
}

/**
 * repeat_array(value: any, count: i32): [any]
 * Returns array with value repeated
 */
function repeat_array(value, count) {
  const c = Math.max(0, Number(count));
  return Array(c).fill(value);
}

/**
 * take(arr: [any], n: i32): [any]
 * Returns first n elements
 */
function take(arr, n) {
  if (!Array.isArray(arr)) return [];
  const count = Math.max(0, Number(n));
  return arr.slice(0, count);
}

/**
 * drop(arr: [any], n: i32): [any]
 * Returns array without first n elements
 */
function drop(arr, n) {
  if (!Array.isArray(arr)) return [];
  const count = Math.max(0, Number(n));
  return arr.slice(count);
}

/**
 * takeRight(arr: [any], n: i32): [any]
 * Returns last n elements
 */
function takeRight(arr, n) {
  if (!Array.isArray(arr)) return [];
  const count = Math.max(0, Number(n));
  return arr.slice(-count || undefined);
}

/**
 * dropRight(arr: [any], n: i32): [any]
 * Returns array without last n elements
 */
function dropRight(arr, n) {
  if (!Array.isArray(arr)) return [];
  const count = Math.max(0, Number(n));
  return count === 0 ? arr : arr.slice(0, -count);
}

/**
 * initial(arr: [any]): [any]
 * Returns all but last element
 */
function initial(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  return arr.slice(0, -1);
}

/**
 * tail(arr: [any]): [any]
 * Returns all but first element
 */
function tail(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  return arr.slice(1);
}

// ============================================================================
// Object/Map Functions
// ============================================================================

/**
 * keys(obj: map): [string]
 * Returns array of object keys
 */
function keys(obj) {
  if (obj === null || obj === undefined) return [];
  if (Array.isArray(obj)) return obj.map((_, i) => String(i));
  return Object.keys(obj);
}

/**
 * values(obj: map): [any]
 * Returns array of object values
 */
function values(obj) {
  if (obj === null || obj === undefined) return [];
  if (Array.isArray(obj)) return obj;
  return Object.values(obj);
}

/**
 * entries(obj: map): [[string, any]]
 * Returns array of [key, value] pairs
 */
function entries(obj) {
  if (obj === null || obj === undefined) return [];
  if (Array.isArray(obj)) {
    return obj.map((val, idx) => [String(idx), val]);
  }
  return Object.entries(obj);
}

/**
 * has(obj: map, key: string): bool
 * Checks if object has key
 */
function has(obj, key) {
  if (obj === null || obj === undefined) return false;
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * get(obj: map, key: string): any
 * Gets value for key, returns null if not found
 */
function get(obj, key) {
  if (obj === null || obj === undefined) return null;
  return obj[key] || null;
}

/**
 * set(obj: map, key: string, value: any): map
 * Sets value for key and returns modified object
 */
function set(obj, key, value) {
  if (obj === null || obj === undefined) obj = {};
  obj[key] = value;
  return obj;
}

/**
 * delete(obj: map, key: string): map
 * Deletes key from object and returns modified object
 */
function delete_key(obj, key) {
  if (obj !== null && obj !== undefined) {
    delete obj[key];
  }
  return obj;
}

/**
 * merge(obj1: map, obj2: map): map
 * Merges two objects (obj2 values override obj1)
 */
function merge(obj1, obj2) {
  const result = obj1 && typeof obj1 === 'object' ? { ...obj1 } : {};
  if (obj2 && typeof obj2 === 'object') {
    Object.assign(result, obj2);
  }
  return result;
}

/**
 * pick(obj: map, keys: [string]): map
 * Returns new object with only specified keys
 */
function pick(obj, keys_list) {
  if (obj === null || obj === undefined) return {};
  if (!Array.isArray(keys_list)) return {};
  const result = {};
  for (const key of keys_list) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * omit(obj: map, keys: [string]): map
 * Returns new object without specified keys
 */
function omit(obj, keys_list) {
  if (obj === null || obj === undefined) return {};
  if (!Array.isArray(keys_list)) return obj;
  const result = { ...obj };
  for (const key of keys_list) {
    delete result[key];
  }
  return result;
}

/**
 * fromEntries(entries: [[string, any]]): map
 * Creates object from array of [key, value] pairs
 */
function fromEntries(entries_arr) {
  if (!Array.isArray(entries_arr)) return {};
  const result = {};
  for (const entry of entries_arr) {
    if (Array.isArray(entry) && entry.length >= 2) {
      result[entry[0]] = entry[1];
    }
  }
  return result;
}

// ============================================================================
// Object/Map Functions - Advanced (15개)
// ============================================================================

/**
 * assign(target: map, source: map): map
 * Assigns properties from source to target
 */
function assign(target, source) {
  const t = (target && typeof target === 'object') ? target : {};
  if (source && typeof source === 'object') {
    Object.assign(t, source);
  }
  return t;
}

/**
 * freeze(obj: map): map
 * Freezes object to prevent modifications
 */
function freeze(obj) {
  if (obj !== null && typeof obj === 'object') {
    Object.freeze(obj);
  }
  return obj;
}

/**
 * seal(obj: map): map
 * Seals object to prevent property additions
 */
function seal(obj) {
  if (obj !== null && typeof obj === 'object') {
    Object.seal(obj);
  }
  return obj;
}

/**
 * preventExtensions(obj: map): map
 * Prevents new properties from being added
 */
function preventExtensions(obj) {
  if (obj !== null && typeof obj === 'object') {
    Object.preventExtensions(obj);
  }
  return obj;
}

/**
 * isFrozen(obj: map): bool
 * Checks if object is frozen
 */
function isFrozen(obj) {
  if (obj === null || typeof obj !== 'object') return true;
  return Object.isFrozen(obj);
}

/**
 * isSealed(obj: map): bool
 * Checks if object is sealed
 */
function isSealed(obj) {
  if (obj === null || typeof obj !== 'object') return true;
  return Object.isSealed(obj);
}

/**
 * isExtensible(obj: map): bool
 * Checks if object is extensible
 */
function isExtensible(obj) {
  if (obj === null || typeof obj !== 'object') return false;
  return Object.isExtensible(obj);
}

/**
 * getOwnPropertyNames(obj: map): [string]
 * Gets all property names (enumerable and non-enumerable)
 */
function getOwnPropertyNames(obj) {
  if (obj === null || obj === undefined) return [];
  return Object.getOwnPropertyNames(obj);
}

/**
 * getOwnPropertyDescriptor(obj: map, key: string): map | null
 * Gets property descriptor
 */
function getOwnPropertyDescriptor(obj, key) {
  if (obj === null || obj === undefined) return null;
  const desc = Object.getOwnPropertyDescriptor(obj, key);
  return desc || null;
}

/**
 * defineProperty(obj: map, key: string, descriptor: map): map
 * Defines property with descriptor
 */
function defineProperty(obj, key, descriptor) {
  if (obj === null || typeof obj !== 'object') return obj;
  try {
    Object.defineProperty(obj, key, descriptor || {});
  } catch (e) {
    // Silently fail
  }
  return obj;
}

/**
 * defineProperties(obj: map, descriptors: map): map
 * Defines multiple properties
 */
function defineProperties(obj, descriptors) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (descriptors === null || typeof descriptors !== 'object') return obj;
  try {
    Object.defineProperties(obj, descriptors);
  } catch (e) {
    // Silently fail
  }
  return obj;
}

/**
 * getPrototypeOf(obj: any): map | null
 * Gets prototype of object
 */
function getPrototypeOf(obj) {
  if (obj === null || obj === undefined) return null;
  return Object.getPrototypeOf(obj);
}

/**
 * setPrototypeOf(obj: map, proto: map): map
 * Sets prototype of object
 */
function setPrototypeOf(obj, proto) {
  if (obj === null || typeof obj !== 'object') return obj;
  try {
    Object.setPrototypeOf(obj, proto);
  } catch (e) {
    // Silently fail
  }
  return obj;
}

/**
 * create(proto: map, properties?: map): map
 * Creates object with specified prototype
 */
function create(proto, properties) {
  const obj = Object.create(proto);
  if (properties && typeof properties === 'object') {
    Object.defineProperties(obj, properties);
  }
  return obj;
}

/**
 * groupBy_object(arr: [any], fn: function): map
 * Groups array by function, returns map
 */
function groupBy_object(arr, fn) {
  if (!Array.isArray(arr)) return {};
  if (typeof fn !== 'function') return {};
  const result = {};
  arr.forEach((item, idx) => {
    const key = String(fn(item, idx, arr));
    if (!result[key]) result[key] = [];
    result[key].push(item);
  });
  return result;
}

// ============================================================================
// Function Composition (15개)
// ============================================================================

/**
 * memoize(fn: function): function
 * Caches function results
 */
function memoize(fn) {
  if (typeof fn !== 'function') return fn;
  const cache = {};
  return function(...args) {
    const key = JSON.stringify(args);
    if (key in cache) return cache[key];
    const result = fn.apply(this, args);
    cache[key] = result;
    return result;
  };
}

/**
 * debounce(fn: function, delay: i32): function
 * Delays function call until after delay ms
 */
function debounce(fn, delay) {
  if (typeof fn !== 'function') return fn;
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), Number(delay));
  };
}

/**
 * throttle(fn: function, limit: i32): function
 * Limits function call frequency
 */
function throttle(fn, limit) {
  if (typeof fn !== 'function') return fn;
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, Number(limit));
    }
  };
}

/**
 * compose(...fns: function): function
 * Composes functions right-to-left
 */
function compose(...fns) {
  return (x) => fns.reverse().reduce((acc, fn) => {
    if (typeof fn !== 'function') return acc;
    return fn(acc);
  }, x);
}

/**
 * pipe_fn(...fns: function): function
 * Pipes functions left-to-right
 */
function pipe_fn(...fns) {
  return (x) => fns.reduce((acc, fn) => {
    if (typeof fn !== 'function') return acc;
    return fn(acc);
  }, x);
}

/**
 * partial(fn: function, ...args: any): function
 * Returns partially applied function
 */
function partial(fn, ...args) {
  if (typeof fn !== 'function') return fn;
  return function(...newArgs) {
    return fn.apply(this, [...args, ...newArgs]);
  };
}

/**
 * curry(fn: function): function
 * Converts multi-arg function to curried form
 */
function curry(fn) {
  if (typeof fn !== 'function') return fn;
  const arity = fn.length;
  return function curried(...args) {
    if (args.length >= arity) return fn.apply(this, args);
    return (...nextArgs) => curried.apply(this, [...args, ...nextArgs]);
  };
}

/**
 * once(fn: function): function
 * Executes function only once
 */
function once(fn) {
  if (typeof fn !== 'function') return fn;
  let called = false;
  let result;
  return function(...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

/**
 * negate(fn: function): function
 * Returns negated boolean result
 */
function negate(fn) {
  if (typeof fn !== 'function') return fn;
  return function(...args) {
    return !fn.apply(this, args);
  };
}

/**
 * complement(fn: function): function
 * Alias for negate
 */
function complement(fn) {
  return negate(fn);
}

/**
 * identity(x: any): any
 * Returns value unchanged
 */
function identity(x) {
  return x;
}

/**
 * constant(value: any): function
 * Returns function that always returns value
 */
function constant(value) {
  return () => value;
}

/**
 * tap(fn: function): function
 * Executes fn for side effects, returns value
 */
function tap(fn) {
  if (typeof fn !== 'function') return identity;
  return (x) => {
    fn(x);
    return x;
  };
}

/**
 * when(predicate: function, fn: function): function
 * Applies fn if predicate is true
 */
function when(predicate, fn) {
  if (typeof predicate !== 'function') return identity;
  if (typeof fn !== 'function') return identity;
  return (x) => predicate(x) ? fn(x) : x;
}

/**
 * unless(predicate: function, fn: function): function
 * Applies fn if predicate is false
 */
function unless(predicate, fn) {
  return when(negate(predicate), fn);
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
// Advanced Utilities (10개)
// ============================================================================

/**
 * deepClone(obj: any): any
 * Creates deep copy of value
 */
function deepClone(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) {
    const arr = [];
    for (const item of obj) {
      arr.push(deepClone(item));
    }
    return arr;
  }
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * deepEqual(a: any, b: any): bool
 * Deeply compares two values
 */
function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return a === b;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

/**
 * shallowClone(obj: any): any
 * Creates shallow copy
 */
function shallowClone(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return [...obj];
  return { ...obj };
}

/**
 * shallowEqual(a: any, b: any): bool
 * Shallowly compares two values
 */
function shallowEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!keysB.includes(key) || a[key] !== b[key]) return false;
  }
  return true;
}

/**
 * isEmpty(value: any): bool
 * Checks if value is empty
 */
function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * isEqual(a: any, b: any): bool
 * Alias for deepEqual
 */
function isEqual(a, b) {
  return deepEqual(a, b);
}

/**
 * isNull(value: any): bool
 * Checks if value is null
 */
function isNull(value) {
  return value === null;
}

/**
 * isUndefined(value: any): bool
 * Checks if value is undefined
 */
function isUndefined(value) {
  return value === undefined;
}

/**
 * isNullish(value: any): bool
 * Checks if value is null or undefined
 */
function isNullish(value) {
  return value === null || value === undefined;
}

/**
 * isDefined(value: any): bool
 * Checks if value is not undefined
 */
function isDefined(value) {
  return value !== undefined;
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

  // String Functions (15 + 25 = 40)
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

  // String - Advanced (25개 추가)
  substring,
  substr,
  string_slice,
  charCodeAt,
  fromCharCode,
  padStart,
  padEnd,
  repeat: repeat, // name conflict with array repeat
  toLocaleLowerCase,
  toLocaleUpperCase,
  match,
  search,
  localeCompare,
  codePointAt,
  fromCodePoint,
  string_concat,
  normalize,
  toString,
  valueOf,
  at: at, // name conflict with array at
  trimLeft,
  trimRight,

  // Math Functions (15 + 20 = 35)
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

  // Math - Advanced (20개 추가)
  asin,
  acos,
  atan,
  atan2,
  sinh,
  cosh,
  tanh,
  isFinite,
  isNaN,
  isInfinity,
  trunc,
  sign,
  cbrt,
  hypot,
  deg2rad,
  rad2deg,
  clamp,
  lerp,
  fract,
  modf,

  // Array Functions (25 + 30 = 55)
  push,
  pop,
  shift,
  unshift,
  slice: slice, // name conflict with string slice
  reverse_array,
  indexOf_array,
  lastIndexOf_array,
  includes_array,
  sort,
  map,
  filter,
  reduce,
  forEach,
  find,
  findIndex,
  some,
  every,
  concat,
  flatten,
  unique,
  compact,
  chunk,
  zip,
  sum,
  avg,
  min_array,
  max_array,

  // Array - Advanced (30개 추가)
  flat,
  flatMap,
  splice,
  copyWithin,
  fill,
  entries_array,
  keys_array,
  values_array,
  findLast,
  findLastIndex,
  at_array,
  with_array,
  groupBy,
  partition,
  intersperse,
  transpose,
  combinations,
  permutations,
  sample,
  shuffle,
  range,
  repeat_array,
  take,
  drop,
  takeRight,
  dropRight,
  initial,
  tail,

  // Object/Map Functions (10 + 15 = 25)
  keys,
  values,
  entries,
  has,
  get,
  set,
  delete: delete_key,
  merge,
  pick,
  omit,
  fromEntries,

  // Object - Advanced (15개 추가)
  assign,
  freeze,
  seal,
  preventExtensions,
  isFrozen,
  isSealed,
  isExtensible,
  getOwnPropertyNames,
  getOwnPropertyDescriptor,
  defineProperty,
  defineProperties,
  getPrototypeOf,
  setPrototypeOf,
  create,
  groupBy_object,

  // Function Composition (15개)
  memoize,
  debounce,
  throttle,
  compose,
  pipe_fn,
  partial,
  curry,
  once,
  negate,
  complement,
  identity,
  constant,
  tap,
  when,
  unless,

  // Advanced Utilities (10개)
  deepClone,
  deepEqual,
  shallowClone,
  shallowEqual,
  isEmpty,
  isEqual,
  isNull,
  isUndefined,
  isNullish,
  isDefined,

  // Utilities
  typeof: typeof_,
  len,
  to_string,
};
