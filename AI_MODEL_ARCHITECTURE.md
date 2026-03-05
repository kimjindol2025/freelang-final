# 🧠 AI 모델 아키텍처 설계
## Neural Network for Compiler Optimization

**목표**: FreeLang IR을 분석하여 최적 기계어 생성 규칙을 예측하는 신경망

---

## 1. 모델 구조 (Model Architecture)

### 1.1 선택된 모델: Hybrid CNN-LSTM

```
입력: IR 벡터화 (1000차원)
    ↓
┌─────────────────────────────────┐
│ Convolutional Block (특징 추출)  │
├─────────────────────────────────┤
│ Conv1D(128, kernel=3) + ReLU   │
│ Conv1D(128, kernel=3) + ReLU   │
│ MaxPool1D(2)                    │
│ Dropout(0.2)                    │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ LSTM Block (순차 의존성 학습)    │
├─────────────────────────────────┤
│ LSTM(64 units)                  │
│ LSTM(64 units)                  │
│ Dropout(0.3)                    │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ Dense Block (최종 분류)          │
├─────────────────────────────────┤
│ Dense(128) + ReLU               │
│ Dropout(0.3)                    │
│ Dense(64) + ReLU                │
│ Dropout(0.2)                    │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 출력층 (2개)                     │
├─────────────────────────────────┤
│ 1. 최적화 규칙 (10 클래스)       │
│    softmax 활성화               │
│ 2. 신뢰도 점수 (1개)             │
│    sigmoid 활성화 [0,1]          │
└─────────────────────────────────┘
```

### 1.2 계층별 세부 설정

```python
# PyTorch 구현 예시

import torch
import torch.nn as nn

class CompilerOptimizer(nn.Module):
    def __init__(self, input_dim=1000, num_optimizations=10):
        super().__init__()

        # Convolutional Block
        self.conv1 = nn.Conv1d(1, 128, kernel_size=3, padding=1)
        self.conv2 = nn.Conv1d(128, 128, kernel_size=3, padding=1)
        self.pool = nn.MaxPool1d(2)
        self.dropout1 = nn.Dropout(0.2)

        # LSTM Block
        self.lstm1 = nn.LSTM(128, 64, batch_first=True, bidirectional=True)
        self.lstm2 = nn.LSTM(128, 64, batch_first=True)
        self.dropout2 = nn.Dropout(0.3)

        # Dense Block
        self.fc1 = nn.Linear(64, 128)
        self.fc2 = nn.Linear(128, 64)
        self.dropout3 = nn.Dropout(0.3)
        self.dropout4 = nn.Dropout(0.2)

        # Output layers
        self.optimization_output = nn.Linear(64, num_optimizations)
        self.confidence_output = nn.Linear(64, 1)

    def forward(self, x):
        # Conv block
        x = torch.relu(self.conv1(x))
        x = torch.relu(self.conv2(x))
        x = self.pool(x)
        x = self.dropout1(x)

        # Reshape for LSTM
        x = x.transpose(1, 2)  # (batch, time, channels)

        # LSTM block
        x, _ = self.lstm1(x)
        x, _ = self.lstm2(x)
        x = self.dropout2(x)

        # Take last output
        x = x[:, -1, :]

        # Dense block
        x = torch.relu(self.fc1(x))
        x = self.dropout3(x)
        x = torch.relu(self.fc2(x))
        x = self.dropout4(x)

        # Output
        optimization = self.optimization_output(x)  # (batch, 10)
        confidence = torch.sigmoid(self.confidence_output(x))  # (batch, 1)

        return optimization, confidence
```

---

## 2. 입력 특성화 (Input Featurization)

### 2.1 IR 벡터화 방법

```
IR (Intermediate Representation)
    ↓
┌─────────────────────────────────────────────┐
│ 1. IR 구조 분석                            │
│   - 기본 블록(Basic Block) 수              │
│   - 루프 깊이 & 강도                       │
│   - 함수 호출 그래프                       │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ 2. 정적 특성 추출 (50차원)                 │
│   - 명령어 분포 (ADD, MUL, LOAD 등)       │
│   - 메모리 접근 패턴                       │
│   - 제어 흐름 복잡도                       │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ 3. 동적 특성 추출 (300차원)                │
│   - 루프 반복 횟수                         │
│   - 메모리 할당 크기                       │
│   - 데이터 접근 패턴                       │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ 4. 학습된 특성 (650차원)                   │
│   - 사전학습된 CodeBERT 임베딩             │
│   - 자동 특성 추출                         │
└─────────────────────────────────────────────┘
    ↓
벡터 결합: 50 + 300 + 650 = 1000차원
```

### 2.2 특성 정의 (Feature Definition)

```python
def extract_ir_features(ir_code):
    """
    IR 코드를 1000차원 벡터로 변환
    """
    features = {}

    # 정적 특성 (Static Features)
    features['num_basic_blocks'] = count_basic_blocks(ir_code)
    features['loop_depth'] = analyze_loop_depth(ir_code)
    features['loop_trip_count'] = estimate_trip_count(ir_code)

    # 명령어 분포
    features['instr_add'] = count_instruction(ir_code, 'ADD')
    features['instr_mul'] = count_instruction(ir_code, 'MUL')
    features['instr_load'] = count_instruction(ir_code, 'LOAD')
    features['instr_store'] = count_instruction(ir_code, 'STORE')

    # 메모리 특성
    features['memory_accesses'] = count_memory_accesses(ir_code)
    features['cache_line_reuse'] = analyze_cache_reuse(ir_code)
    features['stride_pattern'] = analyze_stride(ir_code)

    # 제어 흐름
    features['cyclomatic_complexity'] = calculate_cyclomatic(ir_code)
    features['branch_count'] = count_branches(ir_code)

    # 정규화 (0~1)
    normalized_features = normalize(features)

    # 1000차원 벡터로 변환
    feature_vector = convert_to_vector(normalized_features, dim=1000)

    return feature_vector
```

---

## 3. 출력 공간 (Output Space)

### 3.1 최적화 규칙 분류 (10 클래스)

```python
OPTIMIZATION_CLASSES = {
    0: "NO_OPTIMIZATION",           # 최적화 불필요
    1: "LOOP_UNROLL_2X",            # 루프 전개 2배
    2: "LOOP_UNROLL_4X",            # 루프 전개 4배
    3: "LOOP_UNROLL_8X",            # 루프 전개 8배
    4: "LOOP_VECTORIZATION",        # 루프 벡터화 (SIMD)
    5: "CONSTANT_FOLDING",          # 상수 폴딩
    6: "DEAD_CODE_ELIMINATION",     # 불필요 코드 제거
    7: "LOOP_TILING",               # 루프 타일링
    8: "FUNCTION_INLINING",         # 함수 인라인
    9: "MEMORY_PREFETCH"            # 메모리 프리페치
}

# 출력:
optimization_logits = model(input_vector)  # (batch, 10)
optimization_probs = softmax(optimization_logits)  # (batch, 10)
best_optimization = argmax(optimization_probs)  # (batch,)
```

### 3.2 신뢰도 점수 (Confidence Score)

```
신뢰도 = AI가 선택한 최적화의 정확도 확률

범위: [0, 1]
0.0: 완전히 확신 없음
0.5: 50% 확신
1.0: 100% 확신

손실함수에서 신뢰도와 실제 성능 개선을 연결:
    reward = improvement_rate × confidence^2

예:
    - 30% 개선, 0.8 신뢰도 → reward = 0.30 × 0.64 = 0.192
    - 30% 개선, 0.5 신뢰도 → reward = 0.30 × 0.25 = 0.075
```

---

## 4. 학습 전략 (Training Strategy)

### 4.1 손실함수 (Loss Function)

```python
def compute_loss(optimization_output, confidence_output, actual_improvement):
    """
    다중 작업 손실함수

    L_total = L_classification + λ₁ × L_confidence + λ₂ × L_reinforcement
    """

    # 1. 분류 손실 (Cross-Entropy)
    L_classification = cross_entropy_loss(
        optimization_output,
        ground_truth_optimization
    )

    # 2. 신뢰도 손실 (MSE)
    L_confidence = mse_loss(
        confidence_output,
        actual_confidence  # 실제 정확도
    )

    # 3. 강화학습 손실 (Policy Gradient)
    improvement_rate = (baseline - actual) / baseline
    advantage = improvement_rate - expected_improvement

    L_reinforcement = -log(confidence_output) × advantage

    # 최종 손실
    L_total = L_classification + 0.5 × L_confidence + 0.3 × L_reinforcement

    return L_total
```

### 4.2 훈련 루프

```python
def train_epoch(model, train_loader, optimizer, scheduler):
    """
    한 에포크 훈련
    """
    total_loss = 0.0

    for batch_idx, (ir_vectors, labels, improvements) in enumerate(train_loader):
        # Forward pass
        optimization_pred, confidence_pred = model(ir_vectors)

        # Loss computation
        loss = compute_loss(
            optimization_pred,
            confidence_pred,
            improvements
        )

        # Backward pass
        optimizer.zero_grad()
        loss.backward()

        # Gradient clipping (안정성)
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

        # Optimization step
        optimizer.step()

        total_loss += loss.item()

        if batch_idx % 100 == 0:
            print(f"Epoch {epoch}, Batch {batch_idx}: Loss = {loss.item():.4f}")

    # Learning rate scheduling
    scheduler.step()

    return total_loss / len(train_loader)
```

### 4.3 학습 스케줄

```
Phase 2 (Week 3-5): 초기 학습
    - 학습률: 0.001
    - 배치 크기: 32
    - 에포크: 50
    - 데이터: 50,000개

Phase 2 (Week 6-8): 미세 튜닝
    - 학습률: 0.0001
    - 배치 크기: 16
    - 에포크: 20
    - 데이터: 500,000개
    - 강화학습 가중치 증가

기대 효과:
    - 초기: 65% 정확도
    - 중기: 78% 정확도
    - 최종: 85% 정확도
```

---

## 5. 평가 지표 (Evaluation Metrics)

### 5.1 분류 성능

```python
# 정확도 (Accuracy)
accuracy = (correct_predictions / total_predictions) × 100

# 정밀도 & 재현율 (Precision & Recall)
precision = TP / (TP + FP)
recall = TP / (TP + FN)

# F1 점수
f1 = 2 × (precision × recall) / (precision + recall)

# 혼동 행렬 (Confusion Matrix)
confusion_matrix[i][j] = "클래스 i가 클래스 j로 예측된 횟수"
```

### 5.2 최적화 성능

```python
# 성능 개선 (Performance Improvement)
improvement = (baseline_cycles - optimized_cycles) / baseline_cycles

# 신뢰도 정확도 (Confidence Calibration)
expected_accuracy = mean(confidence_scores)
actual_accuracy = (correct_predictions / total) × 100
calibration_error = |expected_accuracy - actual_accuracy|

# 종합 점수 (Composite Score)
score = accuracy × 0.4 + improvement × 0.4 + (1 - calibration_error) × 0.2
```

---

## 6. 실시간 피드백 루프 (Real-time Feedback Loop)

### 6.1 온라인 학습 (Online Learning)

```
새로운 코드 입력
    ↓
AI가 최적화 제안
    ↓
컴파일 및 실행
    ↓
성능 측정
    ↓
모델 즉시 피드백
    ↓
가중치 업데이트
    ↓
다음 코드에 적용

장점:
    - 실시간 개선
    - 최신 코드 패턴 학습
    - 적응형 최적화
```

### 6.2 구현

```python
def online_learning_step(model, ir_vector, improvement_achieved):
    """
    한 개의 코드에 대한 온라인 학습 단계
    """
    # Forward
    optimization_pred, confidence_pred = model(ir_vector)

    # Loss with actual improvement
    loss = compute_loss(
        optimization_pred,
        confidence_pred,
        improvement_achieved
    )

    # Backprop with small learning rate
    optimizer.zero_grad()
    loss.backward()

    # 작은 학습률로 업데이트 (과적합 방지)
    for param in model.parameters():
        param.data -= 0.00001 * param.grad

    return loss.item()
```

---

## 7. 모델 검증 (Model Validation)

### 7.1 검증 전략

```
훈련 데이터 (70%): 350,000개
검증 데이터 (15%): 75,000개
테스트 데이터 (15%): 75,000개

검증 체크:
□ 훈련/검증 손실이 균형있게 감소하는가?
□ 과적합 신호가 있는가? (훈련 손실 << 검증 손실)
□ 정확도가 지속적으로 향상되는가?
```

### 7.2 조기 중단 (Early Stopping)

```python
def should_stop_training(val_losses, patience=10):
    """
    검증 손실이 개선되지 않으면 훈련 중단
    """
    if len(val_losses) < patience:
        return False

    recent_losses = val_losses[-patience:]
    best_loss = min(recent_losses)

    if recent_losses[-1] > best_loss × 1.01:
        return True

    return False
```

---

## 8. 배포 준비 (Deployment Preparation)

### 8.1 모델 최적화

```
원본 모델 (훈련용)
    ↓
양자화 (Quantization)
    - float32 → int8
    - 크기: 90% 감소
    - 속도: 3-5배 향상
    ↓
프루닝 (Pruning)
    - 불필요한 가중치 제거
    - 크기: 추가 50% 감소
    ↓
증류 (Distillation)
    - 큰 모델 → 작은 모델
    - 성능 유지, 크기 축소
    ↓
배포 모델 (실행용)
```

### 8.2 통합 인터페이스

```python
class AICompilerOptimizer:
    def __init__(self, model_path):
        self.model = load_model(model_path)
        self.model.eval()

    def optimize(self, ir_code):
        """
        IR 코드에 대한 최적화 규칙 제시
        """
        # Featurize
        ir_vector = extract_ir_features(ir_code)

        # Predict
        with torch.no_grad():
            optimization, confidence = self.model(ir_vector)

        # Get best optimization
        opt_idx = torch.argmax(optimization)
        opt_name = OPTIMIZATION_CLASSES[opt_idx.item()]
        confidence_score = confidence.item()

        return {
            'optimization': opt_name,
            'confidence': confidence_score,
            'expected_improvement': self.estimate_improvement(ir_code, opt_name)
        }
```

---

## 9. Phase 2-8 마일스톤

```
Week 3-4: 초기 모델 훈련 (50,000 데이터)
    ├─ 기본 정확도: 65%
    ├─ 성능 개선: 15%
    └─ 신뢰도 정확도: 70%

Week 5-6: 확장 훈련 (300,000 데이터)
    ├─ 정확도: 78%
    ├─ 성능 개선: 28%
    └─ 신뢰도 정확도: 82%

Week 7-8: 미세 튜닝 (500,000 데이터)
    ├─ 정확도: 85%
    ├─ 성능 개선: 35%
    └─ 신뢰도 정확도: 88%

Week 9-12: 컴파일러 통합 & 검증
    ├─ 실제 성능 측정
    ├─ 에너지 효율 분석
    └─ 배포 최적화
```

---

**AI 모델 아키텍처 설계 완료**

다음: REINFORCEMENT_LEARNING_STRATEGY.md (강화학습 전략)
