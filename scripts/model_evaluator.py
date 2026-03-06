#!/usr/bin/env python3
"""
Model Evaluator - 모델 성능 평가

Phase 2 Week 6: 훈련된 모델의 정확도, F1, AUC 계산
"""

import json
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
import os
import numpy as np
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score, confusion_matrix
import matplotlib.pyplot as plt

# train_ai_model.py에서 클래스 임포트
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from train_ai_model import CompilerOptimizationDataset, CompilerOptimizer


class ModelEvaluator:
    """모델 평가기"""

    def __init__(self, model_path='./models/ai_optimizer_epoch_50.pth'):
        self.model_path = model_path
        self.model = None
        self.device = torch.device('cpu')  # CUDA 호환성 문제로 CPU 강제
        self.test_loader = None
        self.results = {}

    def load_model(self):
        """모델 로드"""
        if not os.path.exists(self.model_path):
            print(f"❌ 모델 파일 없음: {self.model_path}")
            return False

        self.model = CompilerOptimizer(input_dim=1000, num_optimizations=10)
        self.model.load_state_dict(torch.load(self.model_path))
        self.model.to(self.device)
        self.model.eval()

        print(f"✅ 모델 로드: {self.model_path}")
        return True

    def load_test_data(self):
        """테스트 데이터 로드"""
        try:
            test_dataset = CompilerOptimizationDataset(
                './data/synthetic/labeled_data.json', split='test')
            self.test_loader = DataLoader(test_dataset, batch_size=32)

            print(f"✅ 테스트 데이터 로드: {len(test_dataset)}개 샘플")
            return True
        except Exception as e:
            print(f"❌ 테스트 데이터 로드 실패: {e}")
            return False

    def evaluate(self):
        """전체 평가"""
        print("\n📊 모델 평가 시작...")
        print("=" * 60)

        all_preds = []
        all_labels = []
        all_confidence = []
        all_true_confidence = []

        with torch.no_grad():
            for batch in self.test_loader:
                code_vector = batch['code_vector'].to(self.device)
                opt_label = batch['optimization_label'].to(self.device)
                conf_label = batch['confidence_label'].to(self.device)

                opt_pred, conf_pred = self.model(code_vector)

                # 최대 확률 클래스 선택
                pred_classes = torch.argmax(opt_pred, dim=1)

                all_preds.extend(pred_classes.cpu().numpy())
                all_labels.extend(opt_label.squeeze().cpu().numpy())
                all_confidence.extend(conf_pred.squeeze().cpu().numpy())
                all_true_confidence.extend(conf_label.squeeze().cpu().numpy())

        all_preds = np.array(all_preds)
        all_labels = np.array(all_labels)
        all_confidence = np.array(all_confidence)
        all_true_confidence = np.array(all_true_confidence)

        # 메트릭 계산
        accuracy = accuracy_score(all_labels, all_preds)
        f1 = f1_score(all_labels, all_preds, average='weighted', zero_division=0)

        # AUC (One-vs-Rest)
        try:
            # 다중 클래스 AUC
            one_hot_labels = np.eye(10)[all_labels]
            auc = roc_auc_score(one_hot_labels, torch.nn.functional.softmax(
                torch.tensor(all_confidence, device=self.device), dim=1).cpu().numpy(),
                multi_class='ovr', average='weighted')
        except:
            auc = 0.0

        # Confusion Matrix
        cm = confusion_matrix(all_labels, all_preds, labels=range(10))

        # 신뢰도 관련 메트릭
        confidence_mae = np.mean(np.abs(all_confidence - all_true_confidence))
        confidence_rmse = np.sqrt(np.mean((all_confidence - all_true_confidence) ** 2))

        self.results = {
            'accuracy': float(accuracy),
            'f1_weighted': float(f1),
            'auc': float(auc),
            'confidence_mae': float(confidence_mae),
            'confidence_rmse': float(confidence_rmse),
            'total_samples': len(all_labels),
            'cm': cm.tolist()
        }

        # 출력
        print(f"\n🎯 평가 결과:")
        print(f"  정확도: {accuracy:.1%}")
        print(f"  F1 (가중): {f1:.4f}")
        print(f"  AUC (One-vs-Rest): {auc:.4f}")
        print(f"  신뢰도 MAE: {confidence_mae:.4f}")
        print(f"  신뢰도 RMSE: {confidence_rmse:.4f}")
        print(f"  샘플 수: {len(all_labels)}")

        # 클래스별 성능
        print(f"\n📊 클래스별 정확도:")
        optimization_names = [
            'NO_OPT', 'UNROLL_2X', 'UNROLL_4X', 'UNROLL_8X',
            'VECTORIZE', 'CONST_FOLD', 'DEAD_CODE', 'TILING',
            'INLINE', 'PREFETCH'
        ]

        for i, opt_name in enumerate(optimization_names):
            class_mask = all_labels == i
            if class_mask.sum() > 0:
                class_acc = accuracy_score(all_labels[class_mask], all_preds[class_mask])
                class_count = class_mask.sum()
                print(f"  {opt_name}: {class_acc:.1%} ({class_count}개)")

        return True

    def save_results(self):
        """결과 저장"""
        os.makedirs('./models', exist_ok=True)

        results_file = './models/evaluation_results.json'
        with open(results_file, 'w') as f:
            json.dump(self.results, f, indent=2)

        print(f"\n✅ 평가 결과 저장: {results_file}")

        return results_file

    def generate_report(self):
        """평가 리포트 생성"""
        report = {
            'phase': 'Phase 2 Week 6',
            'description': 'AI 모델 성능 평가',
            'model_path': self.model_path,
            'evaluation_metrics': self.results,
            'recommendations': []
        }

        # 추천사항
        acc = self.results.get('accuracy', 0)
        if acc < 0.65:
            report['recommendations'].append(
                "⚠️  정확도가 목표(65%)보다 낮음 - Week 5 추가 훈련 필요"
            )
        elif acc < 0.78:
            report['recommendations'].append(
                "ℹ️  Week 6 목표(78%) 달성 예상 - Week 7 데이터 확장 진행"
            )
        else:
            report['recommendations'].append(
                "✅ 정확도 목표 달성 - Week 8 강화학습 진행 가능"
            )

        # 신뢰도 분석
        conf_mae = self.results.get('confidence_mae', 0)
        if conf_mae > 0.15:
            report['recommendations'].append(
                "⚠️  신뢰도 예측 편차 크음 - confidence 헤드 재훈련 필요"
            )

        report_file = './models/evaluation_report.json'
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        print(f"✅ 평가 리포트 저장: {report_file}")

        # 화면 출력
        print("\n📋 평가 리포트:")
        print(json.dumps(report, indent=2, ensure_ascii=False))

        return report_file


def main():
    """메인 실행"""
    print("🔍 FreeLang AI Model Evaluator")
    print("=" * 60)

    # 모델 평가기 초기화
    evaluator = ModelEvaluator('./models/ai_optimizer_epoch_50.pth')

    # Step 1: 모델 로드
    print("\n📂 Step 1: 모델 로드")
    if not evaluator.load_model():
        return

    # Step 2: 테스트 데이터 로드
    print("\n📂 Step 2: 테스트 데이터 로드")
    if not evaluator.load_test_data():
        return

    # Step 3: 평가
    print("\n📊 Step 3: 모델 평가")
    if not evaluator.evaluate():
        return

    # Step 4: 결과 저장
    print("\n💾 Step 4: 결과 저장")
    evaluator.save_results()

    # Step 5: 리포트 생성
    print("\n📋 Step 5: 리포트 생성")
    evaluator.generate_report()

    print("\n✅ 평가 완료!")


if __name__ == '__main__':
    main()
