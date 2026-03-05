const FreeLangInterpreter = require('./src/interpreter');

// 간단한 테스트
const testCode = `
fn test_header(): void {
  println("✓ ELF Header Test")
  println("  Magic: 0x7f454c46")
  println("  Class: 64-bit")
}

fn main(): void {
  println("╔════════════════════════════════════════╗")
  println("║     ELF Linker Execution Test          ║")
  println("╚════════════════════════════════════════╝")
  println("")
  test_header()
}
`;

const interpreter = new FreeLangInterpreter();
console.log('=== Testing FreeLang println ===');
try {
  interpreter.execute(testCode);
  console.log('\n=== Test completed ===');
} catch(e) {
  console.error('Error:', e.message);
}
