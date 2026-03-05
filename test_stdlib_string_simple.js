const FreeLangInterpreter = require('./src/interpreter');
const fs = require('fs');

const interp = new FreeLangInterpreter();
const stdlibStringCode = fs.readFileSync('./stdlib_string.fl', 'utf8');

console.log('Testing stdlib_string.fl...\n');

const result = interp.execute(stdlibStringCode + '\nupper("hello")');
console.log(`Result:`, result);
