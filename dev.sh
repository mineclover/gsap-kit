#!/bin/bash

# GSAP Kit 개발 서버 관리 스크립트

case "$1" in
  start)
    echo "🚀 TypeScript 개발 서버를 백그라운드에서 시작합니다..."

    # 기존 프로세스 정리
    pkill -f 'nodemon.*src-ts' 2>/dev/null || true
    pkill -f 'live-server' 2>/dev/null || true

    # 로그 파일 초기화
    > dev.log

    # 백그라운드에서 실행
    nohup npm run dev:ts >> dev.log 2>&1 &

    echo "✅ 서버가 백그라운드에서 실행 중입니다"
    echo "📝 로그 확인: npm run logs 또는 tail -f dev.log"
    echo "🌐 브라우저: http://localhost:8000/examples/preview.html"
    echo "⏹️  종료: npm run stop 또는 ./dev.sh stop"

    sleep 2
    echo ""
    echo "실행 중인 프로세스:"
    ps aux | grep -E 'nodemon|live-server' | grep -v grep || echo "프로세스를 찾을 수 없습니다"
    ;;

  stop)
    echo "⏹️  개발 서버를 종료합니다..."
    pkill -f 'nodemon.*src-ts' || true
    pkill -f 'live-server' || true
    pkill -f 'tsc --watch' || true
    echo "✅ 서버가 종료되었습니다"
    ;;

  restart)
    echo "🔄 개발 서버를 재시작합니다..."
    $0 stop
    sleep 2
    $0 start
    ;;

  status)
    echo "📊 서버 상태 확인 중..."
    echo ""
    NODEMON_PID=$(pgrep -f 'nodemon.*src-ts')
    LIVE_SERVER_PID=$(pgrep -f 'live-server')

    if [ -n "$NODEMON_PID" ]; then
      echo "✅ nodemon 실행 중 (PID: $NODEMON_PID)"
    else
      echo "❌ nodemon 실행 중이지 않음"
    fi

    if [ -n "$LIVE_SERVER_PID" ]; then
      echo "✅ live-server 실행 중 (PID: $LIVE_SERVER_PID)"
    else
      echo "❌ live-server 실행 중이지 않음"
    fi

    echo ""
    echo "전체 프로세스:"
    ps aux | grep -E 'nodemon|live-server|tsc.*watch' | grep -v grep || echo "실행 중인 프로세스 없음"
    ;;

  logs)
    echo "📝 로그를 실시간으로 표시합니다 (Ctrl+C로 종료)..."
    tail -f dev.log
    ;;

  *)
    echo "GSAP Kit 개발 서버 관리"
    echo ""
    echo "사용법: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start    - 백그라운드에서 개발 서버 시작"
    echo "  stop     - 개발 서버 종료"
    echo "  restart  - 개발 서버 재시작"
    echo "  status   - 서버 상태 확인"
    echo "  logs     - 로그 실시간 확인"
    echo ""
    echo "또는 npm 스크립트 사용:"
    echo "  npm run dev:ts      - 포그라운드에서 실행"
    echo "  npm run stop        - 서버 종료"
    echo "  npm run logs        - 로그 확인"
    echo "  npm run status      - 상태 확인"
    ;;
esac
