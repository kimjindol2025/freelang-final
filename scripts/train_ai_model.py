#!/usr/bin/env python3
"""
FreeLang AI Compiler Optimizer - Model Training
Hybrid CNN-LSTM for Compiler Optimization

Phase 2 Week 5-8: AI 모델 학습
"""

import json
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import os
from datetime import datetime

# ============================================
# 1. Dataset 클래스
# ============================================

class CompilerOptimizationDataset(Dataset):
    """컴파일러 최적화 데이터셋"""

    def __init__(self, labeled_data_file: str, split: str = 'train'):
        """
        Args:
            labeled_data_file: 레이블된 데이터 파일
            split: 'train', 'val', 'test'
        """
        self.data = []
        self.load_data(labeled_data_file, split)

    def load_data(self, file_path: str, split: str):
        """데이터 로드"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                all_data = json.load(f)

            # Train/Val/Test 분할 (70/15/15)
            n = len(all_data)
            train_size = int(n * 0.7)
            val_size = int(n * 0.15)

            if split == 'train':
                self.data = all_data[:train_size]
            elif split == 'val':
                self.data = all_data[train_size:train_size + val_size]
            else:  # test
                self.data = all_data[train_size + val_size:]

            print(f"✅ {split.upper()}: {len(self.data)}개 샘플 로드")

        except FileNotFoundError:
            print(f"❌ 파일 없음: {file_path}")

    def extract_features(self, variant_code: str) -> np.ndarray:
        """
        코드를 1000차원 벡터로 변환
        (실제로는 CodeBERT 임베딩 사용)
        """
        # 간단한 특성 추출 (데모 버전)
        features = []

        # 1. 코드 길이 (정규화)
        features.append(len(variant_code) / 10000)

        # 2. 명령어 분포
        instructions = ['for', 'if', 'while', 'let', 'return', 'function']
        for instr in instructions:
            count = variant_code.lower().count(instr)
            features.append(count / max(1, len(variant_code) / 100))

        # 3. 메모리 접근 패턴
        memory_ops = ['arr', 'obj', 'data']
        for op in memory_ops:
            count = variant_code.lower().count(op)
            features.append(count / max(1, len(variant_code) / 100))

        # 4. 제어 흐름 복잡도
        branch_count = variant_code.count('if') + variant_code.count('while')
        features.append(branch_count / max(1, len(variant_code) / 100))

        # 5. 루프 깊이 추정
        max_depth = 0
        current_depth = 0
        for char in variant_code:
            if char == '{':
                current_depth += 1
                max_depth = max(max_depth, current_depth)
            elif char == '}':
                current_depth -= 1
        features.append(max_depth / 10)

        # 벡터 길이 고정 (1000차원)
        vector = np.array(features[:50])  # 처음 50개 특성
        # 나머지는 0으로 패딩
        vector = np.pad(vector, (0, 1000 - len(vector)), mode='constant')

        return vector[:1000]  # 정확히 1000차원

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        """데이터셋 아이템 반환"""
        sample = self.data[idx]

        # 입력: 코드 벡터
        code_vector = self.extract_features(sample['variant']['variant_code'])

        # 출력: 최적화 규칙 (10가지 분류)
        optimization_map = {
            'NO_OPTIMIZATION': 0,
            'LOOP_UNROLL_2X': 1,
            'LOOP_UNROLL_4X': 2,
            'LOOP_UNROLL_8X': 3,
            'LOOP_VECTORIZATION': 4,
            'CONSTANT_FOLDING': 5,
            'DEAD_CODE_ELIMINATION': 6,
            'LOOP_TILING': 7,
            'FUNCTION_INLINING': 8,
            'MEMORY_PREFETCH': 9
        }

        # 변이 타입을 최적화 규칙으로 매핑
        mutation_to_opt = {
            'loop_unroll': 2,  # LOOP_UNROLL_4X (기본값)
            'constant_variation': 5,  # CONSTANT_FOLDING
            'variable_rename': 0,  # NO_OPTIMIZATION
            'data_type_variation': 5,  # CONSTANT_FOLDING
            'instruction_reorder': 1,  # LOOP_UNROLL_2X
            'nesting_depth': 7,  # LOOP_TILING
        }

        mutation_type = sample['variant']['mutation_type']
        opt_label = mutation_to_opt.get(mutation_type, 0)

        # 신뢰도 점수
        confidence = sample['improvement']['confidence_score']

        return {
            'code_vector': torch.FloatTensor(code_vector),
            'optimization_label': torch.LongTensor([opt_label]),
            'confidence_label': torch.FloatTensor([confidence]),
            'improvement': torch.FloatTensor([sample['improvement']['improvement_percentage'] / 100])
        }


# ============================================
# 2. 신경망 모델
# ============================================

class CompilerOptimizer(nn.Module):
    """Hybrid CNN-LSTM 신경망"""

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

        self.relu = nn.ReLU()

    def forward(self, x):
        # x: (batch, 1000)
        x = x.unsqueeze(1)  # (batch, 1, 1000)

        # Conv block
        x = self.relu(self.conv1(x))
        x = self.relu(self.conv2(x))
        x = self.pool(x)  # (batch, 128, 500)
        x = self.dropout1(x)

        # Reshape for LSTM
        x = x.transpose(1, 2)  # (batch, 500, 128)

        # LSTM block
        x, _ = self.lstm1(x)  # (batch, 500, 128)
        x, _ = self.lstm2(x)  # (batch, 500, 64)
        x = self.dropout2(x)

        # Take last output
        x = x[:, -1, :]  # (batch, 64)

        # Dense block
        x = self.relu(self.fc1(x))
        x = self.dropout3(x)
        x = self.relu(self.fc2(x))
        x = self.dropout4(x)

        # Output
        optimization = self.optimization_output(x)
        confidence = torch.sigmoid(self.confidence_output(x))

        return optimization, confidence


# ============================================
# 3. 훈련 함수
# ============================================

class Trainer:
    """모델 훈련기"""

    def __init__(self, model, device='cpu', learning_rate=0.001):
        self.model = model.to(device)
        self.device = device
        self.optimizer = optim.Adam(model.parameters(), lr=learning_rate)
        self.scheduler = optim.lr_scheduler.StepLR(self.optimizer, step_size=5, gamma=0.1)

        # 손실함수
        self.ce_loss = nn.CrossEntropyLoss()
        self.mse_loss = nn.MSELoss()

        self.train_losses = []
        self.val_losses = []

    def compute_loss(self, opt_pred, conf_pred, opt_label, confidence_label, improvement):
        """다중 작업 손실 계산"""
        # 1. 분류 손실
        l_classification = self.ce_loss(opt_pred, opt_label.squeeze())

        # 2. 신뢰도 손실
        l_confidence = self.mse_loss(conf_pred, confidence_label)

        # 3. 강화학습 손실
        advantage = improvement - 0.2  # 20% 개선이 기준
        l_reinforcement = -torch.log(conf_pred + 1e-6) * advantage.unsqueeze(1)

        # 최종 손실
        total_loss = l_classification + 0.5 * l_confidence + 0.3 * l_reinforcement.mean()

        return total_loss

    def train_epoch(self, train_loader):
        """한 에포크 훈련"""
        self.model.train()
        total_loss = 0.0
        correct = 0
        total = 0

        for batch_idx, batch in enumerate(train_loader):
            # 데이터 로드
            code_vector = batch['code_vector'].to(self.device)
            opt_label = batch['optimization_label'].to(self.device)
            conf_label = batch['confidence_label'].to(self.device)
            improvement = batch['improvement'].to(self.device)

            # Forward pass
            opt_pred, conf_pred = self.model(code_vector)

            # Loss
            loss = self.compute_loss(opt_pred, conf_pred, opt_label, conf_label, improvement)

            # Backward
            self.optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
            self.optimizer.step()

            # 통계
            total_loss += loss.item()
            _, predicted = torch.max(opt_pred.data, 1)
            total += opt_label.size(0)
            correct += (predicted == opt_label.squeeze()).sum().item()

            if (batch_idx + 1) % 100 == 0:
                print(f"  Batch {batch_idx + 1}: Loss = {loss.item():.4f}")

        avg_loss = total_loss / len(train_loader)
        accuracy = 100 * correct / total

        return avg_loss, accuracy

    def validate(self, val_loader):
        """검증"""
        self.model.eval()
        total_loss = 0.0
        correct = 0
        total = 0

        with torch.no_grad():
            for batch in val_loader:
                code_vector = batch['code_vector'].to(self.device)
                opt_label = batch['optimization_label'].to(self.device)
                conf_label = batch['confidence_label'].to(self.device)
                improvement = batch['improvement'].to(self.device)

                opt_pred, conf_pred = self.model(code_vector)
                loss = self.compute_loss(opt_pred, conf_pred, opt_label, conf_label, improvement)

                total_loss += loss.item()
                _, predicted = torch.max(opt_pred.data, 1)
                total += opt_label.size(0)
                correct += (predicted == opt_label.squeeze()).sum().item()

        avg_loss = total_loss / len(val_loader)
        accuracy = 100 * correct / total

        return avg_loss, accuracy

    def train(self, train_loader, val_loader, num_epochs=50):
        """전체 훈련 루프"""
        print(f"\n🚀 훈련 시작 ({num_epochs} epochs)")
        print("=" * 60)

        best_val_loss = float('inf')
        patience = 10
        patience_counter = 0

        for epoch in range(num_epochs):
            # 훈련
            train_loss, train_acc = self.train_epoch(train_loader)

            # 검증
            val_loss, val_acc = self.validate(val_loader)

            # 스케줄러 업데이트
            self.scheduler.step()

            # 로깅
            print(f"\nEpoch {epoch + 1}/{num_epochs}")
            print(f"  Train Loss: {train_loss:.4f}, Acc: {train_acc:.1f}%")
            print(f"  Val Loss: {val_loss:.4f}, Acc: {val_acc:.1f}%")

            self.train_losses.append(train_loss)
            self.val_losses.append(val_loss)

            # 조기 중단
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                patience_counter = 0
                print(f"  ✅ 개선! (Best Val Loss: {best_val_loss:.4f})")
            else:
                patience_counter += 1
                if patience_counter >= patience:
                    print(f"\n⚠️  조기 중단 (개선 없음 {patience}회)")
                    break

        print("\n✅ 훈련 완료!")

    def save_model(self, path: str):
        """모델 저장"""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        torch.save(self.model.state_dict(), path)
        print(f"✅ 모델 저장: {path}")

    def load_model(self, path: str):
        """모델 로드"""
        self.model.load_state_dict(torch.load(path))
        print(f"✅ 모델 로드: {path}")


# ============================================
# 4. 메인 실행
# ============================================

def main():
    """메인 실행 함수"""
    print("🧠 FreeLang AI Compiler Optimizer - Model Training")
    print("=" * 60)

    # 설정
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"\n📱 Device: {device}")

    batch_size = 32
    num_epochs = 50
    learning_rate = 0.001

    # Step 1: 데이터 로드
    print("\n📂 Step 1: 데이터 로드")
    train_dataset = CompilerOptimizationDataset(
        './data/synthetic/labeled_data.json', split='train')
    val_dataset = CompilerOptimizationDataset(
        './data/synthetic/labeled_data.json', split='val')
    test_dataset = CompilerOptimizationDataset(
        './data/synthetic/labeled_data.json', split='test')

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size)
    test_loader = DataLoader(test_dataset, batch_size=batch_size)

    print(f"  Train: {len(train_dataset)}, Val: {len(val_dataset)}, Test: {len(test_dataset)}")

    # Step 2: 모델 초기화
    print("\n🧠 Step 2: 모델 초기화")
    model = CompilerOptimizer(input_dim=1000, num_optimizations=10)
    total_params = sum(p.numel() for p in model.parameters())
    print(f"  파라미터: {total_params:,}개")

    # Step 3: 훈련
    print("\n⚙️  Step 3: 모델 훈련")
    trainer = Trainer(model, device=device, learning_rate=learning_rate)
    trainer.train(train_loader, val_loader, num_epochs=num_epochs)

    # Step 4: 모델 저장
    print("\n💾 Step 4: 모델 저장")
    model_path = f'./models/ai_optimizer_epoch_{num_epochs}.pth'
    trainer.save_model(model_path)

    # Step 5: 테스트
    print("\n🧪 Step 5: 테스트")
    test_loss, test_acc = trainer.validate(test_loader)
    print(f"  Test Accuracy: {test_acc:.1f}%")

    # 통계 저장
    stats = {
        'timestamp': datetime.now().isoformat(),
        'epochs': num_epochs,
        'batch_size': batch_size,
        'learning_rate': learning_rate,
        'device': str(device),
        'model_parameters': total_params,
        'train_losses': trainer.train_losses,
        'val_losses': trainer.val_losses,
        'final_train_acc': trainer.train_losses[-1] if trainer.train_losses else 0,
        'test_accuracy': test_acc
    }

    stats_path = './models/training_stats.json'
    os.makedirs(os.path.dirname(stats_path), exist_ok=True)
    with open(stats_path, 'w') as f:
        json.dump(stats, f, indent=2)

    print(f"\n✅ 훈련 완료!")
    print(f"  모델: {model_path}")
    print(f"  통계: {stats_path}")


if __name__ == '__main__':
    main()
