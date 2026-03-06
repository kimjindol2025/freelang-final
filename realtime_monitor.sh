#!/bin/bash

echo "🚀 FreeLang Phase 2 - 72코어 풀 로드 모니터링 시작"
echo ""

for i in {1..60}; do
  # 232 서버 CPU 상태
  SSH_OUT=$(ssh -p 2222 kim@192.168.45.232 "ps aux | grep python3 | grep train_ai_model" 2>/dev/null)
  
  if [ ! -z "$SSH_OUT" ]; then
    CPU=$(echo "$SSH_OUT" | awk '{print $3}')
    MEM=$(echo "$SSH_OUT" | awk '{printf "%d", $6/1024}')
    TIME=$(echo "$SSH_OUT" | awk '{print $11}')
    
    # 진행률 계산 (CPU 활용도 기준)
    CPU_INT=$(echo "$CPU" | cut -d'.' -f1)
    if [ $CPU_INT -ge 7000 ]; then
      PROGRESS="████████████████████ 100% (72코어)"
      STATUS="🔥 풀 로드 중"
    elif [ $CPU_INT -ge 5400 ]; then
      PROGRESS="███████████████░░░░░  75% (54코어)"
      STATUS="⚡ 높음"
    elif [ $CPU_INT -ge 3600 ]; then
      PROGRESS="██████████░░░░░░░░░░  50% (36코어)"
      STATUS="🟡 중간"
    else
      PROGRESS="██████░░░░░░░░░░░░░░  25% (18코어)"
      STATUS="⏳ 시작"
    fi
    
    clear
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  🚀 FreeLang Phase 2 Week 5 - 72코어 풀 로드 훈련 중      ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "⏰ 시간: $(date '+%H:%M:%S') | 경과: ${TIME}"
    echo ""
    echo "【CPU 활용도】"
    echo "  현재: ${CPU}% ${STATUS}"
    echo "  진행: $PROGRESS"
    echo ""
    echo "【메모리】"
    echo "  사용: ${MEM}MB"
    echo ""
    echo "【예상】"
    echo "  배치: 256 | 에포크: 5"
    echo "  예상 완료: 3-5분"
    echo ""
    echo "  마지막 업데이트: $(date '+%H:%M:%S')"
    echo "  (자동 갱신 중...)"
  else
    echo "❌ 훈련 종료 또는 오류 발생"
    break
  fi
  
  sleep 5
done

echo ""
echo "✅ 모니터링 완료"
