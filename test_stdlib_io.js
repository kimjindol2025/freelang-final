/**
 * FreeLang stdlib_io.fl 검증 테스트
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

console.log('================================================');
console.log('📦 FREELANG STDLIB_IO TESTS');
console.log('================================================\n');

// ============================================================================
// TEST: readFile & writeFile
// ============================================================================

console.log('--- FILE I/O ---');

test('writeFile - 파일 생성', `
fn writeTest(): bool {
  return writeFile("test_io_write.txt", "Hello, FreeLang!")
}
writeTest()
`, result => result === true);

test('readFile - 파일 읽기', `
fn readTest(): string {
  writeFile("test_io_read.txt", "Hello, FreeLang!")
  return readFile("test_io_read.txt")
}
readTest()
`, result => result === "Hello, FreeLang!");

test('readFile - 파일이 없을 때 빈 문자열', `
fn readNonexist(): string {
  return readFile("nonexistent_file_xyz.txt")
}
readNonexist()
`, result => result === "");

// ============================================================================
// TEST: appendFile
// ============================================================================

console.log('\n--- APPEND FILE ---');

test('appendFile - 파일에 추가', `
fn appendTest(): bool {
  writeFile("test_io_append.txt", "Line 1")
  appendFile("test_io_append.txt", " Line 2")
  let content = readFile("test_io_append.txt")
  return content == "Line 1 Line 2"
}
appendTest()
`, result => result === true);

// ============================================================================
// TEST: getEnv
// ============================================================================

console.log('\n--- ENVIRONMENT VARIABLES ---');

test('getEnv - PATH 환경변수 읽기', `
fn envTest(): bool {
  let path = getEnv("PATH")
  return len(path) > 0
}
envTest()
`, result => result === true);

test('getEnv - 존재하지 않는 환경변수는 빈 문자열', `
fn envNonexist(): bool {
  let val = getEnv("NONEXISTENT_VAR_XYZ_12345")
  return val == ""
}
envNonexist()
`, result => result === true);

// ============================================================================
// TEST: basename
// ============================================================================

console.log('\n--- BASENAME ---');

test('basename - 전체 경로에서 파일명 추출', `
fn basenameTest1(): string {
  return basename("/home/user/file.txt")
}
basenameTest1()
`, result => result === "file.txt");

test('basename - 경로 없음', `
fn basenameTest2(): string {
  return basename("simple.txt")
}
basenameTest2()
`, result => result === "simple.txt");

test('basename - 복잡한 경로', `
fn basenameTest3(): string {
  return basename("/usr/local/bin/myapp")
}
basenameTest3()
`, result => result === "myapp");

// ============================================================================
// TEST: dirname
// ============================================================================

console.log('\n--- DIRNAME ---');

test('dirname - 전체 경로에서 디렉토리만 추출', `
fn dirnameTest1(): string {
  return dirname("/home/user/file.txt")
}
dirnameTest1()
`, result => result === "/home/user");

test('dirname - 경로 없음', `
fn dirnameTest2(): string {
  return dirname("simple.txt")
}
dirnameTest2()
`, result => result === ".");

test('dirname - 복잡한 경로', `
fn dirnameTest3(): string {
  return dirname("/usr/local/bin/myapp")
}
dirnameTest3()
`, result => result === "/usr/local/bin");

// ============================================================================
// TEST: extension
// ============================================================================

console.log('\n--- EXTENSION ---');

test('extension - 단순 파일 확장자', `
fn extTest1(): string {
  return extension("file.txt")
}
extTest1()
`, result => result === "txt");

test('extension - 복수 점을 가진 파일', `
fn extTest2(): string {
  return extension("archive.tar.gz")
}
extTest2()
`, result => result === "gz");

test('extension - 확장자 없음', `
fn extTest3(): string {
  return extension("README")
}
extTest3()
`, result => result === "");

test('extension - 경로를 포함한 파일', `
fn extTest4(): string {
  return extension("/home/user/document.pdf")
}
extTest4()
`, result => result === "pdf");

// ============================================================================
// INTEGRATION: 경로 조작 함수들 조합
// ============================================================================

console.log('\n--- INTEGRATION ---');

test('경로 분석 - dirname + basename', `
fn pathAnalysis(): bool {
  let path = "/home/user/document.pdf"
  let dir = dirname(path)
  let file = basename(path)
  return dir == "/home/user" and file == "document.pdf"
}
pathAnalysis()
`, result => result === true);

// ============================================================================
// CLEANUP
// ============================================================================

try {
  if (fs.existsSync('test_io_write.txt')) fs.unlinkSync('test_io_write.txt');
  if (fs.existsSync('test_io_read.txt')) fs.unlinkSync('test_io_read.txt');
  if (fs.existsSync('test_io_append.txt')) fs.unlinkSync('test_io_append.txt');
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
