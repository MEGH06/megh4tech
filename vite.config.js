import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import seo from './tools/seo.mjs'

// https://vite.dev/config/
export default defineConfig({
  // seo fills the two placeholders in index.html from src/data — the
  // schema.org graph and a real text version of the page for anything that
  // does not run JavaScript.
  plugins: [react(), seo()],
  base: '/',
})
