/**
 * FreeLang v2.5.0 - JavaScript Bridge Runtime
 *
 * This file serves as the Node.js entry point for the FreeLang package.
 * It provides a JavaScript implementation of FreeLang's built-in functions,
 * allowing FreeLang code to be executed through Node.js's require() system.
 *
 * Architecture:
 * - index.js (this file): exports the runtime module
 * - src/runtime.js: implements 10+ core built-in functions
 *
 * Usage:
 *   const freelang = require('freelang');
 *   freelang.println("Hello, World!");
 */

'use strict';

const runtime = require('./src/runtime');

// Export all runtime functions as the package interface
module.exports = runtime;

// Also support direct imports of specific functions:
// const { println, print, read_file } = require('freelang');
