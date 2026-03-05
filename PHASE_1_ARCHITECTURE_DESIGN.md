# Phase 1: 컴파일러 기초 아키텍처 설계

**팀장**: Claude (Haiku 4.5)
**에이전트**: Compiler Engineer (주), Runtime Engineer (협력)
**기간**: Week 1-2
**상태**: 🚀 시작 (2026-03-06)

---

## 📋 Executive Summary

FreeLang v2-freelang-ai (Minimal AST) 기반 컴파일러 구축.

**목표**: FreeLang 소스코드 → LLVM IR → x86-64 기계어

```
Phase 1 흐름:
┌──────────────┐
│ FreeLang 소스 │  (test.fl)
└──────┬───────┘
       │
       ↓
┌──────────────────────────────┐
│ Lexer (기존 - 사용함)          │
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│ Parser (기존 - 개선 필요)      │
│ - AST 생성                    │
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│ Semantic Analyzer (신규)      │  ← Phase 1 핵심
│ - 변수 타입 확인              │
│ - 함수 시그니처 검증          │
│ - 스코프 관리                 │
│ - 타입 불일치 감지           │
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│ IR Generator (신규)           │  ← Phase 1 핵심
│ - 3-주소 코드                 │
│ - 기본 블록                   │
│ - 제어 흐름 그래프            │
│ - LLVM IR 변환               │
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│ LLVM (외부 - C++ 라이브러리) │
│ - IR 최적화                   │
│ - 코드 생성                   │
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│ x86-64 기계어                │  (Phase 2)
└──────────────────────────────┘
```

---

## 🏗️ 아키텍처 핵심 결정사항

### 1. AST 선택: Minimal AST (기존)

**파일**: `/home/kimjin/Desktop/kim/v2-freelang-ai/src/parser/ast.ts`

**현황**:
```typescript
// 기존 MinimalFunctionAST
interface MinimalFunctionAST {
  name: string;
  params: { name: string; type: string }[];
  body: Statement[];
  returnType: string;
  typeParams?: { name: string }[];  // Phase 1: Generic 지원 추가됨
}

// 기존 Statement 타입
type Statement =
  | { kind: "let"; name: string; type?: string; value: Expr }
  | { kind: "return"; value?: Expr }
  | { kind: "if"; condition: Expr; then: Statement[]; else?: Statement[] }
  | { kind: "while"; condition: Expr; body: Statement[] }
  | { kind: "for"; variable: string; iterable: Expr; body: Statement[] }
  | ...

// 기존 Expr 타입
type Expr =
  | { kind: "literal"; type: string; value: any }
  | { kind: "ident"; name: string }
  | { kind: "call"; callee: Expr; args: Expr[] }
  | { kind: "binary"; left: Expr; op: string; right: Expr }
  | { kind: "unary"; op: string; operand: Expr }
  | ...
```

**개선 필요**:
- [ ] Phase I (try-catch-finally) AST 형식 이미 추가됨 ✓
- [ ] Phase J (async-await) AST 형식 추가 ✓
- [x] struct 정의 및 필드 접근 (구현 중)
- [x] 메서드 호출 (`obj.method()`) 지원 필요

---

### 2. 의미분석기 전략

**목표**: 타입 안정성, 변수 스코프 검증

#### 2-1. 심볼 테이블 (Symbol Table)

```typescript
// semantic-analyzer.fl
interface SymbolEntry {
  name: string;
  kind: "variable" | "function" | "type";
  type: string;              // i32, string, fn(...) -> ...
  scope: number;             // 0=global, 1=function, 2+=nested
  defined: boolean;
  line: number;
}

class SymbolTable {
  private scopes: Map<number, SymbolEntry[]> = new Map();
  private currentScope: number = 0;

  declare(name: string, kind: string, type: string): void
  lookup(name: string): SymbolEntry | null
  enterScope(): void
  exitScope(): void
}
```

#### 2-2. 타입 검증

**지원 타입** (Phase 1):
```
Primitive:  i32, i64, f64, string, bool, void
Composite:  array<T>, Result<T,E>, Option<T>
Function:   fn(i32, string): bool
Generic:    T, U, V (type parameters)
```

**검증 규칙**:
1. 변수 사용 전 선언 확인
2. 함수 호출 인수 타입 일치
3. return 문 반환 타입 일치
4. 배열 인덱싱 정수 확인
5. 연산자 오버로딩 검증

#### 2-3. 에러 처리

```typescript
enum SemanticError {
  UNDEFINED_VARIABLE = "undefined variable",
  TYPE_MISMATCH = "type mismatch",
  UNDEFINED_FUNCTION = "undefined function",
  WRONG_ARGUMENT_COUNT = "wrong argument count",
  UNDEFINED_FIELD = "undefined field",
}

interface Diagnostic {
  error: SemanticError;
  message: string;
  line: number;
  col: number;
  context: string;
}
```

---

### 3. IR (중간 표현) 설계

**목표**: 플랫폼 독립적, LLVM 호환

#### 3-1. 3-주소 코드 (3AC: Three-Address Code)

```
// 입력:
x = y + z * w

// 3AC:
t1 = z * w
t2 = y + t1
x = t2
```

#### 3-2. 기본 블록 (Basic Block)

```
정의: 분기점 없이 순차 실행되는 명령어 집합
특징:
- 입구: 한 점 (첫 문장)
- 출구: 최대 2개 경로 (조건분기 or 무조건분기)
- 흐름: 명확한 선후관계

예시:
┌─────────────┐
│   Block 0   │
│ x = 5       │
│ y = x + 3   │
│ if y > 10   │ ← 분기점
└──┬─────┬────┘
   │     │
   ↓     ↓
┌──────┐ ┌──────┐
│Block1│ │Block2│
│return│ │return│
└──────┘ └──────┘
```

#### 3-3. IR 명령어 집합 (과제 단순화)

```
// 산술 연산
BINOP: t0 = t1 + t2
UNOP:  t0 = -t1

// 메모리
LOAD:  t0 = x[t1]
STORE: x[t1] = t0

// 제어 흐름
BR:    goto L0
BRZ:   if t0 == 0 goto L0
LABEL: L0:
CALL:  t0 = foo(t1, t2)
RET:   return t0

// 함수 진입/퇴출
ENTER: (스택 프레임 설정)
LEAVE: (스택 해제)
```

#### 3-4. LLVM IR 변환

**목표**: IR → LLVM 문법

```llvm
; 입력 (우리 IR):
t0 = 5
t1 = x + t0
if t1 > 10 goto L0
return t1

; 출력 (LLVM IR):
define i32 @main() {
entry:
  %t0 = alloca i32
  store i32 5, i32* %t0
  %x_val = load i32, i32* @x
  %t1 = add i32 %x_val, 5
  %cond = icmp sgt i32 %t1, 10
  br i1 %cond, label %L0, label %L1
L0:
  ret i32 %t1
L1:
  ...
}
```

---

## 📂 파일 구조 및 구현 계획

### Phase 1 새로 생성할 파일

```
/home/kimjin/Desktop/kim/freelang-final/
├── src/
│   ├── compiler/
│   │   ├── semantic-analyzer.fl      (Week 3-4, 600줄)
│   │   ├── symbol-table.fl           (Week 2, 200줄)
│   │   ├── ir-generator.fl           (Week 5-6, 800줄)
│   │   ├── ir-validator.fl           (Week 7, 200줄)
│   │   └── llvm-bindings.fl          (Week 8, 300줄)
│   ├── test/
│   │   ├── test-framework.fl         (Week 1, 300줄)
│   │   ├── semantic-tests.fl         (Week 4, 400줄)
│   │   ├── ir-tests.fl               (Week 6, 400줄)
│   │   └── integration-tests.fl      (Week 8, 500줄)
│   └── benchmark/
│       ├── perf-suite.fl             (Week 9, 200줄)
│       └── memory-profiler.fl        (Week 10, 150줄)
│
├── docs/
│   ├── PHASE_1_ARCHITECTURE_DESIGN.md (이 파일)
│   ├── SEMANTIC_ANALYZER_SPEC.md
│   ├── IR_SPEC.md
│   └── LLVM_INTEGRATION_GUIDE.md
│
└── Makefile                          (Week 1, 100줄)
```

---

## 🔗 의존성 맵핑

### 외부 의존성

```
1. LLVM C API (llvm-c)
   - 버전: 14.0 이상
   - 헤더: llvm-c/Core.h, llvm-c/Target.h
   - 바인딩: FreeLang FFI 사용
   - 상태: Week 8에 POC (추후 확인 필요)

2. 표준 라이브러리 (FreeLang)
   - stdlib.fl (배열, 맵, 문자열)
   - 상태: ✓ 이미 사용 중

3. Git/Gogs (버전 관리)
   - 상태: ✓ 기존 인프라 활용
```

### 내부 의존성

```
Parser (기존)
  ↓
Lexer (기존)
  ↓
AST (기존 + 확장)
  ↓
Semantic Analyzer (신규, Week 2-4)
  ↓
  ├─→ Symbol Table (신규, Week 1-2)
  └─→ Type Checker (신규, Week 3)
  ↓
IR Generator (신규, Week 5-7)
  ├─→ 3-Address Code (신규, Week 5)
  ├─→ Basic Block Builder (신규, Week 6)
  └─→ CFG (Control Flow Graph) (신규, Week 6)
  ↓
LLVM Backend (신규, Week 8)
  └─→ LLVM IR Emitter (신규, Week 8)
```

---

## ✅ Phase 1 체크리스트

### Week 1-2: 기초 설정

- [ ] 이 아키텍처 문서 작성 ✓
- [ ] Makefile 작성 (FreeLang 빌드)
- [ ] 테스트 프레임워크 구축 (test-framework.fl)
- [ ] CI/CD 파이프라인 설정
- [ ] 성능 벤치마크 기준선 설정

### Week 3-4: 의미분석기

- [ ] Symbol Table 구현
- [ ] 변수 선언 추적
- [ ] 함수 시그니처 검증
- [ ] 타입 체크 규칙 (10+ 규칙)
- [ ] 에러 메시지 생성
- [ ] 50개 단위 테스트

### Week 5-6: IR 생성

- [ ] 3-주소 코드 변환
- [ ] 기본 블록 빌더
- [ ] 제어 흐름 그래프
- [ ] 100줄 프로그램 컴파일
- [ ] 50개 단위 테스트

### Week 7-8: LLVM 통합

- [ ] LLVM C API 바인딩
- [ ] IR → LLVM 변환
- [ ] 최적화 옵션 설정
- [ ] 통합 테스트 20개
- [ ] 성능 벤치마크 실행

### Week 9-12: 검증 및 개선

- [ ] 전체 통합 테스트
- [ ] 성능 개선 (목표: Rust 대비 30배)
- [ ] 문서화 완성
- [ ] 다음 Phase 준비

---

## 📊 성공 기준 (Phase 1 완료)

| 기준 | 목표 | 검증 방법 |
|------|------|----------|
| 의미분석 | 300개 테스트 통과 | 자동 테스트 |
| IR 생성 | 100줄 프로그램 컴파일 | 수동 테스트 |
| LLVM 통합 | 기계어 생성 성공 | objdump 확인 |
| 성능 | Rust 대비 30배 이내 | benchmark.fl |
| 코드 품질 | 80%+ 테스트 커버리지 | lcov |
| 문서 | 모든 모듈 문서화 | README 검수 |

---

## 🚀 시작 방법

### 1단계: 저장소 구조 초기화

```bash
mkdir -p src/compiler src/test src/benchmark docs

# Makefile 작성
cat > Makefile << 'EOF'
# FreeLang Compiler Phase 1 Makefile
.PHONY: build test benchmark clean

build:
	@echo "🔨 Building Phase 1 compiler..."
	# FreeLang 인터프리터로 컴파일 (추후 구현)

test:
	@echo "🧪 Running tests..."
	# test-framework.fl 실행

benchmark:
	@echo "📊 Running benchmarks..."
	# perf-suite.fl 실행

clean:
	rm -rf build/ *.o *.elf
EOF
```

### 2단계: 테스트 프레임워크 시작

**test-framework.fl** 작성 (Week 1):
- assert 함수
- describe/it 문법
- 테스트 결과 리포팅
- (상세 내용은 별도 파일)

### 3단계: Symbol Table 구현

**symbol-table.fl** 작성 (Week 2):
- SymbolEntry 타입
- SymbolTable 클래스
- scope 관리
- (상세 내용은 별도 파일)

### 4단계: Semantic Analyzer

**semantic-analyzer.fl** 작성 (Week 3-4):
- AST 방문자 패턴
- 타입 체크 규칙
- 에러 리포팅
- (상세 내용은 별도 파일)

---

## ⚠️ 위험 요소 및 대응

| 위험 | 확률 | 대응 |
|------|------|------|
| LLVM 바인딩 복잡 | 높음 | Week 8 조기 POC 진행 |
| 타입 시스템 설계 변경 | 중간 | Week 3 설계 리뷰 실시 |
| 성능 미달 | 중간 | Week 5에 최적화 계획 수정 |
| 테스트 자동화 어려움 | 낮음 | 표준 프레임워크 사용 |

---

## 📞 주간 체크포인트

**매주 금요일 검증**:

```markdown
## Week X 리포트

### 완료
- [ ] ...

### 진행 중
- [ ] ...

### 블로커
- ...

### 다음주 계획
- ...

### 코드 통계
- 작성: XXX줄
- 테스트: YYY개
- 버그: Z개
```

---

**문서 작성**: 2026-03-06
**팀장**: Claude (Haiku 4.5)
**상태**: 🚀 Phase 1 Week 1-2 시작 중

다음 문서: `SEMANTIC_ANALYZER_SPEC.md` (Week 2)
