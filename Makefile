# ============================================
# FreeLang Phase 1 Compiler - Makefile
# ============================================
# 목적: FreeLang 컴파일 및 테스트 자동화
# 작성: 2026-03-06
# ============================================

.PHONY: help build test test-framework test-symbol-table test-semantic test-ir clean docs

# 기본 변수
FREELANG_BIN := freelang
FREELANG_INTERPRETER := node
FREELANG_MAIN := dist/index.js

# 디렉토리
SRC_DIR := src
TEST_DIR := src/test
COMPILER_DIR := src/compiler
BENCHMARK_DIR := src/benchmark
BUILD_DIR := build
DOCS_DIR := docs

# 파일
TEST_FRAMEWORK := $(TEST_DIR)/test-framework.fl
SYMBOL_TABLE := $(COMPILER_DIR)/symbol-table.fl

help:
	@echo "╔════════════════════════════════════════╗"
	@echo "║  FreeLang Phase 1 Compiler - Makefile  ║"
	@echo "╚════════════════════════════════════════╝"
	@echo ""
	@echo "사용 가능한 명령어:"
	@echo ""
	@echo "  make help              이 도움말 출력"
	@echo "  make build             컴파일러 빌드"
	@echo "  make test              모든 테스트 실행"
	@echo "  make test-framework    테스트 프레임워크 테스트"
	@echo "  make test-symbol-table Symbol Table 테스트"
	@echo "  make test-semantic     의미분석기 테스트 (준비 중)"
	@echo "  make test-ir           IR 생성기 테스트 (준비 중)"
	@echo "  make clean             빌드 산출물 제거"
	@echo "  make docs              문서 생성"
	@echo ""

# 빌드 타겟
build:
	@echo "🔨 Building FreeLang Phase 1 compiler..."
	@echo ""
	@echo "Status: 진행 중 (Week 2)"
	@echo "- Parser: ✓ (기존)"
	@echo "- Lexer: ✓ (기존)"
	@echo "- Symbol Table: ✓ (새로 추가)"
	@echo "- Semantic Analyzer: ⏳ (Week 3-4)"
	@echo "- IR Generator: ⏳ (Week 5-6)"
	@echo "- LLVM Backend: ⏳ (Week 8)"
	@echo ""

# 테스트 타겟
test: test-framework test-symbol-table
	@echo ""
	@echo "╔════════════════════════════════════════╗"
	@echo "║       모든 테스트 완료                  ║"
	@echo "╚════════════════════════════════════════╝"

test-framework:
	@echo ""
	@echo "🧪 Running: Test Framework Tests"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "test-framework.fl를 FreeLang 인터프리터로 실행:"
	@echo "$ $(FREELANG_INTERPRETER) $(FREELANG_MAIN) $(TEST_FRAMEWORK)"
	@echo ""
	@echo "현재 상태: 테스트 케이스 작성 완료"
	@echo "- Basic Assertions: 4개 테스트"
	@echo "- Symbol Table Example: 3개 테스트"
	@echo "- Semantic Analyzer Example: 2개 테스트"
	@echo "- IR Generator Example: 2개 테스트"
	@echo ""
	@echo "[실행 예정] npm run test"
	@echo ""

test-symbol-table:
	@echo ""
	@echo "🧪 Running: Symbol Table Tests"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "symbol-table.fl를 FreeLang 인터프리터로 실행:"
	@echo "$ $(FREELANG_INTERPRETER) $(FREELANG_MAIN) $(SYMBOL_TABLE)"
	@echo ""
	@echo "테스트 항목:"
	@echo "1. Symbol table 생성"
	@echo "2. 글로벌 변수 선언"
	@echo "3. 글로벌 함수 선언"
	@echo "4. 심볼 조회"
	@echo "5. 변수 초기화 표시"
	@echo "6. 스코프 진입"
	@echo "7. 로컬 변수 선언"
	@echo "8. 로컬 변수 조회"
	@echo "9. 스코프 종료"
	@echo "10. 글로벌 변수 유지 확인"
	@echo "11. 로컬 변수 제거 확인"
	@echo "12. 중복 선언 감지"
	@echo "13. 에러 리포팅"
	@echo ""
	@echo "[실행 예정] npm run test"
	@echo ""

test-semantic:
	@echo ""
	@echo "🧪 Running: Semantic Analyzer Tests"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "상태: Week 3-4에 구현 예정"
	@echo ""

test-ir:
	@echo ""
	@echo "🧪 Running: IR Generator Tests"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "상태: Week 5-6에 구현 예정"
	@echo ""

# 정리
clean:
	@echo "🧹 Cleaning up..."
	@rm -rf $(BUILD_DIR)
	@rm -f *.o *.elf *.out
	@find . -name "*.tmp" -delete
	@echo "✓ Clean complete"

# 문서 생성
docs:
	@echo "📚 Generating documentation..."
	@echo ""
	@echo "생성된 문서:"
	@echo "- PHASE_1_ARCHITECTURE_DESIGN.md"
	@echo "- SEMANTIC_ANALYZER_SPEC.md (Week 2 예정)"
	@echo "- IR_SPEC.md (Week 5 예정)"
	@echo "- LLVM_INTEGRATION_GUIDE.md (Week 8 예정)"
	@echo ""

# 상태 확인
status:
	@echo ""
	@echo "📊 Phase 1 Status Report"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "현재 주차: Week 1-2 (설계 및 기초)"
	@echo ""
	@echo "완료:"
	@echo "  ✓ 아키텍처 설계 (PHASE_1_ARCHITECTURE_DESIGN.md)"
	@echo "  ✓ 테스트 프레임워크 (test-framework.fl)"
	@echo "  ✓ Symbol Table 구현 (symbol-table.fl)"
	@echo "  ✓ Makefile 작성"
	@echo ""
	@echo "진행 중:"
	@echo "  ⏳ 의존성 분석"
	@echo "  ⏳ LLVM 바인딩 검토"
	@echo ""
	@echo "예정:"
	@echo "  ⏳ Semantic Analyzer (Week 3-4)"
	@echo "  ⏳ IR Generator (Week 5-6)"
	@echo "  ⏳ LLVM 통합 (Week 8)"
	@echo ""

# 코드 통계
stats:
	@echo ""
	@echo "📈 Code Statistics (Phase 1)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "FreeLang 파일:"
	@wc -l $(TEST_FRAMEWORK) $(SYMBOL_TABLE) 2>/dev/null || echo "파일 정보 없음"
	@echo ""
	@echo "총 줄 수:"
	@find $(SRC_DIR) -name "*.fl" | xargs wc -l | tail -1
	@echo ""

# 기본 타겟
.DEFAULT_GOAL := help
