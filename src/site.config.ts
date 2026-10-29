// Site-wide feature switches. Flip `enabled` to turn a feature on or off without touching any page.

export const comments = {
  enabled: false,
  // Giscus stores comments as GitHub Discussions on this repo. IDs come from https://giscus.app
  repo: 'BFFonseca/bffonseca.github.io',
  repoId: 'R_kgDORnGSpg',
  category: 'Blog comments',
  categoryId: '',
} as const;
