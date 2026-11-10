#!/bin/sh
set -eu

node /app/ws-server.cjs &
WS_PID="$!"

nginx -g 'daemon off;' &
NGINX_PID="$!"

cleanup() {
    kill "$WS_PID" "$NGINX_PID" 2>/dev/null || true
}

trap cleanup INT TERM EXIT

# Exit when either process dies so the container restart policy brings both back.
while kill -0 "$WS_PID" 2>/dev/null && kill -0 "$NGINX_PID" 2>/dev/null; do
    sleep 2
done

echo "start.sh: a process exited (ws-server alive: $(kill -0 "$WS_PID" 2>/dev/null && echo yes || echo no), nginx alive: $(kill -0 "$NGINX_PID" 2>/dev/null && echo yes || echo no))" >&2
exit 1
