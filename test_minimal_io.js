/**
 * FreeLang stdlib_io functions - Minimal test
 * Using minimal_stdlib_io.fl (no type hints)
 */

const FreeLangInterpreter = require('./src/interpreter');
const fs = require('fs');

let passed = 0;
let failed = 0;

function test(name, code, expectedCheck) {
  try {
    const interp = new FreeLangInterpreter();
    const result = interp.execute(code);

    if (result.success && expectedCheck(result.result, result)) {
      console.log(`✓ ${name}`);
      passed++;
    } else {
      console.log(`✗ ${name}`);
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      } else {
        console.log(`  Result: ${JSON.stringify(result.result)}`);
      }
      failed++;
    }
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Exception: ${error.message}`);
    failed++;
  }
}

const stdlibCode = fs.readFileSync('./minimal_stdlib_io.fl', 'utf8');

console.log('================================================');
console.log('📦 MINIMAL I/O TEST (minimal_stdlib_io.fl)');
console.log('================================================\n');

// ============================================================================
// FILE I/O
// ============================================================================

console.log('--- FILE I/O ---');

test('writeFile', stdlibCode + `
let result = writeFile("test.txt", "Hello");
result == true;
`, result => result === true);

test('readFile', stdlibCode + `
writeFile("test.txt", "Hello");
let content = readFile("test.txt");
content == "Hello";
`, result => result === true);

test('readFile (nonexistent)', stdlibCode + `
let content = readFile("nonexistent_xyz.txt");
content == "";
`, result => result === true);

test('appendFile', stdlibCode + `
writeFile("test_append.txt", "Line1");
appendFile("test_append.txt", "Line2");
let content = readFile("test_append.txt");
content == "Line1Line2";
`, result => result === true);

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

console.log('\n--- ENVIRONMENT VARIABLES ---');

test('getEnv - PATH', stdlibCode + `
let path = getEnv("PATH");
len(path) > 0;
`, result => result === true);

test('getEnv - nonexistent', stdlibCode + `
let val = getEnv("NONEXISTENT_VAR_XYZ");
val == "";
`, result => result === true);

// ============================================================================
// PATH MANIPULATION
// ============================================================================

console.log('\n--- PATH MANIPULATION ---');

test('basename - full path', stdlibCode + `
let b = basename("/home/user/file.txt");
b == "file.txt";
`, result => result === true);

test('basename - no path', stdlibCode + `
let b = basename("simple.txt");
b == "simple.txt";
`, result => result === true);

test('dirname - full path', stdlibCode + `
let d = dirname("/home/user/file.txt");
d == "/home/user";
`, result => result === true);

test('dirname - no path', stdlibCode + `
let d = dirname("simple.txt");
d == ".";
`, result => result === true);

test('extension - with ext', stdlibCode + `
let e = extension("file.txt");
e == "txt";
`, result => result === true);

test('extension - no ext', stdlibCode + `
let e = extension("README");
e == "";
`, result => result === true);

test('extension - multiple dots', stdlibCode + `
let e = extension("archive.tar.gz");
e == "gz";
`, result => result === true);

// ============================================================================
// INTEGRATION
// ============================================================================

console.log('\n--- INTEGRATION ---');

test('path analysis', stdlibCode + `
let path = "/home/user/doc.pdf";
let dir = dirname(path);
let file = basename(path);
let ext = extension(path);
dir == "/home/user" and file == "doc.pdf" and ext == "pdf";
`, result => result === true);

// ============================================================================
// CLEANUP
// ============================================================================

try {
  if (fs.existsSync('test.txt')) fs.unlinkSync('test.txt');
  if (fs.existsSync('test_append.txt')) fs.unlinkSync('test_append.txt');
} catch (e) {
  // ignore
}

// ============================================================================
// RESULTS
// ============================================================================

console.log('\n================================================');
console.log(`✓ Passed: ${passed} tests`);
console.log(`✗ Failed: ${failed} tests`);
console.log(`Total: ${passed + failed} tests`);
console.log('================================================\n');

process.exit(failed > 0 ? 1 : 0);
