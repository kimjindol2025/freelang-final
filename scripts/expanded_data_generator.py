#!/usr/bin/env python3
"""
Expanded Data Generator - 데이터셋 확장

Phase 2 Week 7: 50K → 150K 데이터 확장
변이 타입 추가 + 강도 조정 + 메트릭 개선
"""

import json
import random
import os
from synthetic_data_generator import SyntheticDataGenerator
from performance_labeler import PerformanceLabeler
from typing import Dict, List


class ExpandedDataGenerator:
    """확장 데이터 생성기"""

    ADDITIONAL_MUTATION_TYPES = [
        # 원래 7가지 + 새로운 3가지
        'loop_unroll',
        'constant_variation',
        'array_dimension',
        'data_type_variation',
        'variable_rename',
        'instruction_reorder',
        'nesting_depth',
        # 새로운 최적화 패턴
        'cache_locality',  # 캐시 친화적 코드 배치
        'branch_prediction',  # 분기 예측 최적화
        'register_allocation'  # 레지스터 할당 최적화
    ]

    def __init__(self):
        self.generator = SyntheticDataGenerator('./tests')
        self.labeler = PerformanceLabeler()
        self.expanded_variants = []

    def load_existing_data(self, variants_file='./data/synthetic/variants.json'):
        """기존 데이터 로드"""
        try:
            with open(variants_file, 'r') as f:
                self.expanded_variants = json.load(f)
            print(f"✅ 기존 변이 로드: {len(self.expanded_variants)}개")
            return len(self.expanded_variants)
        except FileNotFoundError:
            print(f"⚠️  기존 데이터 없음 - 새로 생성")
            return 0

    def load_original_tests(self):
        """원본 테스트 로드"""
        total = self.generator.load_all_tests()
        print(f"✅ 원본 테스트 로드: {total}개")
        return total

    def generate_additional_variants(self, per_test: int = 100) -> int:
        """추가 변이 생성 (기존 50개 + 추가 100개 = 150개)"""
        print(f"\n🔄 추가 변이 생성 (테스트당 {per_test}개)")
        print("=" * 60)

        total_variants = len(self.expanded_variants)

        for idx, (test_name, test_code) in enumerate(self.generator.original_codes):
            original_id = f"test_{idx:04d}"

            # 추가 변이 생성 (100개)
            for i in range(per_test):
                # 새로운 변이 타입 우선
                if i < 30:
                    mutation_type = random.choice(self.ADDITIONAL_MUTATION_TYPES[7:])
                else:
                    mutation_type = random.choice(self.ADDITIONAL_MUTATION_TYPES)

                strength = random.randint(1, 5)  # 강도 1-5로 확대

                variant = self.generator.generate_variant(
                    original_id, test_code, mutation_type, strength)

                if variant and variant.is_valid:
                    self.expanded_variants.append({
                        'original_id': variant.original_id,
                        'variant_id': variant.variant_id,
                        'original_code': variant.original_code,
                        'variant_code': variant.variant_code,
                        'mutation_type': variant.mutation_type,
                        'mutation_strength': variant.mutation_strength,
                        'is_valid': variant.is_valid
                    })
                    total_variants += 1

            # 진행률 표시
            if (idx + 1) % 50 == 0:
                print(f"  ✅ {idx + 1}/{len(self.generator.original_codes)} 처리 완료 "
                      f"({total_variants}개 누적)")

        print(f"\n✅ 추가 변이 생성 완료: {total_variants}개 (증가분: +{total_variants - len(self.expanded_variants)})")
        return total_variants

    def enhance_metrics(self, metrics: Dict) -> Dict:
        """메트릭 향상 (더 정확한 시뮬레이션)"""
        # 강도와 메트릭의 상관관계 강화
        strength_factor = metrics.get('mutation_strength', 1)

        # 사이클 최적화율 개선
        cycle_improvement = 0.05 * strength_factor
        metrics['cycle_count'] = max(
            int(metrics['cycle_count'] * (1 - cycle_improvement)),
            metrics['cycle_count'] // 2
        )

        # 캐시 히트율 개선
        metrics['cache_hit_rate'] = min(
            metrics['cache_hit_rate'] + 0.05 * strength_factor,
            0.95
        )

        # 에너지 절감
        metrics['energy_consumption_mj'] = metrics['cycle_count'] / 1000 * 0.002

        return metrics

    def label_all_variants(self, variants_file='./data/synthetic/variants.json') -> int:
        """모든 변이에 레이블 추가"""
        print("\n📊 성능 레이블링 시작...")
        print("=" * 60)

        # 파일에서 변이 로드
        try:
            with open(variants_file, 'r') as f:
                all_variants = json.load(f)
        except FileNotFoundError:
            print(f"❌ 변이 파일 없음: {variants_file}")
            return 0

        labeled_variants = []

        for idx, variant in enumerate(all_variants):
            try:
                # 성능 메트릭 시뮬레이션
                metrics = self.labeler.simulate_execution(
                    variant['variant_code'],
                    variant['mutation_type'],
                    variant['mutation_strength']
                )

                # 컴파일 시간
                metrics['compilation_time_ms'] = self.labeler.simulate_compilation(
                    variant['variant_code'])

                # 바이너리 크기
                metrics['binary_size_bytes'] = int(
                    len(variant['variant_code']) * 3 + random.randint(50, 200))

                # 코드 밀도
                metrics['code_density'] = len(variant['variant_code']) / max(1, metrics['binary_size_bytes'])

                # variant_id 추가
                metrics['variant_id'] = variant['variant_id']

                # 최적화 효과 계산
                improvement = self.labeler.compute_improvement(variant, metrics)

                labeled_variants.append({
                    'variant': variant,
                    'metrics': metrics,
                    'improvement': improvement
                })

                if (idx + 1) % 5000 == 0:
                    print(f"  ✅ {idx + 1}/{len(all_variants)} 레이블링 완료")

            except Exception as e:
                print(f"⚠️  {variant['variant_id']}: {e}")

        # 저장
        output_file = './data/synthetic/labeled_data.json'
        with open(output_file, 'w') as f:
            json.dump(labeled_variants, f, indent=2, ensure_ascii=False)

        print(f"\n✅ 레이블링 완료: {len(labeled_variants)}개 변이")
        print(f"✅ 저장: {output_file}")

        return len(labeled_variants)

    def save_expanded_variants(self) -> str:
        """확장된 변이 저장"""
        output_file = './data/synthetic/variants_expanded.json'

        with open(output_file, 'w') as f:
            json.dump(self.expanded_variants, f, indent=2, ensure_ascii=False)

        print(f"✅ 확장 변이 저장: {output_file} ({len(self.expanded_variants)}개)")
        return output_file

    def generate_statistics(self) -> Dict:
        """통계 생성"""
        stats = {
            'total_variants': len(self.expanded_variants),
            'expansion_factor': len(self.expanded_variants) / 9000 if 9000 > 0 else 0,
            'mutation_distribution': {},
            'strength_distribution': {},
            'target': 'Week 7: 50K → 150K 데이터 (목표 진행중)'
        }

        for variant in self.expanded_variants:
            mutation = variant['mutation_type']
            stats['mutation_distribution'][mutation] = \
                stats['mutation_distribution'].get(mutation, 0) + 1

            strength = variant['mutation_strength']
            stats['strength_distribution'][strength] = \
                stats['strength_distribution'].get(strength, 0) + 1

        stats_file = './data/analysis/expansion_stats.json'
        os.makedirs(os.path.dirname(stats_file), exist_ok=True)

        with open(stats_file, 'w') as f:
            json.dump(stats, f, indent=2)

        print(f"\n📊 통계:")
        print(f"  총 변이: {stats['total_variants']}")
        print(f"  확장율: {stats['expansion_factor']:.1f}배 (9K → {stats['total_variants']/1000:.0f}K)")
        print(f"  저장: {stats_file}")

        return stats


def main():
    """메인 실행"""
    print("📦 FreeLang Expanded Data Generator")
    print("=" * 60)

    generator = ExpandedDataGenerator()

    # Step 1: 원본 테스트 로드
    print("\n📂 Step 1: 원본 테스트 로드")
    total_tests = generator.load_original_tests()

    # Step 2: 기존 데이터 로드
    print("\n📂 Step 2: 기존 데이터 로드")
    existing = generator.load_existing_data()

    # Step 3: 추가 변이 생성
    print("\n🔄 Step 3: 추가 변이 생성 (50K → 150K)")
    total_variants = generator.generate_additional_variants(per_test=100)

    # Step 4: 변이 저장
    print("\n💾 Step 4: 확장 변이 저장")
    generator.save_expanded_variants()

    # Step 5: 레이블링
    print("\n📊 Step 5: 성능 레이블링")
    labeled = generator.label_all_variants('./data/synthetic/variants.json')

    # Step 6: 통계
    print("\n📈 Step 6: 통계 생성")
    generator.generate_statistics()

    print("\n✅ 데이터 확장 완료!")
    print(f"  원본 테스트: {total_tests}개")
    print(f"  확장 변이: {total_variants}개")
    print(f"  레이블링: {labeled}개")


if __name__ == '__main__':
    main()
