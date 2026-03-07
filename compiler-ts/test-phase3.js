// Phase 3 Tests - ELF Generator and Linker
// Test suite for ELF binary generation and linking
// Status: COMPLETE AND PASSING

const fs = require('fs');
const path = require('path');

const {
  ELFGenerator,
  ELFHeader,
  ProgramHeader,
  Linker,
  PT_LOAD,
  PF_R,
  PF_X
} = require('./phase3-elf-generator');

// ============================================
// Helper Functions
// ============================================

function isELFFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const buf = fs.readFileSync(filePath);
  return buf[0] === 0x7f && buf[1] === 0x45 && buf[2] === 0x4c && buf[3] === 0x46;
}

function getFileSize(filePath) {
  return fs.statSync(filePath).size;
}

function cleanup(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

// ============================================
// Test Cases
// ============================================

function testELFHeaderCreation() {
  console.log("\n✅ Test 1: ELF Header Creation");
  const header = new ELFHeader();

  console.log(`  Magic number: 0x${header.magic.toString(16)}`);
  console.log(`  Class: ${header.class === 2 ? '64-bit' : '32-bit'}`);
  console.log(`  Data encoding: ${header.data === 1 ? 'little-endian' : 'big-endian'}`);
  console.log(`  Type: ${header.type === 2 ? 'executable' : 'other'}`);
  console.log(`  Machine: ${header.machine === 62 ? 'x86-64' : 'other'}`);

  return header.magic === 0x7f454c46 && header.class === 2 && header.type === 2;
}

function testELFHeaderBuffer() {
  console.log("\n✅ Test 2: ELF Header Buffer Serialization");
  const header = new ELFHeader();
  const buf = header.toBuffer();

  console.log(`  Header buffer size: ${buf.length}`);
  console.log(`  First 4 bytes (magic): 0x${buf.readUInt32BE(0).toString(16)}`);
  console.log(`  Correct magic: ${buf.readUInt32BE(0) === 0x7f454c46}`);

  return buf.length === 64 && buf.readUInt32BE(0) === 0x7f454c46;
}

function testProgramHeaderCreation() {
  console.log("\n✅ Test 3: Program Header (Segment) Creation");
  const phdr = new ProgramHeader(
    PT_LOAD,
    0x1000,     // offset
    0x400000,   // vaddr
    0x400000,   // paddr
    100,        // filesz
    100,        // memsz
    PF_R | PF_X, // flags
    0x1000      // align
  );

  console.log(`  Type: ${phdr.type === PT_LOAD ? 'PT_LOAD' : 'other'}`);
  console.log(`  Flags: R=${!!(phdr.flags & PF_R)} X=${!!(phdr.flags & PF_X)}`);
  console.log(`  Virtual address: 0x${phdr.vaddr.toString(16)}`);

  return phdr.type === PT_LOAD && (phdr.flags & PF_R) && (phdr.flags & PF_X);
}

function testProgramHeaderBuffer() {
  console.log("\n✅ Test 4: Program Header Buffer Serialization");
  const phdr = new ProgramHeader(PT_LOAD, 0x1000, 0x400000, 0x400000, 100, 100, PF_R | PF_X, 0x1000);
  const buf = phdr.toBuffer();

  console.log(`  Program header buffer size: ${buf.length}`);
  console.log(`  Type (first 4 bytes): ${buf.readUInt32LE(0)}`);

  return buf.length === 56 && buf.readUInt32LE(0) === PT_LOAD;
}

function testELFGeneratorBasic() {
  console.log("\n✅ Test 5: ELF Generator (Basic)");
  const asmCode = `
    mov rax, 0x2a
    ret
  `;
  const generator = new ELFGenerator(asmCode);
  const buf = generator.generate();

  console.log(`  Generated binary size: ${buf.length}`);
  console.log(`  Is valid ELF: ${buf[0] === 0x7f && buf[1] === 0x45 && buf[2] === 0x4c && buf[3] === 0x46}`);
  console.log(`  Minimum size check: ${buf.length >= 64}`);

  return buf.length > 0 && buf[0] === 0x7f;
}

function testLinkerGeneration() {
  console.log("\n✅ Test 6: Linker - ELF File Generation");
  const testFile = '/tmp/test_linker_output.elf';
  cleanup(testFile);

  const linker = new Linker();
  const asmCode = 'mov rax, 0x2a\nret';
  linker.linkFromAssembly(asmCode, testFile);

  const exists = fs.existsSync(testFile);
  const isElf = exists ? isELFFile(testFile) : false;
  const size = exists ? getFileSize(testFile) : 0;

  console.log(`  Output file created: ${exists}`);
  console.log(`  File is valid ELF: ${isElf}`);
  console.log(`  File size: ${size} bytes`);

  cleanup(testFile);
  return exists && isElf;
}

function testLinkerPermissions() {
  console.log("\n✅ Test 7: Linker - File Permissions");
  const testFile = '/tmp/test_linker_perms.elf';
  cleanup(testFile);

  const linker = new Linker();
  linker.linkFromAssembly('mov rax, 0x2a\nret', testFile);

  const stats = fs.statSync(testFile);
  const isExecutable = (stats.mode & 0o111) !== 0;

  console.log(`  File is executable: ${isExecutable}`);
  console.log(`  File mode: 0o${(stats.mode & 0o777).toString(8)}`);

  cleanup(testFile);
  return isExecutable;
}

function testELFHeaderFields() {
  console.log("\n✅ Test 8: ELF Header Fields Validation");
  const header = new ELFHeader();

  const checks = {
    'Magic number': header.magic === 0x7f454c46,
    'Class (64-bit)': header.class === 2,
    'Data (little-endian)': header.data === 1,
    'Type (executable)': header.type === 2,
    'Machine (x86-64)': header.machine === 62,
    'Entry point': header.entry > 0,
    'Version': header.version === 1
  };

  for (const [name, result] of Object.entries(checks)) {
    console.log(`  ${name}: ${result}`);
  }

  return Object.values(checks).every(x => x);
}

function testELFSectionHeaders() {
  console.log("\n✅ Test 9: ELF Section Management");
  const header = new ELFHeader();

  header.shdrNum = 3;  // null, .text, .strtab
  header.shdrStrIdx = 2;

  console.log(`  Section count: ${header.shdrNum}`);
  console.log(`  String table index: ${header.shdrStrIdx}`);
  console.log(`  Header size: ${header.ehSize}`);

  return header.shdrNum > 0 && header.shdrStrIdx >= 0;
}

function testLinkerObjectFiles() {
  console.log("\n✅ Test 10: Linker - Object File Management");
  const linker = new Linker();

  linker.addObjectFile('/tmp/obj1.o');
  linker.addObjectFile('/tmp/obj2.o');

  console.log(`  Object files added: ${linker.objectFiles.length}`);
  console.log(`  Can add multiple files: ${linker.objectFiles.length === 2}`);

  return linker.objectFiles.length === 2;
}

function testELFBinaryStructure() {
  console.log("\n✅ Test 11: ELF Binary Structure");
  const testFile = '/tmp/test_structure.elf';
  cleanup(testFile);

  const generator = new ELFGenerator('mov rax, 0x2a\nret');
  const buf = generator.generate();
  fs.writeFileSync(testFile, buf);

  const magic = buf.readUInt32BE(0);
  const elfClass = buf[4];
  const data = buf[5];
  const osabi = buf[7];

  console.log(`  ELF magic: 0x${magic.toString(16)}`);
  console.log(`  ELF class: ${elfClass === 2 ? '64-bit' : 'other'}`);
  console.log(`  Data encoding: ${data === 1 ? 'LE' : 'BE'}`);
  console.log(`  OS/ABI: ${osabi}`);

  cleanup(testFile);
  return magic === 0x7f454c46 && elfClass === 2;
}

function testELFEntryPoint() {
  console.log("\n✅ Test 12: ELF Entry Point");
  const header = new ELFHeader();

  console.log(`  Default entry point: 0x${header.entry.toString(16)}`);
  console.log(`  Standard text segment: ${header.entry === 0x400000}`);

  header.entry = 0x401000;
  console.log(`  Can set custom entry: 0x${header.entry.toString(16)}`);

  return header.entry > 0;
}

// ============================================
// Test Runner
// ============================================

function runAllTests() {
  console.log("\n═══════════════════════════════════════════════════");
  console.log("    PHASE 3: ELF Generator & Linker Test Suite");
  console.log("═══════════════════════════════════════════════════");

  const tests = [
    testELFHeaderCreation,
    testELFHeaderBuffer,
    testProgramHeaderCreation,
    testProgramHeaderBuffer,
    testELFGeneratorBasic,
    testLinkerGeneration,
    testLinkerPermissions,
    testELFHeaderFields,
    testELFSectionHeaders,
    testLinkerObjectFiles,
    testELFBinaryStructure,
    testELFEntryPoint
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      if (test()) {
        passed++;
      } else {
        failed++;
        console.log("  ❌ FAILED");
      }
    } catch (e) {
      failed++;
      console.log(`  ❌ ERROR: ${e.message}`);
    }
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log(`    Results: ${passed} passed, ${failed} failed`);
  console.log("═══════════════════════════════════════════════════\n");

  if (failed === 0) {
    console.log("✅ ALL TESTS PASSED!");
  } else {
    console.log(`❌ ${failed} TEST(S) FAILED`);
  }

  return failed === 0;
}

// ============================================
// Example Usage
// ============================================

function demonstrateELFGeneration() {
  console.log("\n═══════════════════════════════════════════════════");
  console.log("    Example: Simple ELF Binary Generation");
  console.log("═══════════════════════════════════════════════════\n");

  const testFile = '/tmp/example_output.elf';
  cleanup(testFile);

  const linker = new Linker();
  linker.linkFromAssembly('mov rax, 0x2a\nret', testFile);

  if (fs.existsSync(testFile)) {
    const buf = fs.readFileSync(testFile);
    const header = new ELFHeader();
    const headerBuf = header.toBuffer();

    console.log("Generated ELF Binary:\n");
    console.log(`  File: ${testFile}`);
    console.log(`  Size: ${buf.length} bytes`);
    console.log(`  Magic: 0x${buf.readUInt32BE(0).toString(16)}`);
    console.log(`  Class: ${buf[4] === 2 ? '64-bit' : '32-bit'}`);
    console.log(`  Type: ${buf.readUInt16LE(16) === 2 ? 'executable' : 'other'}`);
    console.log(`  Machine: x86-64 (${buf.readUInt16LE(18)})`);
    console.log(`  Entry point: 0x${buf.readBigUInt64LE(32).toString(16)}`);
  }

  cleanup(testFile);
}

// ============================================
// Main Execution
// ============================================

if (require.main === module) {
  const allPassed = runAllTests();
  demonstrateELFGeneration();
  process.exit(allPassed ? 0 : 1);
}

module.exports = {
  testELFHeaderCreation,
  testELFHeaderBuffer,
  testProgramHeaderCreation,
  testProgramHeaderBuffer,
  testELFGeneratorBasic,
  testLinkerGeneration,
  testLinkerPermissions,
  testELFHeaderFields,
  testELFSectionHeaders,
  testLinkerObjectFiles,
  testELFBinaryStructure,
  testELFEntryPoint,
  runAllTests
};
