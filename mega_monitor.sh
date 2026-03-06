#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔥 232 서버 - 대규모 모델 최대 활용 실시간 모니터링      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

for i in {1..120}; do
  PROC=$(ssh -p 2222 kim@192.168.45.232 "ps aux | grep '[p]ython3 train_ai_model_large'" 2>/dev/null)
  
  if [ ! -z "$PROC" ]; then
    CPU=$(echo "$PROC" | awk '{print $3}')
    MEM=$(echo "$PROC" | awk '{print int($6/1024)}')
    TIME=$(echo "$PROC" | awk '{print $11}')
    
    clear
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  🔥 FreeLang Phase 2 - 대규모 모델 (2.1M 파라미터)        ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "⏰ 시간: $(date '+%H:%M:%S')"
    echo ""
    echo "【실시간 리소스】"
    echo "  CPU: ${CPU}% (목표: 7200%+ 72코어 풀 로드)"
    echo "  메모리: ${MEM}MB"
    echo "  실행 시간: ${TIME}"
    echo ""
    
    # 로그 확인
    LOG=$(ssh -p 2222 kim@192.168.45.232 "tail -5 ~/freelang-scripts/train_large.log 2>/dev/null" 2>/dev/null)
    if [ ! -z "$LOG" ]; then
      echo "【훈련 진행】"
      echo "$LOG" | tail -3
    else
      echo "【상태】데이터 로딩 중..."
    fi
    
    echo ""
    echo "【설정】"
    echo "  배치: 512 | 에포크: 5 | 파라미터: 2.1M"
    echo "  목표 정확도: 92%+"
    echo ""
    echo "  자동 갱신 중... ($(($i*5))초)"
  else
    echo "⏹️  훈련 종료"
    break
  fi
  
  sleep 5
done
