# FreeLang v3.0 - 웹 프레임워크

## 목차
1. [기본 서버 설정](#기본-서버-설정)
2. [라우팅](#라우팅)
3. [미들웨어](#미들웨어)
4. [요청/응답 처리](#요청응답-처리)
5. [데이터베이스](#데이터베이스)
6. [폼 처리](#폼-처리)
7. [ORM 사용](#orm-사용)
8. [실전 예제](#실전-예제)

---

## 기본 서버 설정

### Hello World 서버

```fl
use @freelang/web as web;

let app = web.createApp();

app.get("/", fn(req, res) {
  res.send("Hello, World!");
});

app.listen(3000, fn() {
  println("Server running on port 3000");
  println("Visit http://localhost:3000");
});
```

### 다양한 포트와 호스트

```fl
use @freelang/web as web;

let app = web.createApp();

app.get("/", fn(req, res) {
  res.send("Hello");
});

// 포트 지정
app.listen(8080);

// 호스트와 포트 지정
app.listen(3000, "localhost", fn() {
  println("Ready");
});

// 클러스터 모드 (여러 프로세스)
app.cluster(4)  // 4개 워커 프로세스
  .listen(3000, fn() {
    println("Cluster mode");
  });
```

### 서버 이벤트

```fl
use @freelang/web as web;

let app = web.createApp();

// 요청 전 이벤트
app.on("request", fn(req) {
  println("Request: " + req.method + " " + req.path);
});

// 요청 후 이벤트
app.on("response", fn(res) {
  println("Response: " + str(res.statusCode));
});

// 에러 이벤트
app.on("error", fn(error) {
  println("Error: " + error);
});

// 서버 종료
app.on("close", fn() {
  println("Server closed");
});

app.listen(3000);
```

---

## 라우팅

### HTTP 메서드

```fl
use @freelang/web as web;

let app = web.createApp();

// GET 요청
app.get("/users", fn(req, res) {
  res.json({ users: ["Alice", "Bob"] });
});

// POST 요청
app.post("/users", fn(req, res) {
  let name = req.body.name;
  res.json({ message: "User created: " + name });
});

// PUT 요청 (전체 갱신)
app.put("/users/:id", fn(req, res) {
  let id = req.params.id;
  res.json({ message: "User " + id + " updated" });
});

// PATCH 요청 (부분 갱신)
app.patch("/users/:id", fn(req, res) {
  let id = req.params.id;
  res.json({ message: "User " + id + " patched" });
});

// DELETE 요청
app.delete("/users/:id", fn(req, res) {
  let id = req.params.id;
  res.json({ message: "User " + id + " deleted" });
});

// HEAD 요청
app.head("/users/:id", fn(req, res) {
  res.status(200).send("");
});

// OPTIONS 요청
app.options("/users/:id", fn(req, res) {
  res.header("Allow", "GET,POST,PUT,PATCH,DELETE");
  res.send("");
});

// 모든 메서드
app.all("/ping", fn(req, res) {
  res.send("pong");
});
```

### 경로 매개변수

```fl
use @freelang/web as web;

let app = web.createApp();

// 단일 매개변수
app.get("/users/:id", fn(req, res) {
  let id = req.params.id;
  res.json({ id: id, name: "User " + id });
});

// 여러 매개변수
app.get("/users/:user_id/posts/:post_id", fn(req, res) {
  let user_id = req.params.user_id;
  let post_id = req.params.post_id;
  res.json({ user: user_id, post: post_id });
});

// 쿼리 매개변수
app.get("/search", fn(req, res) {
  let q = req.query.q;        // 검색어
  let limit = req.query.limit; // 결과 수
  let offset = req.query.offset; // 오프셋

  res.json({
    query: q,
    limit: limit,
    offset: offset,
    results: []
  });
});

// 예: /search?q=free&limit=10&offset=20
```

### 라우트 그룹

```fl
use @freelang/web as web;

let app = web.createApp();

// 버전 1 API
let v1 = app.group("/api/v1");

v1.get("/users", fn(req, res) {
  res.json({ version: "v1", users: [] });
});

v1.post("/users", fn(req, res) {
  res.json({ version: "v1", message: "created" });
});

// 버전 2 API
let v2 = app.group("/api/v2");

v2.get("/users", fn(req, res) {
  res.json({ version: "v2", users: [], pagination: {} });
});

// 중첩 그룹
let admin = app.group("/admin");
let api = admin.group("/api");

api.get("/users", fn(req, res) {
  res.json({ admin: true, users: [] });
});
```

---

## 미들웨어

### 미들웨어 등록

```fl
use @freelang/web as web;

let app = web.createApp();

// 전역 미들웨어
app.use(fn(req, res, next) {
  println("Request: " + req.method + " " + req.path);
  next();  // 다음 미들웨어로
});

// 특정 경로 미들웨어
app.use("/api", fn(req, res, next) {
  println("API request");
  next();
});

// 메서드별 미들웨어
app.post("/users", fn(req, res, next) {
  println("Validating user data...");
  next();
}, fn(req, res) {
  res.json({ message: "User created" });
});
```

### 인증 미들웨어

```fl
use @freelang/web as web;

fn auth_middleware(req, res, next) {
  let token = req.header("Authorization");

  if (token == null || len(token) == 0) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // 토큰 검증
  if (verify_token(token)) {
    req.user = get_user_from_token(token);
    next();
  } else {
    res.status(401).json({ error: "Invalid token" });
  }
}

let app = web.createApp();

// API 경로에 인증 미들웨어 적용
app.use("/api", auth_middleware);

app.get("/api/protected", fn(req, res) {
  res.json({ message: "Protected data", user: req.user });
});
```

### CORS 미들웨어

```fl
use @freelang/web as web;

fn cors_middleware(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  if (req.method == "OPTIONS") {
    res.status(200).send("");
  } else {
    next();
  }
}

let app = web.createApp();
app.use(cors_middleware);

app.get("/api/data", fn(req, res) {
  res.json({ data: "Hello from CORS" });
});
```

### 로깅 미들웨어

```fl
use @freelang/web as web;

fn logging_middleware(req, res, next) {
  let start = now();  // 현재 시간

  // 응답 전송 후 로깅
  let original_send = res.send;
  res.send = fn(data) {
    let duration = now() - start;
    println(req.method + " " + req.path +
            " " + str(res.statusCode) +
            " (" + str(duration) + "ms)");

    original_send(data);
  };

  next();
}

let app = web.createApp();
app.use(logging_middleware);
```

---

## 요청/응답 처리

### 요청 객체 (req)

```fl
app.get("/example", fn(req, res) {
  // 요청 정보
  let method = req.method;              // "GET"
  let path = req.path;                  // "/example"
  let full_url = req.url;               // "http://localhost:3000/example?key=value"
  let query_string = req.queryString;   // "key=value"

  // 헤더
  let user_agent = req.header("User-Agent");
  let content_type = req.header("Content-Type");
  let all_headers = req.headers;        // 모든 헤더

  // 바디 (POST/PUT)
  let body = req.body;                  // { ... }
  let raw_body = req.rawBody;           // 원본 문자열

  // 쿠키
  let session_id = req.cookie("session_id");
  let all_cookies = req.cookies;        // { ... }

  // 매개변수
  let params = req.params;              // { id: "123" }
  let query = req.query;                // { key: "value" }

  // IP 주소
  let ip = req.ip;                      // "192.168.1.100"

  // 프로토콜
  let protocol = req.protocol;          // "http" or "https"

  res.send("OK");
});
```

### 응답 객체 (res)

```fl
app.get("/example", fn(req, res) {
  // 상태 코드 설정
  res.status(200);
  res.status(404);
  res.status(500);

  // 헤더 설정
  res.header("Content-Type", "application/json");
  res.header("Cache-Control", "no-cache");
  res.header("X-Custom-Header", "value");

  // 쿠키 설정
  res.cookie("name", "value");
  res.cookie("session_id", "abc123", {
    maxAge: 24 * 60 * 60 * 1000,  // 1일
    httpOnly: true,
    secure: true,
    sameSite: "Strict"
  });

  // 다양한 응답 형식
  res.send("Plain text");
  res.json({ key: "value" });
  res.html("<h1>Hello</h1>");
  res.file("/path/to/file.pdf");
  res.download("/path/to/file.pdf", "custom-name.pdf");

  // 리다이렉트
  res.redirect("/new-path");
  res.redirect(301, "/permanent-path");

  // 상태 코드 + 메시지
  res.status(404).send("Not found");
});
```

### JSON 응답

```fl
app.get("/users", fn(req, res) {
  let users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" }
  ];

  res.json(users);
  // Content-Type: application/json 자동 설정
});
```

### 파일 다운로드

```fl
app.get("/download/:file", fn(req, res) {
  let filename = req.params.file;
  let filepath = "/downloads/" + filename;

  // 파일 전송
  res.download(filepath);

  // 또는 커스텀 이름으로
  res.download(filepath, "custom-name.pdf");
});
```

---

## 데이터베이스

### SQLite 연결

```fl
use @freelang/web as web;
use @freelang/db as db;

let app = web.createApp();

// 데이터베이스 연결
let database = db.connect("sqlite:///app.db");

// 테이블 생성
database.exec(
  "CREATE TABLE IF NOT EXISTS users (" +
  "  id INTEGER PRIMARY KEY AUTO_INCREMENT," +
  "  name TEXT NOT NULL," +
  "  email TEXT UNIQUE," +
  "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP" +
  ")"
);

// 데이터 삽입
app.post("/users", fn(req, res) {
  let name = req.body.name;
  let email = req.body.email;

  let result = database.insert(
    "INSERT INTO users (name, email) VALUES (?, ?)",
    [name, email]
  );

  res.json({ id: result.insertId, name: name, email: email });
});

// 데이터 조회
app.get("/users", fn(req, res) {
  let users = database.query("SELECT * FROM users");
  res.json(users);
});

// 특정 사용자 조회
app.get("/users/:id", fn(req, res) {
  let id = req.params.id;
  let user = database.queryOne(
    "SELECT * FROM users WHERE id = ?",
    [id]
  );

  if (user == null) {
    res.status(404).json({ error: "User not found" });
  } else {
    res.json(user);
  }
});

// 데이터 수정
app.put("/users/:id", fn(req, res) {
  let id = req.params.id;
  let name = req.body.name;
  let email = req.body.email;

  database.update(
    "UPDATE users SET name = ?, email = ? WHERE id = ?",
    [name, email, id]
  );

  res.json({ message: "User updated" });
});

// 데이터 삭제
app.delete("/users/:id", fn(req, res) {
  let id = req.params.id;

  database.delete(
    "DELETE FROM users WHERE id = ?",
    [id]
  );

  res.json({ message: "User deleted" });
});

app.listen(3000);
```

### PostgreSQL 연결

```fl
use @freelang/db as db;

// PostgreSQL 연결
let database = db.connect("postgresql://user:password@localhost:5432/mydb");

// 사용법은 SQLite와 동일
let users = database.query("SELECT * FROM users");
```

---

## 폼 처리

### HTML 폼 제출

```fl
use @freelang/web as web;

let app = web.createApp();

// 폼 페이지 제공
app.get("/register", fn(req, res) {
  res.html(
    "<form method='POST' action='/register'>" +
    "  <input name='username' required>" +
    "  <input name='email' type='email' required>" +
    "  <input name='password' type='password' required>" +
    "  <button type='submit'>Register</button>" +
    "</form>"
  );
});

// 폼 데이터 처리
app.post("/register", fn(req, res) {
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;

  // 검증
  if (len(username) < 3) {
    res.status(400).json({ error: "Username too short" });
    return;
  }

  if (!validate_email(email)) {
    res.status(400).json({ error: "Invalid email" });
    return;
  }

  // 저장
  save_user(username, email, password);

  res.redirect("/login");
});
```

### 파일 업로드

```fl
app.post("/upload", fn(req, res) {
  let files = req.files;  // { fieldname: File }

  for file in files {
    let name = file.filename;
    let path = "/uploads/" + name;

    // 파일 저장
    save_file(file, path);

    println("Uploaded: " + name);
  }

  res.json({ message: "Upload complete", count: len(files) });
});
```

---

## ORM 사용

### 모델 정의

```fl
use @freelang/orm as orm;

let User = orm.model("User", {
  id: orm.id(),
  name: orm.string({ required: true }),
  email: orm.string({ unique: true, required: true }),
  password: orm.string({ required: true }),
  created_at: orm.datetime({ default: orm.now() })
});

let Post = orm.model("Post", {
  id: orm.id(),
  title: orm.string({ required: true }),
  content: orm.text(),
  user_id: orm.foreignKey(User),
  created_at: orm.datetime({ default: orm.now() })
});

// 관계 정의
User.hasMany(Post);
Post.belongsTo(User);
```

### CRUD 연산

```fl
use @freelang/orm as orm;

// 생성 (CREATE)
let user = User.create({
  name: "Alice",
  email: "alice@example.com",
  password: hash_password("secret123")
});

// 읽기 (READ)
let found_user = User.findById(1);
let all_users = User.findAll();
let active_users = User.where({ active: true }).limit(10);

// 수정 (UPDATE)
user.name = "Alice Updated";
user.save();

// 또는
User.update({ id: 1 }, { name: "Alice Updated" });

// 삭제 (DELETE)
user.delete();

// 또는
User.delete({ id: 1 });
```

### 쿼리

```fl
// 조건 쿼리
let users = User
  .where({ active: true })
  .where(fn(u) { return u.age > 18; })
  .limit(10)
  .offset(0)
  .orderBy("created_at", "desc");

// 관계 로딩
let user = User.findById(1);
let posts = user.getPosts();

// 조인
let user_with_posts = User.findById(1)
  .include(Post)
  .first();

// 집계
let count = User.count();
let total_age = User.sum("age");
let avg_age = User.avg("age");
let max_age = User.max("age");
let min_age = User.min("age");
```

---

## 실전 예제

### 예제: Todo API

```fl
use @freelang/web as web;
use @freelang/db as db;

let app = web.createApp();
let database = db.connect("sqlite:///todo.db");

// 테이블 생성
database.exec(
  "CREATE TABLE IF NOT EXISTS todos (" +
  "  id INTEGER PRIMARY KEY AUTO_INCREMENT," +
  "  title TEXT NOT NULL," +
  "  completed BOOLEAN DEFAULT 0," +
  "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP" +
  ")"
);

// 모든 할일 조회
app.get("/todos", fn(req, res) {
  let todos = database.query("SELECT * FROM todos ORDER BY created_at DESC");
  res.json(todos);
});

// 할일 생성
app.post("/todos", fn(req, res) {
  let title = req.body.title;

  if (len(title) == 0) {
    res.status(400).json({ error: "Title required" });
    return;
  }

  let result = database.insert(
    "INSERT INTO todos (title) VALUES (?)",
    [title]
  );

  res.status(201).json({
    id: result.insertId,
    title: title,
    completed: false
  });
});

// 할일 완료 처리
app.patch("/todos/:id/toggle", fn(req, res) {
  let id = req.params.id;

  let todo = database.queryOne(
    "SELECT * FROM todos WHERE id = ?",
    [id]
  );

  if (todo == null) {
    res.status(404).json({ error: "Todo not found" });
    return;
  }

  database.update(
    "UPDATE todos SET completed = ? WHERE id = ?",
    [!todo.completed, id]
  );

  res.json({ ...todo, completed: !todo.completed });
});

// 할일 삭제
app.delete("/todos/:id", fn(req, res) {
  let id = req.params.id;

  database.delete(
    "DELETE FROM todos WHERE id = ?",
    [id]
  );

  res.json({ message: "Todo deleted" });
});

app.listen(3000, fn() {
  println("Todo API running on port 3000");
});
```

---

## 요약

**웹 프레임워크의 주요 기능**:
- 라우팅 (GET, POST, PUT, DELETE 등)
- 미들웨어 (요청 전/후 처리)
- 요청/응답 처리
- 데이터베이스 연동 (SQLite, PostgreSQL)
- ORM (모델 기반 쿼리)
- 파일 업로드/다운로드

다음 단계: **[API 레퍼런스](API_REFERENCE.md)**
