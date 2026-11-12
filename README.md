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
  thumbnailCrop:     object  // optional – thumbnail image/crop overrides (see below)
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
  thumbnailCrop:     object  // optional – thumbnail image/crop overrides (see below)
}
```

Each project lives in its own subfolder and can include a `media/` directory for images referenced in its Markdown content. The same pattern applies to blog posts.

Each entry gets a thumbnail automatically: a file named `thumbnail.png`, `thumbnail.jpg` or `thumbnail.jpeg` in the entry's folder (or its `media/` folder) is used if present; otherwise the last image in the post/project body is used (Markdown `![alt](media/image.png)` — also `./media/…`, `<media/with spaces.png>` and `%20` — or `<img>` tags; local paths or `raw.githubusercontent.com` URLs pointing at files in this repo). Entries with neither get no thumbnail.

The thumbnail shows as a thin cropped strip between the title and description on the `/blog` and `/projects` index cards, and as a full-width banner (capped at 20rem tall) at the top of the post or project page. 
#### Thumbnail image and crop

There are four thumbnail slots: the index-card **strip** and the page **banner** (`hero`), each on **desktop** (768px and wider) and **phone** (`mobile`). Each slot can use a different image and crop. The image always fills its box (`object-fit: cover`); whatever doesn't fit is cut off. Defaults (and box heights) live in `thumbnails` in `src/site.config.ts`. Any post or project can override them:

```yaml
thumbnailCrop:
  x: 50                  # focal point, % from the left (0–100)
  y: 30                  # focal point, % from the top (0–100)
  zoom: 1.2              # 1 = just fills the box; zoom grows around the focal point
  image: media/cover.jpg # optional – a different image from this entry's folder
  strip:                 # optional – index-card strip only
    y: 60
    mobile:              # optional – strip on phones only
      image: media/detail.jpg
      zoom: 1.5
  hero:                  # optional – page banner only
    desktop:             # optional – banner on desktop only
      x: 20
```

Every field is optional. Each slot uses the most specific value set: `strip`/`hero` → `desktop`/`mobile` value, then the `strip`/`hero` value, then the top-level value, then the site default. Without an `image`, the automatic thumbnail (above) is used. Use `image: none` for no thumbnail, at any level: top level hides all of them, `strip: { image: none }` hides only the index strip, `strip: { mobile: { image: none } }` hides it only on phones.

**Interactive editor:** run `npm run dev` and click **dev** in the nav (or open [`/dev`](http://localhost:4321/dev)), then **Thumbnail editor**. Pick a post or project; each of the four thumbnails (strip · desktop, strip · phone, banner · desktop, banner · phone) has its own card, edited independently:

- **Image** picks any image from the entry's folder, **none** for no thumbnail, or **automatic**.
- On **project** pages, tick **images from related blog posts** to also list images from posts tagged with the project's `relatedTag` (grouped per post). They're saved as relative paths, e.g. `image: '../../blog/7/media/photo.png'`.
- **Drag the frame** over the image to choose what's shown; clicking elsewhere on the image jumps it there.
- **Scroll** over the image or use the slider to **zoom**.
- A preview at the real size sits under each card; **reset** clears that thumbnail.
- **Save to file** writes `thumbnailCrop` into the entry's frontmatter (only that block is touched), as one `strip`/`hero` → `desktop`/`mobile` block per thumbnail. Shared values already in the file are folded into each thumbnail first, so what you see is what's saved. **Copy YAML** copies it instead; **Reset all** clears everything.

The dev page and editor only exist in the dev server (`src/integrations/`); they aren't part of `npm run build`. Add new dev tools to `src/integrations/dev-tools/tools.ts`.

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
