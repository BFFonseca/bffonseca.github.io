# DebugLED

Personal website — about, projects, and blog. Built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com), deployed automatically to GitHub Pages.

Live at **[debugled.com](https://www.debugled.com)**

## Stack

| Layer     | Technology                           |
| --------- | ------------------------------------ |
| Framework | Astro 6                              |
| Styling   | Tailwind CSS 4                       |
| Content   | Astro Content Collections (Markdown) |
| Hosting   | GitHub Pages (custom domain)         |
| CI/CD     | GitHub Actions                       |

## Project Structure

```
src/
├── components/
│   ├── Nav.astro               # Site navigation
│   └── Footer.astro            # Site footer
├── layouts/
│   └── BaseLayout.astro        # Shared page wrapper
├── pages/
│   ├── index.astro             # Home / About
│   ├── about.astro             # About page
│   ├── contact.astro           # Contact page
│   ├── projects.astro          # Projects listing
│   ├── projects/
│   │   └── [slug].astro        # Dynamic project detail page
│   └── blog/
│       ├── index.astro         # Blog listing
│       └── [slug].astro        # Dynamic blog post page
├── content/
│   ├── projects/
│   │   └── <project-name>/
│   │       ├── project-<name>.md   # Project content & frontmatter
│   │       └── media/              # Project images and assets
│   └── blog/
│       └── <post-id>/
│           ├── <post-name>.md      # Post content & frontmatter
│           └── media/              # Post images and assets
├── styles/
│   └── global.css              # Global styles
└── content.config.ts           # Content collection schemas
public/
└── favicon.svg
.github/
└── workflows/
    └── deploy.yml              # Auto-deploy to GitHub Pages on push to main
```

## Content Model

### Blog posts (`src/content/blog/`)

```ts
{
  title:       string
  description: string
  date:        string       // "YYYY-MM-DD"
  tags:        string[]     // optional
  draft:       boolean      // optional, defaults to false
  thumbnail:         image   // optional – path relative to the .md, e.g. ./media/thumb.jpg
  thumbnailAlt:      string  // optional – alt text for the thumbnail
  thumbnailPosition: string  // optional – CSS object-position for cropping, e.g. "center 30%"
}
```

### Projects (`src/content/projects/`)

```ts
{
  title:       string
  description: string
  tags:        string[]     // optional
  repo:        string       // optional – GitHub URL
  live:        string       // optional – live URL
  status:      'planned' | 'active' | 'live' | 'paused' | 'complete'
  relatedTag:  string       // optional – links to blog posts with this tag
  thumbnail:         image   // optional – path relative to the .md, e.g. ./media/thumb.jpg
  thumbnailAlt:      string  // optional – alt text for the thumbnail
  thumbnailPosition: string  // optional – CSS object-position for cropping, e.g. "center 30%"
}
```

Each project lives in its own subfolder and can include a `media/` directory for images referenced in its Markdown content. The same pattern applies to blog posts.

A `thumbnail` shows as a thin cropped strip between the title and description on the `/blog` and `/projects` index cards, and as a full-width banner (capped at 20rem tall) at the top of the post or project page. Use `thumbnailPosition` to choose which part of the image stays visible when it's cropped.

## Deployment

Pushes to `main` trigger the GitHub Actions workflow (`.github/workflows/deploy.yml`), which builds the site and publishes it to GitHub Pages. No manual steps required.

---

> This page and most of the files in this repository have been created by or with the help of AI. More precisely by Anthropic's Claude using the Sonnet 4.6 Extended, Sonnet 5, Opus 4.8 and Fable 5 models.
