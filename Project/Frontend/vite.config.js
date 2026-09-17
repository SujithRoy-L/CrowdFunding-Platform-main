import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    host: true, // Bind to 0.0.0.0 — accessible from any browser/device on the network
    port: 5173,
    strictPort: false, // Don't crash if port is busy, try the next one
    cors: true, // Allow all cross-origin requests in dev

    // ─── API Proxy ───────────────────────────────────────────────────────────
    // All /api and /socket.io calls are forwarded to the backend.
    // This means the browser sees them as same-origin (no CORS at all),
    // which fixes Brave Shields, Edge security, and any other browser
    // that blocks cross-origin requests or WebSocket cross-port connections.
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        ws: true, // Also proxy WebSocket upgrades
      },
      "/socket.io": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        ws: true, // Critical for Socket.IO WebSocket handshake
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
