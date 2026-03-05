const FreeLangInterpreter = require('./src/interpreter');
const fs = require('fs');

const interpreter = new FreeLangInterpreter();
const code = fs.readFileSync('./self-hosting-test.fl', 'utf8');
const result = interpreter.execute(code);

console.log('\n--- Execution Result ---');
console.log('Success:', result.success);
if (!result.success) {
  console.log('Error:', result.error);
}
