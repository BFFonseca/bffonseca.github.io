// Site-wide feature switches. Flip `enabled` to turn a feature on or off without touching any page.

export const comments = {
  enabled: true,
  // Giscus stores comments as GitHub Discussions on this repo. IDs come from https://giscus.app
  // giscus.json at the repo root lists the only sites allowed to embed these threads.
  repo: 'BFFonseca/bffonseca.github.io',
  repoId: 'R_kgDORnGSpg',
  category: 'Blog comments',
  categoryId: 'DIC_kwDORnGSps4DJ6RF',
} as const;
