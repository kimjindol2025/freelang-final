#!/usr/bin/env python3
"""
FreeLang Phase 2 자동화 마스터 스크립트
Week 3-8: 데이터 생성 → 모델 훈련 → 평가

Week 3-4: 합성 데이터 + 성능 레이블 + 분석
Week 5-8: AI 모델 훈련 + 강화학습 + 검증
"""

import subprocess
import json
import os
from datetime import datetime

class Phase2Runner:
    """Phase 2 자동화 오케스트레이션"""

    def __init__(self):
        self.phase_dir = os.path.dirname(os.path.abspath(__file__))
        self.project_dir = os.path.dirname(self.phase_dir)
        self.log = []
        self.results = {}

    def log_msg(self, msg, level="INFO"):
        """로깅"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_line = f"[{timestamp}] {level}: {msg}"
        self.log.append(log_line)
        print(log_line)

    def run_script(self, script_name, description):
        """Python 스크립트 실행"""
        self.log_msg(f"{'='*60}")
        self.log_msg(f"▶ {description}")
        self.log_msg(f"{'='*60}")

        script_path = os.path.join(self.phase_dir, script_name)

        try:
            result = subprocess.run(
                ['python3', script_path],
                cwd=self.project_dir,
                capture_output=False,
                timeout=3600  # 1시간 타임아웃
            )

            if result.returncode == 0:
                self.log_msg(f"✅ {description} 완료", "SUCCESS")
                return True
            else:
                self.log_msg(f"❌ {description} 실패 (code={result.returncode})", "ERROR")
                return False

        except subprocess.TimeoutExpired:
            self.log_msg(f"⏱️  {description} 타임아웃", "ERROR")
            return False
        except Exception as e:
            self.log_msg(f"❌ {description} 에러: {e}", "ERROR")
            return False

    def week_3_4_data_generation(self):
        """Week 3-4: 데이터 생성"""
        self.log_msg("📊 PHASE 2 WEEK 3-4: 데이터 생성", "PHASE")

        success = True

        # Step 1: 합성 데이터 생성
        if not self.run_script(
            'synthetic_data_generator.py',
            'Step 1: 합성 데이터 생성 (50K→실제 데이터 개수)'
        ):
            success = False

        # Step 2: 성능 레이블링
        if not self.run_script(
            'performance_labeler.py',
            'Step 2: 성능 메트릭 추가 (14개 지표)'
        ):
            success = False

        # Step 3: 데이터셋 분석
        if not self.run_script(
            'dataset_analyzer.py',
            'Step 3: 데이터셋 분석 및 QA'
        ):
            success = False

        self.results['week_3_4'] = success
        return success

    def week_5_model_training(self):
        """Week 5: 초기 모델 훈련"""
        self.log_msg("🧠 PHASE 2 WEEK 5: 모델 훈련", "PHASE")

        if not self.run_script(
            'train_ai_model.py',
            'Step 4: CNN-LSTM 모델 훈련 (50 epochs)'
        ):
            self.results['week_5'] = False
            return False

        self.results['week_5'] = True
        return True

    def week_6_evaluation(self):
        """Week 6: 모델 평가"""
        self.log_msg("📈 PHASE 2 WEEK 6: 모델 평가", "PHASE")

        if not self.run_script(
            'model_evaluator.py',
            'Step 5: 모델 성능 평가 (정확도, F1, AUC)'
        ):
            self.results['week_6'] = False
            return False

        self.results['week_6'] = True
        return True

    def week_7_data_expansion(self):
        """Week 7: 데이터 확장"""
        self.log_msg("📦 PHASE 2 WEEK 7: 데이터 확장", "PHASE")

        if not self.run_script(
            'expanded_data_generator.py',
            'Step 6: 데이터 확장 (50K → 150K)'
        ):
            self.results['week_7'] = False
            return False

        self.results['week_7'] = True
        return True

    def week_8_reinforcement_learning(self):
        """Week 8: 강화학습 추가 훈련"""
        self.log_msg("⚡ PHASE 2 WEEK 8: 강화학습", "PHASE")

        if not self.run_script(
            'train_ai_model_rl.py',
            'Step 7: 강화학습 추가 훈련 (RL 피드백 루프)'
        ):
            self.results['week_8'] = False
            return False

        # 최종 검증
        if not self.run_script(
            'optimization_validator.py',
            'Step 8: 최적화 검증 (실제 성능 개선 확인)'
        ):
            self.results['week_8'] = False
            return False

        self.results['week_8'] = True
        return True

    def generate_final_report(self):
        """최종 리포트 생성"""
        self.log_msg("📋 최종 리포트 생성", "REPORT")

        report = {
            'timestamp': datetime.now().isoformat(),
            'phase': 'Phase 2 (Week 3-8)',
            'results': self.results,
            'log_lines': len(self.log),
            'summary': {
                'week_3_4': '✅ 데이터 생성 + 레이블 + 분석' if self.results.get('week_3_4') else '❌ 데이터 생성 실패',
                'week_5': '✅ 초기 모델 훈련' if self.results.get('week_5') else '❌ 모델 훈련 실패',
                'week_6': '✅ 모델 평가' if self.results.get('week_6') else '❌ 모델 평가 실패',
                'week_7': '✅ 데이터 확장' if self.results.get('week_7') else '❌ 데이터 확장 실패',
                'week_8': '✅ 강화학습 + 검증' if self.results.get('week_8') else '❌ 강화학습 실패'
            }
        }

        # 리포트 저장
        report_dir = os.path.join(self.project_dir, 'data', 'reports')
        os.makedirs(report_dir, exist_ok=True)

        report_file = os.path.join(report_dir, f'phase2_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json')
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)

        self.log_msg(f"📄 리포트 저장: {report_file}")

        # 로그 파일 저장
        log_file = os.path.join(report_dir, f'phase2_log_{datetime.now().strftime("%Y%m%d_%H%M%S")}.txt')
        with open(log_file, 'w') as f:
            f.write('\n'.join(self.log))

        self.log_msg(f"📄 로그 저장: {log_file}")

        return report_file

    def run_all(self):
        """전체 Phase 2 실행"""
        print("\n")
        print("=" * 80)
        print("🚀 FreeLang Phase 2 자동화 시작 (Week 3-8)")
        print("=" * 80)
        print("\n")

        start_time = datetime.now()

        # Week 3-4: 데이터 생성
        if not self.week_3_4_data_generation():
            self.log_msg("❌ Week 3-4 실패 - 이후 단계 중단", "CRITICAL")
            return False

        # Week 5: 모델 훈련
        if not self.week_5_model_training():
            self.log_msg("⚠️  Week 5 실패 - Week 6+ 스킵", "WARNING")
            return False

        # Week 6: 평가
        if not self.week_6_evaluation():
            self.log_msg("⚠️  Week 6 실패 - Week 7+ 스킵", "WARNING")
            return False

        # Week 7: 데이터 확장
        if not self.week_7_data_expansion():
            self.log_msg("⚠️  Week 7 실패 - Week 8 스킵", "WARNING")
            return False

        # Week 8: 강화학습
        if not self.week_8_reinforcement_learning():
            self.log_msg("⚠️  Week 8 실패", "WARNING")
            return False

        # 최종 리포트
        self.generate_final_report()

        elapsed = (datetime.now() - start_time).total_seconds()
        self.log_msg(f"⏱️  전체 소요 시간: {elapsed:.0f}초 ({elapsed/3600:.1f}시간)")

        print("\n")
        print("=" * 80)
        print("✅ FreeLang Phase 2 완료!")
        print("=" * 80)
        print("\n")

        # 최종 요약
        for key, status in self.results.items():
            symbol = "✅" if status else "❌"
            print(f"{symbol} {key}: {status}")

        print("\n")
        return True


if __name__ == '__main__':
    runner = Phase2Runner()
    success = runner.run_all()
    exit(0 if success else 1)
