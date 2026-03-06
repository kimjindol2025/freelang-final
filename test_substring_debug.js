const FreeLangInterpreter = require('./src/interpreter');
const fs = require('fs');

const stdlibCode = fs.readFileSync('./minimal_stdlib_io.fl', 'utf8');

const interp = new FreeLangInterpreter();

// Test substring
const result = interp.execute(stdlibCode + `
let path = "/home/user/file.txt";
let idx = lastIndexOf(path, "/");
let sub = substring(path, 0, idx);
sub;
`);

console.log('substring result:', result);
