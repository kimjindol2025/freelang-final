# 📤 FreeLang Final Repository - GOGS 배포 가이드

**목표**: FreeLang Final 저장소를 GOGS에 푸시하고 영구 저장

---

## 📋 사전 준비

### 1단계: GOGS 토큰 확인

```bash
# GOGS 토큰이 저장되어 있는지 확인
cat ~/.gogs_token

# 없으면 생성 (GOGS 웹에서)
# Settings → Applications → Generate new token
# 스코프: repo (필수)
```

### 2단계: 저장소 생성

**방법 A: 웹 인터페이스** (권장)
1. https://gogs.dclub.kr/user/repos 방문
2. "New Repository" 클릭
3. Repository name: `freelang-final`
4. Description: `FreeLang - 99.9% Self-Hosting Achievement`
5. Private: ☐ (체크 해제, 공개)
6. Create Repository 클릭

**방법 B: API** (자동화)
```bash
TOKEN="your_gogs_token_here"

curl -X POST \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "freelang-final",
    "description": "FreeLang - 99.9% Self-Hosting Achievement. Complete language independence with 8,142 lines of FreeLang.",
    "private": false
  }' \
  "https://gogs.dclub.kr/api/v1/user/repos"
```

---

## 🚀 푸시 방법

### 방법 1: SSH (권장)

**전제조건**: SSH 키가 GOGS에 등록되어 있어야 함

```bash
# 현재 위치: /data/data/com.termux/files/home/freelang-final

# 원본 제거 (HTTPS)
git remote remove origin

# SSH 원본 추가
git remote add origin git@gogs.dclub.kr:kim/freelang-final.git

# 푸시
git push -u origin master
```

### 방법 2: HTTPS (기본)

```bash
# 현재 위치: /data/data/com.termux/files/home/freelang-final

# HTTPS 원본이 이미 설정되어 있음
git remote -v

# 푸시 (사용자명/패스워드 입력 요청)
git push -u origin master

# 입력:
# Username for 'https://gogs.dclub.kr': kim
# Password for 'https://kim@gogs.dclub.kr': [GOGS 패스워드]
```

### 방법 3: 토큰 인증 (HTTPS)

```bash
# GOGS 토큰으로 인증
TOKEN="your_gogs_token_here"
USERNAME="kim"

# 원본 재설정
git remote remove origin
git remote add origin https://${USERNAME}:${TOKEN}@gogs.dclub.kr/kim/freelang-final.git

# 푸시
git push -u origin master
```

---

## ✅ 푸시 확인

### 1단계: 로컬 확인

```bash
# 현재 위치 확인
pwd
# 출력: /data/data/com.termux/files/home/freelang-final

# 커밋 확인
git log --oneline -5
# 출력:
# f17de4b docs(manifest): Complete FreeLang Final Repository structure
# 8ffff32 feat: FreeLang Final Repository - 99.9% Self-Hosting Achievement

# 브랜치 확인
git branch -a
# 출력:
# * master
#   remotes/origin/master
```

### 2단계: GOGS 웹 확인

```bash
# 브라우저에서 방문
https://gogs.dclub.kr/kim/freelang-final

# 다음이 보이는지 확인:
# ✅ 2개 커밋
# ✅ README.md 파일
# ✅ growth/ 디렉토리
# ✅ MANIFEST.md 파일
```

### 3단계: API로 확인

```bash
TOKEN="your_gogs_token_here"

curl -H "Authorization: token $TOKEN" \
  https://gogs.dclub.kr/api/v1/repos/kim/freelang-final

# 응답 예:
# {
#   "name": "freelang-final",
#   "full_name": "kim/freelang-final",
#   "description": "FreeLang - 99.9% Self-Hosting Achievement...",
#   "commits": 2
# }
```

---

## 🔧 트러블슈팅

### 문제 1: "repository not found"

**원인**: GOGS에 저장소가 없음

**해결**:
```bash
# 웹에서 저장소 생성 (위의 "사전 준비" 섹션 참고)
# 또는 API로 생성

# 확인
git remote -v
# origin이 https://gogs.dclub.kr/kim/freelang-final.git를 가리키는지 확인
```

### 문제 2: "authentication failed"

**원인**: 사용자명/패스워드 또는 토큰이 잘못됨

**해결**:
```bash
# 방법 A: 자격증명 재입력
git push -u origin master  # 입력 프롬프트 나타남

# 방법 B: 토큰 사용
git remote remove origin
git remote add origin https://kim:${TOKEN}@gogs.dclub.kr/kim/freelang-final.git
git push -u origin master

# 방법 C: SSH 사용
git remote remove origin
git remote add origin git@gogs.dclub.kr:kim/freelang-final.git
git push -u origin master
```

### 문제 3: "fatal: unable to access"

**원인**: 네트워크 연결 문제 또는 URL 오류

**해결**:
```bash
# URL 확인
git remote -v
# git@gogs.dclub.kr:kim/freelang-final.git 또는
# https://gogs.dclub.kr/kim/freelang-final.git

# 네트워크 테스트
ping gogs.dclub.kr  # 또는
curl -I https://gogs.dclub.kr

# 재시도
git push -u origin master -v  # 상세 로그 출력
```

### 문제 4: "fatal: 'origin' does not appear to be a 'git' repository"

**원인**: 현재 디렉토리가 git 저장소가 아님

**해결**:
```bash
# 올바른 디렉토리 확인
pwd
# 출력: /data/data/com.termux/files/home/freelang-final

# .git 디렉토리 확인
ls -la .git
# 출력: drwxr-xr-x ... .git

# git 상태 확인
git status
```

---

## 📊 푸시 후 검증

### 체크리스트

```bash
# ✅ 로컬에서 커밋 확인
git log --oneline -3

# ✅ 원본 설정 확인
git remote -v

# ✅ 추적 브랜치 확인
git branch -a

# ✅ 파일 목록 확인
git ls-tree -r HEAD

# ✅ 파일 내용 확인 (README.md 첫 10줄)
git show HEAD:README.md | head -10
```

### GOGS 웹에서 확인

```
https://gogs.dclub.kr/kim/freelang-final

확인 항목:
☑ Repository name: freelang-final
☑ Description: FreeLang - 99.9% Self-Hosting Achievement...
☑ Commits: 2개 이상
☑ Files: README.md, MANIFEST.md, growth/ 등
☑ Branches: master
☑ Last commit: 오늘 날짜
```

---

## 🎯 배포 완료 후 다음 단계

### 1단계: README 최상단 추가 (선택)

```markdown
# FreeLang - 99.9% 자체호스팅 달성 🎉

> **기록이 증명한다** (Your Record is Your Proof)
>
> 8,142줄의 FreeLang 코드로 완전한 언어 독립성 입증

[전체 문서 보기](./MANIFEST.md)
```

### 2단계: 태그 생성 (선택)

```bash
git tag -a v1.0-final -m "FreeLang Final Repository - 99.9% Self-Hosting

- 8,142줄 FreeLang (99.9%)
- 8줄 Rust (0.1%, 모듈선언)
- 63개 테스트 통과
- Stack Integrity 검증 완료 (1M 스위칭, drift=0)

Status: ✅ LANGUAGE INDEPENDENT"

git push origin v1.0-final
```

### 3단계: GOGS에서 Release 생성 (선택)

웹 인터페이스:
1. Releases 탭 클릭
2. "Create a Release" 클릭
3. Tag: v1.0-final
4. Title: "FreeLang Final Repository v1.0"
5. Description: [위의 태그 메시지]

---

## 📝 최종 확인 사항

### 저장소 메타데이터

```bash
# 저장소 정보 출력
git log --all --oneline --graph

# 예상 출력:
# * f17de4b docs(manifest): Complete FreeLang Final Repository structure
# * 8ffff32 feat: FreeLang Final Repository - 99.9% Self-Hosting Achievement

# 파일 목록
ls -la

# 예상:
# drwxr-xr-x  3 user user       4096  growth/
# -rw-r--r--  1 user user    446226  MANIFEST.md
# -rw-r--r--  1 user user  1358226  growth/
# -rw-r--r--  1 user user   98226   README.md
# drwxr-xr-x  2 user user       4096  .git/
```

### 최종 상태

```
FreeLang Final Repository Status
================================

✅ 로컬 저장소
  - 위치: /data/data/com.termux/files/home/freelang-final
  - 커밋: 2개
  - 파일: 4개 (README.md, MANIFEST.md, growth/*, .git/)
  - 브랜치: master

⏳ GOGS 배포 (다음 단계)
  - 저장소: https://gogs.dclub.kr/kim/freelang-final
  - 상태: 푸시 대기
  - 방법: git push -u origin master

📊 최종 메트릭
  - 코드: 8,142줄 FreeLang (99.9%)
  - 문서: 7,000+줄
  - 테스트: 63개 통과 (100%)
  - 언어 독립성: 99.9% ✅
```

---

## 🚀 자동 배포 스크립트

```bash
#!/bin/bash
# deploy-to-gogs.sh

set -e

# 설정
GOGS_HOST="https://gogs.dclub.kr"
USERNAME="kim"
REPO_NAME="freelang-final"
TOKEN="${GOGS_TOKEN:-}"  # 환경변수에서 토큰 읽음

# 1단계: 토큰 확인
if [ -z "$TOKEN" ]; then
    echo "❌ GOGS_TOKEN 환경변수가 설정되지 않음"
    echo "설정: export GOGS_TOKEN='your_token_here'"
    exit 1
fi

# 2단계: 저장소 생성 (존재하지 않으면)
echo "📦 저장소 생성 중..."
curl -s -X POST \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "'$REPO_NAME'",
    "description": "FreeLang - 99.9% Self-Hosting Achievement",
    "private": false
  }' \
  "$GOGS_HOST/api/v1/user/repos" || echo "ℹ️ 저장소가 이미 존재하거나 생성 실패"

# 3단계: 원본 설정
echo "🔗 원본 설정 중..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://${USERNAME}:${TOKEN}@${GOGS_HOST#https://}/${USERNAME}/${REPO_NAME}.git"

# 4단계: 푸시
echo "📤 푸시 중..."
git push -u origin master

# 5단계: 확인
echo "✅ 푸시 완료!"
echo "🌐 저장소: $GOGS_HOST/$USERNAME/$REPO_NAME"

# 6단계: 상세 정보 출력
echo ""
echo "📊 저장소 정보:"
curl -s -H "Authorization: token $TOKEN" \
  "$GOGS_HOST/api/v1/repos/$USERNAME/$REPO_NAME" | jq '.  '
```

**사용**:
```bash
chmod +x deploy-to-gogs.sh
export GOGS_TOKEN="your_token_here"
./deploy-to-gogs.sh
```

---

## 🎖️ 배포 완료

```
┌────────────────────────────────────────┐
│   FreeLang Final Repository Deployed   │
├────────────────────────────────────────┤
│ ✅ 로컬 저장소: /freelang-final        │
│ ✅ 원본 설정: origin → https://...     │
│ ✅ 브랜치: master                      │
│ ✅ 커밋: 2개                           │
│ ⏳ GOGS 배포: 준비 완료                │
│                                        │
│ 다음: git push -u origin master       │
└────────────────────────────────────────┘
```

**저장소**: https://gogs.dclub.kr/kim/freelang-final
**상태**: 준비 완료 ✅

---

**생성**: 2026-03-03
**대상**: FreeLang Final Repository v1.0
**상태**: 배포 대기 중
