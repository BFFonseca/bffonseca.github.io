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

export const analytics = {
  enabled: false,
  // GoatCounter site code: the CODE in https://CODE.goatcounter.com. No cookies, no stored IPs.
  // Tag shared links with ?campaign=<name> (optionally &ref=<source>) to see them as campaigns.
  // Visit any page with #toggle-goatcounter to stop counting your own visits in that browser.
  goatcounterCode: '',
} as const;

export const viewCounts = {
  // Needs analytics enabled, plus "Allow adding visitor counts on your website" in GoatCounter's settings.
  enabled: false,
  // Hide the count on pages with fewer views than this. GoatCounter caches counts for up to 4 hours.
  minimum: 0,
} as const;

export const thumbnails = {
  // Default crop for every thumbnail. Each post/project can override any of these with
  // `thumbnailCrop` in its frontmatter (see README). The image always fills the box; what
  // doesn't fit is cut off.
  //   x, y  focal point in % of the image (0 = left/top, 50 = centre, 100 = right/bottom).
  //         This point is kept in view and zoom grows around it.
  //   zoom  1 = just enough to fill the box, 2 = twice that, etc.
  //   height  box height (any CSS length). Site-wide only.
  strip: { x: 50, y: 50, zoom: 1, height: { mobile: '5rem', desktop: '6rem' } }, // index cards
  hero:  { x: 50, y: 50, zoom: 1, height: 'clamp(10rem, 40vw, 20rem)' },        // top of post/project page
} as const;
