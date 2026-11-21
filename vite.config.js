import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// base: './' — щоб зібраний сайт працював і в підпапці (GitHub Pages)
export default defineConfig({
  plugins: [vue()],
  base: './',
})
