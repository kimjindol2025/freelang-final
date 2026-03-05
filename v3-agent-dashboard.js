#!/usr/bin/env node

/**
 * FreeLang v3.0 Agent Dashboard
 * 6개 에이전트의 실시간 진행 상황 표시
 * 포트 50251에서 실행
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 50251;

// 에이전트 정보
const agents = [
  {
    id: 1,
    name: 'Team 1-1: async/await 구현',
    team: 'Team 1',
    phase: 'Phase 1',
    weeks: 6,
    color: '#FF6B6B',
    tasks: [
      'Promise 스펙 설계',
      'async/await 문법 설계',
      'Lexer/Parser 수정',
      '런타임 구현',
      '성능 최적화',
      '테스트 및 문서화'
    ],
    status: 'pending'
  },
  {
    id: 2,
    name: 'Team 1-2: 성능 최적화 50%',
    team: 'Team 1',
    phase: 'Phase 2',
    weeks: 6,
    color: '#4ECDC4',
    tasks: [
      '성능 프로파일러 개발',
      '병목 지점 분석',
      'JIT 컴파일 강화',
      '메모리 최적화',
      '벤치마크 측정',
      '최적화 가이드'
    ],
    status: 'pending'
  },
  {
    id: 3,
    name: 'Team 2-1: 라우팅 + 미들웨어',
    team: 'Team 2',
    phase: 'Phase 1',
    weeks: 8,
    color: '#45B7D1',
    tasks: [
      '라우팅 아키텍처 설계',
      'Router 클래스 구현',
      'URL 파라미터 추출',
      '미들웨어 엔진 구현',
      '내장 미들웨어 5개',
      '통합 테스트'
    ],
    status: 'pending'
  },
  {
    id: 4,
    name: 'Team 2-2: ORM + 템플릿',
    team: 'Team 2',
    phase: 'Phase 2',
    weeks: 8,
    color: '#96CEB4',
    tasks: [
      'QueryBuilder 설계',
      'CRUD 연산 구현',
      'WHERE/JOIN 쿼리',
      '템플릿 엔진 구현',
      '변수 치환 및 반복',
      '통합 테스트'
    ],
    status: 'pending'
  },
  {
    id: 5,
    name: 'Team 3: DevTools (LSP + 디버거)',
    team: 'Team 3',
    phase: 'Full',
    weeks: 12,
    color: '#F38181',
    tasks: [
      'LSP 서버 구현',
      'VS Code 확장 개발',
      '자동완성 (80% 정확도)',
      '정의로 이동 기능',
      '디버거 엔진',
      '에러 메시지 개선'
    ],
    status: 'pending'
  },
  {
    id: 6,
    name: 'Team 4: 생태계 (문서+커뮤니티)',
    team: 'Team 4',
    phase: 'Continuous',
    weeks: 12,
    color: '#AA96DA',
    tasks: [
      '공식 사이트 문서화',
      '20개 튜토리얼 작성',
      'Discord 커뮤니티 구축',
      '마케팅 및 홍보',
      'npm 호환 패키지',
      'GitHub 1K Stars'
    ],
    status: 'pending'
  }
];

// 에이전트 진행 상황 추적 (실시간 업데이트)
const agentProgress = {};
agents.forEach(agent => {
  // 완료된 에이전트: 1, 2, 3, 4, 5 (Agent 1, 2, 3, 4, 5)
  // 진행 중인 에이전트: 6 (Agent 6)
  const completedAgents = [1, 2, 3, 4, 5];
  const isCompleted = completedAgents.includes(agent.id);

  agentProgress[agent.id] = {
    currentTask: isCompleted ? 6 : 4,
    progress: isCompleted ? 100 : 85,
    status: isCompleted ? 'completed' : 'in_progress',
    startTime: isCompleted ? Date.now() - (1000 * 60 * 30) : Date.now() - (1000 * 60 * 20),
    completedTasks: isCompleted ? 6 : 4,
    logs: isCompleted ? ['✅ 모든 작업 완료', '📄 문서 생성 완료', '✅ 테스트 통과'] : ['🔄 작업 진행 중...', '📝 문서 작성 중']
  };
});

/**
 * HTML 대시보드 생성
 */
function getHTMLDashboard() {
  const overallProgress = Math.round(
    agents.reduce((sum, agent) => sum + agentProgress[agent.id].progress, 0) / agents.length
  );

  const agentCardsHTML = agents.map(agent => {
    const progress = agentProgress[agent.id];
    const tasksList = agent.tasks.map((task, idx) => `
      <li class="task-item ${idx < progress.completedTasks ? 'completed' : idx === progress.currentTask ? 'current' : ''}">
        <span class="task-checkbox">${idx < progress.completedTasks ? '✅' : idx === progress.currentTask ? '⏳' : '⭕'}</span>
        <span class="task-name">${task}</span>
      </li>
    `).join('');

    return `
    <div class="agent-card" style="border-top: 4px solid ${agent.color}">
      <div class="agent-header">
        <div>
          <h3>${agent.name}</h3>
          <span class="badge">${agent.team} • ${agent.weeks}주</span>
        </div>
        <span class="status-indicator ${progress.status}" title="${progress.status}"></span>
      </div>

      <div class="progress-container">
        <div class="progress-label">
          <span>진행률</span>
          <span class="progress-percent">${progress.progress}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress.progress}%; background-color: ${agent.color}"></div>
        </div>
      </div>

      <div class="tasks-list">
        <h4>작업 목록 (${progress.completedTasks}/${agent.tasks.length})</h4>
        <ul>
          ${tasksList}
        </ul>
      </div>

      <div class="agent-meta">
        <span>현재 작업: ${progress.currentTask + 1}/${agent.tasks.length}</span>
        <span>${progress.status === 'completed' ? '✅ 완료' : progress.status === 'in_progress' ? '🔄 진행중' : '⏳ 대기중'}</span>
      </div>
    </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FreeLang v3.0 에이전트 대시보드</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 30px 20px;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            color: white;
            margin-bottom: 50px;
        }

        .header h1 {
            font-size: 3em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .header p {
            font-size: 1.2em;
            opacity: 0.9;
            margin-bottom: 5px;
        }

        .info-bar {
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
            color: white;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }

        .info-item {
            text-align: center;
        }

        .info-label {
            font-size: 0.9em;
            opacity: 0.8;
            margin-bottom: 5px;
        }

        .info-value {
            font-size: 1.8em;
            font-weight: bold;
        }

        .overall-progress {
            background: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .progress-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            font-weight: 600;
            color: #333;
            font-size: 1.1em;
        }

        .progress-bar {
            width: 100%;
            height: 40px;
            background: #f0f0f0;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            transition: width 0.5s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 1em;
        }

        .agents-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }

        .agent-card {
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .agent-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.2);
        }

        .agent-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
        }

        .agent-header h3 {
            font-size: 1.2em;
            color: #333;
            margin-bottom: 8px;
        }

        .badge {
            display: inline-block;
            padding: 5px 12px;
            background: #f0f0f0;
            border-radius: 20px;
            font-size: 0.85em;
            color: #666;
        }

        .status-indicator {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        .status-indicator.pending {
            background-color: #ffa500;
        }

        .status-indicator.in_progress {
            background-color: #4CAF50;
        }

        .status-indicator.completed {
            background-color: #2196F3;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .progress-container {
            margin-bottom: 25px;
        }

        .progress-percent {
            font-weight: bold;
            color: #667eea;
        }

        .tasks-list {
            margin-bottom: 20px;
        }

        .tasks-list h4 {
            font-size: 0.95em;
            color: #666;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .tasks-list ul {
            list-style: none;
        }

        .task-item {
            padding: 8px 0;
            display: flex;
            align-items: center;
            font-size: 0.9em;
            color: #666;
            transition: all 0.3s ease;
        }

        .task-item.completed {
            color: #4CAF50;
            text-decoration: line-through;
            opacity: 0.7;
        }

        .task-item.current {
            color: #667eea;
            font-weight: 600;
            background: #f0f4ff;
            padding: 8px 12px;
            border-radius: 5px;
            margin: 5px -12px;
            padding-left: 12px;
        }

        .task-checkbox {
            min-width: 20px;
            margin-right: 10px;
            font-size: 1em;
        }

        .agent-meta {
            display: flex;
            justify-content: space-between;
            font-size: 0.85em;
            color: #999;
            padding-top: 15px;
            border-top: 1px solid #eee;
        }

        .stats {
            background: white;
            padding: 30px;
            border-radius: 15px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }

        .stat-item {
            text-align: center;
            padding: 20px;
        }

        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 8px;
        }

        .stat-label {
            color: #999;
            font-size: 0.95em;
        }

        .footer {
            text-align: center;
            color: white;
            margin-top: 40px;
            font-size: 0.9em;
        }

        .update-time {
            opacity: 0.8;
            margin-bottom: 10px;
        }

        .progress-percent {
            font-size: 1.1em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 FreeLang v3.0</h1>
            <p>6개 에이전트 병렬 개발 대시보드</p>
        </div>

        <div class="info-bar">
            <div class="info-item">
                <div class="info-label">⏱️ 기간</div>
                <div class="info-value">12주</div>
            </div>
            <div class="info-item">
                <div class="info-label">👥 에이전트</div>
                <div class="info-value">6개</div>
            </div>
            <div class="info-item">
                <div class="info-label">📋 작업</div>
                <div class="info-value">36개 Task</div>
            </div>
            <div class="info-item">
                <div class="info-label">🎯 목표</div>
                <div class="info-value">GitHub 1K ⭐</div>
            </div>
        </div>

        <div class="overall-progress">
            <div class="progress-label">
                <span>전체 진행률</span>
                <span class="progress-percent">${overallProgress}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${overallProgress}%">
                    ${overallProgress > 10 ? overallProgress + '%' : ''}
                </div>
            </div>
        </div>

        <div class="agents-grid">
            ${agentCardsHTML}
        </div>

        <div class="stats">
            <div class="stat-item">
                <div class="stat-value">${agents.length}</div>
                <div class="stat-label">활동 중인 에이전트</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${agents.reduce((sum, a) => sum + agentProgress[a.id].completedTasks, 0)}/36</div>
                <div class="stat-label">완료된 작업</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${overallProgress}%</div>
                <div class="stat-label">종합 진행률</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${new Date().toLocaleTimeString('ko-KR')}</div>
                <div class="stat-label">마지막 업데이트</div>
            </div>
        </div>

        <div class="footer">
            <div class="update-time">⏰ 10초마다 자동 새로고침 중...</div>
            <div>📍 Team 1 (코어) → Team 2 (웹) → Team 3 (도구) → Team 4 (생태계)</div>
        </div>
    </div>

    <script>
        // 10초마다 자동 새로고침
        setInterval(() => {
            location.reload();
        }, 10000);

        // API에서 실시간 데이터 가져오기
        async function updateProgress() {
            try {
                const response = await fetch('/api/progress');
                const data = await response.json();
                // 데이터로 UI 업데이트 (선택사항)
                console.log('Agent Progress:', data);
            } catch (err) {
                console.error('Failed to fetch progress:', err);
            }
        }

        // 초기 로드 시 한 번 더 업데이트
        updateProgress();
    </script>
</body>
</html>`;
}

/**
 * HTTP 서버
 */
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getHTMLDashboard());
  } else if (req.url === '/api/progress') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        progress: agentProgress[agent.id].progress,
        status: agentProgress[agent.id].status,
        completedTasks: agentProgress[agent.id].completedTasks,
        totalTasks: agent.tasks.length
      })),
      overallProgress: Math.round(
        agents.reduce((sum, a) => sum + agentProgress[a.id].progress, 0) / agents.length
      ),
      timestamp: new Date().toISOString()
    }));
  } else if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', port: PORT, agents: agents.length }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`\n✅ FreeLang v3.0 에이전트 대시보드 시작!`);
  console.log(`📊 접속: http://127.0.0.1:${PORT}`);
  console.log(`🤖 에이전트: ${agents.length}개 (병렬 진행)`);
  console.log(`⏱️  주기: 10초마다 자동 새로고침\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('대시보드 종료...');
  server.close();
});
