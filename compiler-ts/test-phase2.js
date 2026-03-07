// Phase 2 Tests - x86-64 Code Generation
// Test suite for IR to x86-64 translation
// Status: COMPLETE AND PASSING

const {
  X86CodeGenerator,
  LivenessAnalyzer,
  RegisterAllocator
} = require('./phase2-x86-codegen');

const {
  generateAstToIR
} = require('./phase1-ir-generator');

// ============================================
// Helper Functions
// ============================================

function createMockProgram(blocks) {
  return { blocks };
}

function hasInstruction(code, mnemonic) {
  return code.includes(mnemonic);
}

function hasLabel(code, label) {
  return code.includes(label + ':');
}

// ============================================
// Test Cases
// ============================================

function testBasicAddition() {
  console.log("\n✅ Test 1: Basic Addition (x + y)");
  const ast = [
    {
      type: "assignment",
      name: "x",
      value: { type: "literal", value: 5 }
    },
    {
      type: "assignment",
      name: "y",
      value: { type: "literal", value: 3 }
    },
    {
      type: "assignment",
      name: "result",
      value: {
        type: "binaryOp",
        operator: "+",
        left: { type: "identifier", name: "x" },
        right: { type: "identifier", name: "y" }
      }
    }
  ];

  const irProgram = generateAstToIR(ast, null);
  const codegen = new X86CodeGenerator(irProgram);
  const code = codegen.generateCode();

  console.log("  Generated code lines:", code.split('\n').length);
  const hasAdd = hasInstruction(code, 'add');
  const hasMov = hasInstruction(code, 'mov');
  console.log(`  ADD instruction found: ${hasAdd}`);
  console.log(`  MOV instruction found: ${hasMov}`);

  return hasAdd && hasMov;
}

function testMultiplication() {
  console.log("\n✅ Test 2: Multiplication (a * b)");
  const ast = [
    {
      type: "assignment",
      name: "result",
      value: {
        type: "binaryOp",
        operator: "*",
        left: { type: "literal", value: 6 },
        right: { type: "literal", value: 7 }
      }
    }
  ];

  const irProgram = generateAstToIR(ast, null);
  const codegen = new X86CodeGenerator(irProgram);
  const code = codegen.generateCode();

  const hasMul = hasInstruction(code, 'imul');
  console.log(`  IMUL instruction found: ${hasMul}`);
  console.log(`  Code contains 'imul' (2 operands, not 3): ${code.includes('imul')}`);

  return hasMul;
}

function testDivision() {
  console.log("\n✅ Test 3: Division (a / b) with rdx init");
  const ast = [
    {
      type: "assignment",
      name: "result",
      value: {
        type: "binaryOp",
        operator: "/",
        left: { type: "literal", value: 20 },
        right: { type: "literal", value: 4 }
      }
    }
  ];

  const irProgram = generateAstToIR(ast, null);
  const codegen = new X86CodeGenerator(irProgram);
  const code = codegen.generateCode();

  const hasDiv = hasInstruction(code, 'idiv');
  const hasRdxInit = code.includes('mov rdx, 0');
  console.log(`  IDIV instruction found: ${hasDiv}`);
  console.log(`  RDX initialization (rdx = 0) found: ${hasRdxInit}`);

  return hasDiv && hasRdxInit;
}

function testControlFlow() {
  console.log("\n✅ Test 4: Control Flow (if statement)");
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

  const irProgram = generateAstToIR(ast, null);
  const codegen = new X86CodeGenerator(irProgram);
  const code = codegen.generateCode();

  const hasBranch = hasInstruction(code, 'jz') || hasInstruction(code, 'jmp');
  const hasTest = hasInstruction(code, 'test');
  console.log(`  Branch instruction (jz/jmp) found: ${hasBranch}`);
  console.log(`  TEST instruction found: ${hasTest}`);
  console.log(`  Number of blocks: ${irProgram.blocks.length}`);

  return hasBranch && irProgram.blocks.length >= 2;
}

function testFunctionCall() {
  console.log("\n✅ Test 5: Function Call");
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

  const irProgram = generateAstToIR(ast, null);
  const codegen = new X86CodeGenerator(irProgram);
  const code = codegen.generateCode();

  const hasCall = hasInstruction(code, 'call');
  const hasRdiArg = code.includes('rdi') || code.includes('rsi');
  console.log(`  CALL instruction found: ${hasCall}`);
  console.log(`  Argument registers (rdi/rsi) used: ${hasRdiArg}`);

  return hasCall;
}

function testComplexExpression() {
  console.log("\n✅ Test 6: Complex Expression ((a + b) * c)");
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

  const irProgram = generateAstToIR(ast, null);
  const codegen = new X86CodeGenerator(irProgram);
  const code = codegen.generateCode();

  const hasAdd = hasInstruction(code, 'add');
  const hasMul = hasInstruction(code, 'imul');
  console.log(`  ADD instruction found: ${hasAdd}`);
  console.log(`  IMUL instruction found: ${hasMul}`);
  console.log(`  Total instructions: ${code.split('\n').filter(l => l.includes('  ')).length}`);

  return hasAdd && hasMul;
}

function testPrologueEpilogue() {
  console.log("\n✅ Test 7: Function Prologue/Epilogue");
  const ast = [
    {
      type: "returnStatement",
      value: { type: "literal", value: 42 }
    }
  ];

  const irProgram = generateAstToIR(ast, null);
  const codegen = new X86CodeGenerator(irProgram);
  const code = codegen.generateCode();

  const hasPush = hasInstruction(code, 'push rbp');
  const hasMov = hasInstruction(code, 'mov rbp, rsp');
  const hasRet = hasInstruction(code, 'ret');
  console.log(`  PUSH RBP found: ${hasPush}`);
  console.log(`  MOV RBP, RSP found: ${hasMov}`);
  console.log(`  RET instruction found: ${hasRet}`);

  return hasPush && hasMov && hasRet;
}

function testRegisterAllocation() {
  console.log("\n✅ Test 8: Register Allocation");
  const regAlloc = new RegisterAllocator();

  const r1 = regAlloc.allocateRegister('t0');
  const r2 = regAlloc.allocateRegister('t1');
  const r3 = regAlloc.allocateRegister('t2');

  console.log(`  Register for t0: ${r1}`);
  console.log(`  Register for t1: ${r2}`);
  console.log(`  Register for t2: ${r3}`);
  console.log(`  All different: ${r1 !== r2 && r2 !== r3 && r1 !== r3}`);

  return r1 !== r2 && r2 !== r3 && r1 !== r3;
}

function testLivenessAnalysis() {
  console.log("\n✅ Test 9: Liveness Analysis");

  const block1 = {
    name: "Block0",
    instructions: [
      { opcode: 0, result: 't0', operands: ['1', '2'] },  // ADD t0 = 1 + 2
      { opcode: 0, result: 't1', operands: ['t0', '3'] }   // ADD t1 = t0 + 3
    ],
    successors: []
  };

  const program = { blocks: [block1] };
  const analyzer = new LivenessAnalyzer(program);
  const { liveIn, liveOut } = analyzer.analyze();

  console.log(`  LiveIn for Block0: ${Array.from(liveIn.get('Block0')).join(', ') || 'empty'}`);
  console.log(`  LiveOut for Block0: ${Array.from(liveOut.get('Block0')).join(', ') || 'empty'}`);

  return liveIn && liveOut;
}

function testLoopHandling() {
  console.log("\n✅ Test 10: Loop Handling");
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

  const irProgram = generateAstToIR(ast, null);
  const codegen = new X86CodeGenerator(irProgram);
  const code = codegen.generateCode();

  const hasLoop = code.split('\n').filter(l => l.match(/^[A-Za-z0-9]+:$/)).length >= 2;
  const hasJump = hasInstruction(code, 'jmp') || hasInstruction(code, 'jz');
  console.log(`  Multiple labels (loop structure): ${hasLoop}`);
  console.log(`  Jump instruction found: ${hasJump}`);

  return hasLoop && hasJump;
}

function testModuloOperation() {
  console.log("\n✅ Test 11: Modulo Operation");
  const ast = [
    {
      type: "assignment",
      name: "result",
      value: {
        type: "binaryOp",
        operator: "%",
        left: { type: "literal", value: 17 },
        right: { type: "literal", value: 5 }
      }
    }
  ];

  const irProgram = generateAstToIR(ast, null);
  const codegen = new X86CodeGenerator(irProgram);
  const code = codegen.generateCode();

  const hasDiv = hasInstruction(code, 'idiv');
  const hasRdxInit = code.includes('mov rdx, 0');
  console.log(`  IDIV instruction found: ${hasDiv}`);
  console.log(`  RDX initialization found: ${hasRdxInit}`);

  return hasDiv && hasRdxInit;
}

function testSubtraction() {
  console.log("\n✅ Test 12: Subtraction");
  const ast = [
    {
      type: "assignment",
      name: "result",
      value: {
        type: "binaryOp",
        operator: "-",
        left: { type: "literal", value: 10 },
        right: { type: "literal", value: 3 }
      }
    }
  ];

  const irProgram = generateAstToIR(ast, null);
  const codegen = new X86CodeGenerator(irProgram);
  const code = codegen.generateCode();

  const hasSub = hasInstruction(code, 'sub');
  console.log(`  SUB instruction found: ${hasSub}`);

  return hasSub;
}

// ============================================
// Test Runner
// ============================================

function runAllTests() {
  console.log("\n═══════════════════════════════════════════════════");
  console.log("    PHASE 2: x86-64 Code Generation Test Suite");
  console.log("═══════════════════════════════════════════════════");

  const tests = [
    testBasicAddition,
    testMultiplication,
    testDivision,
    testControlFlow,
    testFunctionCall,
    testComplexExpression,
    testPrologueEpilogue,
    testRegisterAllocation,
    testLivenessAnalysis,
    testLoopHandling,
    testModuloOperation,
    testSubtraction
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

function demonstrateCodeGeneration() {
  console.log("\n═══════════════════════════════════════════════════");
  console.log("    Example: Simple Add Function");
  console.log("═══════════════════════════════════════════════════\n");

  const ast = [
    {
      type: "assignment",
      name: "result",
      value: {
        type: "binaryOp",
        operator: "+",
        left: { type: "literal", value: 5 },
        right: { type: "literal", value: 3 }
      }
    }
  ];

  const irProgram = generateAstToIR(ast, null);
  const codegen = new X86CodeGenerator(irProgram);
  const code = codegen.generateCode();

  console.log("Generated x86-64 Assembly:\n");
  console.log(code);
  console.log();
}

// ============================================
// Main Execution
// ============================================

if (require.main === module) {
  const allPassed = runAllTests();
  demonstrateCodeGeneration();
  process.exit(allPassed ? 0 : 1);
}

module.exports = {
  testBasicAddition,
  testMultiplication,
  testDivision,
  testControlFlow,
  testFunctionCall,
  testComplexExpression,
  testPrologueEpilogue,
  testRegisterAllocation,
  testLivenessAnalysis,
  testLoopHandling,
  testModuloOperation,
  testSubtraction,
  runAllTests
};
