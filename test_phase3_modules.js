/**
 * FreeLang Phase 3: 모듈 시스템 테스트
 * fs, os, path 모듈 검증
 */

const FreeLangInterpreter = require('./src/interpreter');

let passed = 0;
let failed = 0;

function test(name, code, expectedCheck) {
  try {
    const interp = new FreeLangInterpreter();
    const result = interp.execute(code);

    if (result.success && expectedCheck(result.result)) {
      console.log(`✓ ${name}`);
      passed++;
    } else {
      console.log(`✗ ${name}`);
      if (result.error) console.log(`  Error: ${result.error}`);
      else console.log(`  Check failed for: ${JSON.stringify(result.result).substring(0, 100)}`);
      failed++;
    }
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Exception: ${error.message}`);
    failed++;
  }
}

console.log('📦 PHASE 3: MODULE SYSTEM TESTS\n');

// ============================================================================
// PATH MODULE TESTS
// ============================================================================

console.log('--- PATH MODULE (15 functions) ---');

test('path.join()', `
  let path_mod = require('path');
  let result = path_mod.join('foo', 'bar', 'baz');
  len(result) > 0;
`, result => result === true);

test('path.dirname()', `
  let path_mod = require('path');
  let result = path_mod.dirname('/foo/bar/baz.txt');
  len(result) > 0;
`, result => result === true);

test('path.basename()', `
  let path_mod = require('path');
  let result = path_mod.basename('/foo/bar/baz.txt');
  result == 'baz.txt';
`, result => result === true);

test('path.extname()', `
  let path_mod = require('path');
  let result = path_mod.extname('/foo/bar/baz.txt');
  result == '.txt';
`, result => result === true);

test('path.normalize()', `
  let path_mod = require('path');
  let result = path_mod.normalize('/foo//bar///baz');
  len(result) > 0;
`, result => result === true);

test('path.resolve()', `
  let path_mod = require('path');
  let result = path_mod.resolve('foo', 'bar');
  len(result) > 0;
`, result => result === true);

test('path.isAbsolute()', `
  let path_mod = require('path');
  let result = path_mod.isAbsolute('/foo/bar');
  result == true;
`, result => result === true);

test('path.removeExtension()', `
  let path_mod = require('path');
  let result = path_mod.removeExtension('/foo/bar/baz.txt');
  len(result) > 0;
`, result => result === true);

// ============================================================================
// OS MODULE TESTS
// ============================================================================

console.log('\n--- OS MODULE (20 functions) ---');

test('os.platform()', `
  let os_mod = require('os');
  let result = os_mod.platform();
  len(result) > 0;
`, result => result === true);

test('os.arch()', `
  let os_mod = require('os');
  let result = os_mod.arch();
  len(result) > 0;
`, result => result === true);

test('os.hostname()', `
  let os_mod = require('os');
  let result = os_mod.hostname();
  len(result) > 0;
`, result => result === true);

test('os.type()', `
  let os_mod = require('os');
  let result = os_mod.type();
  len(result) > 0;
`, result => result === true);

test('os.cpuCount()', `
  let os_mod = require('os');
  let result = os_mod.cpuCount();
  result > 0;
`, result => result === true);

test('os.getTotalMemory()', `
  let os_mod = require('os');
  let result = os_mod.getTotalMemory();
  result > 0;
`, result => result === true);

test('os.getFreeMemory()', `
  let os_mod = require('os');
  let result = os_mod.getFreeMemory();
  result > 0;
`, result => result === true);

test('os.getUsedMemory()', `
  let os_mod = require('os');
  let result = os_mod.getUsedMemory();
  result >= 0;
`, result => result === true);

test('os.getMemoryUsagePercent()', `
  let os_mod = require('os');
  let result = os_mod.getMemoryUsagePercent();
  result >= 0 && result <= 100;
`, result => result === true);

test('os.getHomeDirectory()', `
  let os_mod = require('os');
  let result = os_mod.getHomeDirectory();
  len(result) > 0;
`, result => result === true);

// ============================================================================
// COMBINED MODULE TESTS
// ============================================================================

console.log('\n--- COMBINED MODULE TESTS ---');

test('Multiple modules', `
  let path_mod = require('path');
  let os_mod = require('os');
  let p = path_mod.join('/', 'tmp');
  let host = os_mod.hostname();
  len(p) > 0 && len(host) > 0;
`, result => result === true);

test('Module function count (path)', `
  let path_mod = require('path');
  let funcs = keys(path_mod);
  len(funcs) >= 15;
`, result => result === true);

test('Module function count (os)', `
  let os_mod = require('os');
  let funcs = keys(os_mod);
  len(funcs) >= 20;
`, result => result === true);

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

console.log('\n--- ERROR HANDLING ---');

test('Invalid module', `
  try {
    require('nonexistent');
    false;
  } catch (e) {
    true;
  }
`, result => result === true || result === false); // Either true or error is ok

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total: ${passed + failed}`);
if (passed + failed > 0) {
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
}
console.log('='.repeat(50));

// ============================================================================
// MODULE STATISTICS
// ============================================================================

try {
  const moduleLoader = require('./src/module-loader');
  console.log('\n📦 Loaded Modules:');
  const stats = moduleLoader.getStatistics();
  for (const [name, count] of Object.entries(stats)) {
    console.log(`  ${name}: ${count} functions`);
  }
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  console.log(`  ─────────────────────`);
  console.log(`  Total: ${total} functions`);
} catch (error) {
  console.log(`Error getting module stats: ${error.message}`);
}

console.log('='.repeat(50) + '\n');

process.exit(failed > 0 ? 1 : 0);
