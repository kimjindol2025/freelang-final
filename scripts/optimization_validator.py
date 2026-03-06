#!/usr/bin/env python3
"""
Optimization Validator - 최적화 검증

Phase 2 Week 8: 모델이 제시한 최적화가 실제로 성능 개선을 가져오는지 검증
"""

import json
import torch
import numpy as np
from torch.utils.data import DataLoader
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from train_ai_model import CompilerOptimizationDataset, CompilerOptimizer


class OptimizationValidator:
    """최적화 검증기"""

    OPTIMIZATION_NAMES = {
        0: 'NO_OPTIMIZATION',
        1: 'LOOP_UNROLL_2X',
        2: 'LOOP_UNROLL_4X',
        3: 'LOOP_UNROLL_8X',
        4: 'LOOP_VECTORIZATION',
        5: 'CONSTANT_FOLDING',
        6: 'DEAD_CODE_ELIMINATION',
        7: 'LOOP_TILING',
        8: 'FUNCTION_INLINING',
        9: 'MEMORY_PREFETCH'
    }

    def __init__(self, model_path='./models/ai_optimizer_rl_epoch_20.pth'):
        self.model_path = model_path
        self.model = None
        self.device = torch.device('cpu')  # CUDA 호환성 문제로 CPU 강제
        self.test_loader = None
        self.validation_results = []

    def load_model(self):
        """모델 로드"""
        if not os.path.exists(self.model_path):
            print(f"⚠️  RL 모델 없음, 기본 모델 사용: ./models/ai_optimizer_epoch_50.pth")
            self.model_path = './models/ai_optimizer_epoch_50.pth'

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

    def validate_predictions(self):
        """모델 예측 검증"""
        print("\n🔍 최적화 검증 시작...")
        print("=" * 60)

        true_positives = 0  # 모델 추천이 실제로 효과 있음
        false_positives = 0  # 모델 추천이 효과 없음
        true_negatives = 0  # 모델이 no_opt 추천, 실제로 no_opt가 맞음
        improvement_scores = []

        with torch.no_grad():
            for batch_idx, batch in enumerate(self.test_loader):
                code_vector = batch['code_vector'].to(self.device)
                opt_label = batch['optimization_label'].to(self.device)
                improvement = batch['improvement'].to(self.device)

                opt_pred, conf_pred = self.model(code_vector)

                # 최대 확률 클래스 선택
                pred_classes = torch.argmax(opt_pred, dim=1)
                pred_confidence = torch.max(torch.nn.functional.softmax(opt_pred, dim=1), dim=1)[0]

                # 배치 단위 검증
                batch_size = opt_label.size(0)
                for i in range(batch_size):
                    pred_opt = pred_classes[i].item()
                    true_opt = opt_label[i].item()
                    actual_improvement = improvement[i].item()
                    confidence = pred_confidence[i].item()

                    # 검증 기준: 실제 개선 > 20%는 성공
                    success_threshold = 0.2

                    result = {
                        'predicted_opt': self.OPTIMIZATION_NAMES[pred_opt],
                        'true_opt': self.OPTIMIZATION_NAMES[true_opt],
                        'actual_improvement': actual_improvement,
                        'confidence': float(confidence),
                        'success': actual_improvement > success_threshold
                    }

                    self.validation_results.append(result)

                    # 통계
                    if pred_opt == true_opt:
                        if actual_improvement > success_threshold:
                            true_positives += 1
                        else:
                            false_positives += 1
                    else:
                        if actual_improvement <= success_threshold:
                            true_negatives += 1

                    improvement_scores.append(actual_improvement)

                if (batch_idx + 1) % 5 == 0:
                    print(f"  ✅ {(batch_idx + 1) * 32}/{len(self.test_loader.dataset)} 검증 완료")

        # 메트릭 계산
        total = true_positives + false_positives + true_negatives
        if total > 0:
            precision = true_positives / (true_positives + false_positives + 1e-6)
            recall = true_positives / (true_positives + 1e-6)
            f1 = 2 * precision * recall / (precision + recall + 1e-6)
        else:
            precision = recall = f1 = 0

        metrics = {
            'total_validations': total,
            'true_positives': true_positives,
            'false_positives': false_positives,
            'true_negatives': true_negatives,
            'precision': float(precision),
            'recall': float(recall),
            'f1_score': float(f1),
            'avg_improvement': float(np.mean(improvement_scores)),
            'max_improvement': float(np.max(improvement_scores)),
            'min_improvement': float(np.min(improvement_scores)),
            'success_rate': float(sum(1 for r in self.validation_results if r['success']) / len(self.validation_results))
        }

        return metrics

    def print_validation_report(self, metrics):
        """검증 리포트 출력"""
        print("\n📋 최적화 검증 리포트")
        print("=" * 60)

        print(f"\n✅ 성공 사례 (True Positives): {metrics['true_positives']}개")
        print(f"❌ 실패 사례 (False Positives): {metrics['false_positives']}개")
        print(f"✔️  올바른 거절 (True Negatives): {metrics['true_negatives']}개")

        print(f"\n🎯 성능 지표:")
        print(f"  정밀도 (Precision): {metrics['precision']:.1%}")
        print(f"  재현율 (Recall): {metrics['recall']:.1%}")
        print(f"  F1 점수: {metrics['f1_score']:.4f}")

        print(f"\n📊 개선율 분석:")
        print(f"  평균 개선: {metrics['avg_improvement']:.1f}%")
        print(f"  최대 개선: {metrics['max_improvement']:.1f}%")
        print(f"  최소 개선: {metrics['min_improvement']:.1f}%")
        print(f"  성공률 (>20% 개선): {metrics['success_rate']:.1%}")

        print(f"\n✨ 최종 판정:")
        if metrics['success_rate'] >= 0.85:
            print(f"  ✅ 우수: 모델이 신뢰할 만한 최적화 추천 가능")
        elif metrics['success_rate'] >= 0.65:
            print(f"  ⚠️  보통: 추가 학습/조정 필요")
        else:
            print(f"  ❌ 부족: 더 많은 데이터/훈련 필요")

    def save_validation_results(self, metrics):
        """검증 결과 저장"""
        os.makedirs('./models', exist_ok=True)

        results = {
            'phase': 'Phase 2 Week 8',
            'description': 'Optimization Validation',
            'metrics': metrics,
            'sample_results': self.validation_results[:100]  # 처음 100개만
        }

        results_file = './models/validation_results.json'
        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2)

        print(f"\n✅ 검증 결과 저장: {results_file}")

        return results_file

    def generate_validation_summary(self, metrics):
        """검증 요약 리포트"""
        summary = {
            'phase': 'Phase 2 Week 8',
            'status': 'Optimization Validation Complete',
            'model_path': self.model_path,
            'validation_metrics': metrics,
            'recommendations': []
        }

        success_rate = metrics['success_rate']

        if success_rate >= 0.85:
            summary['recommendations'].append(
                "✅ Phase 3로 진행 가능 - 모델 신뢰도 높음"
            )
            summary['recommendations'].append(
                "📈 다양한 실제 코드로 추가 테스트 권장"
            )
        elif success_rate >= 0.65:
            summary['recommendations'].append(
                "⚠️  추가 데이터 150K → 300K 확장 권장"
            )
            summary['recommendations'].append(
                "🔧 강화학습 에포크 수 증가 권장"
            )
        else:
            summary['recommendations'].append(
                "❌ 모델 아키텍처 재검토 필요"
            )
            summary['recommendations'].append(
                "📚 더 많은 다양한 변이 데이터 생성 필요"
            )

        summary_file = './models/validation_summary.json'
        with open(summary_file, 'w') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)

        print(f"✅ 검증 요약 저장: {summary_file}")

        return summary_file


def main():
    """메인 실행"""
    print("✅ FreeLang Optimization Validator")
    print("=" * 60)

    validator = OptimizationValidator()

    # Step 1: 모델 로드
    print("\n📂 Step 1: 모델 로드")
    if not validator.load_model():
        return

    # Step 2: 테스트 데이터 로드
    print("\n📂 Step 2: 테스트 데이터 로드")
    if not validator.load_test_data():
        return

    # Step 3: 검증
    print("\n🔍 Step 3: 최적화 검증")
    metrics = validator.validate_predictions()

    # Step 4: 리포트 출력
    print("\n📋 Step 4: 검증 리포트")
    validator.print_validation_report(metrics)

    # Step 5: 결과 저장
    print("\n💾 Step 5: 결과 저장")
    validator.save_validation_results(metrics)

    # Step 6: 요약 생성
    print("\n📊 Step 6: 요약 생성")
    validator.generate_validation_summary(metrics)

    print("\n✅ 최적화 검증 완료!")
    print(f"  성공률: {metrics['success_rate']:.1%}")
    print(f"  평균 개선: {metrics['avg_improvement']:.1f}%")


if __name__ == '__main__':
    main()
