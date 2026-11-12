import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import thumbnailEditor from './src/integrations/thumbnail-editor/index.ts';

export default defineConfig({
  site: 'https://debugled.com', // replace with your actual domain
  // Dev-only: thumbnail crop editor at /dev/thumbnails (not included in builds)
  integrations: [thumbnailEditor()],
  vite: {
    plugins: [tailwindcss()],
  },
});
