# Memory Model Design

**팀**: Runtime Engineer (Agent 3)
**기간**: Week 3-6 (병렬 with Compiler Agent)
**라인**: ~400줄 FreeLang + 아키텍처 문서
**상태**: 🚀 **시작 가능**

---

## 🎯 목표

**입력**: IR (from IR Generator)
**출력**: Runtime memory management system + malloc/free implementation
**검증**: 30+ 테스트 통과

---

## 🏗️ 메모리 구조

### Week 3: 메모리 레이아웃 설계

```
┌────────────────────────────────────────┐
│         Kernel Space (제외)            │
├────────────────────────────────────────┤
│         Stack (높은 주소)              │
│  ┌─────────────────────────────┐      │
│  │ Local Variables             │      │
│  │ Return Address              │      │
│  │ Function Parameters         │      │
│  └─────────────────────────────┘ ←─── ESP
│          ↓ (grows down)               │
│                                      │
│          ↑ (grows up)                │
│  ┌─────────────────────────────┐     │
│  │ Heap                        │     │
│  │ - malloc'd objects          │     │
│  │ - GC managed memory         │     │
│  │ - Free blocks               │     │
│  └─────────────────────────────┘ ←─── brk
│                                      │
│ Data Segment (초기화된 전역 변수)     │
│                                      │
│ BSS Segment (초기화 안 된 전역)       │
│                                      │
│ Code Segment (읽기 전용)             │
│         (낮은 주소)                  │
└────────────────────────────────────────┘
```

### 파일

**src/compiler/memory-layout.fl** (100줄)

```freelang
struct MemoryLayout {
  stack_base: i64,      // 스택 시작 주소
  stack_size: i64,      // 스택 크기
  heap_base: i64,       // 힙 시작 주소
  heap_size: i64,       // 힙 크기
  code_base: i64,       // 코드 시작
  code_size: i64,       // 코드 크기
}

fn new_memory_layout(): MemoryLayout
fn allocate_stack_frame(size: i32): i64
fn deallocate_stack_frame(size: i32): void
fn get_stack_pointer(): i64
fn get_heap_pointer(): i64
```

**테스트** (5개):
```
✓ Memory layout initialization
✓ Stack frame allocation
✓ Stack frame deallocation
✓ Heap pointer tracking
✓ Memory boundary checks
```

---

## 🏗️ Malloc/Free 구현 (Week 4)

### 메모리 블록 구조

```freelang
struct MemoryBlock {
  size: i64,            // 블록 크기
  allocated: bool,      // 할당 여부
  next_block: i64,      // 다음 블록 주소 (링크)
  prev_block: i64,      // 이전 블록 주소
  magic: i64,           // 보호 값 (0xDEADBEEF)
}

// 메모리 레이아웃:
// [MemoryBlock header] [실제 데이터] [MemoryBlock header] ...
```

### 파일

**src/compiler/malloc-free.fl** (200줄)

```freelang
struct Allocator {
  heap_start: i64,
  heap_end: i64,
  first_block: i64,
  free_list: i64,
}

fn new_allocator(size: i64): Allocator

// malloc: First-Fit 전략
fn malloc(allocator: Allocator, size: i64): i64

// free: 블록 재사용
fn free(allocator: Allocator, ptr: i64): void

// 내부 함수
fn find_free_block(allocator: Allocator, size: i64): i64
fn merge_free_blocks(allocator: Allocator): void
fn check_corruption(block: i64): bool
```

**알고리즘**:

```
malloc(size):
  1. First-Fit으로 충분한 크기의 free 블록 검색
  2. 블록 크기 > size면 분할 (fragmentation 방지)
  3. allocated 플래그 설정
  4. 메모리 반환

free(ptr):
  1. 블록 헤더에서 size 읽음
  2. allocated 플래그 해제
  3. 인접 free 블록과 병합 (coalescing)
  4. 검증 (magic 값 확인)
```

**테스트** (10개):
```
✓ Single allocation
✓ Multiple allocations
✓ Free block
✓ Reuse freed block
✓ Block splitting
✓ Block merging
✓ Memory corruption detection
✓ Allocation failure (out of memory)
✓ Free invalid pointer
✓ Fragmentation handling
```

---

## 🏗️ GC (Mark-and-Sweep) - Week 5-6

### 목표

```freelang
struct GC {
  objects: Array<GCObject>,
  roots: Array<i64>,      // 루트 객체들
  heap: Allocator,
}

struct GCObject {
  ptr: i64,
  size: i64,
  marked: bool,
  type_info: i64,
}

fn garbage_collect(gc: GC): void
```

### 알고리즘

```
Mark Phase:
  1. 모든 루트 객체 마킹
  2. 참조되는 모든 객체 재귀적으로 마킹

Sweep Phase:
  1. 마킹되지 않은 객체 회수
  2. free() 호출로 메모리 반환

Compact (선택사항):
  1. 남은 객체들 정렬
  2. 메모리 단편화 감소
```

**파일**: **src/compiler/gc-manager.fl** (150줄)

```freelang
fn mark_object(gc: GC, obj: i64): void
fn mark_recursive(gc: GC, obj: i64): void
fn sweep(gc: GC): void
fn garbage_collect(gc: GC): void
```

**테스트** (8개):
```
✓ Mark phase
✓ Sweep phase
✓ GC with reachable objects
✓ GC with unreachable objects
✓ GC fragmentation reduction
✓ Multiple GC cycles
✓ Memory recovery
✓ Performance (< 100ms per cycle)
```

---

## 🏗️ 스택 관리 - Week 4-5

### Stack Frame

```freelang
struct StackFrame {
  return_address: i64,
  saved_rbp: i64,         // Previous frame pointer
  local_vars: Array<i64>,
  var_count: i32,
}

fn push_frame(size: i32): i64      // ESP 감소
fn pop_frame(): void               // ESP 증가
fn get_frame_pointer(): i64
fn get_local_var(offset: i32): i64
fn set_local_var(offset: i32, value: i64): void
```

**파일**: **src/compiler/stack-manager.fl** (100줄)

**테스트** (5개):
```
✓ Push stack frame
✓ Pop stack frame
✓ Local variable access
✓ Nested frames
✓ Stack overflow detection
```

---

## 🏗️ 함수 호출 규약 (Calling Convention) - Week 5

**x86-64 System V AMD64 ABI**:

```
Parameter passing:
  rdi, rsi, rdx, rcx, r8, r9 (처음 6개 정수)
  xmm0-xmm7 (처음 8개 float)
  스택 (나머지)

Return value:
  rax (정수)
  rdx:rax (64비트 이상)
  xmm0, xmm1 (float)

Preserved (Callee가 보존):
  rbp, rsp, rbx, r12-r15
```

**파일**: **src/compiler/calling-convention.fl** (100줄)

```freelang
fn setup_call_stack(args: Array<i64>): void
fn prepare_return_value(value: i64): void
fn restore_caller_registers(): void
```

**테스트** (5개):
```
✓ Parameter passing (1 arg)
✓ Parameter passing (6 args)
✓ Parameter passing (stack args)
✓ Return value handling
✓ Register preservation
```

---

## 📊 통합 테스트 (Week 6)

**파일**: **src/test/memory-integration-tests.fl** (100줄)

```freelang
test_memory_integration() {
  // 복합 시나리오
  ✓ Malloc + Free + GC cycle
  ✓ Nested function calls with local vars
  ✓ Array allocation and deallocation
  ✓ Struct allocation and access
  ✓ String storage and GC
  ✓ Memory pressure handling
  ✓ Performance (allocation < 1us)
  ✓ No memory leaks
}
```

---

## 📊 검증 계획

### Week 3 체크포인트
- ✅ Memory layout 설계
- ✅ 메모리 레이아웃 테스트 (5개)
- ✅ 초기 malloc/free 구현

### Week 4 체크포인트
- ✅ Malloc/Free 완성
- ✅ Stack frame 관리
- ✅ 테스트 20개 통과

### Week 5 체크포인트
- ✅ GC 기본 구현
- ✅ Calling convention 정의
- ✅ 통합 테스트 시작

### Week 6 체크포인트
- ✅ GC 완성
- ✅ 통합 테스트 30개 통과
- ✅ 성능 벤치마크 완료

---

## 🎯 성공 기준

- ✅ Malloc/Free: < 1µs allocation latency
- ✅ GC: < 100ms per cycle
- ✅ Memory overhead: < 10%
- ✅ Fragmentation: < 5%
- ✅ 모든 테스트 (30+) 통과
- ✅ No memory leaks

---

## 📂 파일 산출물

```
src/compiler/
├── memory-layout.fl (100줄)
├── malloc-free.fl (200줄)
├── gc-manager.fl (150줄)
├── stack-manager.fl (100줄)
└── calling-convention.fl (100줄)

src/test/
├── memory-layout-tests.fl (30줄)
├── malloc-free-tests.fl (50줄)
├── gc-tests.fl (40줄)
├── stack-tests.fl (30줄)
└── memory-integration-tests.fl (100줄)
```

**총**: 400줄 + 250줄 테스트 = 650줄

---

## 🔄 Compiler Agent와의 협력

**의존성**:
- Week 3-4: Semantic Analyzer와 병렬 (독립적)
- Week 5-6: IR Generator와 협력 (메모리 할당 IR 지원)

**동기화 포인트**:
- Week 5 금요일: IR의 메모리 관련 연산 정의
- Week 6 금요일: 통합 테스트 (IR + 메모리 함께)

---

**준비**: ✅ 시작 가능
**의존성**: 없음 (독립적 설계)
**다음**: Phase 2 (Week 13-24) 메모리 매니저 활용
