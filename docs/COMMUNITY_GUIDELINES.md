# FreeLang 커뮤니티 가이드라인

## 목차
1. [기여 가이드](#기여-가이드)
2. [이슈 템플릿](#이슈-템플릿)
3. [PR 프로세스](#pr-프로세스)
4. [Code of Conduct](#code-of-conduct)
5. [질문하기](#질문하기)
6. [버그 리포팅](#버그-리포팅)

---

## 기여 가이드

FreeLang은 커뮤니티의 기여를 환영합니다! 다음 방법으로 도움을 주실 수 있습니다:

### 1. 코드 기여

FreeLang 개선에 코드를 기여하세요:

```bash
# 저장소 포크
git clone https://github.com/YOUR_USERNAME/freelang.git

# 기능 브랜치 생성
git checkout -b feature/your-feature-name

# 변경 사항 커밋
git commit -m "feat: Add your feature"

# 브랜치 푸시
git push origin feature/your-feature-name

# Pull Request 생성
# GitHub에서 PR을 생성합니다
```

### 2. 문서 개선

- 튜토리얼, 예제, API 문서 작성
- 오타 수정
- 번역 (다국어 지원)

### 3. 버그 리포팅

- 상세한 버그 설명
- 재현 방법
- 기대 동작

### 4. 기능 제안

- 새로운 기능 아이디어
- 성능 개선 제안
- 사용자 경험 개선

### 5. 테스트 작성

- 단위 테스트
- 통합 테스트
- E2E 테스트

---

## 이슈 템플릿

GitHub에서 이슈를 작성할 때 다음 템플릿을 사용하세요:

### 버그 리포트

```markdown
## 버그 설명
버그가 무엇인지 간단히 설명해주세요.

## 재현 방법
버그를 재현하는 단계:
1. ...
2. ...
3. ...

## 예상 동작
정상적인 동작이 무엇인지 설명해주세요.

## 실제 동작
실제로 일어나는 동작을 설명해주세요.

## 환경
- OS: [예: Windows 10, macOS 11, Ubuntu 20.04]
- FreeLang 버전: [예: 3.0.0]
- Node.js 버전: [예: 18.0.0]

## 스크린샷
해당되면 스크린샷을 첨부해주세요.

## 추가 정보
다른 관련 정보가 있으면 작성해주세요.
```

### 기능 요청

```markdown
## 기능 설명
요청하는 기능을 간단히 설명해주세요.

## 사용 사례
이 기능이 어디에 도움이 될지 설명해주세요.

## 예상 동작
기능이 어떻게 동작해야 하는지 설명해주세요.

## 대안 고려
다른 대안이 있다면 설명해주세요.

## 추가 정보
참고할 만한 링크나 예제가 있으면 첨부해주세요.
```

---

## PR 프로세스

### 1. PR 작성 전 확인

- [ ] 기능이 이슈에서 논의되었나요?
- [ ] 테스트를 작성했나요?
- [ ] 문서를 업데이트했나요?
- [ ] 코드 스타일을 확인했나요?

### 2. PR 템플릿

```markdown
## 관련 이슈
#123 (이슈 번호를 입력하세요)

## 변경 사항
- 변경 사항 1
- 변경 사항 2
- 변경 사항 3

## 테스트 방법
PR을 테스트하는 방법:
1. ...
2. ...
3. ...

## 체크리스트
- [ ] 코드 리뷰를 위해 준비됨
- [ ] 테스트를 추가/업데이트함
- [ ] 문서를 업데이트함
- [ ] 브레이킹 변경이 없음
- [ ] PR 설명이 명확함

## 스크린샷 (해당 시)
변경 전/후 스크린샷을 첨부해주세요.
```

### 3. PR 리뷰 체크리스트

PR 리뷰어는 다음을 확인합니다:

- [ ] 코드 품질
- [ ] 테스트 커버리지
- [ ] 문서 완전성
- [ ] 성능 영향
- [ ] 보안 문제
- [ ] 호환성

### 4. 병합 (Merge)

리뷰가 완료되고 모든 테스트가 통과하면 PR이 병합됩니다.

---

## Code of Conduct

### 우리의 약속

우리는 모두가 환영받고 포함되는 커뮤니티를 만들기 위해 약속합니다.

### 행동 기준

#### 긍정적 행동
- 포함적인 언어 사용
- 다양한 관점 존중
- 건설적인 비판 수용
- 커뮤니티 최선 집중

#### 용인되지 않는 행동
- 성희롱, 폭력, 괴롭힘
- 차별 (성별, 성적 지향, 장애, 종교 등)
- 개인 정보 공개 (승인 없이)
- 스팸, 홍보
- 다른 기여자를 폄하하는 언어

### 시행

위반 행동을 목격하면:

1. **보고**: conduct@freelang.io로 이메일 보내기
2. **검토**: 커뮤니티 팀이 검토합니다
3. **조치**: 필요한 조치를 취합니다

---

## 질문하기

### 좋은 질문의 특징

**명확한 제목**
```
나쁜 예: "도움 주세요!!!"
좋은 예: "async/await에서 에러 처리 방법이 무엇인가요?"
```

**문제 설명**
```
어떤 문제를 해결하려고 하나요?
```

**코드 예제**
```
재현 가능한 최소 코드를 제공하세요.
```

**당신이 시도한 것**
```
지금까지 뭘 시도했나요?
```

**예상 결과**
```
어떤 결과를 기대했나요?
```

### 질문 채널

- **GitHub Discussions**: 질문과 토론
- **Discord**: 실시간 채팅 (https://discord.gg/freelang)
- **Stack Overflow**: 태그 `freelang`

---

## 버그 리포팅

### 좋은 버그 리포트

#### 1. 재현 가능한 예제

```fl
// 버그를 재현하는 최소 코드
let arr = [1, 2, 3];
let result = map(arr, (x) => x * 2);
println(result);  // 예상: [2, 4, 6]
```

#### 2. 예상 vs 실제

```
예상: [2, 4, 6]
실제: TypeError: map is not defined
```

#### 3. 환경 정보

```
- FreeLang: 3.0.0
- Node.js: 18.0.0
- OS: macOS 11.6
```

#### 4. 스택 트레이스

```
Error: map is not defined
  at main.fl:3:15
  at runtime.js:123:45
```

### 버그 확인

버그를 제출하기 전에:

- [ ] 최신 버전인가요?
- [ ] 문서를 확인했나요?
- [ ] GitHub Issues를 검색했나요?
- [ ] 재현 가능한가요?

---

## 개발 설정

로컬에서 개발하려면:

```bash
# 저장소 클론
git clone https://github.com/freelang/freelang.git
cd freelang

# 의존성 설치
npm install

# 빌드
npm run build

# 테스트 실행
npm test

# 로컬 버전 사용
npm link
fl --version
```

---

## 커뮤니티 이벤트

### 월간 웨비나
- **일시**: 매월 첫 번째 목요일 UTC 18:00
- **주제**: 최신 기능, 팁, 커뮤니티 Q&A
- **참여**: https://freelang.io/webinars

### GitHub Discussions
- 기능 제안
- 베스트 프랙티스
- 프로젝트 쇼케이스

### Discord
- 실시간 채팅
- 기술 지원
- 네트워킹

---

## 리소스

### 문서
- 공식 문서: https://freelang.io/docs
- API 레퍼런스: https://freelang.io/docs/api
- 커뮤니티 튜토리얼: https://freelang.io/tutorials

### 커뮤니티
- GitHub: https://github.com/freelang/freelang
- Discord: https://discord.gg/freelang
- Stack Overflow: https://stackoverflow.com/questions/tagged/freelang

### 지원
- 버그 리포트: https://github.com/freelang/freelang/issues
- 기능 요청: https://github.com/freelang/freelang/discussions
- 보안 문제: security@freelang.io

---

감사합니다. FreeLang 커뮤니티를 함께 만들어가겠습니다! 🚀
