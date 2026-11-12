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
  thumbnailAlt:      string  // optional – alt text for the thumbnail
  thumbnailCrop:     object  // optional – overrides the default thumbnail crop (see below)
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
  thumbnailAlt:      string  // optional – alt text for the thumbnail
  thumbnailCrop:     object  // optional – overrides the default thumbnail crop (see below)
}
```

Each project lives in its own subfolder and can include a `media/` directory for images referenced in its Markdown content. The same pattern applies to blog posts.

Each entry gets a thumbnail automatically: a file named `thumbnail.png`, `thumbnail.jpg` or `thumbnail.jpeg` in the entry's folder (or its `media/` folder) is used if present; otherwise the last image in the post/project body is used (Markdown `![alt](media/image.png)` — also `./media/…`, `<media/with spaces.png>` and `%20` — or `<img>` tags; local paths or `raw.githubusercontent.com` URLs pointing at files in this repo). Entries with neither get no thumbnail.

The thumbnail shows as a thin cropped strip between the title and description on the `/blog` and `/projects` index cards, and as a full-width banner (capped at 20rem tall) at the top of the post or project page. 
#### Thumbnail cropping

The image always fills its box (`object-fit: cover`); whatever doesn't fit is cut off. Defaults (and box heights) live in `thumbnails` in `src/site.config.ts`. Any post or project can override them:

```yaml
thumbnailCrop:
  x: 50          # focal point, % from the left (0–100)
  y: 30          # focal point, % from the top (0–100)
  zoom: 1.2      # 1 = just fills the box; zoom grows around the focal point
  strip:         # optional – applies only to the index-card strip
    y: 60
  hero:          # optional – applies only to the banner on the post/project page
    zoom: 1
```

Every field is optional. Precedence: `strip`/`hero` value → top-level `thumbnailCrop` value → site default.

**Interactive editor:** run `npm run dev` and open [`/dev/thumbnails`](http://localhost:4321/dev/thumbnails). Pick a post or project, then:

- **Drag a frame** over the full image to choose what's shown (cyan = index strip, amber = page banner, dashed = how it looks on a phone). Clicking outside a frame jumps it there.
- **Scroll** over the image or use the slider to **zoom**.
- **Both / Strip only / Banner only** chooses whether you're editing the shared crop or a strip-/banner-specific override.
- Live previews show the strip and banner at their real desktop and phone sizes.
- **Save to file** writes `thumbnailCrop` into the entry's frontmatter (only that block is touched); **Copy YAML** copies it instead. **Clear layer** / **Reset all** remove overrides.

The editor only exists in the dev server (`src/integrations/thumbnail-editor/`); it isn't part of `npm run build`.

### Image carousels

Wrap images in `<div class="carousel">` in any blog post or project page:

```html
<div class="carousel">
  <img src="https://raw.githubusercontent.com/.../media/one.jpg" alt="First" title="Optional caption" />
  <img src="https://raw.githubusercontent.com/.../media/two.jpg" alt="Second" />
</div>
```

Markdown images also work, with a blank line after `<div class="carousel">` and before `</div>`:

```md
<div class="carousel">

![First](media/one.jpg "Optional caption")
![Second](media/two.jpg)

</div>
```

## Deployment

Pushes to `main` trigger the GitHub Actions workflow (`.github/workflows/deploy.yml`), which builds the site and publishes it to GitHub Pages. No manual steps required.

---

> This page and most of the files in this repository have been created by or with the help of AI. More precisely by Anthropic's Claude using the Sonnet 4.6 Extended, Sonnet 5, Opus 4.8 and Fable 5 models.
