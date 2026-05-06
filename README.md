# rl-overlay

Overlay for Rocket League.  Uses React to read Websocket data from the SOS BakkesMod plugin: https://gitlab.com/bakkesplugins/sos

[Test video of the overlay in action](https://youtu.be/775lHXatrj4)
[![Screenshot of the overlay test video](https://img.youtube.com/vi/775lHXatrj4/maxresdefault.jpg)](https://youtu.be/775lHXatrj4)

[First live stream using the overlay!](https://www.twitch.tv/videos/2284601496)

Also sends information via Websocket (https://github.com/kj-joseph/rl-socket) to separate stats page.  (In the future, this WS link will also connect a control panel.)

[Short clip of the stats page](https://youtu.be/yDxOHUj3Wxg)
[![Screenshot of the stats page](https://img.youtube.com/vi/yDxOHUj3Wxg/maxresdefault.jpg)](https://youtu.be/yDxOHUj3Wxg)

## Local development

### Prerequisites

- Node.js 20+
- npm

### Run the website locally

```bash
npm install
npm run dev
```

Vite runs with `--host`, so you can open the site at:

- `http://localhost:5173`

### Optional: run local websocket relay

If you want to test local relay traffic (instead of the production websocket URL), run this in a second terminal:

```bash
node ws-server.js
```

The relay listens on `ws://localhost:8321`.

To use it from the app, switch the websocket constant in:

- `src/views/overlay/Overlay.jsx`
- `src/views/statboard/Statboard.jsx`

Use the local line:

```js
const socketServerUrl = "ws://localhost:8321"; // local testing
```

instead of the production line:

```js
const socketServerUrl = "https://overlay.rscna.com/ws/"; // prod
```

### Live game feed (optional)

Overlay game data is read from the SOS BakkesMod websocket feed at `ws://localhost:49122`.
For broadcasting stats data from a real game, use [rlstatsapi](https://github.com/xentrick/rlstatsapi).
If that feed is not running, the site still loads, but live in-game updates will be missing.

## Docker deployment (VPS)

This container runs two processes:

- Vite static site via nginx on host port `5137`
- WebSocket relay (`ws-server.js`) via node on host port `8321`

Example nginx reverse proxy:

```nginx
location /ws/ {
	proxy_pass http://localhost:8321/;
	proxy_set_header Upgrade $http_upgrade;
	proxy_set_header Connection "Upgrade";
	proxy_set_header Host $host;
	proxy_set_header X-Forwarded-For $remote_addr;
}

location / {
	proxy_pass http://localhost:5137/;
	proxy_set_header Host $host;
	proxy_set_header X-Forwarded-For $remote_addr;
}
```

### First deploy

```bash
docker compose up -d --build
```

### Rebuild/redeploy after updates

```bash
git pull
docker compose up -d --build
```

### Useful commands

```bash
# View logs
docker compose logs -f

# Restart container
docker compose restart

# Stop container
docker compose down
```
