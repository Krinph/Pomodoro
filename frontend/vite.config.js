import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',   // 你的 Spring Boot 地址
        changeOrigin: true,
      },
    },
    // 忽略 electron 目录：主进程代码不需要前端热更新监听，也能避免 watch 临时文件时报 EBUSY
    watch: {
      ignored: ['**/electron/**'],
    },
  },
})