#!/usr/bin/env python3
"""
AI Model Training with Reinforcement Learning

Phase 2 Week 8: 강화학습 피드백 루프 추가
실제 성능 개선율을 보상으로 활용한 모델 미세 조정
"""

import json
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import os
from datetime import datetime

# train_ai_model.py에서 클래스 임포트
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from train_ai_model import (
    CompilerOptimizationDataset, CompilerOptimizer, Trainer
)


class RLTrainer(Trainer):
    """강화학습 훈련기 (Trainer 확장)"""

    def __init__(self, model, device='cpu', learning_rate=0.0001):
        super().__init__(model, device, learning_rate)
        self.rl_weight = 0.3  # 초기 RL 가중치
        self.episode = 0

    def compute_rl_loss(self, conf_pred, improvement, baseline_improvement=0.2):
        """강화학습 손실 (정책 그래디언트)"""
        # Advantage 계산: 실제 개선 - 기준선
        advantage = improvement - baseline_improvement

        # Policy Loss: -log(π) * Advantage
        policy_loss = -torch.log(conf_pred + 1e-6) * advantage.unsqueeze(1)

        # Entropy 정규화 (탐색 촉진)
        entropy = -conf_pred * torch.log(conf_pred + 1e-6) - \
                  (1 - conf_pred) * torch.log(1 - conf_pred + 1e-6)

        # 최종 손실
        rl_loss = policy_loss.mean() - 0.01 * entropy.mean()

        return rl_loss

    def compute_loss_with_rl(self, opt_pred, conf_pred, opt_label, confidence_label, improvement):
        """RL 가중치를 포함한 다중 작업 손실"""
        # 기본 손실 (분류 + 신뢰도)
        l_classification = self.ce_loss(opt_pred, opt_label.squeeze())
        l_confidence = self.mse_loss(conf_pred, confidence_label)

        # RL 손실
        l_rl = self.compute_rl_loss(conf_pred, improvement)

        # 총 손실 (RL 가중치 증가)
        total_loss = (1.0 - self.rl_weight) * l_classification + \
                     0.5 * (1.0 - self.rl_weight) * l_confidence + \
                     self.rl_weight * l_rl

        return total_loss

    def train_epoch_with_rl(self, train_loader):
        """RL 포함 에포크 훈련"""
        self.model.train()
        total_loss = 0.0
        correct = 0
        total = 0
        rl_losses = []

        for batch_idx, batch in enumerate(train_loader):
            code_vector = batch['code_vector'].to(self.device)
            opt_label = batch['optimization_label'].to(self.device)
            conf_label = batch['confidence_label'].to(self.device)
            improvement = batch['improvement'].to(self.device)

            # Forward pass
            opt_pred, conf_pred = self.model(code_vector)

            # Loss (RL 포함)
            loss = self.compute_loss_with_rl(opt_pred, conf_pred, opt_label, conf_label, improvement)

            # Backward
            self.optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
            self.optimizer.step()

            # 통계
            total_loss += loss.item()
            rl_losses.append(loss.item())
            _, predicted = torch.max(opt_pred.data, 1)
            total += opt_label.size(0)
            correct += (predicted == opt_label.squeeze()).sum().item()

            if (batch_idx + 1) % 100 == 0:
                rl_weight_pct = self.rl_weight * 100
                print(f"  Batch {batch_idx + 1}: Loss = {loss.item():.4f} (RL weight: {rl_weight_pct:.0f}%)")

        avg_loss = total_loss / len(train_loader)
        accuracy = 100 * correct / total

        return avg_loss, accuracy

    def train_with_rl(self, train_loader, val_loader, num_epochs=20, rl_schedule='linear'):
        """RL 스케줄을 포함한 훈련"""
        print(f"\n🚀 강화학습 훈련 시작 ({num_epochs} epochs, RL schedule: {rl_schedule})")
        print("=" * 60)

        best_val_loss = float('inf')
        patience = 5
        patience_counter = 0

        for epoch in range(num_epochs):
            # RL 가중치 스케줄
            if rl_schedule == 'linear':
                self.rl_weight = 0.3 + (0.5 - 0.3) * (epoch / num_epochs)
            elif rl_schedule == 'exponential':
                self.rl_weight = 0.3 * (2.0 ** (epoch / num_epochs))
            else:
                self.rl_weight = 0.5  # 고정

            # 훈련
            train_loss, train_acc = self.train_epoch_with_rl(train_loader)

            # 검증
            val_loss, val_acc = self.validate(val_loader)

            # 스케줄러 업데이트
            self.scheduler.step()

            # 로깅
            rl_pct = self.rl_weight * 100
            print(f"\nEpoch {epoch + 1}/{num_epochs} [RL: {rl_pct:.0f}%]")
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

        print("\n✅ 강화학습 훈련 완료!")


def main():
    """메인 실행"""
    print("🧠 FreeLang AI Model - Reinforcement Learning Training")
    print("=" * 60)

    # 설정 (CUDA 호환성 문제로 CPU 강제)
    device = torch.device('cpu')  # CUDA 지원 안 됨
    print(f"\n📱 Device: {device}")

    batch_size = 32
    num_epochs = 20  # RL은 더 적은 에포크로 미세 조정
    learning_rate = 0.0001  # 더 낮은 러닝레이트

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

    # Step 2: 사전훈련 모델 로드
    print("\n🧠 Step 2: 사전훈련 모델 로드")
    model = CompilerOptimizer(input_dim=1000, num_optimizations=10)

    model_path = './models/ai_optimizer_epoch_50.pth'
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path))
        print(f"  ✅ 모델 로드: {model_path}")
    else:
        print(f"  ⚠️  사전훈련 모델 없음 - 새로 초기화")

    total_params = sum(p.numel() for p in model.parameters())
    print(f"  파라미터: {total_params:,}개")

    # Step 3: RL 훈련
    print("\n⚡ Step 3: 강화학습 훈련")
    rl_trainer = RLTrainer(model, device=device, learning_rate=learning_rate)

    # RL 스케줄: linear (0.3 → 0.5)
    rl_trainer.train_with_rl(
        train_loader, val_loader,
        num_epochs=num_epochs,
        rl_schedule='linear'
    )

    # Step 4: 모델 저장
    print("\n💾 Step 4: 강화학습 모델 저장")
    rl_model_path = f'./models/ai_optimizer_rl_epoch_{num_epochs}.pth'
    rl_trainer.save_model(rl_model_path)

    # Step 5: 테스트
    print("\n🧪 Step 5: 테스트")
    test_loss, test_acc = rl_trainer.validate(test_loader)
    print(f"  Test Accuracy: {test_acc:.1f}%")
    print(f"  Test Loss: {test_loss:.4f}")

    # Step 6: 통계 저장
    print("\n📊 Step 6: 통계 저장")
    stats = {
        'timestamp': datetime.now().isoformat(),
        'phase': 'Phase 2 Week 8 - Reinforcement Learning',
        'epochs': num_epochs,
        'batch_size': batch_size,
        'learning_rate': learning_rate,
        'device': str(device),
        'model_parameters': total_params,
        'rl_schedule': 'linear',
        'train_losses': rl_trainer.train_losses,
        'val_losses': rl_trainer.val_losses,
        'test_accuracy': test_acc,
        'test_loss': test_loss,
        'improvement_over_pretrained': f"{(test_acc - 0.65) / 0.65 * 100:.1f}%"
    }

    stats_path = './models/rl_training_stats.json'
    os.makedirs(os.path.dirname(stats_path), exist_ok=True)
    with open(stats_path, 'w') as f:
        json.dump(stats, f, indent=2)

    print(f"✅ 통계 저장: {stats_path}")

    print(f"\n✅ 강화학습 훈련 완료!")
    print(f"  기본 모델: {model_path}")
    print(f"  RL 모델: {rl_model_path}")
    print(f"  통계: {stats_path}")


if __name__ == '__main__':
    main()
