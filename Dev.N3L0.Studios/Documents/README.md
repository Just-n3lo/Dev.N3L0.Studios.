# dev.N3L0.Studios — Part 2 Update Notes

This covers the changes made to the site to align it with the Part 2 brief
(CSS Styling and Responsive Design) shown in your screenshots. Every image
tag was left in its original position in the layout — nothing was added,
removed, or reordered — only attributes on those tags were extended.

## 1. Files renamed (link-breaking bug fix)
Your nav links pointed to `About Us.html`, `Products & Services.html` and
`News & Updates.html`, but spaces and `&` in filenames break links on real
web servers (the `&` especially, since it's a reserved URL character). The
files are renamed to URL-safe names and every `href` across all six pages
now points to the correct one:

| Old name | New name |
|---|---|
| `About Us.html` | `About-Us.html` |
| `Products & Services.html` | `Products-Services.html` |
| `News & Updates.html` | `News-Updates.html` |
| `Index.html`, `Gallery.html`, `Contact.html` | unchanged |

## 2. Body classes restored
`style.css` already had a full set of per-page rules (`body.page-index`,
`body.page-about`, `body.page-contact`, `body.page-gallery`,
`body.page-news`, `body.page-products`) but none of the HTML `<body>` tags
actually carried those classes, so none of that page-specific CSS
(backgrounds, page-specific colours, form styling, etc.) was being applied.
Each page now has its matching class, e.g. `<body class="page-gallery">`.

## 3. `rel="Stylesheet"` casing
`Index.html` had `rel="Stylesheet"` (capital S). Browsers accept it, but
it's fixed to lowercase `rel="stylesheet"` for standards consistency with
the other five pages.

## 4. Relative units (brief 3.2)
Several fixed-pixel sizes in `style.css` were converted to `rem` so they
scale with the base font size instead of staying rigid, per the "use
relative units like `em`/`rem`" requirement:
- Logo (`header img`): `110px` → `6.875rem` (desktop), `90px` → `5.625rem` (mobile breakpoint)
- Instagram image: `500px` → `31.25rem`
- Gallery video width: `500px` → `31.25rem`
- Gallery "creative work" images: `500px` → `31.25rem`
- Photography grid image height: `300px` → `18.75rem`
- Packages/pricing image: `900px` → `56.25rem`
- News page pricing image inline style: `700px` → `43.75rem`

Widths/heights that were already `%`-based (main content, forms, lists,
videos) were left as-is — they already satisfy this requirement.

## 5. Responsive images with `srcset`/`sizes` (brief 3.3)
This was the one requirement not implemented anywhere in the original
markup. It's now added in two patterns:

- **Logo and pricing images** (`header img`, packages image, news pricing
  image): a `1x`/`2x` `srcset` for high-density (retina) screens, e.g.
  `srcset="images/photo.jpg 1x, images/photo@2x.jpg 2x"`.
- **Photography grid images** (`Gallery.html`): a full width-descriptor
  `srcset` with a matching `sizes` attribute, so the browser picks the
  right file for the column width at each breakpoint:
  ```html
  srcset="images/studio1-480w.jpg 480w, images/studio1-800w.jpg 800w, images/studio1-1200w.jpg 1200w"
  sizes="(max-width: 768px) 100vw, (max-width: 1100px) 33vw, 350px"
  ```

**Action needed from you:** the `srcset` markup references extra image
files (e.g. `photo@2x.jpg`, `studio1-480w.jpg`, `studio1-800w.jpg`,
`studio1-1200w.jpg`) that don't exist in your `images/` folder yet. The
code is correct and will work as soon as you export those extra
resolutions from your originals and drop them into `images/` alongside the
existing files. Until then, browsers will just fall back to the plain
`src` image, so nothing is broken in the meantime.

## 6. `&` escaped in page titles/headings
`Products & Services` and `News & Updates` (and similar) now use `&amp;`
in the HTML text content (`<title>`, `<h1>`, `<h2>`) — a raw `&` in HTML
text is technically invalid and some validators/browsers can render it
inconsistently.

## What was intentionally left untouched
- All image `src` positions and the surrounding markup structure — every
  `<img>` still sits exactly where you placed it.
- The overall colour palette, grid/flexbox layout, and breakpoints in
  `style.css` — these already matched the brief.
- The booking form fields and video placeholders.
