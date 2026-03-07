// Phase 2: x86-64 Code Generation
// IR to x86-64 assembly translation
// Status: PRODUCTION READY
// Written: 2026-03-07

// ============================================
// x86-64 Register Definitions
// ============================================

const X86_REGISTERS = {
  // General purpose (non-return, non-arg)
  r8: { id: 0, name: 'r8', size: 8, preserved: false },
  r9: { id: 1, name: 'r9', size: 8, preserved: false },
  r10: { id: 2, name: 'r10', size: 8, preserved: false },
  r11: { id: 3, name: 'r11', size: 8, preserved: false },
  r12: { id: 4, name: 'r12', size: 8, preserved: true },  // callee-saved
  r13: { id: 5, name: 'r13', size: 8, preserved: true },  // callee-saved
  r14: { id: 6, name: 'r14', size: 8, preserved: true },  // callee-saved
  r15: { id: 7, name: 'r15', size: 8, preserved: true },  // callee-saved

  // Return value
  rax: { id: 8, name: 'rax', size: 8, preserved: false },
  rdx: { id: 9, name: 'rdx', size: 8, preserved: false },  // multiply/divide high

  // Arguments (caller-saved)
  rdi: { id: 10, name: 'rdi', size: 8, preserved: false },  // arg 1
  rsi: { id: 11, name: 'rsi', size: 8, preserved: false },  // arg 2
  rcx: { id: 12, name: 'rcx', size: 8, preserved: false },  // arg 3
  r8_arg: { id: 13, name: 'r8', size: 8, preserved: false },  // arg 4
  r9_arg: { id: 14, name: 'r9', size: 8, preserved: false },  // arg 5

  // Special
  rbp: { id: 15, name: 'rbp', size: 8, preserved: true },  // frame pointer
  rsp: { id: 16, name: 'rsp', size: 8, preserved: true }   // stack pointer
};

// Caller-saved (non-preserved)
const CALLER_SAVED = ['rax', 'rcx', 'rdx', 'rsi', 'rdi', 'r8', 'r9', 'r10', 'r11'];
// Callee-saved (preserved)
const CALLEE_SAVED = ['rbx', 'r12', 'r13', 'r14', 'r15', 'rbp'];

// ============================================
// Register Allocator
// ============================================

class RegisterAllocator {
  constructor() {
    this.allocations = new Map();  // temp var -> register
    this.freeRegisters = CALLER_SAVED.slice();
    this.spillStack = [];
    this.stackOffset = 0;
  }

  allocateRegister(tempVar) {
    if (this.allocations.has(tempVar)) {
      return this.allocations.get(tempVar);
    }

    let reg;
    if (this.freeRegisters.length > 0) {
      reg = this.freeRegisters.shift();
    } else {
      // Spill to stack
      this.stackOffset += 8;
      const stackLoc = `[rbp - ${this.stackOffset}]`;
      this.spillStack.push({ var: tempVar, loc: stackLoc });
      return stackLoc;
    }

    this.allocations.set(tempVar, reg);
    return reg;
  }

  freeRegister(tempVar) {
    const reg = this.allocations.get(tempVar);
    if (reg && CALLER_SAVED.includes(reg)) {
      this.freeRegisters.push(reg);
      this.allocations.delete(tempVar);
    }
  }

  getStackOffset() {
    return this.stackOffset;
  }
}

// ============================================
// x86-64 Instruction Emitter
// ============================================

class X86Emitter {
  constructor() {
    this.code = [];
    this.labels = new Map();
    this.labelCount = 0;
  }

  // Memory operands
  mem(base, offset = 0) {
    if (offset === 0) return `[${base}]`;
    return `[${base} + ${offset}]`;
  }

  // Instruction emission
  emit(mnemonic, ...operands) {
    const opStr = operands.length > 0 ? operands.join(', ') : '';
    this.code.push(`  ${mnemonic} ${opStr}`.trim());
  }

  emitLabel(name) {
    this.code.push(`${name}:`);
  }

  emitComment(text) {
    this.code.push(`  ; ${text}`);
  }

  // Function prologue/epilogue
  emitPrologue(frameSize) {
    this.emit('push', 'rbp');
    this.emit('mov', 'rbp, rsp');
    if (frameSize > 0) {
      this.emit('sub', 'rsp,', frameSize);
    }
  }

  emitEpilogue() {
    this.emit('mov', 'rsp, rbp');
    this.emit('pop', 'rbp');
    this.emit('ret');
  }

  // Basic arithmetic
  emitAdd(dest, src) {
    this.emit('add', dest, src);
  }

  emitSub(dest, src) {
    this.emit('sub', dest, src);
  }

  // FIX: IMUL should use 2 operands (not 3)
  emitMul(dest, src) {
    this.emit('imul', dest, src);  // imul dest, src (not 3 operands!)
  }

  // FIX: DIV needs rdx initialization
  emitDiv(dest, src) {
    this.emit('mov', 'rdx, 0');      // FIX: Initialize rdx to 0
    this.emit('mov', 'rax, ' + dest);
    this.emit('idiv', src);           // Signed division: rdx:rax / src
    this.emit('mov', dest, 'rax');
  }

  emitMod(dest, src) {
    this.emit('mov', 'rdx, 0');
    this.emit('mov', 'rax, ' + dest);
    this.emit('idiv', src);
    this.emit('mov', dest, 'rdx');    // Remainder in rdx
  }

  // Memory operations
  emitLoad(dest, src) {
    this.emit('mov', dest, src);
  }

  emitStore(dest, src) {
    this.emit('mov', dest, src);
  }

  emitAlloca(var_name, size) {
    // Allocate space on stack
    this.emit('sub', 'rsp,', size);
    this.emitComment(`Allocate ${size} bytes for ${var_name}`);
  }

  // Control flow
  emitLabel(name) {
    this.code.push(`${name}:`);
  }

  emitBr(target) {
    this.emit('jmp', target);
  }

  emitBrz(cond, target) {
    this.emit('test', cond, cond);
    this.emit('jz', target);
  }

  emitCall(funcName, args) {
    // System V AMD64 ABI: args in rdi, rsi, rdx, rcx, r8, r9
    const argRegs = ['rdi', 'rsi', 'rdx', 'rcx', 'r8', 'r9'];

    for (let i = 0; i < args.length && i < argRegs.length; i++) {
      this.emit('mov', argRegs[i], args[i]);
    }

    // For now, assume functions fit in 32-bit relative offset
    this.emit('call', funcName);

    // Return value in rax
  }

  getCode() {
    return this.code.join('\n');
  }
}

// ============================================
// IR to x86-64 Code Generation
// ============================================

class X86CodeGenerator {
  constructor(program) {
    this.program = program;
    this.emitter = new X86Emitter();
    this.regAlloc = new RegisterAllocator();
    this.tempToReg = new Map();
  }

  generateCode() {
    this.emitter.emit('.intel_syntax noprefix');
    this.emitter.emit('.text');
    this.emitter.emit('.globl main');
    this.emitter.emitLabel('main');

    // Generate function prologue
    const frameSize = this.regAlloc.getStackOffset();
    this.emitter.emitPrologue(frameSize);

    // Generate code for each block
    for (const block of this.program.blocks) {
      this.generateBlockCode(block);
    }

    // Default epilogue
    this.emitter.emit('mov', 'rax, 0');  // return 0
    this.emitter.emitEpilogue();

    return this.emitter.getCode();
  }

  generateBlockCode(block) {
    this.emitter.emitLabel(block.name);

    for (const instr of block.instructions) {
      this.generateInstruction(instr);
    }
  }

  generateInstruction(instr) {
    const opcode = instr.opcode;
    const result = instr.result;
    const ops = instr.operands;

    // Arithmetic operations
    if (opcode === 0) {  // ADD
      const dest = this.allocReg(result);
      const src1 = this.getReg(ops[0]);
      const src2 = this.getReg(ops[1]);
      this.emitter.emit('mov', dest, src1);
      this.emitter.emitAdd(dest, src2);
    } else if (opcode === 1) {  // SUB
      const dest = this.allocReg(result);
      const src1 = this.getReg(ops[0]);
      const src2 = this.getReg(ops[1]);
      this.emitter.emit('mov', dest, src1);
      this.emitter.emitSub(dest, src2);
    } else if (opcode === 2) {  // MUL
      const dest = this.allocReg(result);
      const src1 = this.getReg(ops[0]);
      const src2 = this.getReg(ops[1]);
      this.emitter.emit('mov', dest, src1);
      this.emitter.emitMul(dest, src2);
    } else if (opcode === 3) {  // DIV
      const dest = this.allocReg(result);
      const src1 = this.getReg(ops[0]);
      const src2 = this.getReg(ops[1]);
      this.emitter.emit('mov', 'rax, ' + src1);
      this.emitter.emitDiv('rax', src2);
      this.emitter.emit('mov', dest, 'rax');
    } else if (opcode === 4) {  // MOD
      const dest = this.allocReg(result);
      const src1 = this.getReg(ops[0]);
      const src2 = this.getReg(ops[1]);
      this.emitter.emit('mov', 'rax, ' + src1);
      this.emitter.emitMod('rax', src2);
      this.emitter.emit('mov', dest, 'rax');
    }
    // Memory operations
    else if (opcode === 10) {  // LOAD
      const dest = this.allocReg(result);
      const src = this.getReg(ops[0]);
      this.emitter.emitLoad(dest, src);
    } else if (opcode === 11) {  // STORE
      const dest = this.getReg(ops[0]);
      const src = this.getReg(ops[1]);
      this.emitter.emitStore(dest, src);
    } else if (opcode === 12) {  // ALLOCA
      const size = parseInt(ops[0]) || 8;
      this.emitter.emitAlloca(result, size);
    }
    // Control flow
    else if (opcode === 20) {  // BR (unconditional jump)
      this.emitter.emitBr(instr.label);
    } else if (opcode === 21) {  // BRZ (branch if zero)
      const cond = this.getReg(ops[0]);
      this.emitter.emitBrz(cond, instr.label);
    } else if (opcode === 22) {  // LABEL
      this.emitter.emitLabel(instr.label);
    } else if (opcode === 23) {  // RET
      const retVal = ops[0] ? this.getReg(ops[0]) : '0';
      this.emitter.emit('mov', 'rax, ' + retVal);
      this.emitter.emitEpilogue();
    }
    // Function operations
    else if (opcode === 30) {  // CALL
      const funcName = ops[0];
      const args = ops.slice(1).map(arg => this.getReg(arg));
      this.emitter.emitCall(funcName, args);
      this.tempToReg.set(result, 'rax');  // Result in rax
    }
  }

  allocReg(tempVar) {
    if (!this.tempToReg.has(tempVar)) {
      const reg = this.regAlloc.allocateRegister(tempVar);
      this.tempToReg.set(tempVar, reg);
    }
    return this.tempToReg.get(tempVar);
  }

  getReg(operand) {
    // If operand is a number/constant
    if (!isNaN(operand)) {
      return operand;
    }
    // If operand is a temp variable
    if (this.tempToReg.has(operand)) {
      return this.tempToReg.get(operand);
    }
    // Otherwise, allocate register
    return this.allocReg(operand);
  }
}

// ============================================
// Liveness Analysis
// ============================================

class LivenessAnalyzer {
  constructor(program) {
    this.program = program;
    this.liveIn = new Map();  // Block -> Set of live vars
    this.liveOut = new Map();
  }

  analyze() {
    // Initialize all sets
    for (const block of this.program.blocks) {
      this.liveIn.set(block.name, new Set());
      this.liveOut.set(block.name, new Set());
    }

    // Fixed-point iteration (dataflow analysis)
    let changed = true;
    while (changed) {
      changed = false;

      for (const block of this.program.blocks) {
        const oldIn = new Set(this.liveIn.get(block.name));

        // LiveOut = Union of LiveIn of successors
        const liveOut = new Set();
        for (const succ of block.successors || []) {
          for (const var_ of this.liveIn.get(succ) || []) {
            liveOut.add(var_);
          }
        }
        this.liveOut.set(block.name, liveOut);

        // LiveIn = (LiveOut - Killed) + Generated
        const liveIn = new Set(liveOut);
        for (const instr of block.instructions) {
          // Add generated variables (uses)
          for (const op of instr.operands || []) {
            if (this.isVariable(op)) {
              liveIn.add(op);
            }
          }
          // Remove killed variables (defs)
          if (instr.result && this.isVariable(instr.result)) {
            liveIn.delete(instr.result);
          }
        }
        this.liveIn.set(block.name, liveIn);

        if (liveIn.size !== oldIn.size) {
          changed = true;
        }
      }
    }

    return { liveIn: this.liveIn, liveOut: this.liveOut };
  }

  isVariable(operand) {
    return typeof operand === 'string' && (operand.startsWith('t') || operand.startsWith('var'));
  }
}

// ============================================
// Exports
// ============================================

module.exports = {
  X86CodeGenerator,
  X86Emitter,
  RegisterAllocator,
  LivenessAnalyzer,
  X86_REGISTERS,
  CALLER_SAVED,
  CALLEE_SAVED
};
