import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import thumbnailEditor from './src/integrations/thumbnail-editor/index.ts';
import devTools from './src/integrations/dev-tools/index.ts';

export default defineConfig({
  site: 'https://debugled.com', // replace with your actual domain
  // Dev-only: tools page at /dev and thumbnail editor at /dev/thumbnails (not included in builds)
  integrations: [devTools(), thumbnailEditor()],
  vite: {
    plugins: [tailwindcss()],
  },
});
