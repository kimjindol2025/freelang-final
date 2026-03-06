const FreeLangInterpreter = require('./src/interpreter');

const testCode = `
fn main(): void {
  println("Test 1: ELF Header Creation")
  let magic = 0x7f454c46
  println("Magic number: " + str(magic))
}
`;

console.log('=== Running FreeLang Test ===');
const interpreter = new FreeLangInterpreter();
const result = interpreter.execute(testCode);
console.log('Result:', result);
console.log('=== Completed ===');
