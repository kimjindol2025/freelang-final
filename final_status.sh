#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║       FreeLang Phase 2 최대 리소스 활용 - 최종 상태        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "⏰ 시간: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

echo "【232 서버 (메인 훈련)】"
ssh -p 2222 kim@192.168.45.232 "ps aux | grep '[p]ython3 train_ai_model'" 2>/dev/null | awk 'NR==1 {
  cpu = $3;
  mem = int($6/1024);
  cores = int(cpu / 100);
  printf "  ✅ 진행 중\n";
  printf "  CPU: %s%% (%d코어 사용)\n", cpu, cores;
  printf "  메모리: %dMB\n", mem;
  printf "  시간: %s\n", $11;
}'

echo ""
echo "【설정】"
echo "  배치 크기: 512 (256GB 메모리 활용)"
echo "  에포크: 3"
echo "  CPU 스레드: 72코어"
echo ""

echo "【예상】"
echo "  총 배치: 6,300개 / 512 = 약 13개 배치"
echo "  예상 완료: 약 5-10분"
echo ""

echo "【완료 후 자동 실행】"
echo "  ✅ Week 6: 모델 평가"
echo "  ✅ Week 7: 데이터 확장 (이미 완료)"
echo "  ✅ Week 8: RL 훈련"
echo "  ✅ Week 8: 검증"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔥 최대 리소스 활용 모드 실행 중...                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
