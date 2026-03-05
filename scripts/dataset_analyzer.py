#!/usr/bin/env python3
"""
Dataset Analyzer - 데이터셋 품질 분석 및 시각화

Phase 2 Week 3-4: 데이터셋 분석
"""

import json
import os
from typing import Dict, List
import statistics

class DatasetAnalyzer:
    """데이터셋 분석기"""

    def __init__(self, labeled_data_file: str = './data/synthetic/labeled_data.json'):
        """
        Args:
            labeled_data_file: 레이블된 데이터 파일
        """
        self.labeled_data_file = labeled_data_file
        self.data = []
        self.analysis = {}

    def load_data(self) -> int:
        """데이터 로드"""
        try:
            with open(self.labeled_data_file, 'r', encoding='utf-8') as f:
                self.data = json.load(f)
            print(f"✅ 로드: {len(self.data)}개 데이터 샘플")
            return len(self.data)
        except FileNotFoundError:
            print(f"❌ 파일 없음: {self.labeled_data_file}")
            return 0

    def analyze_metrics_distribution(self) -> Dict:
        """메트릭 분포 분석"""
        print("\n📊 메트릭 분포 분석...")

        if not self.data:
            return {}

        # 메트릭별 통계
        metrics_stats = {}

        # 추출할 메트릭
        metric_keys = [
            'cycle_count',
            'memory_accesses',
            'cache_hit_rate',
            'cpu_utilization',
            'ipc',
            'energy_consumption_mj',
            'compilation_time_ms',
            'binary_size_bytes'
        ]

        for metric_key in metric_keys:
            values = [d['metrics'][metric_key] for d in self.data
                     if metric_key in d['metrics']]

            if values:
                metrics_stats[metric_key] = {
                    'min': min(values),
                    'max': max(values),
                    'mean': statistics.mean(values),
                    'median': statistics.median(values),
                    'stdev': statistics.stdev(values) if len(values) > 1 else 0,
                    'count': len(values)
                }

                print(f"  {metric_key}:")
                print(f"    범위: {metrics_stats[metric_key]['min']:.2f} ~ "
                      f"{metrics_stats[metric_key]['max']:.2f}")
                print(f"    평균: {metrics_stats[metric_key]['mean']:.2f}")

        return metrics_stats

    def analyze_mutation_distribution(self) -> Dict:
        """변이 분포 분석"""
        print("\n🔄 변이 분포 분석...")

        mutation_dist = {}

        for data in self.data:
            variant = data['variant']
            mutation_type = variant['mutation_type']

            mutation_dist[mutation_type] = mutation_dist.get(mutation_type, 0) + 1

        # 출력
        total = sum(mutation_dist.values())
        for mutation_type in sorted(mutation_dist.keys()):
            count = mutation_dist[mutation_type]
            percentage = (count / total) * 100
            print(f"  {mutation_type}: {count} ({percentage:.1f}%)")

        return mutation_dist

    def analyze_performance_categories(self) -> Dict:
        """성능 카테고리 분석"""
        print("\n⚡ 성능 카테고리 분석...")

        category_dist = {}

        for data in self.data:
            improvement = data['improvement']
            category = improvement['category']

            category_dist[category] = category_dist.get(category, 0) + 1

        # 출력
        total = sum(category_dist.values())
        for category in sorted(category_dist.keys()):
            count = category_dist[category]
            percentage = (count / total) * 100
            print(f"  {category}: {count} ({percentage:.1f}%)")

        return category_dist

    def analyze_improvement_distribution(self) -> Dict:
        """개선율 분포 분석"""
        print("\n📈 개선율 분포 분석...")

        improvements = [d['improvement']['improvement_percentage'] for d in self.data]

        stats = {
            'min_improvement': min(improvements),
            'max_improvement': max(improvements),
            'mean_improvement': statistics.mean(improvements),
            'median_improvement': statistics.median(improvements),
            'stdev_improvement': statistics.stdev(improvements) if len(improvements) > 1 else 0
        }

        print(f"  최소: {stats['min_improvement']:.1f}%")
        print(f"  최대: {stats['max_improvement']:.1f}%")
        print(f"  평균: {stats['mean_improvement']:.1f}%")
        print(f"  중앙값: {stats['median_improvement']:.1f}%")

        return stats

    def analyze_mutation_strength_correlation(self) -> Dict:
        """변이 강도와 성능의 상관관계"""
        print("\n🔗 변이 강도 vs 성능 상관관계...")

        strength_improvements = {}

        for data in self.data:
            variant = data['variant']
            strength = variant['mutation_strength']
            improvement = data['improvement']['improvement_percentage']

            if strength not in strength_improvements:
                strength_improvements[strength] = []

            strength_improvements[strength].append(improvement)

        # 분석
        correlation = {}
        for strength in sorted(strength_improvements.keys()):
            improvements = strength_improvements[strength]
            correlation[strength] = {
                'avg_improvement': statistics.mean(improvements),
                'count': len(improvements),
                'best': max(improvements),
                'worst': min(improvements)
            }

            print(f"  강도 {strength}: "
                  f"평균 {correlation[strength]['avg_improvement']:.1f}% "
                  f"({correlation[strength]['count']}개)")

        return correlation

    def analyze_data_quality(self) -> Dict:
        """데이터 품질 분석"""
        print("\n✓ 데이터 품질 분석...")

        quality_issues = {
            'missing_fields': 0,
            'invalid_metrics': 0,
            'outliers': 0,
            'duplicate_ids': 0
        }

        seen_ids = set()

        for data in self.data:
            # 필드 검사
            required_fields = ['variant', 'metrics', 'improvement']
            if not all(field in data for field in required_fields):
                quality_issues['missing_fields'] += 1

            # 메트릭 유효성 검사
            metrics = data.get('metrics', {})
            if metrics.get('cycle_count', 0) < 0 or metrics.get('cache_hit_rate', 0) > 1:
                quality_issues['invalid_metrics'] += 1

            # 중복 ID 검사
            variant_id = data.get('variant', {}).get('variant_id', '')
            if variant_id in seen_ids:
                quality_issues['duplicate_ids'] += 1
            seen_ids.add(variant_id)

        # 특이치 탐지 (간단한 버전)
        improvements = [d['improvement']['improvement_percentage'] for d in self.data]
        mean_imp = statistics.mean(improvements)
        stdev_imp = statistics.stdev(improvements) if len(improvements) > 1 else 0

        for data in self.data:
            improvement = data['improvement']['improvement_percentage']
            if abs(improvement - mean_imp) > 3 * stdev_imp:
                quality_issues['outliers'] += 1

        # 출력
        print(f"  누락된 필드: {quality_issues['missing_fields']}")
        print(f"  유효하지 않은 메트릭: {quality_issues['invalid_metrics']}")
        print(f"  중복 ID: {quality_issues['duplicate_ids']}")
        print(f"  특이치: {quality_issues['outliers']}")

        quality_score = 1.0 - (sum(quality_issues.values()) / len(self.data))
        print(f"  품질 점수: {quality_score:.1%}")

        return {
            'issues': quality_issues,
            'quality_score': quality_score
        }

    def generate_comprehensive_report(self, output_dir: str = './data/analysis') -> str:
        """종합 리포트 생성"""
        os.makedirs(output_dir, exist_ok=True)

        report = {
            'dataset_info': {
                'total_samples': len(self.data),
                'source': 'synthetic_variants',
                'status': '✅ 분석 완료'
            },
            'metrics_distribution': self.analyze_metrics_distribution(),
            'mutation_distribution': self.analyze_mutation_distribution(),
            'performance_categories': self.analyze_performance_categories(),
            'improvement_distribution': self.analyze_improvement_distribution(),
            'mutation_strength_correlation': self.analyze_mutation_strength_correlation(),
            'data_quality': self.analyze_data_quality()
        }

        # 저장
        report_file = os.path.join(output_dir, 'comprehensive_analysis.json')
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        print(f"\n✅ 종합 리포트 저장: {report_file}")

        return report_file

    def generate_training_summary(self, output_dir: str = './data/analysis') -> str:
        """AI 학습용 요약 생성"""
        os.makedirs(output_dir, exist_ok=True)

        summary = {
            'phase': 'Phase 2 Week 3-4',
            'status': '데이터 생성 & 레이블링 완료',
            'dataset_statistics': {
                'total_samples': len(self.data),
                'training_set_size': int(len(self.data) * 0.7),
                'validation_set_size': int(len(self.data) * 0.15),
                'test_set_size': int(len(self.data) * 0.15)
            },
            'expected_model_performance': {
                'initial_accuracy': '65%',
                'target_accuracy': '85%',
                'performance_improvement': '35%',
                'confidence_score': '85-90%'
            },
            'next_steps': [
                'AI 모델 초기화 (CNN-LSTM)',
                '학습 데이터 로드',
                'Phase 2 Week 5: 초기 훈련 시작'
            ]
        }

        summary_file = os.path.join(output_dir, 'training_summary.json')
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)

        print(f"✅ 학습 요약 저장: {summary_file}")

        return summary_file


def main():
    """메인 실행 함수"""
    print("🔍 FreeLang Dataset Analyzer")
    print("=" * 50)

    # 분석기 초기화
    analyzer = DatasetAnalyzer('./data/synthetic/labeled_data.json')

    # Step 1: 데이터 로드
    print("\n📂 Step 1: 데이터 로드")
    total = analyzer.load_data()

    if total == 0:
        print("❌ 레이블된 데이터를 찾을 수 없습니다.")
        print("   먼저 performance_labeler.py를 실행하세요.")
        return

    # Step 2: 상세 분석
    print("\n📊 Step 2: 상세 분석 시작")
    analyzer.analyze_metrics_distribution()
    analyzer.analyze_mutation_distribution()
    analyzer.analyze_performance_categories()
    analyzer.analyze_improvement_distribution()
    analyzer.analyze_mutation_strength_correlation()
    analyzer.analyze_data_quality()

    # Step 3: 리포트 생성
    print("\n📝 Step 3: 리포트 생성")
    analyzer.generate_comprehensive_report()
    analyzer.generate_training_summary()

    print("\n✅ 분석 완료!")
    print("\n🚀 Next: AI 모델 훈련 준비 (Week 5)")


if __name__ == '__main__':
    main()
