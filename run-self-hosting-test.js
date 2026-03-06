const FreeLangInterpreter = require('./src/interpreter');
const fs = require('fs');

const interpreter = new FreeLangInterpreter();
const code = fs.readFileSync('test-self-hosting.fl', 'utf8');
const result = interpreter.execute(code);

console.log('Success:', result.success);
if (result.success) {
  console.log('\n✅ Self-hosting test completed successfully!');
} else {
  console.log('\n❌ Error:', result.error);
}
