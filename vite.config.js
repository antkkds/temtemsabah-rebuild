import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

let gitCommit = 'dev';
let gitBranch = 'dev';
try {
  gitCommit = execSync('git rev-parse --short HEAD 2>/dev/null').toString().trim() || 'dev';
  gitBranch = execSync('git rev-parse --abbrev-ref HEAD 2>/dev/null').toString().trim() || 'dev';
} catch {}

export default defineConfig({
  base: '/temtemsabah/',
  plugins: [react()],
  define: {
    __GIT_COMMIT__: JSON.stringify(gitCommit),
    __GIT_BRANCH__: JSON.stringify(gitBranch),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3456',
        changeOrigin: true,
      },
    },
  },
})
