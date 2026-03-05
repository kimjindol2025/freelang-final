#!/usr/bin/env python3
"""
Performance Labeler - 코드 변이의 성능 측정 및 레이블 생성

Phase 2 Week 3-4: 성능 레이블링
"""

import json
import time
import subprocess
import os
import random
from typing import Dict, List
from dataclasses import dataclass, asdict
import hashlib

@dataclass
class PerformanceMetrics:
    """성능 메트릭"""
    variant_id: str
    cycle_count: int
    execution_time_ns: float
    memory_accesses: int
    cache_misses: int
    cache_hit_rate: float
    cpu_utilization: float
    ipc: float  # Instructions Per Cycle
    energy_consumption_mj: float
    thermal_load: float
    compilation_time_ms: float
    binary_size_bytes: int
    code_density: float


class PerformanceLabeler:
    """성능 레이블러"""

    def __init__(self, variants_file: str = './data/synthetic/variants.json'):
        """
        Args:
            variants_file: 변이 데이터 파일
        """
        self.variants_file = variants_file
        self.variants = []
        self.metrics = []
        self.baseline_metrics = None

    def load_variants(self) -> int:
        """변이 데이터 로드"""
        try:
            with open(self.variants_file, 'r', encoding='utf-8') as f:
                self.variants = json.load(f)
            print(f"✅ 로드: {len(self.variants)}개 변이")
            return len(self.variants)
        except FileNotFoundError:
            print(f"❌ 파일 없음: {self.variants_file}")
            return 0

    def simulate_compilation(self, code: str) -> float:
        """
        컴파일 시간 시뮬레이션
        (실제로는 FreeLang 컴파일러를 호출)
        """
        # 코드 길이에 비례하는 시뮬레이션
        base_time = 10  # ms
        complexity = len(code) / 100
        random_jitter = random.uniform(0.8, 1.2)

        return (base_time + complexity) * random_jitter

    def simulate_execution(self, code: str, mutation_type: str,
                          strength: int) -> Dict:
        """
        실행 메트릭 시뮬레이션
        (실제로는 perf/QEMU를 통해 측정)
        """
        # 베이스라인 메트릭
        base_cycles = 1000
        base_memory = 100
        base_cache_misses = 20

        # 변이 타입에 따른 조정
        mutation_factors = {
            'loop_unroll': {
                'cycles': 0.7 - (strength * 0.05),  # 강도가 높을수록 빠름
                'memory': 1.0,
                'cache': 0.8 - (strength * 0.05),
            },
            'constant_variation': {
                'cycles': 0.95,
                'memory': 1.0,
                'cache': 1.0,
            },
            'variable_rename': {
                'cycles': 1.0,
                'memory': 1.0,
                'cache': 1.0,
            },
            'data_type_variation': {
                'cycles': 0.9 if strength == 1 else 1.1,
                'memory': 1.1 if strength > 2 else 1.0,
                'cache': 1.0,
            },
            'instruction_reorder': {
                'cycles': 0.85,
                'memory': 1.0,
                'cache': 0.95,
            },
            'nesting_depth': {
                'cycles': 1.0 + (strength * 0.1),  # 깊을수록 느림
                'memory': 1.0 + (strength * 0.05),
                'cache': 1.0,
            },
        }

        factors = mutation_factors.get(mutation_type, {
            'cycles': 1.0,
            'memory': 1.0,
            'cache': 1.0
        })

        # 메트릭 계산
        cycle_count = int(base_cycles * factors['cycles'] * random.uniform(0.95, 1.05))
        memory_accesses = int(base_memory * factors['memory'] * random.uniform(0.95, 1.05))
        cache_misses = int(base_cache_misses * factors['cache'] * random.uniform(0.95, 1.05))

        # 파생 메트릭
        execution_time_ns = cycle_count * 0.5  # 1 cycle ≈ 0.5ns (2GHz 기준)
        cache_hit_rate = max(0, (memory_accesses - cache_misses) / memory_accesses)
        ipc = random.uniform(1.5, 2.5)  # Instructions Per Cycle
        cpu_utilization = (ipc / 4.0) * 100  # 최대 4 IPC 가정
        energy_consumption_mj = (cycle_count / 1000) * 0.002  # mJ
        thermal_load = cpu_utilization * 0.8

        return {
            'cycle_count': cycle_count,
            'execution_time_ns': execution_time_ns,
            'memory_accesses': memory_accesses,
            'cache_misses': cache_misses,
            'cache_hit_rate': cache_hit_rate,
            'cpu_utilization': cpu_utilization,
            'ipc': ipc,
            'energy_consumption_mj': energy_consumption_mj,
            'thermal_load': thermal_load,
        }

    def measure_variant(self, variant: Dict) -> PerformanceMetrics:
        """단일 변이의 성능 측정"""
        variant_id = variant['variant_id']
        code = variant['variant_code']
        mutation_type = variant['mutation_type']
        strength = variant['mutation_strength']

        # Step 1: 컴파일 시간 측정
        compile_time = self.simulate_compilation(code)

        # Step 2: 실행 메트릭 측정
        exec_metrics = self.simulate_execution(code, mutation_type, strength)

        # Step 3: 바이너리 크기 추정
        binary_size = int(len(code) * 3 + random.randint(50, 200))

        # Step 4: 코드 밀도 계산
        code_density = len(code) / max(1, binary_size)

        # 메트릭 객체 생성
        metrics = PerformanceMetrics(
            variant_id=variant_id,
            cycle_count=exec_metrics['cycle_count'],
            execution_time_ns=exec_metrics['execution_time_ns'],
            memory_accesses=exec_metrics['memory_accesses'],
            cache_misses=exec_metrics['cache_misses'],
            cache_hit_rate=exec_metrics['cache_hit_rate'],
            cpu_utilization=exec_metrics['cpu_utilization'],
            ipc=exec_metrics['ipc'],
            energy_consumption_mj=exec_metrics['energy_consumption_mj'],
            thermal_load=exec_metrics['thermal_load'],
            compilation_time_ms=compile_time,
            binary_size_bytes=binary_size,
            code_density=code_density
        )

        return metrics

    def label_all_variants(self) -> int:
        """모든 변이에 성능 레이블 추가"""
        print("\n📊 성능 레이블링 시작...")

        labeled_count = 0
        for idx, variant in enumerate(self.variants):
            try:
                metrics = self.measure_variant(variant)
                self.metrics.append(asdict(metrics))
                labeled_count += 1

                # 진행률 표시
                if (idx + 1) % 5000 == 0:
                    print(f"  ✅ {idx + 1}/{len(self.variants)} 레이블링 완료")

            except Exception as e:
                print(f"⚠️  {variant['variant_id']}: {e}")

        print(f"\n✅ 레이블링 완료: {labeled_count}개 변이")
        return labeled_count

    def compute_improvement(self, variant: Dict, metrics: Dict) -> Dict:
        """최적화 효과 계산"""
        # 베이스라인과의 비교
        baseline_cycles = 1000  # 평균적인 베이스라인

        improvement_rate = (baseline_cycles - metrics['cycle_count']) / baseline_cycles
        improvement_pct = improvement_rate * 100

        # 신뢰도 점수 (0~1)
        # 메트릭들의 일관성을 기반으로
        consistency = 1.0 - abs(metrics['cache_hit_rate'] - 0.7) * 0.2

        return {
            'baseline_cycles': baseline_cycles,
            'improvement_cycles': baseline_cycles - metrics['cycle_count'],
            'improvement_percentage': improvement_pct,
            'confidence_score': max(0.5, min(1.0, consistency)),
            'category': self._categorize_performance(improvement_pct)
        }

    def _categorize_performance(self, improvement: float) -> str:
        """성능 카테고리 분류"""
        if improvement >= 30:
            return "high_performance"
        elif improvement >= 15:
            return "medium_performance"
        elif improvement >= 0:
            return "low_performance"
        else:
            return "degradation"

    def save_labels(self, output_dir: str = './data/synthetic') -> str:
        """레이블 저장"""
        os.makedirs(output_dir, exist_ok=True)

        # 개선율 계산 추가
        labeled_variants = []
        for variant, metrics in zip(self.variants, self.metrics):
            improvement = self.compute_improvement(variant, metrics)

            labeled_variants.append({
                'variant': variant,
                'metrics': metrics,
                'improvement': improvement
            })

        # JSON 저장
        output_file = os.path.join(output_dir, 'labeled_data.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(labeled_variants, f, indent=2, ensure_ascii=False)

        print(f"✅ 저장: {output_file}")
        return output_file

    def generate_label_statistics(self, output_dir: str = './data/analysis') -> None:
        """레이블 통계 생성"""
        os.makedirs(output_dir, exist_ok=True)

        # 기본 통계
        stats = {
            'total_labeled': len(self.metrics),
            'average_cycle_count': sum(m['cycle_count'] for m in self.metrics) / len(self.metrics) if self.metrics else 0,
            'average_cache_hit_rate': sum(m['cache_hit_rate'] for m in self.metrics) / len(self.metrics) if self.metrics else 0,
            'average_energy': sum(m['energy_consumption_mj'] for m in self.metrics) / len(self.metrics) if self.metrics else 0,
            'performance_distribution': {}
        }

        # 성능 분포
        for variant, metrics in zip(self.variants, self.metrics):
            improvement = self.compute_improvement(variant, metrics)
            category = improvement['category']
            stats['performance_distribution'][category] = \
                stats['performance_distribution'].get(category, 0) + 1

        # 저장
        stats_file = os.path.join(output_dir, 'label_statistics.json')
        with open(stats_file, 'w') as f:
            json.dump(stats, f, indent=2)

        print(f"\n📊 레이블링 통계:")
        print(f"  평균 사이클: {stats['average_cycle_count']:.0f}")
        print(f"  평균 캐시 히트율: {stats['average_cache_hit_rate']:.1%}")
        print(f"  평균 에너지: {stats['average_energy']:.2f} mJ")
        print(f"  저장: {stats_file}")

        return stats


def main():
    """메인 실행 함수"""
    print("🎯 FreeLang Performance Labeler")
    print("=" * 50)

    # 라벨러 초기화
    labeler = PerformanceLabeler('./data/synthetic/variants.json')

    # Step 1: 변이 로드
    print("\n📂 Step 1: 변이 데이터 로드")
    total = labeler.load_variants()

    if total == 0:
        print("❌ 변이 데이터를 찾을 수 없습니다.")
        print("   먼저 synthetic_data_generator.py를 실행하세요.")
        return

    # Step 2: 성능 측정
    print("\n📊 Step 2: 성능 측정")
    labeled = labeler.label_all_variants()

    # Step 3: 레이블 저장
    print("\n💾 Step 3: 레이블 저장")
    labeler.save_labels()

    # Step 4: 통계 생성
    print("\n📈 Step 4: 통계 생성")
    stats = labeler.generate_label_statistics()

    print("\n✅ 성능 레이블링 완료!")
    print(f"  처리된 변이: {labeled}개")
    print(f"  저장된 데이터: ./data/synthetic/labeled_data.json")


if __name__ == '__main__':
    main()
