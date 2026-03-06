# x86-64 Code Generator 사양서

**팀**: CodeGen Engineer (Agent 2)
**기간**: Week 13-24 (Phase 2, 12주)
**라인**: ~2500줄 FreeLang
**상태**: 🚀 **준비 중 (Week 1-12에 학습)**

---

## 📋 목표

**입력**: LLVM IR (from IR Generator)
**출력**: x86-64 기계어 + ELF 실행파일
**검증**: 100+ 테스트 통과

---

## 🏗️ CodeGen 파이프라인

```
LLVM IR
   ↓
Instruction Selection (IR → x86-64 어셈블리)
   ↓
Register Allocation
   ↓
Instruction Scheduling
   ↓
x86-64 Assembly (.asm)
   ↓
Assembler (→ .o)
   ↓
Linker (→ .elf)
```

---

## 📂 파일 구조 (Phase 2)

```
src/compiler/
├── x86-64-isel.fl (600줄)      // Instruction Selection
├── x86-64-regalloc.fl (400줄)  // Register Allocation
├── x86-64-scheduler.fl (300줄) // Instruction Scheduling
├── x86-64-emitter.fl (300줄)   // Assembly 생성
├── linker-basic.fl (400줄)     // 기본 링커
└── elf-generator.fl (200줄)    // ELF 포맷 생성
```

---

## Week 1-4: 학습 및 설계 (Phase 1 병렬)

### x86-64 아키텍처 기초

```
레지스터:
  rax, rbx, rcx, rdx      (일반용)
  rdi, rsi, rdx, rcx, r8, r9 (함수 인수)
  r10, r11                (임시)
  r12-r15                 (보존)
  rsp                     (스택 포인터)
  rbp                     (베이스 포인터)
  rip                     (명령어 포인터)

명령어:
  mov dst, src     (이동)
  add dst, src     (더하기)
  sub dst, src     (빼기)
  imul dst, src    (곱하기)
  idiv dst         (나누기)
  cmp op1, op2     (비교)
  jmp label        (무조건 점프)
  je label         (같으면 점프)
  jne label        (다르면 점프)
  push reg         (스택 푸시)
  pop reg          (스택 팝)
  call func        (함수 호출)
  ret              (반환)
```

**학습 자료 작성** (Week 1-2):
- x86-64 명령어 레퍼런스 (100줄)
- 호출 규약 문서 (50줄)
- 레지스터 할당 알고리즘 (30줄)

---

## Week 5-12: Instruction Selection 설계

### IR → x86-64 변환 규칙

```
LLVM IR              x86-64 Assembly

add i32 %a, %b      mov rax, [%a_addr]
                    add rax, [%b_addr]
                    mov [result_addr], rax

mul i32 %a, %b      mov rax, [%a_addr]
                    imul rax, [%b_addr]
                    mov [result_addr], rax

load i32, ptr       mov rax, [ptr]
                    mov [dest], rax

store i32, ptr      mov rax, [src]
                    mov [ptr], rax

br label             jmp label

br i1 cond, %then, %else
                    cmp %cond, 0
                    jne %then
                    jmp %else
```

**파일 작성 계획** (Week 5-12):

**src/compiler/x86-64-isel.fl** (600줄)

```freelang
struct x86_64_ISel {
  ir_program: IRProgram,
  asm_code: Array<string>,
  labels: Map<string, i64>,
}

fn new_isel(ir: IRProgram): x86_64_ISel
fn select_instruction(instr: IRInstruction): Array<string>
fn emit_asm(isel: x86_64_ISel): string
```

**테스트**:
```
✓ ADD instruction selection
✓ SUB instruction selection
✓ MUL instruction selection
✓ DIV instruction selection
✓ MOD instruction selection
✓ Memory load/store
✓ Comparison
✓ Branch generation
✓ Function call generation
✓ Return instruction generation
```

---

## Week 9-12: Register Allocation

### 레지스터 할당 알고리즘 (Linear Scan)

```
1. IR에서 모든 변수의 라이프타임 계산
2. 선형 스캔으로 레지스터 할당
3. Spill (메모리로 내보내기) 처리
4. 스택 프레임 설정

예:
  t0 = 5        // rax 할당
  t1 = 10       // rbx 할당
  t2 = t0 + t1  // rcx 할당
  ...
  if spill 필요:
    mov [rsp - 8], rcx  (t2를 스택에 저장)
    ...
    mov rcx, [rsp - 8]  (스택에서 복원)
```

**파일 작성 계획**:

**src/compiler/x86-64-regalloc.fl** (400줄)

```freelang
struct Liveness {
  variable: string,
  first_use: i32,
  last_use: i32,
}

struct RegisterAllocator {
  ir_program: IRProgram,
  register_map: Map<string, string>,  // var → register
  spill_map: Map<string, i64>,        // var → stack offset
  available_regs: Array<string>,
}

fn calculate_liveness(prog: IRProgram): Array<Liveness>
fn allocate_registers(regalloc: RegisterAllocator): void
fn handle_spills(): Array<string>
```

**테스트**:
```
✓ Liveness calculation
✓ Register assignment
✓ Spill generation
✓ Spill reload
✓ Register pressure handling
✓ Callee-save register preservation
✓ No register conflicts
✓ Optimal allocation
```

---

## 전체 일정 (Phase 2)

### Week 13-20: 기본 x86-64 코드생성

```
Week 13-14:
  ├── Instruction Selection 기초
  ├── 산술 연산 (ADD, SUB, MUL, DIV)
  ├── 메모리 연산 (LOAD, STORE)
  └── 테스트 20개

Week 15-16:
  ├── Register Allocation
  ├── Spill handling
  ├── 함수 프롤로그/에필로그
  └── 테스트 15개

Week 17-20:
  ├── 제어 흐름 (JMP, JEQ, JNE)
  ├── 함수 호출 (CALL, RET)
  ├── Instruction Scheduling (선택사항)
  └── 테스트 30개
```

### Week 21-24: 링커 + 최적화

```
Week 21-22:
  ├── ELF 파일 포맷 생성
  ├── 기본 링커 (심볼 해석)
  ├── 동적 링킹
  └── 테스트 15개

Week 23-24:
  ├── 통합 테스트 (100줄 프로그램)
  ├── 성능 최적화
  ├── 문서화
  └── 테스트 20개
```

---

## 📊 마일스톤

### Week 13 체크포인트
- ✅ x86-64 명령어 레퍼런스 완료
- ✅ Instruction Selection 기초
- ✅ 산술 연산 어셈블리 생성

### Week 16 체크포인트
- ✅ Register Allocation 완료
- ✅ 함수 프롤로그/에필로그
- ✅ 기본 프로그램 실행 가능

### Week 20 체크포인트
- ✅ 모든 기본 명령어 지원
- ✅ 함수 호출 동작
- ✅ 1000줄 프로그램 컴파일 가능

### Week 24 체크포인트
- ✅ 링커 완성
- ✅ ELF 실행파일 생성
- ✅ 독립 프로그램 실행 가능

---

## 🎯 성능 목표 (Phase 2)

```
Rust 대비 성능:
  - Week 16: 30배 이내 (기초만)
  - Week 20: 10배 이내 (최적화)
  - Week 24: 5배 이내 (완성)
```

---

## 📚 학습 리소스 (Week 1-12)

**필독서**:
1. AMD x86-64 Architecture Manual (Chapter 1-3)
2. System V AMD64 ABI (함수 호출 규약)
3. ELF 파일 포맷 스펙
4. LLVM IR 레퍼런스

**실습**:
1. x86-64 어셈블리 기초 (NASM)
2. 간단한 프로그램 컴파일 및 실행
3. GDB 디버깅 실습
4. objdump로 기계어 분석

---

## 📂 파일 산출물 (Phase 2)

```
src/compiler/
├── x86-64-isel.fl (600줄)
├── x86-64-regalloc.fl (400줄)
├── x86-64-scheduler.fl (300줄)  // 선택
├── x86-64-emitter.fl (300줄)
├── linker-basic.fl (400줄)
├── elf-generator.fl (200줄)
└── codegen-optimizer.fl (300줄)

src/test/
├── isel-tests.fl (100줄)
├── regalloc-tests.fl (80줄)
├── linker-tests.fl (80줄)
├── codegen-integration-tests.fl (200줄)
└── performance-tests.fl (100줄)

Docs/
├── x86-64-instruction-ref.md (100줄)
├── calling-convention.md (50줄)
├── elf-format.md (100줄)
└── linker-design.md (100줄)
```

**총**: 2500줄 + 600줄 테스트 = 3100줄

---

## 🚀 즉시 시작 가능한 작업 (Week 1-12)

**Week 1-2**: x86-64 기초 학습
- 명령어 세트 학습
- 호출 규약 이해
- 간단한 어셈블리 코딩

**Week 3-4**: 문서 작성
- x86-64 명령어 레퍼런스 (100줄)
- ISel 규칙 정의 (200줄)
- 레지스터 할당 알고리즘 (100줄)

**Week 5-6**: 설계 완성
- x86-64-isel.fl 구조 설계
- 레지스터 할당 알고리즘 상세 설계
- ELF 링커 설계

**Week 7-8**: 테스트 케이스 작성
- 50+ 단위 테스트 설계
- 통합 테스트 케이스
- 성능 벤치마크 설계

**Week 9-12**: 초기 구현
- x86-64-isel.fl 스켈레톤
- x86-64-regalloc.fl 스켈레톤
- 기본 명령어 선택 구현

---

## 🔄 다른 Agent와의 협력

**Compiler Agent (Agent 1)**:
- Week 12까지: Semantic → IR 완성
- Week 13: CodeGen 시작 전 IR 최종 검증

**Runtime Agent (Agent 3)**:
- Week 6까지: Memory Model 설계
- Week 13: 메모리 할당 연동 테스트

**Optimizer Agent (Agent 4)**:
- Week 16부터: x86-64 레벨 최적화 시작

---

**준비**: 🚀 **즉시 시작 가능 (학습 + 설계)**
**의존성**: IR Generator (Week 6) → Instruction Selection (Week 13)
**다음**: Phase 3 (Week 25-32) Bootloader + Kernel
