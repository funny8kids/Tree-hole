import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      // 代理知乎圈子 API，解决 CORS 问题
      '/api/zhihu': {
        target: 'https://openapi.zhihu.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/zhihu/, ''),
        secure: true,
      },
      // 代理知乎公开 API
      '/api/zhihu-public': {
        target: 'https://www.zhihu.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/zhihu-public/, ''),
        secure: true,
      },
    },
  },
})
