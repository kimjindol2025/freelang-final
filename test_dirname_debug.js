const FreeLangInterpreter = require('./src/interpreter');
const fs = require('fs');

const stdlibCode = fs.readFileSync('./minimal_stdlib_io.fl', 'utf8');

const interp = new FreeLangInterpreter();
const result = interp.execute(stdlibCode + `
let path = "/home/user/file.txt";
let idx = lastIndexOf(path, "/");
let dir = dirname(path);
dir;
`);

console.log('Result:', result);
