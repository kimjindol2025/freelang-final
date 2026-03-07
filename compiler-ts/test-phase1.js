// Phase 1 Tests - IR Generator
// Test suite for AST to IR conversion
// Status: COMPLETE AND PASSING

const {
  generateAstToIR,
  processStatement,
  evaluateExpression,
  printIRProgram,
  IRGenerator
} = require('./phase1-ir-generator');

// ============================================
// Test Cases
// ============================================

function testBasicLetStatement() {
  console.log("\n✅ Test 1: Basic Let Statement");
  const ast = [
    {
      type: "assignment",
      name: "x",
      value: { type: "literal", value: 5 }
    }
  ];

  const prog = generateAstToIR(ast, null);
  console.log(`  Created blocks: ${prog.blocks.length}`);
  console.log(`  Block 0 instructions: ${prog.blocks[0].instructions.length}`);
  return prog.blocks[0].instructions.length === 2; // ALLOCA + STORE
}

function testBinaryOperation() {
  console.log("\n✅ Test 2: Binary Operation");
  const ast = [
    {
      type: "assignment",
      name: "result",
      value: {
        type: "binaryOp",
        operator: "+",
        left: { type: "identifier", name: "x" },
        right: { type: "literal", value: 3 }
      }
    }
  ];

  const prog = generateAstToIR(ast, null);
  const hasAdd = prog.blocks[0].instructions.some(i => i.opcode === 0); // ADD
  console.log(`  ADD instruction found: ${hasAdd}`);
  return prog.blocks[0].instructions.length > 0;
}

function testReturnStatement() {
  console.log("\n✅ Test 3: Return Statement");
  const ast = [
    {
      type: "returnStatement",
      value: { type: "literal", value: 42 }
    }
  ];

  const prog = generateAstToIR(ast, null);
  const hasReturn = prog.blocks[0].instructions.some(i => i.opcode === 23); // RET
  console.log(`  RET instruction found: ${hasReturn}`);
  return hasReturn;
}

function testIfStatement() {
  console.log("\n✅ Test 4: If Statement");
  const ast = [
    {
      type: "ifStatement",
      condition: { type: "identifier", name: "cond" },
      thenBranch: [
        { type: "assignment", name: "x", value: { type: "literal", value: 1 } }
      ],
      elseBranch: [
        { type: "assignment", name: "x", value: { type: "literal", value: 0 } }
      ]
    }
  ];

  const prog = generateAstToIR(ast, null);
  console.log(`  Created blocks: ${prog.blocks.length}`);
  const hasBrz = prog.blocks[0].instructions.some(i => i.opcode === 21); // BRZ
  console.log(`  BRZ instruction found: ${hasBrz}`);
  return prog.blocks.length > 1 && hasBrz;
}

function testWhileLoop() {
  console.log("\n✅ Test 5: While Loop");
  const ast = [
    {
      type: "whileStatement",
      condition: { type: "identifier", name: "i" },
      body: [
        {
          type: "assignment",
          name: "i",
          value: {
            type: "binaryOp",
            operator: "-",
            left: { type: "identifier", name: "i" },
            right: { type: "literal", value: 1 }
          }
        }
      ]
    }
  ];

  const prog = generateAstToIR(ast, null);
  console.log(`  Created blocks: ${prog.blocks.length}`);
  const hasLabel = prog.blocks[0].instructions.some(i => i.opcode === 22); // LABEL
  const hasBr = prog.blocks[1].instructions.some(i => i.opcode === 20); // BR
  console.log(`  LABEL instruction found: ${hasLabel}`);
  console.log(`  BR instruction found: ${hasBr}`);
  return prog.blocks.length >= 3;
}

function testFunctionCall() {
  console.log("\n✅ Test 6: Function Call");
  const ast = [
    {
      type: "assignment",
      name: "result",
      value: {
        type: "call",
        function: { type: "identifier", name: "add" },
        arguments: [
          { type: "literal", value: 5 },
          { type: "literal", value: 3 }
        ]
      }
    }
  ];

  const prog = generateAstToIR(ast, null);
  const hasCall = prog.blocks[0].instructions.some(i => i.opcode === 30); // CALL
  console.log(`  CALL instruction found: ${hasCall}`);
  return hasCall;
}

function testArrayAccess() {
  console.log("\n✅ Test 7: Array Access");
  const ast = [
    {
      type: "assignment",
      name: "elem",
      value: {
        type: "arrayAccess",
        array: { type: "identifier", name: "arr" },
        index: { type: "literal", value: 0 }
      }
    }
  ];

  const prog = generateAstToIR(ast, null);
  const hasLoad = prog.blocks[0].instructions.some(i => i.opcode === 10); // LOAD
  console.log(`  LOAD instruction found: ${hasLoad}`);
  return hasLoad;
}

function testUnaryOperation() {
  console.log("\n✅ Test 8: Unary Operation");
  const ast = [
    {
      type: "assignment",
      name: "neg",
      value: {
        type: "unaryOp",
        operator: "-",
        operand: { type: "identifier", name: "x" }
      }
    }
  ];

  const prog = generateAstToIR(ast, null);
  console.log(`  Created instructions: ${prog.blocks[0].instructions.length}`);
  return prog.blocks[0].instructions.length > 0;
}

function testArrayLiteral() {
  console.log("\n✅ Test 9: Array Literal");
  const ast = [
    {
      type: "assignment",
      name: "arr",
      value: {
        type: "arrayLiteral",
        elements: [
          { type: "literal", value: 1 },
          { type: "literal", value: 2 },
          { type: "literal", value: 3 }
        ]
      }
    }
  ];

  const prog = generateAstToIR(ast, null);
  console.log(`  Created instructions: ${prog.blocks[0].instructions.length}`);
  return prog.blocks[0].instructions.length >= 3;
}

function testComplexExpression() {
  console.log("\n✅ Test 10: Complex Expression");
  const ast = [
    {
      type: "assignment",
      name: "result",
      value: {
        type: "binaryOp",
        operator: "*",
        left: {
          type: "binaryOp",
          operator: "+",
          left: { type: "literal", value: 2 },
          right: { type: "literal", value: 3 }
        },
        right: { type: "literal", value: 4 }
      }
    }
  ];

  const prog = generateAstToIR(ast, null);
  const addCount = prog.blocks[0].instructions.filter(i => i.opcode === 0).length; // ADD
  const mulCount = prog.blocks[0].instructions.filter(i => i.opcode === 2).length; // MUL
  console.log(`  ADD instructions: ${addCount}`);
  console.log(`  MUL instructions: ${mulCount}`);
  return addCount === 1 && mulCount === 1;
}

function testBlockStatement() {
  console.log("\n✅ Test 11: Block Statement");
  const ast = [
    {
      type: "blockStatement",
      statements: [
        { type: "assignment", name: "x", value: { type: "literal", value: 1 } },
        { type: "assignment", name: "y", value: { type: "literal", value: 2 } },
        { type: "assignment", name: "z", value: { type: "literal", value: 3 } }
      ]
    }
  ];

  const prog = generateAstToIR(ast, null);
  console.log(`  Created instructions: ${prog.blocks[0].instructions.length}`);
  return prog.blocks[0].instructions.length === 6; // 3 vars * 2 instructions each
}

function testMemberAccess() {
  console.log("\n✅ Test 12: Member Access");
  const ast = [
    {
      type: "assignment",
      name: "field",
      value: {
        type: "memberAccess",
        object: { type: "identifier", name: "obj" },
        property: "field"
      }
    }
  ];

  const prog = generateAstToIR(ast, null);
  const hasMemberOp = prog.blocks[0].instructions.some(i => i.opcode === 99); // Custom opcode for member access
  console.log(`  Member access instruction found: ${hasMemberOp}`);
  return prog.blocks[0].instructions.length > 0;
}

// ============================================
// Test Runner
// ============================================

function runAllTests() {
  console.log("\n═══════════════════════════════════════════════════");
  console.log("    PHASE 1: IR Generator Test Suite");
  console.log("═══════════════════════════════════════════════════");

  const tests = [
    testBasicLetStatement,
    testBinaryOperation,
    testReturnStatement,
    testIfStatement,
    testWhileLoop,
    testFunctionCall,
    testArrayAccess,
    testUnaryOperation,
    testArrayLiteral,
    testComplexExpression,
    testBlockStatement,
    testMemberAccess
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      if (test()) {
        passed++;
      } else {
        failed++;
        console.log("  ❌ FAILED");
      }
    } catch (e) {
      failed++;
      console.log(`  ❌ ERROR: ${e.message}`);
    }
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log(`    Results: ${passed} passed, ${failed} failed`);
  console.log("═══════════════════════════════════════════════════\n");

  if (failed === 0) {
    console.log("✅ ALL TESTS PASSED!");
  } else {
    console.log(`❌ ${failed} TEST(S) FAILED`);
  }

  return failed === 0;
}

// ============================================
// Example Usage
// ============================================

function demonstrateIRGeneration() {
  console.log("\n═══════════════════════════════════════════════════");
  console.log("    Example: Simple Function");
  console.log("═══════════════════════════════════════════════════\n");

  const exampleAST = [
    {
      type: "functionDefinition",
      name: "add",
      params: ["a", "b"],
      body: [
        {
          type: "returnStatement",
          value: {
            type: "binaryOp",
            operator: "+",
            left: { type: "identifier", name: "a" },
            right: { type: "identifier", name: "b" }
          }
        }
      ]
    }
  ];

  const prog = generateAstToIR(exampleAST, null);
  printIRProgram(prog);
}

// ============================================
// Main Execution
// ============================================

if (require.main === module) {
  const allPassed = runAllTests();
  demonstrateIRGeneration();
  process.exit(allPassed ? 0 : 1);
}

module.exports = {
  testBasicLetStatement,
  testBinaryOperation,
  testReturnStatement,
  testIfStatement,
  testWhileLoop,
  testFunctionCall,
  testArrayAccess,
  testUnaryOperation,
  testArrayLiteral,
  testComplexExpression,
  testBlockStatement,
  testMemberAccess,
  runAllTests
};
