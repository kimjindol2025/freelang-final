# Semantic Analyzer 구현 사양서

**팀**: Compiler Agent
**기간**: Week 3-4 (2주)
**라인**: ~600줄 FreeLang
**상태**: 🚀 **시작 가능**

---

## 📋 목표

**입력**: AST (from Parser)
**출력**: Type-checked AST + Symbol Table + Error List
**검증**: 50+ 테스트 통과

---

## 🏗️ 아키텍처

```
Type-checked AST
      ↑
SemanticAnalyzer.analyze(ast)
      ↑
AST (from Parser)
```

### 인터페이스

```freelang
struct TypeCheckResult {
  success: bool,
  ast: AST,                 // Type annotation 추가됨
  symbol_table: SymbolTable,
  errors: Array<Diagnostic>,
  warnings: Array<string>,
}

fn analyze_semantics(ast: AST): TypeCheckResult
```

---

## 🎯 구현 단계

### Step 1: 타입 시스템 (Day 1)

**파일**: `src/compiler/type-system.fl`

```freelang
enum PrimitiveType {
  I32 = 0,
  I64 = 1,
  F64 = 2,
  STRING = 3,
  BOOL = 4,
  VOID = 5,
}

struct Type {
  kind: i32,  // PrimitiveType
  is_array: bool,
  element_type: Type,  // for array
  generic_params: Array<Type>,
}

fn type_equal(t1: Type, t2: Type): bool
fn type_to_string(t: Type): string
```

**테스트**:
```freelang
✓ type_equal(I32, I32) == true
✓ type_equal(I32, STRING) == false
✓ Array<I32> element type == I32
```

### Step 2: Symbol Table 연동 (Day 1-2)

**파일**: `src/compiler/semantic-analyzer.fl`

```freelang
struct SemanticAnalyzer {
  symbol_table: SymbolTable,
  current_scope: i32,
  errors: Array<Diagnostic>,
  ast: AST,
}

fn new_analyzer(): SemanticAnalyzer
fn analyze(analyzer: SemanticAnalyzer, ast: AST): TypeCheckResult
```

### Step 3: Statement 검증 (Day 2-3)

**구현할 규칙**:

1. **Let 문**: 변수 선언 및 초기화
   ```
   let x: i32 = 5      ✓
   let x: i32 = "str"  ✗ (type mismatch)
   ```

2. **Return 문**: 반환 타입 검증
   ```
   fn foo(): i32 { return 5 }      ✓
   fn foo(): i32 { return "str" }  ✗
   ```

3. **If 문**: 조건 타입 검증
   ```
   if true { ... }     ✓
   if 5 { ... }        ✗ (non-bool condition)
   ```

4. **While 문**: 조건 타입 검증
   ```
   while true { ... }  ✓
   while "str" { ... } ✗
   ```

5. **For 문**: 반복자 타입 검증
   ```
   for x in [1,2,3] { ... }  ✓
   for x in 5 { ... }        ✗ (not iterable)
   ```

### Step 4: Expression 검증 (Day 3-4)

**구현할 규칙**:

1. **Identifier**: 변수 사용 전 선언
   ```
   let x = 5
   println(x)   ✓
   println(y)   ✗ (undefined variable)
   ```

2. **Binary Op**: 연산자 타입 검증
   ```
   5 + 3        ✓ (i32 + i32)
   5 + "str"    ✗ (type mismatch)
   true && false ✓ (bool && bool)
   5 && 3       ✗ (i32 && i32, need bool)
   ```

3. **Call**: 함수 호출 검증
   ```
   fn foo(x: i32): i32 { x }
   foo(5)       ✓
   foo("str")   ✗ (argument type mismatch)
   foo(1, 2)    ✗ (too many arguments)
   ```

4. **Array Access**: 인덱스 타입 검증
   ```
   let arr = [1, 2, 3]
   arr[0]       ✓
   arr["str"]   ✗ (non-integer index)
   ```

5. **Field Access**: 필드 존재 검증
   ```
   let p = Point { x: 3, y: 4 }
   p.x          ✓
   p.z          ✗ (undefined field)
   ```

### Step 5: 에러 리포팅 (Day 4)

```freelang
enum SemanticError {
  UNDEFINED_VARIABLE = 0,
  UNDEFINED_FUNCTION = 1,
  TYPE_MISMATCH = 2,
  UNDEFINED_FIELD = 3,
  WRONG_ARGUMENT_COUNT = 4,
  WRONG_ARGUMENT_TYPE = 5,
  INVALID_RETURN_TYPE = 6,
  INVALID_CONDITION_TYPE = 7,
  NON_ITERABLE = 8,
}

struct Diagnostic {
  error: SemanticError,
  message: string,
  line: i32,
  col: i32,
  context: string,
}
```

**에러 메시지 예시**:
```
Error: undefined variable 'x' at line 5, col 3
Error: type mismatch - expected i32, got string at line 10, col 10
Error: function 'foo' expects 2 arguments, got 1 at line 15
```

---

## 📊 검증 케이스 (50+)

### 기본 타입 검증 (10개)

```freelang
test_basic_types() {
  ✓ i32 literal
  ✓ f64 literal
  ✓ string literal
  ✓ bool literal
  ✓ void return
  ✓ array type
  ✓ generic type
  ✓ function type
  ✓ Result type
  ✓ Option type
}
```

### 변수 스코프 검증 (10개)

```freelang
test_variable_scope() {
  ✓ global variable declaration
  ✓ local variable declaration
  ✓ variable use before declaration error
  ✓ variable shadowing (inner scope)
  ✓ variable access after scope exit error
  ✓ parameter as variable
  ✓ function local variable
  ✓ nested block variable
  ✓ loop variable scope
  ✓ duplicate declaration error
}
```

### 함수 검증 (10개)

```freelang
test_function_checks() {
  ✓ function declaration
  ✓ function return type
  ✓ function call with correct args
  ✓ function call with wrong arg count
  ✓ function call with wrong arg type
  ✓ function parameter type
  ✓ function redeclaration error
  ✓ function undefined error
  ✓ recursive function
  ✓ generic function
}
```

### 식(Expression) 검증 (10개)

```freelang
test_expression_checks() {
  ✓ binary operator type checking
  ✓ unary operator type checking
  ✓ array literal type
  ✓ array indexing
  ✓ array index type (must be integer)
  ✓ field access
  ✓ field access undefined field error
  ✓ method call
  ✓ type conversion
  ✓ operator precedence
}
```

### 제어 흐름 검증 (10개)

```freelang
test_control_flow_checks() {
  ✓ if condition type (must be bool)
  ✓ if-else type unification
  ✓ while condition type (must be bool)
  ✓ for iterable type (must be array)
  ✓ break/continue in loop
  ✓ break/continue outside loop error
  ✓ return type in function
  ✓ unreachable code detection
  ✓ exhaustive match
  ✓ match arm type unification
}
```

---

## 📝 구현 순서

```
Day 1 (4시간)
  ├── type-system.fl 작성 (100줄)
  ├── Type equality 구현
  └── 테스트 5개 작성

Day 2 (4시간)
  ├── SemanticAnalyzer 기초
  ├── Statement 검증 기본
  └── 테스트 10개 작성

Day 3 (4시간)
  ├── Expression 검증
  ├── 타입 불일치 감지
  └── 테스트 20개 작성

Day 4 (4시간)
  ├── 에러 리포팅 완성
  ├── 모든 에러 메시지
  └── 통합 테스트 15개 작성
```

---

## 🎯 성공 기준

- ✅ 50+ 테스트 통과
- ✅ 모든 기본 타입 지원
- ✅ 에러 감지 100% 정확
- ✅ 스코프 처리 완벽
- ✅ 명확한 에러 메시지

---

## 📂 파일 산출물

```
src/compiler/
├── type-system.fl (100줄)
├── semantic-analyzer.fl (400줄)
└── semantic-tests.fl (100줄)
```

---

**준비**: ✅ 시작 가능
**의존성**: symbol-table.fl ✓
**다음**: IR Generator (Week 5-6)
