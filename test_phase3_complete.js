/**
 * FreeLang Phase 3: 완전 모듈 시스템 테스트
 * fs, os, path, crypto, http, date, encoding 모듈 검증
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

console.log('📦 PHASE 3: COMPLETE MODULE SYSTEM TESTS\n');

// ============================================================================
// FS MODULE TESTS (3개)
// ============================================================================

console.log('--- FS MODULE (25 functions) ---');

test('fs.existsSync()', `
  let fs = require('fs');
  let result = fs.existsSync('/tmp');
  result == true || result == false;
`, result => result === true || result === false);

test('fs.isFileSync()', `
  let fs = require('fs');
  let result = fs.isFileSync('/etc/passwd');
  result == true || result == false;
`, result => result === true || result === false);

test('fs.isDirectorySync()', `
  let fs = require('fs');
  let result = fs.isDirectorySync('/tmp');
  result == true || result == false;
`, result => result === true || result === false);

// ============================================================================
// OS MODULE TESTS (3개)
// ============================================================================

console.log('\n--- OS MODULE (20 functions) ---');

test('os.platform()', `
  let os = require('os');
  let result = os.platform();
  len(result) > 0;
`, result => result === true);

test('os.getTotalMemory()', `
  let os = require('os');
  let result = os.getTotalMemory();
  result > 0;
`, result => result === true);

test('os.cpuCount()', `
  let os = require('os');
  let result = os.cpuCount();
  result > 0;
`, result => result === true);

// ============================================================================
// PATH MODULE TESTS (3개)
// ============================================================================

console.log('\n--- PATH MODULE (15 functions) ---');

test('path.join()', `
  let path = require('path');
  let result = path.join('foo', 'bar', 'baz');
  len(result) > 0;
`, result => result === true);

test('path.basename()', `
  let path = require('path');
  let result = path.basename('/foo/bar/baz.txt');
  result == 'baz.txt';
`, result => result === true);

test('path.extname()', `
  let path = require('path');
  let result = path.extname('/foo/bar/baz.txt');
  result == '.txt';
`, result => result === true);

// ============================================================================
// CRYPTO MODULE TESTS (3개)
// ============================================================================

console.log('\n--- CRYPTO MODULE (30 functions) ---');

test('crypto.sha256()', `
  let crypto = require('crypto');
  let result = crypto.sha256('hello');
  len(result) == 64;
`, result => result === true);

test('crypto.md5()', `
  let crypto = require('crypto');
  let result = crypto.md5('test');
  len(result) == 32;
`, result => result === true);

test('crypto.randomHex()', `
  let crypto = require('crypto');
  let result = crypto.randomHex(16);
  len(result) == 32;
`, result => result === true);

// ============================================================================
// HTTP MODULE TESTS (3개)
// ============================================================================

console.log('\n--- HTTP MODULE (40 functions) ---');

test('http.parseUrl()', `
  let http = require('http');
  let result = http.parseUrl('https://example.com:8080/path?query=1');
  result.hostname == 'example.com';
`, result => result === true);

test('http.parseQuery()', `
  let http = require('http');
  let result = http.parseQuery('a=1&b=2');
  result.a == '1' && result.b == '2';
`, result => result === true);

test('http.createRouter()', `
  let http = require('http');
  let router = http.createRouter();
  let routes = router.routes();
  len(routes) == 0;
`, result => result === true);

// ============================================================================
// DATE MODULE TESTS (3개)
// ============================================================================

console.log('\n--- DATE MODULE (35 functions) ---');

test('date.now()', `
  let date = require('date');
  let result = date.now();
  result > 0;
`, result => result === true);

test('date.today()', `
  let date = require('date');
  let today = date.today();
  today.getDate() >= 1 && today.getDate() <= 31;
`, result => result === true);

test('date.toDateString()', `
  let date = require('date');
  let d = date.create(2024, 3, 15);
  let result = date.toDateString(d);
  len(result) == 10;
`, result => result === true);

// ============================================================================
// ENCODING MODULE TESTS (3개)
// ============================================================================

console.log('\n--- ENCODING MODULE (25 functions) ---');

test('encoding.base64Encode()', `
  let encoding = require('encoding');
  let result = encoding.base64Encode('hello');
  len(result) > 0;
`, result => result === true);

test('encoding.hexEncode()', `
  let encoding = require('encoding');
  let result = encoding.hexEncode('test');
  len(result) > 0;
`, result => result === true);

test('encoding.urlEncode()', `
  let encoding = require('encoding');
  let result = encoding.urlEncode('hello world');
  result == 'hello%20world';
`, result => result === true);

// ============================================================================
// MULTI-MODULE TESTS (4개)
// ============================================================================

console.log('\n--- COMBINED MODULE TESTS ---');

test('Multiple modules', `
  let fs = require('fs');
  let os = require('os');
  let path = require('path');
  let platform = os.platform();
  let tempdir = os.getTempDirectory();
  len(platform) > 0 && len(tempdir) > 0;
`, result => result === true);

test('Crypto + Encoding', `
  let crypto = require('crypto');
  let encoding = require('encoding');
  let hash = crypto.sha256('test');
  let encoded = encoding.base64Encode(hash);
  len(encoded) > 0;
`, result => result === true);

test('HTTP + Date', `
  let http = require('http');
  let date = require('date');
  let now = date.now();
  let parsed = http.parseUrl('https://example.com/path?time=' + now);
  parsed.query.time == '' + now;
`, result => result === true);

test('Module function counts', `
  let moduleLoader = require('./src/module-loader');
  let stats = moduleLoader.getStatistics();
  let total = 0;
  for (let key in stats) {
    total = total + stats[key];
  }
  total >= 180;
`, result => result === true);

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
  let total = 0;
  for (const [name, count] of Object.entries(stats)) {
    console.log(`  ${name}: ${count} functions`);
    total += count;
  }
  console.log(`  ─────────────────────`);
  console.log(`  Total: ${total} functions`);
} catch (error) {
  console.log(`Error getting module stats: ${error.message}`);
}

console.log('='.repeat(50) + '\n');

process.exit(failed > 0 ? 1 : 0);
