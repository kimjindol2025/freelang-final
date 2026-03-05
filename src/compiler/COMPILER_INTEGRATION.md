# FreeLang Self-Hosting Compiler - 통합 문서

**작성일**: 2026-03-06
**버전**: v1.0
**담당자**: Agent-3 (통합 담당), Agent-1 (Lexer/Parser), Agent-2 (의미분석/IR)

---

## 목차

1. [아키텍처](#아키텍처)
2. [파이프라인](#파이프라인)
3. [파일 구조](#파일-구조)
4. [통합 점](#통합-점)
5. [테스트 계획](#테스트-계획)
6. [다음 단계](#다음-단계)

---

## 아키텍처

### 컴파일 파이프라인

```
Source Code
    ↓
[Lexer (JavaScript)]      ← Agent-1 담당
    ↓ tokens
[Parser (JavaScript)]     ← Agent-1 담당
    ↓ AST
[Semantic Analyzer (FreeLang)]  ← Agent-2, Agent-3 통합
    ↓ Verified AST
[IR Generator (FreeLang)]       ← Agent-2, Agent-3 통합
    ↓ IR Instructions
[Instruction Selector (FreeLang)] ← Agent-2, Agent-3 통합
    ↓ x86-64 Assembly
Output
```

### 모듈 책임

| 모듈 | 담당자 | 언어 | 상태 | 역할 |
|------|--------|------|------|------|
| **ast.fl** | Agent-3 | FreeLang | ✅ 완성 | AST 노드 정의 및 생성 |
| **compiler.fl** | Agent-3 | FreeLang | ✅ 완성 | 파이프라인 통합 & 진입점 |
| **semantic-analyzer.fl** | Agent-2 | FreeLang | ✅ 정제 | 타입 검사 & 변수 검증 |
| **ir-generator.fl** | Agent-2 | FreeLang | ✅ 정제 | AST → IR 변환 |
| **x86-64-isel.fl** | Agent-2 | FreeLang | ✅ 정제 | IR → x86-64 변환 |
| **type-system.fl** | Agent-2/3 | FreeLang | ✅ 정제 | 타입 정의 & 검사 |
| **symbol-table.fl** | Agent-2 | FreeLang | ✅ 정제 | 스코프 & 심볼 관리 |
| **ir-types.fl** | Agent-2 | FreeLang | ✅ 정제 | IR 타입 & 구조 |
| **lexer.js** | Agent-1 | JavaScript | ✅ 기존 | 토큰 생성 |
| **parser.js** | Agent-1 | JavaScript | ✅ 기존 | AST 생성 |

---

## 파이프라인

### Step 1-2: Lexing & Parsing (JavaScript)

**입력**: 소스 코드 (문자열)
**출력**: AST (JavaScript 객체)

**구현**:
- `lexer.js`: `tokenize()` → 토큰 배열
- `parser.js`: `parse()` → AST

**FreeLang 매핑**:
```
JavaScript AST → FreeLang AST (ast.fl)
- FunctionDeclaration → FunctionDeclaration struct
- VariableDeclaration → VariableDeclaration struct
- BinaryExpression → BinaryOp struct
- etc.
```

### Step 3: Semantic Analysis (FreeLang)

**입력**: AST
**출력**: Verified AST + 에러 보고

**구현** (`semantic-analyzer.fl`):
```freelang
fn analyze_program(analyzer: SemanticAnalyzer, ast: Program): bool
  - 각 statement/declaration 검증
  - 타입 호환성 확인
  - 중복 선언 감지
  - 에러 수집
```

**핵심 함수**:
- `check_variable_declaration()` - 변수 선언 검증
- `check_variable_use()` - 변수 사용 검증
- `check_function_call()` - 함수 호출 검증
- `check_type_compatibility()` - 타입 호환성 확인

### Step 4: IR Generation (FreeLang)

**입력**: AST
**출력**: IR Instructions (중간 코드)

**구현** (`ir-generator.fl`):
```freelang
fn generate_ir_from_ast(gen: IRGenerator, ast: Program): void
  - AST 각 노드를 IR instruction으로 변환
  - 기본 블록(Basic Block) 관리
  - 임시 변수 생성
```

**IR Opcodes**:
- 산술: ADD, SUB, MUL, DIV, MOD
- 메모리: LOAD, STORE, ALLOCA
- 제어: BR, BRZ, LABEL, RET
- 함수: CALL, PHI

### Step 5: Instruction Selection (FreeLang)

**입력**: IR Instructions
**출력**: x86-64 Assembly

**구현** (`x86-64-isel.fl`):
```freelang
fn select_ir_instruction(isel: InstructionSelector, instr: IRInstruction): void
  - IR instruction → x86-64 instruction 변환
  - 레지스터 할당 (간단한 round-robin)
  - 어셈블리 코드 생성
```

**x86-64 Opcodes**:
- MOV, ADD, SUB, IMUL, IDIV, CMP, JMP, JE, JNE
- PUSH, POP, CALL, RET, LEA

---

## 파일 구조

### 신규 생성 파일

#### 1. `/src/compiler/ast.fl` (281줄)

**목적**: AST 노드 타입 정의
**내용**:
- `ASTNode` 베이스 구조
- Literals: NumberLiteral, StringLiteral, BooleanLiteral, ArrayLiteral
- Expressions: Identifier, BinaryOp, UnaryOp, Assignment, CallExpression
- Statements: ExpressionStatement, BlockStatement, IfStatement, WhileStatement, etc.
- Declarations: VariableDeclaration, FunctionDeclaration, StructDeclaration
- Program (최상위)

**핵심 함수**:
- `new_*()` 헬퍼: 각 AST 노드 생성
- `node_type_to_string()` - 디버깅 출력
- `test_ast()` - 단위 테스트

#### 2. `/src/compiler/compiler.fl` (471줄)

**목적**: 컴파일 파이프라인 통합
**내용**:
- `compile()` - 공개 API (기본 설정)
- `compile_with_config()` - 커스텀 설정 컴파일
- `CompilerConfig` - 컴파일 옵션
- `CompileResult` - 결과 구조
- `CompilerState` - 파이프라인 상태 관리

**핵심 함수**:
```freelang
fn compile(source_code: string): CompileResult
  // 6단계 파이프라인 실행
  1. Lexing (JavaScript)
  2. Parsing (JavaScript)
  3. Semantic Analysis
  4. IR Generation
  5. Instruction Selection
  6. Assembly Output

fn main()
  // 3가지 테스트 케이스
```

### 정제된 파일 (기존 + 호환성 개선)

#### 1. `/src/compiler/semantic-analyzer.fl`

**변경 사항**:
- 헤더 주석 업데이트: "AST 호환 버전"
- 기존 구조/함수 유지
- Compiler와의 통합점 명시

#### 2. `/src/compiler/ir-generator.fl`

**변경 사항**:
- 헤더 주석 업데이트: "AST 호환 버전"
- 기존 구조/함수 유지
- 경로: `semantic-analyzer.fl` → `ir-generator.fl`

#### 3. `/src/compiler/x86-64-isel.fl`

**변경 사항**:
- 헤더 주석 업데이트: "Compiler 통합"
- 기존 구조/함수 유지
- 경로: `ir-generator.fl` → `x86-64-isel.fl`

#### 4. `/src/compiler/type-system.fl`

**변경 사항**:
- 헤더 주석: "Compiler와 통합"
- 기존 함수 유지 (호환성)

#### 5. `/src/compiler/symbol-table.fl`

**변경 사항**:
- 헤더 주석: "Compiler 호환"
- 기존 구조/함수 유지

#### 6. `/src/compiler/ir-types.fl`

**변경 사항**:
- 헤더 주석: "Compiler 통합"
- 기존 구조 유지

---

## 통합 점

### 1. AST 생성 (Lexer/Parser → compiler.fl)

**현재 상태**:
- JavaScript Parser.parse()가 JavaScript AST 생성
- FreeLang에서는 `parse_source()` 함수가 이를 FreeLang AST로 매핑

**매핑 로직**:
```
JavaScript AST          FreeLang AST
─────────────────────────────────────
FunctionDeclaration  →  FunctionDeclaration (ast.fl)
VariableDeclaration  →  VariableDeclaration
BinaryExpression     →  BinaryOp
Identifier           →  Identifier
Literal              →  NumberLiteral/StringLiteral
BlockStatement       →  BlockStatement
...
```

### 2. 의미분석 (compiler.fl → semantic-analyzer.fl)

**호출**:
```freelang
state.analyzer = new_analyzer()
let sem_ok = analyze_program(state.analyzer, state.ast)
```

**결과 처리**:
```freelang
if !sem_ok {
  result.error_count = state.analyzer.errors.length()
  // 에러 메시지 수집
}
```

### 3. IR 생성 (compiler.fl → ir-generator.fl)

**호출**:
```freelang
state.ir_gen = new_ir_generator()
generate_ir_from_ast(state.ir_gen, state.ast)
```

**결과 처리**:
```freelang
if config.emit_ir {
  result.ir_code = ir_to_string(state.ir_gen.program)
}
```

### 4. 명령어 선택 (compiler.fl → x86-64-isel.fl)

**호출**:
```freelang
state.isel = new_isel(state.ir_gen.program)
select_all_instructions(state.isel)
```

**결과 처리**:
```freelang
if config.emit_asm {
  result.output = generate_asm(state.isel)
}
```

---

## 테스트 계획

### 단위 테스트

**각 모듈별** `test_*()` 함수 (기존 유지):
- `test_ast()` (ast.fl) - AST 노드 생성 테스트
- `test_semantic_analyzer()` (semantic-analyzer.fl) - 의미분석 테스트
- `test_ir_generator()` (ir-generator.fl) - IR 생성 테스트
- `test_isel()` (x86-64-isel.fl) - 명령어 선택 테스트

**실행**:
```bash
# 각 파일 개별 실행
freelang src/compiler/ast.fl
freelang src/compiler/semantic-analyzer.fl
freelang src/compiler/ir-generator.fl
freelang src/compiler/x86-64-isel.fl
```

### 통합 테스트

**compiler.fl의 main()** - 3가지 테스트 케이스:

1. **기본 변수 선언**
   ```
   Input:  "let x = 5;"
   Output: x86-64 assembly (ALLOCA + MOV)
   ```

2. **함수 정의**
   ```
   Input:  "fn add(x: i32, y: i32): i32 { return x + y; }"
   Output: x86-64 assembly (프롤로그 + 연산 + RET)
   ```

3. **복합 프로그램**
   ```
   Input:  "let x = 10; if x > 5 { println(x); }"
   Output: x86-64 assembly (분기 포함)
   ```

**실행**:
```bash
# 전체 파이프라인 테스트
freelang src/compiler/compiler.fl
```

### 검증 기준

| 테스트 | 성공 기준 |
|--------|----------|
| AST 생성 | 노드 타입 정확성 |
| 의미분석 | 에러 감지 정확성 |
| IR 생성 | Basic Block 구조 정확성 |
| 명령어 선택 | x86-64 opcode 정확성 |
| 어셈블리 생성 | 구문 유효성 (어셈블러로 검증 가능) |

---

## 다음 단계

### Phase 2: 고급 기능

1. **레지스터 할당 개선** (x86-64-regalloc.fl)
   - 현재: 간단한 round-robin
   - 목표: 그래프 기반 색칠 알고리즘

2. **최적화 패스**
   - 데드 코드 제거
   - 상수 폴딩
   - 루프 언롤링

3. **링킹 지원** (linker-basic.fl)
   - 여러 소스 파일 연결
   - 외부 라이브러리 링크

4. **런타임 지원**
   - 표준 라이브러리 (stdlib)
   - 메모리 관리
   - 예외 처리

### Phase 3: 추가 언어 기능

1. **고급 타입**
   - Generics<T>
   - Union types
   - Traits/Interfaces

2. **에러 처리**
   - try/catch/finally
   - 에러 타입 시스템

3. **모듈 시스템**
   - import/export
   - 네임스페이스

---

## 빌드 및 실행

### 요구사항

- FreeLang 런타임 (v2.0+)
- Node.js (Lexer/Parser의 JavaScript 부분)

### 빌드

```bash
# 단일 파일로 컴파일 (선택적)
freelang --compile src/compiler/compiler.fl -o compiler

# 또는 직접 실행
freelang src/compiler/compiler.fl
```

### 사용 예

```freelang
// 프로그램 컴파일
fn main(): void {
  let config: CompilerConfig
  config.emit_ir = true
  config.emit_asm = true
  config.optimize_level = 1
  config.debug = true

  let source = "let x = 42; println(x);"
  let result = compile_with_config(source, config)

  if result.success {
    println("Assembly output:")
    println(result.output)
  } else {
    println("Compilation error:")
    for msg in result.messages {
      println("  " + msg)
    }
  }
}
```

---

## 참고 자료

- AST 정의: `/src/compiler/ast.fl`
- 의미분석: `/src/compiler/semantic-analyzer.fl`
- IR 명세: `/src/compiler/ir-generator.fl`, `/src/compiler/ir-types.fl`
- x86-64: `/src/compiler/x86-64-isel.fl`

---

**상태**: ✅ Phase 1 완성
**다음 리뷰**: 2026-03-07
