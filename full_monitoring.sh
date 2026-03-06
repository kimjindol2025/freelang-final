#!/bin/bash

while true; do
  clear
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║  FreeLang Phase 2 - 72코어 풀 로드 모니터링 (최대 리소스)   ║"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo ""
  echo "⏰ 시간: $(date '+%H:%M:%S')"
  echo ""
  
  # 232 서버 실시간 상황
  echo "【232 서버 - 실시간 모니터】"
  SSH_OUT=$(ssh -p 2222 kim@192.168.45.232 "ps aux | grep '[p]ython3 train_ai_model'" 2>/dev/null)
  
  if [ ! -z "$SSH_OUT" ]; then
    CPU=$(echo "$SSH_OUT" | awk '{print $3}')
    MEM=$(echo "$SSH_OUT" | awk '{printf "%.0f", $6/1024}')
    ETIME=$(echo "$SSH_OUT" | awk '{print $11}')
    echo "  ✅ 진행 중"
    echo "  CPU: ${CPU}% | 메모리: ${MEM}MB"
    echo "  실행 시간: ${ETIME}"
    
    # CPU 활용도 경고/확인
    CPU_INT=$(echo "$CPU" | cut -d'.' -f1)
    if [ $CPU_INT -ge 7000 ]; then
      echo "  🔥 최대 리소스 활용 중 (72코어 풀 로드)"
    elif [ $CPU_INT -ge 3600 ]; then
      echo "  ⚡ 높은 리소스 활용 중"
    else
      echo "  ⏳ 시작 단계 (점차 증가할 예정)"
    fi
  else
    echo "  ❌ 훈련 종료됨"
    
    # 모델 파일 확인
    MODEL_CHECK=$(ssh -p 2222 kim@192.168.45.232 "ls -lh ~/freelang-scripts/models/ai_optimizer_epoch*.pth 2>/dev/null | wc -l" 2>/dev/null)
    if [ "$MODEL_CHECK" -gt 0 ]; then
      echo "  ✅ 모델 파일 생성됨"
      ssh -p 2222 kim@192.168.45.232 "ls -lh ~/freelang-scripts/models/ai_optimizer_epoch*.pth" 2>/dev/null
    fi
  fi
  
  echo ""
  echo "【로그 확인】"
  ssh -p 2222 kim@192.168.45.232 "tail -5 ~/freelang-scripts/train_full.log" 2>/dev/null
  
  echo ""
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║  업데이트: 5초마다 자동 새로고침 | q: 종료                 ║"
  echo "╚════════════════════════════════════════════════════════════╝"
  
  sleep 5
done
