// Dev-only /dev page listing the dev tools (see ./tools.ts). The "dev" nav link that points
// here is only rendered by the dev server, and none of this is part of `astro build`.
import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';

export default function devTools(): AstroIntegration {
  return {
    name: 'dev-tools',
    hooks: {
      'astro:config:setup': ({ command, injectRoute }) => {
        if (command !== 'dev') return;
        injectRoute({ pattern: '/dev', entrypoint: fileURLToPath(new URL('./dev.astro', import.meta.url)) });
      },
    },
  };
}
