import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import sheetsPlugin from "./sheetsPlugin.js"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		sheetsPlugin(), // serves /api/sheets/teams and /api/sheets/players endpoints server-side to avoid CSP issues
	],
	server: {
		watch: {
				usePolling: true
		},
		allowedHosts: true,
	},
	resolve: {
		alias: {
				"@": path.resolve(__dirname, "./src"),
		},
	},
	css: {
	preprocessorOptions: {
		scss: {
			api: "modern-compiler",
			silenceDeprecations: ["legacy-js-api", "mixed-decls", "color-functions"],
		},
	}
	},
	build: {
	rollupOptions: {
		onwarn(warning, warn) {
			if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
				return;
			}
			warn(warning);
		},
	},
	},
});
