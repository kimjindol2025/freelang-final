#!/usr/bin/env python3
"""
FreeLang Synthetic Data Generator
1000개 원본 테스트 코드 → 50,000개 합성 데이터 생성

Phase 2 Week 3-4: 데이터셋 생성
"""

import json
import random
import os
import re
from typing import List, Dict, Tuple
from dataclasses import dataclass
import hashlib

@dataclass
class CodeVariant:
    """코드 변이 정보"""
    original_id: str
    variant_id: str
    original_code: str
    variant_code: str
    mutation_type: str
    mutation_strength: int
    is_valid: bool
    syntax_check: bool

class SyntheticDataGenerator:
    """합성 데이터 생성기"""

    MUTATION_TYPES = [
        'loop_unroll',           # 루프 전개
        'constant_variation',    # 상수 값 변경
        'array_dimension',       # 배열 차원 변경
        'data_type_variation',   # 데이터 타입 변경
        'variable_rename',       # 변수명 변경
        'instruction_reorder',   # 명령어 순서 변경
        'nesting_depth'          # 중첩 깊이 변경
    ]

    def __init__(self, test_dir: str = './tests'):
        """
        Args:
            test_dir: 테스트 파일 디렉토리
        """
        self.test_dir = test_dir
        self.variants = []
        self.original_codes = []
        self.extracted_tests = []

    def extract_test_code(self, test_file: str) -> List[Tuple[str, str]]:
        """
        테스트 파일에서 테스트 코드 추출
        Returns: [(test_name, code_snippet), ...]
        """
        tests = []

        try:
            with open(test_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # suite.it('description', ...) 패턴 찾기
            pattern = r"suite\.it\('([^']+)',\s*\(assert\)\s*=>\s*\{([^}]+)\}"
            matches = re.finditer(pattern, content, re.DOTALL)

            for match in matches:
                test_name = match.group(1)
                test_code = match.group(2).strip()
                tests.append((test_name, test_code))

        except Exception as e:
            print(f"⚠️  Error extracting from {test_file}: {e}")

        return tests

    def load_all_tests(self) -> int:
        """
        모든 테스트 파일에서 코드 추출
        Returns: 추출된 테스트 수
        """
        test_files = [
            'test-runner.js',
            'lexer-tests.js',
            'parser-tests.js',
            'semantic-tests.js',
            'control-flow-tests.js',
            'function-tests.js',
            'array-tests.js',
            'stdlib-tests.js',
            'integration-tests.js',
            'advanced-tests.js'
        ]

        total_tests = 0
        for test_file in test_files:
            full_path = os.path.join(self.test_dir, test_file)
            if os.path.exists(full_path):
                tests = self.extract_test_code(full_path)
                self.original_codes.extend(tests)
                total_tests += len(tests)
                print(f"✅ {test_file}: {len(tests)} 테스트 추출")
            else:
                print(f"⚠️  {test_file}: 파일 없음")

        print(f"\n📊 총 추출: {total_tests}개 테스트 코드")
        return total_tests

    def generate_loop_unroll_variants(self, code: str, strength: int = 2) -> str:
        """루프 전개 변이"""
        # for 루프 찾기
        pattern = r'for\s+(\w+)\s+in\s+range\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)'

        def replace_loop(match):
            var = match.group(1)
            start = match.group(2)
            end = match.group(3)

            # 루프 본문 찾기
            loop_start = match.end()
            brace_count = 0
            loop_end = loop_start

            for i in range(loop_start, len(code)):
                if code[i] == '{':
                    brace_count += 1
                elif code[i] == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        loop_end = i
                        break

            body = code[loop_start:loop_end].strip()

            # 루프 강도 표시 (주석으로 추가)
            return f'for {var} in range({start}, {end}, {strength}) // unroll_strength={strength}\n{body}'

        try:
            return re.sub(pattern, replace_loop, code)
        except:
            return code

    def generate_constant_variation(self, code: str, variation: str = 'medium') -> str:
        """상수 값 변경"""
        # 숫자 리터럴 찾기
        numbers = re.findall(r'\b(\d+)\b', code)

        if not numbers:
            return code

        # 가장 큰 상수 찾기
        num = int(max(numbers, key=int))

        if variation == 'small':
            new_num = max(1, num // 2)
        elif variation == 'large':
            new_num = num * 2
        else:  # medium
            new_num = num

        return code.replace(str(num), str(new_num), 1)

    def generate_variable_rename(self, code: str) -> str:
        """변수명 변경"""
        # 변수명 찾기 (간단한 버전)
        vars_to_rename = re.findall(r'\b([a-z_]\w*)\b', code)

        if not vars_to_rename:
            return code

        # 가장 자주 나타나는 변수 찾기
        var_to_rename = max(set(vars_to_rename),
                           key=vars_to_rename.count)
        new_name = f"{var_to_rename}_opt"

        # 정규식으로 단어 경계 유지하면서 치환
        return re.sub(rf'\b{var_to_rename}\b', new_name, code)

    def generate_data_type_variation(self, code: str) -> str:
        """데이터 타입 변경"""
        variations = {
            'let': 'const',
            'var': 'let',
            'i32': 'i64',
            'f32': 'f64'
        }

        result = code
        for old, new in variations.items():
            result = result.replace(old, new, 1)

        return result

    def generate_variant(self, original_id: str, code: str,
                        mutation_type: str, strength: int) -> CodeVariant:
        """단일 변이 생성"""

        variant_code = code

        try:
            if mutation_type == 'loop_unroll':
                variant_code = self.generate_loop_unroll_variants(code, strength)
            elif mutation_type == 'constant_variation':
                variation_map = {1: 'small', 2: 'medium', 3: 'large'}
                variant_code = self.generate_constant_variation(code,
                                                               variation_map.get(strength, 'medium'))
            elif mutation_type == 'variable_rename':
                variant_code = self.generate_variable_rename(code)
            elif mutation_type == 'data_type_variation':
                variant_code = self.generate_data_type_variation(code)
            else:
                variant_code = code

            # 변이 ID 생성
            variant_id = self._generate_variant_id(original_id, mutation_type, strength)

            return CodeVariant(
                original_id=original_id,
                variant_id=variant_id,
                original_code=code,
                variant_code=variant_code,
                mutation_type=mutation_type,
                mutation_strength=strength,
                is_valid=self._validate_syntax(variant_code),
                syntax_check=True
            )
        except Exception as e:
            print(f"⚠️  Error generating variant for {original_id}: {e}")
            return None

    def _generate_variant_id(self, original_id: str, mutation: str, strength: int) -> str:
        """변이 ID 생성"""
        hash_input = f"{original_id}_{mutation}_{strength}"
        hash_value = hashlib.md5(hash_input.encode()).hexdigest()[:8]
        return f"{original_id}_{mutation}_{strength}_{hash_value}"

    def _validate_syntax(self, code: str) -> bool:
        """간단한 구문 검증"""
        # 기본 검사: 괄호 균형
        open_parens = code.count('(') + code.count('{') + code.count('[')
        close_parens = code.count(')') + code.count('}') + code.count(']')

        return open_parens == close_parens

    def generate_all_variants(self, per_test: int = 50) -> int:
        """
        모든 테스트에 대해 변이 생성
        Args:
            per_test: 테스트당 변이 수
        Returns: 생성된 변이 수
        """
        print(f"\n🔄 변이 생성 시작... (테스트당 {per_test}개)")

        total_variants = 0

        for idx, (test_name, test_code) in enumerate(self.original_codes):
            original_id = f"test_{idx:04d}"

            # 변이 생성
            for i in range(per_test):
                mutation_type = random.choice(self.MUTATION_TYPES)
                strength = random.randint(1, 4)

                variant = self.generate_variant(original_id, test_code,
                                              mutation_type, strength)

                if variant and variant.is_valid:
                    self.variants.append(variant)
                    total_variants += 1

            # 진행률 표시
            if (idx + 1) % 100 == 0:
                print(f"  ✅ {idx + 1}/{len(self.original_codes)} 처리 완료 "
                      f"({total_variants}개 변이)")

        print(f"\n✅ 변이 생성 완료: {total_variants}개")
        return total_variants

    def save_variants(self, output_dir: str = './data/synthetic') -> str:
        """변이 저장"""
        os.makedirs(output_dir, exist_ok=True)

        # JSON 형식으로 저장
        output_file = os.path.join(output_dir, 'variants.json')

        variants_data = []
        for variant in self.variants:
            variants_data.append({
                'original_id': variant.original_id,
                'variant_id': variant.variant_id,
                'original_code': variant.original_code,
                'variant_code': variant.variant_code,
                'mutation_type': variant.mutation_type,
                'mutation_strength': variant.mutation_strength,
                'is_valid': variant.is_valid
            })

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(variants_data, f, indent=2, ensure_ascii=False)

        print(f"✅ 저장 완료: {output_file} ({len(variants_data)}개 변이)")
        return output_file

    def generate_statistics(self, output_dir: str = './data/analysis') -> None:
        """통계 생성"""
        os.makedirs(output_dir, exist_ok=True)

        stats = {
            'total_variants': len(self.variants),
            'valid_variants': sum(1 for v in self.variants if v.is_valid),
            'mutation_distribution': {},
            'strength_distribution': {}
        }

        for variant in self.variants:
            mutation = variant.mutation_type
            stats['mutation_distribution'][mutation] = \
                stats['mutation_distribution'].get(mutation, 0) + 1

            strength = variant.mutation_strength
            stats['strength_distribution'][strength] = \
                stats['strength_distribution'].get(strength, 0) + 1

        stats_file = os.path.join(output_dir, 'generation_stats.json')
        with open(stats_file, 'w') as f:
            json.dump(stats, f, indent=2)

        print(f"\n📊 통계:")
        print(f"  총 변이: {stats['total_variants']}")
        print(f"  유효 변이: {stats['valid_variants']}")
        print(f"  성공률: {stats['valid_variants']/stats['total_variants']*100:.1f}%")
        print(f"  저장: {stats_file}")


def main():
    """메인 실행 함수"""
    print("🚀 FreeLang Synthetic Data Generator")
    print("=" * 50)

    # 생성기 초기화
    generator = SyntheticDataGenerator('./tests')

    # Step 1: 테스트 코드 로드
    print("\n📂 Step 1: 테스트 코드 로드")
    total = generator.load_all_tests()

    if total == 0:
        print("❌ 테스트 코드를 찾을 수 없습니다.")
        return

    # Step 2: 변이 생성
    print("\n🔄 Step 2: 합성 데이터 생성")
    variants = generator.generate_all_variants(per_test=50)  # 50 × 1006 = 50,300개

    # Step 3: 저장
    print("\n💾 Step 3: 데이터 저장")
    generator.save_variants()

    # Step 4: 통계
    print("\n📈 Step 4: 통계 생성")
    generator.generate_statistics()

    print("\n✅ 데이터셋 생성 완료!")
    print(f"  원본 테스트: {total}개")
    print(f"  생성된 변이: {variants}개")


if __name__ == '__main__':
    main()
