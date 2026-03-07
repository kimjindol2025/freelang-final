#!/usr/bin/env node

// FreeLang Compiler CLI
// Usage: node freelang-compile.js <input.fl> <output>
// Written: 2026-03-07

const fs = require('fs');
const path = require('path');
const { FreeLangCompiler } = require('./complete-compiler');

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('FreeLang Compiler');
    console.log('Usage: freelang-compile.js <input.fl> [output]');
    console.log('Example: freelang-compile.js hello.fl hello');
    process.exit(1);
  }

  const inputFile = args[0];
  const outputFile = args[1] || 'a.out';

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: File not found: ${inputFile}`);
    process.exit(1);
  }

  const sourceCode = fs.readFileSync(inputFile, 'utf-8');
  const compiler = new FreeLangCompiler({ verbose: true });

  console.log(`Compiling: ${inputFile}`);
  console.log(`Output: ${outputFile}\n`);

  const result = compiler.compile(sourceCode, outputFile);

  if (result.success) {
    console.log(`\n✅ Compilation successful!`);
    console.log(`Generated: ${outputFile}`);
    process.exit(0);
  } else {
    console.error(`\n❌ Compilation failed!`);
    console.error(result.error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { FreeLangCompiler };
