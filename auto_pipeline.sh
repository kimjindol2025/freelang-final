#!/bin/bash
set -e

echo "🔄 자동 파이프라인 시작..."
echo "태스크: Week 5 완료 → Week 6 평가 자동 실행"
echo ""

# 232 서버 훈련 완료 대기 (30분 타임아웃)
TIMEOUT=1800
ELAPSED=0
INTERVAL=10

echo "⏳ 232 서버 훈련 완료 대기 중..."
while [ $ELAPSED -lt $TIMEOUT ]; do
  if ssh -p 2222 kim@192.168.45.232 "ps aux | grep -E '[p]ython3 train_ai_model' > /dev/null" 2>/dev/null; then
    echo -ne "\r  진행 중... ($ELAPSED초)"
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
  else
    echo ""
    echo "✅ 232 서버 훈련 완료!"
    break
  fi
done

# 모델 파일 확인
echo ""
echo "📊 모델 파일 확인..."
ssh -p 2222 kim@192.168.45.232 "ls -lh ~/freelang-scripts/models/ai_optimizer* 2>/dev/null || echo '모델 파일 아직 생성 중...'" 2>/dev/null

# 모델 파일을 로컬로 전송
echo ""
echo "📥 모델 파일 전송..."
mkdir -p models
scp -P 2222 "kim@192.168.45.232:~/freelang-scripts/models/ai_optimizer*.pth" models/ 2>/dev/null && echo "✅ 전송 완료" || echo "⚠️ 모델 파일 미생성"

# Week 6 평가 시작
echo ""
echo "🚀 Week 6 모델 평가 시작..."
python3 scripts/model_evaluator.py &
EVAL_PID=$!
echo "평가 시작 (PID: $EVAL_PID)"

wait $EVAL_PID
echo "✅ Week 6 평가 완료"

echo ""
echo "📋 Week 8 강화학습 및 검증 준비..."
echo "완료 후 실행:"
echo "  python3 scripts/train_ai_model_rl.py"
echo "  python3 scripts/optimization_validator.py"
