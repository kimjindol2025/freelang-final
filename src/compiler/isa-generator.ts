/**
 * ISA v1.0 Generator (Instruction Set Architecture)
 * FreeLang AST → 바이트코드 변환
 */

// OpCode 정의 (ISA v1.0)
enum OpCode {
  NOP = 0,
  HALT = 1,
  MOV = 2,
  ADD = 3,
  SUB = 4,
  MUL = 5,
  DIV = 6,
  CMP = 7,
  JMP = 8,
  JMP_IF = 9,
  CALL = 10,
  RET = 11,
  PUSH = 12,
  POP = 13,
  LOAD = 14,
  STORE = 15,
  TRY_BEGIN = 16,
  TRY_END = 17,
  RAISE = 18,
  CATCH = 19,
  FOR_INIT = 20,
  FOR_NEXT = 21,
}

// Instruction 구조체
interface Instruction {
  opcode: OpCode;
  dest?: number;    // 대상 레지스터
  src1?: number;    // 소스1 레지스터
  src2?: number;    // 소스2 레지스터
  operand?: number; // 32비트 피연산자 (주소, 상수)
}

// AST 기본 구조
interface ASTNode {
  type: string;
}

interface BinaryOp extends ASTNode {
  type: 'BinaryOp';
  op: string;
  left: ASTNode;
  right: ASTNode;
}

interface FunctionCall extends ASTNode {
  type: 'FunctionCall';
  name: string;
  args: ASTNode[];
}

interface NumberLiteral extends ASTNode {
  type: 'NumberLiteral';
  value: number;
}

interface Identifier extends ASTNode {
  type: 'Identifier';
  name: string;
}

interface Assignment extends ASTNode {
  type: 'Assignment';
  target: string;
  value: ASTNode;
}

interface Program extends ASTNode {
  type: 'Program';
  statements: ASTNode[];
}

/**
 * ISA Generator: AST → 바이트코드
 */
class ISAGenerator {
  private bytecode: number[] = [];
  private currentRegister: number = 0;
  private labels: Map<string, number> = new Map();
  private variables: Map<string, number> = new Map(); // 변수 → 메모리 주소
  private memoryOffset: number = 0;

  /**
   * 바이트코드 생성 (Phase 1-4)
   */
  generate(ast: Program): number[] {
    // Phase 1: 변수 선언 수집
    this.collectVariables(ast);

    // Phase 2: 코드 생성
    for (let i = 0; i < ast.statements.length; i++) {
      const stmt = ast.statements[i];
      const isLast = i === ast.statements.length - 1;
      this.visitStatement(stmt, isLast);
    }

    // Phase 3: HALT 추가
    this.emit(OpCode.HALT);

    // Phase 4: 반환
    return this.bytecode;
  }

  /**
   * 변수 선언 수집 (메모리 할당)
   */
  private collectVariables(ast: Program): void {
    for (const stmt of ast.statements) {
      if (stmt.type === 'Assignment') {
        const assign = stmt as Assignment;
        if (!this.variables.has(assign.target)) {
          this.variables.set(assign.target, this.memoryOffset);
          this.memoryOffset += 4; // 32비트 = 4바이트
        }
      }
    }
  }

  /**
   * Statement 방문
   */
  private visitStatement(node: ASTNode, isLast: boolean = false): void {
    switch (node.type) {
      case 'Assignment':
        this.visitAssignment(node as Assignment, isLast);
        break;
      case 'FunctionCall':
        this.visitFunctionCall(node as FunctionCall);
        break;
      default:
        this.visitExpression(node);
    }
  }

  /**
   * Assignment 방문: a = 10 + 32
   */
  private visitAssignment(assign: Assignment, isLast: boolean = false): void {
    const destAddr = this.variables.get(assign.target)!;
    const valueReg = this.visitExpression(assign.value);

    // STORE 명령어: 레지스터 값을 메모리에 저장
    // OpCode(1) + destReg(1) + addr_hi(1) + addr_lo(1) + padding(1) = 5바이트
    this.bytecode.push(OpCode.STORE);
    this.bytecode.push(valueReg);
    this.bytecode.push((destAddr >> 8) & 0xFF);
    this.bytecode.push(destAddr & 0xFF);
    this.bytecode.push(0);

    // 마지막 statement이면 메모리에서 R0으로 LOAD (반환용)
    if (isLast) {
      // LOAD R0, [destAddr]
      this.bytecode.push(OpCode.LOAD);
      this.bytecode.push(0); // R0
      this.bytecode.push((destAddr >> 8) & 0xFF);
      this.bytecode.push(destAddr & 0xFF);
      this.bytecode.push(0);
    }
  }

  /**
   * Expression 방문: 레지스터 번호 반환
   */
  private visitExpression(node: ASTNode): number {
    switch (node.type) {
      case 'NumberLiteral':
        return this.visitNumberLiteral(node as NumberLiteral);
      case 'Identifier':
        return this.visitIdentifier(node as Identifier);
      case 'BinaryOp':
        return this.visitBinaryOp(node as BinaryOp);
      case 'FunctionCall':
        return this.visitFunctionCall(node as FunctionCall);
      default:
        throw new Error(`Unknown expression type: ${node.type}`);
    }
  }

  /**
   * NumberLiteral 방문: 상수 로드
   */
  private visitNumberLiteral(literal: NumberLiteral): number {
    const reg = this.allocateRegister();

    // MOV 명령어: 상수를 레지스터에 로드
    // OpCode(1) + destReg(1) + const_hi(1) + const_lo(1) + padding(1) = 5바이트
    this.bytecode.push(OpCode.MOV);
    this.bytecode.push(reg);
    this.bytecode.push((literal.value >> 8) & 0xFF);
    this.bytecode.push(literal.value & 0xFF);
    this.bytecode.push(0);

    return reg;
  }

  /**
   * Identifier 방문: 변수 로드
   */
  private visitIdentifier(ident: Identifier): number {
    const reg = this.allocateRegister();
    const addr = this.variables.get(ident.name);

    if (addr === undefined) {
      throw new Error(`Undefined variable: ${ident.name}`);
    }

    // LOAD 명령어: 메모리에서 레지스터로 로드
    // OpCode(1) + destReg(1) + addr_hi(1) + addr_lo(1) + padding(1) = 5바이트
    this.bytecode.push(OpCode.LOAD);
    this.bytecode.push(reg);
    this.bytecode.push((addr >> 8) & 0xFF);
    this.bytecode.push(addr & 0xFF);
    this.bytecode.push(0);

    return reg;
  }

  /**
   * BinaryOp 방문: a + b
   */
  private visitBinaryOp(expr: BinaryOp): number {
    const left = this.visitExpression(expr.left);
    const right = this.visitExpression(expr.right);
    const result = this.allocateRegister();

    // OpCode + destReg + src1 + src2 + padding = 5바이트
    switch (expr.op) {
      case '+':
        this.bytecode.push(OpCode.ADD);
        this.bytecode.push(result);
        this.bytecode.push(left);
        this.bytecode.push(right);
        this.bytecode.push(0);
        break;
      case '-':
        this.bytecode.push(OpCode.SUB);
        this.bytecode.push(result);
        this.bytecode.push(left);
        this.bytecode.push(right);
        this.bytecode.push(0);
        break;
      case '*':
        this.bytecode.push(OpCode.MUL);
        this.bytecode.push(result);
        this.bytecode.push(left);
        this.bytecode.push(right);
        this.bytecode.push(0);
        break;
      case '/':
        this.bytecode.push(OpCode.DIV);
        this.bytecode.push(result);
        this.bytecode.push(left);
        this.bytecode.push(right);
        this.bytecode.push(0);
        break;
      default:
        throw new Error(`Unknown binary operator: ${expr.op}`);
    }

    return result;
  }

  /**
   * FunctionCall 방문
   */
  private visitFunctionCall(call: FunctionCall): number {
    // 기본 구현: 아직 미지원
    return 0;
  }

  /**
   * 레지스터 할당
   */
  private allocateRegister(): number {
    if (this.currentRegister >= 8) {
      throw new Error('Out of registers');
    }
    return this.currentRegister++;
  }

  /**
   * 명령어 방출
   */
  private emit(opcode: OpCode): void {
    this.bytecode.push(opcode);
  }

  /**
   * 바이트코드를 16진수 문자열로 변환 (디버그)
   */
  static bytecodeToHex(bytecode: number[]): string {
    return bytecode
      .map(b => '0x' + b.toString(16).padStart(2, '0'))
      .join(' ');
  }

  /**
   * 바이트코드를 Uint8Array로 변환
   */
  static toUint8Array(bytecode: number[]): Uint8Array {
    return new Uint8Array(bytecode);
  }
}

// Export
export { ISAGenerator, OpCode, Instruction, Program, BinaryOp, FunctionCall, NumberLiteral, Identifier, Assignment };
