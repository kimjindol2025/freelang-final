# 📊 합성 데이터 생성 전략
## FreeLang AI Compiler - Learning Dataset Pipeline

**목표**: 1000개 테스트 코드 → 500,000개 학습 데이터셋으로 확장

---

## Phase 1 Week 2-3: 합성 데이터 생성

### 1. 데이터 소스

```
freelang-final/tests/*.js (1006개 테스트)
    ├── test-runner.js (5개)
    ├── lexer-tests.js (148개)
    ├── parser-tests.js (106개)
    ├── semantic-tests.js (42개)
    ├── control-flow-tests.js (88개)
    ├── function-tests.js (80개)
    ├── array-tests.js (120개)
    ├── stdlib-tests.js (200개)
    ├── integration-tests.js (100개)
    └── advanced-tests.js (117개)

Total: 1006개 테스트 코드
Average: ~50 라인/테스트
Total LOC: ~50,000 라인
```

### 2. 합성 전략 (Code Mutation Strategy)

#### 2.1 변이 유형 (Mutation Types)

```javascript
// Mutation Type 1: 루프 강도 변경 (Loop Intensity)
변이전:
    for i in [1..100] {
        x += arr[i]
    }

변이후 (강도 2):
    for i in [1..100, 2] {
        x += arr[i]
        x += arr[i+1]
    }

변이후 (강도 4):
    for i in [1..100, 4] {
        x += arr[i]
        x += arr[i+1]
        x += arr[i+2]
        x += arr[i+3]
    }

// Mutation Type 2: 상수 값 변경 (Constant Variation)
변이전:
    let size = 100
    for i in [1..size] { ... }

변이후:
    let size = 50    // 작은 크기
    let size = 200   // 중간 크기
    let size = 10000 // 큰 크기

// Mutation Type 3: 배열 크기 변경 (Array Dimension)
변이전:
    let arr = [1, 2, 3, ..., 100]  // 1D

변이후:
    let arr = [[1,2,..,10], [11,12,..,20], ...]  // 2D
    let arr = [[[...]]]  // 3D

// Mutation Type 4: 데이터 타입 변경 (Type Variation)
변이전:
    let x: i32 = 10

변이후:
    let x: i64 = 10  // 큰 정수
    let x: f64 = 10.0  // 실수

// Mutation Type 5: 변수명 변경 (Variable Renaming)
변이전:
    for i in range(0, n) {
        sum = sum + arr[i]
    }

변이후:
    for index in range(0, n) {
        total = total + data[index]
    }

// Mutation Type 6: 명령어 순서 변경 (Instruction Reorder)
변이전:
    x = 10
    y = 20
    z = x + y

변이후:
    y = 20
    x = 10
    z = x + y
    // 의존성 관계 유지하면서 순서 변경

// Mutation Type 7: 중첩 깊이 변경 (Nesting Depth)
변이전:
    if a {
        if b {
            x = 1
        }
    }

변이후:
    if (a && b) {
        x = 1
    }
    // 또는
    if a { if b { if c { x = 1 } } }  // 더 깊게
```

#### 2.2 변이 강도 및 빈도

| 변이 유형 | 강도 | 생성 비율 | 합계 |
|----------|------|---------|------|
| 루프 강도 | 1,2,4,8,16 | 25% | 1000 × 0.25 |
| 상수 값 | 작음/중간/큼 | 20% | 1000 × 0.20 |
| 배열 차원 | 1D/2D/3D | 15% | 1000 × 0.15 |
| 데이터 타입 | i32/i64/f64 | 15% | 1000 × 0.15 |
| 변수명 | 1~3개 변경 | 10% | 1000 × 0.10 |
| 명령어 순서 | 1~5개 순서 변경 | 10% | 1000 × 0.10 |
| 중첩 깊이 | 단순화/심화 | 5% | 1000 × 0.05 |

### 3. 생성 규모 계획

```
Phase 1 (Week 1-2):
    기본 테스트: 1006개
    × 변이 유형: 7가지
    = 7,042개 기본 데이터

Phase 2 (Week 3-5):
    기본 데이터: 7,042개
    × 조합 변이: 70개 조합
    = 493,000개 합성 데이터

Phase 3 (Week 6-8):
    누적: 500,000개
    + 동적 생성: 500,000개
    = 1,000,000개 학습 데이터
```

### 4. 성능 레이블링 (Performance Labeling)

#### 4.1 측정 메트릭

```javascript
// 각 코드에 대해 측정할 메트릭

interface PerformanceMetrics {
    // 기본 메트릭
    cycle_count: number,           // CPU 사이클 수
    execution_time_ns: number,     // 나노초 단위 실행 시간

    // 메모리 메트릭
    memory_accesses: number,       // 메모리 접근 횟수
    cache_misses: number,          // 캐시 미스 횟수
    cache_hit_rate: float,         // 캐시 히트율 (%)
    memory_bandwidth_mb_s: float,  // 메모리 대역폭

    // CPU 메트릭
    instructions_executed: number, // 실행된 명령어 수
    cpu_utilization: float,        // CPU 활용률 (%)
    ipc: float,                    // IPC (Instruction Per Cycle)

    // 에너지 메트릭
    energy_consumption_mj: float,  // 에너지 소비 (밀리줄)
    thermal_load: float,           // 열 부하 (%)

    // 컴파일러 메트릭
    compilation_time_ms: float,    // 컴파일 시간
    binary_size_bytes: number,     // 바이너리 크기
    code_density: float            // 코드 밀도 (명령어/바이트)
}
```

#### 4.2 레이블링 파이프라인

```
1. 코드 컴파일
   FreeLang 소스 → 기계어

2. 성능 프로파일링
   perf 또는 QEMU 사용
   실행 시간 & 리소스 측정

3. 정규화 (Normalization)
   범위: [0, 1]로 정규화
   기준선(baseline)에 대한 상대 성능

4. 레이블 생성
   코드 ID + 메트릭 → JSON
```

#### 4.3 레이블 예시

```json
{
    "code_id": "test_0042_mutation_3",
    "original_test": "array-tests.js",
    "mutation_type": "loop_unroll",
    "mutation_strength": 4,
    "metrics": {
        "cycle_count": 1650,
        "memory_accesses": 400,
        "cache_hit_rate": 0.95,
        "ipc": 1.8,
        "energy_consumption_mj": 2.3,
        "binary_size_bytes": 512,
        "compilation_time_ms": 45
    },
    "performance_label": {
        "category": "high_performance",
        "percentile": 85,
        "score": 0.85,
        "vs_baseline": 0.34  // 34% 개선
    }
}
```

### 5. 구현 인프라

#### 5.1 필요한 도구

```
Python 환경:
    - numpy: 벡터 연산
    - pandas: 데이터 관리
    - scikit-learn: 정규화
    - matplotlib: 시각화

성능 측정:
    - Intel VTune (프로파일링)
    - perf (Linux 성능)
    - QEMU (에뮬레이션)

데이터 관리:
    - HDF5: 대규모 데이터 저장
    - JSON: 메타데이터
    - CSV: 분석용
```

#### 5.2 파일 구조

```
freelang-final/
├── PHASE_1_AI_COMPILER_DESIGN.md
├── SYNTHETIC_DATA_GENERATION.md (현재)
├── data/
│   ├── raw/
│   │   └── original_tests/ (1006개 테스트 코드)
│   ├── synthetic/
│   │   ├── mutations/ (변이된 코드)
│   │   ├── labels/ (성능 레이블)
│   │   └── dataset.hdf5 (통합 데이터셋)
│   └── analysis/
│       ├── distribution.json
│       └── statistics.csv
├── scripts/
│   ├── synthetic_data_generator.py
│   ├── performance_labeler.py
│   ├── dataset_analyzer.py
│   └── train_ai_model.py
└── models/
    ├── ai_optimizer.pth (학습된 모델)
    └── model_config.json
```

### 6. 품질 보증 (Quality Assurance)

#### 6.1 검증 체크리스트

```
□ 모든 합성 데이터가 유효한 FreeLang 구문인가?
□ 원본과 합성 데이터의 프로그램 의미는 동일한가?
□ 레이블의 성능 메트릭이 일관성 있는가?
□ 데이터 분포가 정상적인가?
□ 이상치(outlier)가 있는가?
□ 충분한 다양성이 있는가?
```

#### 6.2 검증 방법

```python
# 합성 데이터 검증

def validate_synthetic_code(original_code, synthetic_code):
    """
    합성 코드가 유효한지 검증
    """
    # 1. 구문 검증
    try:
        ast = parse(synthetic_code)
        assert ast is not None
    except:
        return False, "Syntax Error"

    # 2. 시맨틱 검증
    try:
        semantic_check(ast)
    except:
        return False, "Semantic Error"

    # 3. 의미 보존 검증
    orig_result = execute(original_code, test_input)
    synth_result = execute(synthetic_code, test_input)

    if orig_result != synth_result:
        return False, "Semantic Drift"

    return True, "Valid"
```

---

## 🎯 Phase 1 산출물 (주차별)

### Week 1 (진행 중)
- [x] AI 컴파일러 설계 문서
- [x] 합성 데이터 생성 전략
- [ ] 데이터 추출 스크립트
- [ ] 초기 50,000개 데이터 생성

### Week 2-3
- [ ] 500,000개 합성 데이터 생성 완료
- [ ] 성능 레이블링 완료
- [ ] 데이터 분석 & 가시화
- [ ] AI 모델 학습 데이터셋 준비

---

## 📊 기대 효과

```
기존 컴파일러:
    - 고정된 최적화 규칙
    - 모든 코드에 동일 적용
    - 특정 패턴만 최적화 가능

AI 컴파일러:
    - 500,000개 코드로부터 학습
    - 각 코드의 특성에 맞게 최적화
    - 미지의 패턴도 최적화 가능

기대 개선:
    - 성능: 20~40% 향상
    - 에너지: 15~30% 절감
    - 바이너리 크기: 10~20% 축소
```

---

**Phase 1 Week 2 시작 예정**

다음: AI_MODEL_ARCHITECTURE.md (신경망 설계)
