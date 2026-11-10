// Must be ws:// or wss://. Browsers older than Chrome 125 / Firefox 124 / OBS 31 reject http(s):// here.
const socketServerUrl = import.meta.env.VITE_SOCKET_SERVER_URL || "wss://overlay.rscna.com/ws/";

export default socketServerUrl;
