#!/usr/bin/env node
/**
 * FreeLang CLI Runner
 * Usage: node run.js <file.fl>
 */

const fs = require('fs');
const path = require('path');
const FreeLangInterpreter = require('./src/interpreter');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node run.js <file.fl>');
  process.exit(1);
}

const filePath = args[0];
const fullPath = path.resolve(filePath);

if (!fs.existsSync(fullPath)) {
  console.error(`Error: File not found: ${fullPath}`);
  process.exit(1);
}

const interpreter = new FreeLangInterpreter();
const result = interpreter.executeFile(fullPath);

if (!result.success) {
  console.error(`Error: ${result.error}`);
  process.exit(1);
}
