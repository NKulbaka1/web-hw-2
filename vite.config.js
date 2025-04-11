import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/web-hw-2/', // имя вашего репозитория
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      }
    }
  }
})