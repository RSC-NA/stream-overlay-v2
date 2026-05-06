#!/bin/sh
set -eu

node /app/ws-server.js &
WS_PID="$!"

cleanup() {
    kill "$WS_PID" 2>/dev/null || true
}

trap cleanup INT TERM EXIT

nginx -g 'daemon off;' &
NGINX_PID="$!"

wait "$NGINX_PID"
