# IR Generator 구현 사양서

**팀**: Compiler Agent
**기간**: Week 5-6 (2주)
**라인**: ~800줄 FreeLang
**상태**: 🚀 **시작 가능**
**의존성**: Semantic Analyzer (Week 3-4) ✓

---

## 📋 목표

**입력**: Type-checked AST (from Semantic Analyzer)
**출력**: LLVM IR (텍스트 형식)
**검증**: 50+ 테스트 통과

---

## 🏗️ IR (중간 표현) 개요

### 3-Address Code (3AC)

```
3개 이상의 operand를 갖지 않는 명령어

예시:
x = y + z       (산술)
t0 = arr[i]     (메모리 읽음)
arr[i] = t0     (메모리 쓰기)
goto L0         (분기)
if x > 5 goto L1 (조건분기)
t0 = call foo() (함수 호출)
```

### Basic Block

```
분기점이 없는 순차 명령어들의 집합

예시:
Block0:
  x = 5
  y = x + 3
  if y > 10 goto Block1

Block1:
  z = y * 2
  return z

Block2:
  return 0
```

### Control Flow Graph (CFG)

```
기본 블록들 간의 제어 흐름

Block0 → Block1, Block2
Block1 → exit
Block2 → exit
```

---

## 📂 파일 구조

```
src/compiler/
├── ir-types.fl (100줄)          // IR 타입 정의
├── ir-generator.fl (400줄)      // IR 생성 로직
├── ir-validator.fl (150줄)      // IR 검증
├── ir-optimizer.fl (150줄)      // 기본 최적화
└── ir-printer.fl (100줄)        // IR 출력
```

---

## Week 5: IR 타입 + 기본 생성

### Step 1: IR 타입 정의 (Day 1)

**파일**: `src/compiler/ir-types.fl`

```freelang
// IR 명령어 타입
enum IROpcode {
  // 산술
  ADD = 0,
  SUB = 1,
  MUL = 2,
  DIV = 3,
  MOD = 4,

  // 메모리
  LOAD = 10,    // t0 = arr[i]
  STORE = 11,   // arr[i] = t0
  ALLOCA = 12,  // 스택 할당

  // 제어 흐름
  BR = 20,      // 무조건 분기
  BRZ = 21,     // 0이면 분기
  LABEL = 22,   // 라벨
  RET = 23,     // 반환

  // 함수
  CALL = 30,
  PHI = 31,     // SSA form

  // 기타
  NOP = 99,
}

struct IRInstruction {
  opcode: i32,
  result: string,       // t0, x, etc
  operands: Array<string>,  // [y, z] for y + z
  label: string,        // 라벨 (분기 타겟)
  line: i32,
  col: i32,
}

struct IRBasicBlock {
  name: string,         // "Block0", "Block1"
  instructions: Array<IRInstruction>,
  successors: Array<string>,  // 다음 블록들
  predecessors: Array<string>, // 이전 블록들
}

struct IRProgram {
  blocks: Array<IRBasicBlock>,
  functions: Array<IRFunction>,
  globals: Array<IRGlobal>,
}
```

**테스트** (5개):
```
✓ IR instruction creation
✓ Basic block creation
✓ Control flow graph construction
✓ SSA value numbering
✓ Type annotation preservation
```

### Step 2: Statement → IR (Day 2)

```freelang
fn generate_ir_for_statement(stmt: Statement): Array<IRInstruction>

// 예시:
// Input:  let x: i32 = 5 + 3
// Output: [
//   IRInstruction { opcode: ADD, result: "t0", operands: [5, 3] },
//   IRInstruction { opcode: STORE, result: "x", operands: [t0] }
// ]
```

**지원할 Statement**:
1. Let (변수 선언)
2. Return (반환)
3. If (조건)
4. While (루프)
5. For (반복)
6. Expression (표현식)
7. Block (블록)

### Step 3: Expression → 3AC (Day 3)

```freelang
fn generate_ir_for_expression(expr: Expression): Array<IRInstruction>

// 예시:
// Input:  x + y * z
// Output: [
//   IRInstruction { opcode: MUL, result: "t0", operands: [y, z] },
//   IRInstruction { opcode: ADD, result: "t1", operands: [x, t0] }
// ]
```

**생성 규칙**:
```
// 임시 변수 생성
t0 = 1
t1 = t0 + 2
result = t1

// 배열 인덱싱
t0 = arr[i]      // LOAD
arr[i] = value   // STORE

// 함수 호출
t0 = call foo(x, y)

// 조건 분기
if cond goto Label0
```

**테스트** (10개):
```
✓ Binary operation
✓ Unary operation
✓ Array access (read)
✓ Array access (write)
✓ Function call
✓ Literal
✓ Identifier lookup
✓ Expression precedence
✓ Nested expressions
✓ Type preservation
```

---

## Week 6: Control Flow + 검증

### Step 4: CFG 생성 (Day 1-2)

```freelang
struct CFGBuilder {
  blocks: Array<IRBasicBlock>,
  current_block: string,
  block_counter: i32,
}

fn new_cfg_builder(): CFGBuilder
fn create_block(): string
fn add_instruction(block: string, instr: IRInstruction): void
fn add_edge(from: string, to: string): void
fn finalize_cfg(): Array<IRBasicBlock>
```

**If 문 CFG**:
```
Input:
  if cond {
    x = 1
  } else {
    y = 2
  }
  z = 3

Output:
  Block0: BRZ cond Block2
  Block1: x = 1, BR Block3
  Block2: y = 2, BR Block3
  Block3: z = 3
```

**Loop CFG**:
```
Input:
  while i < 10 {
    x = x + 1
    i = i + 1
  }

Output:
  Block0: LABEL "loop_start"
  Block1: i < 10 BRZ "loop_end"
  Block2: x = x + 1
  Block3: i = i + 1, BR "loop_start"
  Block4: LABEL "loop_end"
```

**테스트** (10개):
```
✓ Simple sequence
✓ If-else block
✓ While loop
✓ For loop
✓ Nested blocks
✓ Break/continue
✓ Early return
✓ Block merging (phi nodes)
✓ Cycle detection
✓ Dominance analysis
```

### Step 5: LLVM IR 변환 (Day 2-3)

```freelang
fn ir_to_llvm(program: IRProgram): string

// 예시:
// IR:  t0 = 5; t1 = t0 + 3
// LLVM:
//   %t0 = alloca i32
//   store i32 5, i32* %t0
//   %t0_val = load i32, i32* %t0
//   %t1 = add i32 %t0_val, 3
```

**변환 규칙**:
```
ADD     → add i32 %a, %b
SUB     → sub i32 %a, %b
MUL     → mul i32 %a, %b
DIV     → sdiv i32 %a, %b
LOAD    → load i32, i32* %ptr
STORE   → store i32 %val, i32* %ptr
BR      → br label %block
BRZ     → br i1 %cond, label %then, label %else
CALL    → call i32 @func(i32 %arg)
RET     → ret i32 %val
```

**파일**: `src/compiler/ir-printer.fl` (100줄)

**테스트** (10개):
```
✓ Instruction to LLVM
✓ Function definition
✓ Basic block labeling
✓ Variable allocation
✓ Type annotation
✓ Function calls
✓ Control flow
✓ Memory operations
✓ String constants
✓ Array operations
```

### Step 6: IR 검증 (Day 3)

**파일**: `src/compiler/ir-validator.fl` (150줄)

```freelang
struct IRValidationError {
  error_type: string,
  message: string,
  block: string,
  instruction: i32,
}

fn validate_ir(program: IRProgram): Array<IRValidationError>
```

**검증 규칙**:
```
✓ 모든 변수는 사용 전 정의되어야 함
✓ 분기 타겟 블록이 존재해야 함
✓ 함수 호출의 인수 개수 일치
✓ 반환 타입 일치
✓ 타입 연산 검증 (i32 + i32 등)
✓ 배열 인덱스는 정수여야 함
✓ 중복된 라벨 없음
✓ 모든 경로가 반환하거나 무한 루프
```

**테스트** (5개):
```
✓ Undefined variable detection
✓ Undefined label detection
✓ Type mismatch detection
✓ Unreachable code detection
✓ Valid IR acceptance
```

### Step 7: 기본 최적화 (Day 4)

**파일**: `src/compiler/ir-optimizer.fl` (150줄)

```freelang
fn optimize_ir(program: IRProgram): IRProgram
```

**최적화 패스**:
1. **상수 폴딩** (Constant Folding)
   ```
   t0 = 5 + 3  →  t0 = 8
   ```

2. **데드 코드 제거** (Dead Code Elimination)
   ```
   x = 5       →  (제거, 사용 안 됨)
   y = x + 1
   ```

3. **블록 병합** (Block Merging)
   ```
   Block0 → Block1 (유일한 후계자)
   Block1 → Block2 (유일한 선행자)
   // 병합 가능
   ```

**테스트** (10개):
```
✓ Constant folding (arithmetic)
✓ Constant folding (boolean)
✓ Dead code elimination
✓ Block merging
✓ Redundant instruction removal
✓ Copy propagation
✓ Optimization correctness
✓ Performance improvement
✓ Combined optimizations
✓ Large program optimization
```

---

## 📊 검증 케이스 (50+)

### 기본 연산 (10개)

```
✓ Addition IR generation
✓ Subtraction IR generation
✓ Multiplication IR generation
✓ Division IR generation
✓ Modulo IR generation
✓ Boolean AND IR generation
✓ Boolean OR IR generation
✓ Comparison operations
✓ Negation IR generation
✓ Type-preserving arithmetic
```

### 메모리 연산 (10개)

```
✓ Variable allocation (ALLOCA)
✓ Variable assignment
✓ Array allocation
✓ Array element access (read)
✓ Array element access (write)
✓ Field access
✓ Field assignment
✓ Pointer operations
✓ Memory layout preservation
✓ Lifetime management
```

### 제어 흐름 (10개)

```
✓ Sequence of statements
✓ If statement CFG
✓ If-else statement CFG
✓ While loop CFG
✓ For loop CFG
✓ Break statement
✓ Continue statement
✓ Early return
✓ Nested blocks
✓ Exception handling (try-catch)
```

### 함수 (10개)

```
✓ Function declaration
✓ Function call
✓ Argument passing
✓ Return value
✓ Local variables
✓ Parameter access
✓ Recursive calls
✓ Generic functions
✓ Multiple return paths
✓ Tail calls (optimization)
```

### 통합 (10개)

```
✓ Complete program (100 lines)
✓ Multiple functions
✓ Complex expressions
✓ Nested control flow
✓ Array operations
✓ String handling
✓ Pattern matching
✓ Result/Option types
✓ Generic code
✓ Real-world algorithm
```

---

## 📝 구현 순서

```
Week 5:
  Day 1-2: IR 타입 + Statement → IR
    ├── ir-types.fl (100줄)
    ├── 기본 Statement 변환
    └── 테스트 10개

  Day 3-4: Expression → 3AC
    ├── 모든 Expression 지원
    ├── 임시 변수 생성
    └── 테스트 15개

Week 6:
  Day 1-2: CFG 생성
    ├── CFGBuilder 구현
    ├── 모든 제어 흐름
    └── 테스트 10개

  Day 3: LLVM IR 변환
    ├── ir-printer.fl
    ├── LLVM 문법 생성
    └── 테스트 10개

  Day 4: 검증 + 최적화
    ├── ir-validator.fl
    ├── ir-optimizer.fl
    └── 테스트 10개
```

---

## 🎯 성공 기준

- ✅ 50+ 테스트 통과
- ✅ 100줄 프로그램 IR 생성 가능
- ✅ LLVM 호환성 검증
- ✅ CFG 정확성
- ✅ 최적화 성능 개선 (10%+)
- ✅ 모든 기본 문법 지원

---

## 📂 파일 산출물

```
src/compiler/
├── ir-types.fl (100줄)
├── ir-generator.fl (400줄)
├── ir-validator.fl (150줄)
├── ir-optimizer.fl (150줄)
└── ir-printer.fl (100줄)

src/test/
├── ir-generation-tests.fl (150줄)
├── ir-cfg-tests.fl (100줄)
├── ir-llvm-tests.fl (100줄)
└── ir-optimization-tests.fl (100줄)
```

**총**: 800줄 + 450줄 테스트 = 1250줄

---

## 🔄 의존성 & 협력

**선행 작업**:
- Semantic Analyzer (Week 3-4) ✓ 필수

**병렬 작업**:
- Memory Model Design (Week 3-6) - 주말 점검
- Week 5 금요일: Memory 관련 IR 명령어 정의

**다음 단계**:
- Week 7-8: LLVM Backend (CodeGen Agent)
- Week 9-12: 통합 테스트

---

**준비**: ✅ 시작 가능
**의존성**: Semantic Analyzer (Week 3-4)
**다음**: LLVM Backend (Week 7-8)
