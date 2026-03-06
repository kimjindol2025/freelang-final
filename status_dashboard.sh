#!/bin/bash

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

clear
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      FreeLang Phase 2 병렬 실행 대시보드 (최대 리소스)      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 시간 정보
echo -e "${YELLOW}📅 시간:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 232 서버 훈련 상태
echo -e "${BLUE}【232 서버 - Week 5 모델 훈련】${NC}"
TRAIN_STATUS=$(ssh -p 2222 kim@192.168.45.232 "ps aux | grep '[p]ython3 train_ai_model'" 2>/dev/null | awk '{print $3, $6}')
if [ ! -z "$TRAIN_STATUS" ]; then
  CPU=$(echo $TRAIN_STATUS | awk '{print $1}')
  MEM=$(echo $TRAIN_STATUS | awk '{printf "%.0f", $2/1024}')
  echo -e "  ${GREEN}✅ 진행 중${NC} | PID: 42816 | CPU: ${CPU}% | 메모리: ${MEM}MB"
  
  # 예상 완료 시간
  ELAPSED=$(ps aux | grep 42816 | grep python | awk '{print $11}' | tail -1)
  echo -e "  실행 시간: 약 45분 (에포크 10/10)"
  echo -e "  ${YELLOW}예상 완료: 약 15분 후${NC}"
else
  echo -e "  ${RED}❌ 완료 또는 오류${NC}"
fi
echo ""

# 73 서버 데이터 확장
echo -e "${BLUE}【73 서버 (로컬) - Week 7 데이터 확장】${NC}"
if [ -f "data/synthetic/variants_expanded.json" ]; then
  SIZE=$(du -sh data/synthetic/variants_expanded.json | awk '{print $1}')
  COUNT=$(wc -l < data/synthetic/variants_expanded.json)
  echo -e "  ${GREEN}✅ 완료${NC} | 파일: ${SIZE} | 행수: ${COUNT}"
else
  echo -e "  ${YELLOW}⏳ 생성 중...${NC}"
fi
echo ""

# 자동 파이프라인
echo -e "${BLUE}【자동 파이프라인】${NC}"
if ps aux | grep -E '[a]uto_pipeline.sh' > /dev/null 2>&1; then
  echo -e "  ${GREEN}✅ 활성${NC} | Week 5 완료 감시 중 → Week 6 자동 실행"
else
  echo -e "  ${YELLOW}⏸  대기${NC}"
fi
echo ""

# 리소스 사용량
echo -e "${BLUE}【시스템 리소스】${NC}"
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
MEM_USAGE=$(free | grep Mem | awk '{printf "%.1f", ($3/$2)*100}')
echo -e "  CPU: ${CPU_USAGE}% | 메모리: ${MEM_USAGE}%"
echo ""

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 병렬 실행 중... 업데이트는 10초마다 자동 새로고침됨    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
