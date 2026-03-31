# rl-overlay

Overlay for Rocket League.  Uses React to read Websocket data from the SOS BakkesMod plugin: https://gitlab.com/bakkesplugins/sos

[Test video of the overlay in action](https://youtu.be/775lHXatrj4)
[![Screenshot of the overlay test video](https://img.youtube.com/vi/775lHXatrj4/maxresdefault.jpg)](https://youtu.be/775lHXatrj4)

[First live stream using the overlay!](https://www.twitch.tv/videos/2284601496)

Also sends information via Websocket (https://github.com/kj-joseph/rl-socket) to separate stats page.  (In the future, this WS link will also connect a control panel.)

[Short clip of the stats page](https://youtu.be/yDxOHUj3Wxg)
[![Screenshot of the stats page](https://img.youtube.com/vi/yDxOHUj3Wxg/maxresdefault.jpg)](https://youtu.be/yDxOHUj3Wxg)

## Docker deployment (behind host Nginx)

This repo now includes:

- `Dockerfile` (multi-stage build with Nginx runtime)
- `docker-compose.yml` (single service, restart enabled)
- `deploy/nginx/overlay.rscna.com.conf` (example host Nginx vhost)

### 1) Run/update the container

```bash
docker compose pull
docker compose build --pull
docker compose up -d
```

The container binds to `127.0.0.1:8085`, so it is only reachable from the host.

### 2) Host Nginx config

Use `deploy/nginx/overlay.rscna.com.conf` as your vhost template so:

- `/ws/` continues to proxy to your websocket backend (`127.0.0.1:8321`)
- `/` proxies to the overlay container (`127.0.0.1:8085`)

Then reload Nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```
