#!/usr/bin/env node

/**
 * FreeLang v2.6.0 에이전트 모니터링 대시보드
 * 포트 50250에서 실시간 에이전트 상태 표시
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 50250;
const TASKS_DIR = '/tmp/claude-1000/-home-kimjin-Desktop-kim/tasks';
const REPO_DIR = '/home/kimjin/Desktop/kim/freelang-final';

// 에이전트 정보
const agents = [
  { name: 'Week 1: Union 타입', branch: 'feature/week1-union-types', color: '#FF6B6B' },
  { name: 'Week 2: try/catch + ?', branch: 'feature/week2-error-handling', color: '#4ECDC4' },
  { name: 'Week 3: import/export', branch: 'feature/week3-modules', color: '#45B7D1' },
  { name: 'Week 4: f-string', branch: 'feature/week4-fstring', color: '#96CEB4' }
];

/**
 * 에이전트 상태 확인
 */
function getAgentStatus() {
  const status = agents.map((agent, idx) => {
    const agentNum = idx + 1;

    // 브랜치 파일 변경 확인
    try {
      const result = require('child_process').execSync(
        `cd ${REPO_DIR} && git checkout -q ${agent.branch} 2>&1 && git status --short`,
        { encoding: 'utf8', timeout: 5000 }
      );

      const hasChanges = result.trim().length > 0;
      const hasTests = result.includes('test_');

      let status_text = '⏳ 준비중';
      let progress = 25;

      if (hasChanges && hasTests) {
        status_text = '✅ 완료';
        progress = 100;
      } else if (hasChanges) {
        status_text = '🔄 작업중';
        progress = 75;
      }

      return {
        name: agent.name,
        branch: agent.branch,
        status: status_text,
        progress: progress,
        color: agent.color,
        files: result.split('\n').filter(l => l.trim()).length
      };
    } catch (err) {
      return {
        name: agent.name,
        branch: agent.branch,
        status: '❌ 오류',
        progress: 0,
        color: agent.color,
        files: 0
      };
    }
  });

  return status;
}

/**
 * 진행률 계산
 */
function getOverallProgress() {
  const status = getAgentStatus();
  const totalProgress = status.reduce((sum, s) => sum + s.progress, 0);
  return Math.round(totalProgress / status.length);
}

/**
 * HTML 대시보드
 */
function getHTMLPage() {
  const status = getAgentStatus();
  const overall = getOverallProgress();

  const agentCards = status.map((agent, idx) => `
    <div class="agent-card" style="border-left: 6px solid ${agent.color}">
      <div class="agent-header">
        <h3>${agent.name}</h3>
        <span class="status-badge">${agent.status}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${agent.progress}%; background-color: ${agent.color}"></div>
      </div>
      <div class="agent-meta">
        <span>파일 수정: ${agent.files}개</span>
        <span>브랜치: ${agent.branch}</span>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FreeLang v2.6.0 에이전트 모니터링</title>
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
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }

        .overall-progress {
            background: white;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .progress-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-weight: 600;
            color: #333;
        }

        .progress-bar {
            width: 100%;
            height: 30px;
            background: #f0f0f0;
            border-radius: 15px;
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
            font-size: 0.9em;
        }

        .agents-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .agent-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .agent-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }

        .agent-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .agent-header h3 {
            font-size: 1.2em;
            color: #333;
        }

        .status-badge {
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
            background: #f0f0f0;
            color: #666;
        }

        .agent-card .progress-bar {
            height: 20px;
            margin-bottom: 15px;
        }

        .agent-meta {
            display: flex;
            justify-content: space-between;
            font-size: 0.85em;
            color: #666;
        }

        .stats {
            background: white;
            padding: 20px;
            border-radius: 10px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }

        .stat-item {
            text-align: center;
            padding: 15px;
        }

        .stat-item .value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }

        .stat-item .label {
            color: #666;
            font-size: 0.9em;
            margin-top: 5px;
        }

        .refresh-info {
            text-align: center;
            color: white;
            margin-top: 20px;
            font-size: 0.9em;
        }

        .status-icon {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 5px;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 FreeLang v2.6.0</h1>
            <p>에이전트 모니터링 대시보드</p>
        </div>

        <div class="overall-progress">
            <div class="progress-label">
                <span>전체 진행률</span>
                <span>${overall}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${overall}%">
                    ${overall > 15 ? overall + '%' : ''}
                </div>
            </div>
        </div>

        <div class="agents-grid">
            ${agentCards}
        </div>

        <div class="stats">
            <div class="stat-item">
                <div class="value">${status.filter(s => s.status === '✅ 완료').length}/4</div>
                <div class="label">완료된 에이전트</div>
            </div>
            <div class="stat-item">
                <div class="value">${status.reduce((sum, s) => sum + s.files, 0)}</div>
                <div class="label">수정된 파일</div>
            </div>
            <div class="stat-item">
                <div class="value">${new Date().toLocaleTimeString('ko-KR')}</div>
                <div class="label">마지막 업데이트</div>
            </div>
        </div>

        <div class="refresh-info">
            <span class="status-icon" style="background-color: #4ECDC4;"></span>
            5초마다 자동 새로고침 중...
        </div>
    </div>

    <script>
        // 5초마다 자동 새로고침
        setInterval(() => {
            location.reload();
        }, 5000);
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
    res.end(getHTMLPage());
  } else if (req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      agents: getAgentStatus(),
      overall: getOverallProgress(),
      timestamp: new Date().toISOString()
    }));
  } else if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', port: PORT }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`\n✅ 에이전트 모니터링 대시보드 시작!`);
  console.log(`📊 접속: http://127.0.0.1:${PORT}`);
  console.log(`🔄 5초마다 자동 새로고침`);
  console.log(`📡 API: http://127.0.0.1:${PORT}/api/status\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('모니터링 서버 종료...');
  server.close();
});
