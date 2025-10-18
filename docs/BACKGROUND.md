# 백그라운드 실행 가이드

## 🚀 빠른 시작

### 방법 1: Shell 스크립트 사용 (권장)

```bash
# 백그라운드에서 시작
./dev.sh start

# 상태 확인
./dev.sh status

# 로그 확인
./dev.sh logs

# 재시작
./dev.sh restart

# 종료
./dev.sh stop
```

### 방법 2: npm 스크립트 사용

```bash
# 종료
npm run stop

# 로그 확인
npm run logs

# 상태 확인
npm run status
```

### 방법 3: 직접 백그라운드 실행

```bash
# macOS / Linux
npm run dev:ts > dev.log 2>&1 &

# 프로세스 ID 확인
echo $!

# 종료
kill [PID]
```

---

## 📋 상세 사용법

### 1. 서버 시작

```bash
./dev.sh start
```

**출력**:
```
🚀 TypeScript 개발 서버를 백그라운드에서 시작합니다...
✅ 서버가 백그라운드에서 실행 중입니다
📝 로그 확인: npm run logs 또는 tail -f dev.log
🌐 브라우저: http://localhost:8000/examples/preview.html
⏹️  종료: npm run stop 또는 ./dev.sh stop

실행 중인 프로세스:
nodemon     12345  1.2  0.5  ...
live-server 12346  0.8  0.3  ...
```

### 2. 상태 확인

```bash
./dev.sh status
```

**출력**:
```
📊 서버 상태 확인 중...

✅ nodemon 실행 중 (PID: 12345)
✅ live-server 실행 중 (PID: 12346)

전체 프로세스:
nodemon --watch src-ts --ext ts ...
live-server --port=8000 ...
```

### 3. 로그 실시간 확인

```bash
./dev.sh logs
```

또는

```bash
npm run logs
```

**출력**:
```
[nodemon] starting `npm run build`
[nodemon] files changed: src-ts/draggable/basic.ts
[live-server] Page reloaded
```

**Ctrl+C**로 로그 보기 종료 (서버는 계속 실행됨)

### 4. 서버 종료

```bash
./dev.sh stop
```

또는

```bash
npm run stop
```

### 5. 서버 재시작

```bash
./dev.sh restart
```

---

## 🔧 고급 사용법

### 포트 변경

`package.json` 수정:

```json
{
  "scripts": {
    "serve:live": "live-server --port=3000 ..."
  }
}
```

### 다른 파일 감시

`nodemon.json` 수정:

```json
{
  "watch": ["src-ts", "src"],  // src 폴더도 감시
  "ext": "ts,js"                // js 파일도 감시
}
```

### 브라우저 자동 열기 비활성화

`package.json` 수정:

```json
{
  "scripts": {
    "serve:live": "live-server --port=8000 --no-browser --watch=dist,examples"
  }
}
```

### 로그 파일 위치 변경

```bash
# 백그라운드 실행 시 로그 위치 지정
npm run dev:ts > logs/custom.log 2>&1 &
```

---

## 🐛 문제 해결

### Q: 서버가 시작되지 않아요

```bash
# 1. 기존 프로세스 확인
./dev.sh status

# 2. 강제 종료
./dev.sh stop

# 3. 포트 확인
lsof -i :8000

# 4. 포트 사용 중이면 프로세스 종료
kill -9 [PID]

# 5. 재시작
./dev.sh start
```

### Q: 로그가 보이지 않아요

```bash
# 로그 파일 확인
cat dev.log

# 실시간 로그
tail -f dev.log

# 또는
./dev.sh logs
```

### Q: 브라우저가 자동으로 열리지 않아요

```bash
# 수동으로 브라우저 열기
open http://localhost:8000/examples/preview.html

# 또는
./dev.sh start
# 출력된 URL로 수동 접속
```

### Q: TypeScript 파일을 수정했는데 반영이 안 돼요

```bash
# 1. 서버 상태 확인
./dev.sh status

# 2. 로그 확인
./dev.sh logs

# 3. 재시작
./dev.sh restart

# 4. 수동 빌드
npm run build

# 5. dist 폴더 확인
ls -la dist/draggable/
```

### Q: 종료가 안 돼요

```bash
# 강제 종료
pkill -9 -f nodemon
pkill -9 -f live-server

# 또는 PID로 직접 종료
ps aux | grep nodemon
kill -9 [PID]
```

### Q: 포트가 이미 사용 중이에요

```bash
# 8000 포트 사용 중인 프로세스 확인
lsof -i :8000

# 프로세스 종료
kill -9 [PID]

# 또는 다른 포트 사용
# package.json에서 포트 변경
```

---

## 📊 프로세스 관리

### 실행 중인 모든 프로세스 확인

```bash
ps aux | grep -E 'nodemon|live-server|tsc' | grep -v grep
```

### 특정 프로세스만 종료

```bash
# nodemon만 종료
pkill -f 'nodemon'

# live-server만 종료
pkill -f 'live-server'
```

### 프로세스 ID 저장

```bash
# PID 파일에 저장
echo $! > .dev.pid

# 나중에 종료
kill $(cat .dev.pid)
```

---

## 💡 팁

### 1. 시작 시 자동으로 브라우저 열기

```bash
./dev.sh start && sleep 3 && open http://localhost:8000/examples/preview.html
```

### 2. 여러 터미널에서 로그 확인

```bash
# 터미널 1
./dev.sh start

# 터미널 2
./dev.sh logs
```

### 3. 시스템 시작 시 자동 실행

**macOS (launchd)**:
`~/Library/LaunchAgents/com.gsapkit.dev.plist` 생성

**Linux (systemd)**:
`/etc/systemd/system/gsapkit.service` 생성

### 4. 백그라운드 실행 + 로그 실시간 확인

```bash
./dev.sh start && ./dev.sh logs
```

---

## ⚙️ 환경별 설정

### macOS

```bash
# 기본 설정
./dev.sh start

# nohup 사용
nohup npm run dev:ts &
```

### Linux

```bash
# 기본 설정
./dev.sh start

# screen 사용
screen -dmS gsapkit npm run dev:ts
screen -r gsapkit  # 연결
# Ctrl+A, D로 detach
```

### Windows (Git Bash / WSL)

```bash
# Git Bash
start npm run dev:ts

# WSL
./dev.sh start
```

---

## 🎯 권장 워크플로우

### 일반 개발

```bash
# 1. 백그라운드에서 시작
./dev.sh start

# 2. VSCode나 에디터로 개발
code .

# 3. src-ts/ 파일 수정 → 자동 반영

# 4. 필요시 로그 확인
./dev.sh logs

# 5. 개발 완료 후 종료
./dev.sh stop
```

### 디버깅

```bash
# 1. 서버 시작
./dev.sh start

# 2. 로그 실시간 확인
./dev.sh logs

# 3. 문제 발생 시 재시작
./dev.sh restart

# 4. 수동 빌드로 확인
npm run build
```

---

**Happy Background Coding! 🚀**
