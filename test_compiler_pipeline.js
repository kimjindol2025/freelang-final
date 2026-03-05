const FreeLangInterpreter = require('./src/interpreter');

const interpreter = new FreeLangInterpreter();

console.log('🧪 Testing FreeLang Compiler Pipeline...\n');

// Test 1: Simple lexer test
console.log('1️⃣ Test Lexer (src/compiler/lexer.fl):');
let result = interpreter.executeFile('src/compiler/lexer.fl');
if (result.success) {
  console.log('✅ Lexer tests passed');
} else {
  console.log('❌ Lexer error:', result.error);
}

console.log('\n---\n');

// Test 2: IR Generator test
console.log('2️⃣ Test IR Generator (src/compiler/ir-generator.fl):');
result = interpreter.executeFile('src/compiler/ir-generator.fl');
if (result.success) {
  console.log('✅ IR Generator tests passed');
} else {
  console.log('❌ IR Generator error:', result.error);
}

console.log('\n---\n');

// Test 3: Parser test  
console.log('3️⃣ Test Parser (src/compiler/parser.fl):');
result = interpreter.executeFile('src/compiler/parser.fl');
if (result.success) {
  console.log('✅ Parser tests passed');
} else {
  console.log('❌ Parser error:', result.error);
}

console.log('\n---\n');

// Test 4: Stdlib array test
console.log('4️⃣ Test stdlib_array.fl:');
result = interpreter.executeFile('stdlib_array.fl');
if (result.success) {
  console.log('✅ stdlib_array tests passed');
} else {
  console.log('❌ stdlib_array error:', result.error);
}

console.log('\n---\n');

// Test 5: Stdlib IO test
console.log('5️⃣ Test stdlib_io.fl:');
result = interpreter.executeFile('stdlib_io.fl');
if (result.success) {
  console.log('✅ stdlib_io tests passed');
} else {
  console.log('❌ stdlib_io error:', result.error);
}

console.log('\n✨ Test suite completed!\n');
