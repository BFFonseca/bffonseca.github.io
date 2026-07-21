import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://debugled.com', // replace with your actual domain
  vite: {
    plugins: [tailwindcss()],
  },
});
