#!/bin/bash
echo "=== 🚀 FreeLang Phase 2 병렬 실행 모니터링 (2026-03-06) ==="
echo ""

# 73 서버 (로컬) 작업
echo "【73 서버 - 로컬】"
echo "Week 7 데이터 확장 (PID 3762256):"
ps aux | grep 3762256 | grep -v grep || echo "  ✅ 완료됨"
echo ""

# 232 서버 훈련 상황
echo "【232 서버 - 훈련】"
echo "Week 5 모델 훈련 (PID 42816):"
ssh -p 2222 kim@192.168.45.232 "ps aux | grep 42816 | grep -v grep" 2>/dev/null | awk '{print "  실행 시간: "$11" | CPU: "$3"% | 메모리: "int($6/1024)"MB"}'
echo ""

# 데이터 크기 확인
echo "【데이터 현황】"
echo -n "73 서버 확장 데이터: "
du -sh data/synthetic/variants_expanded.json 2>/dev/null || echo "생성 중..."
echo ""

echo "=== 다음 자동 실행: Week 5 완료 → Week 6 평가 ==="
