# Ant & Lee wedding website

A single-screen wedding-weekend save-the-date that can be hosted as-is on Vercel, Cloudflare Pages, Netlify, or GitHub Pages. No build step is needed.

## Personalize it

Open [site-content.js](./site-content.js) and replace the visible details. It contains the names, save-the-weekend dates, location, the four weekend events, and the footer note.

The page structure is in [index.html](./index.html), and its one-screen layout, colors, and lattice frame are in [styles.css](./styles.css).

## Preview on your computer

From this folder, run:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

## Publish it

Because this is a plain static website, import the GitHub repository into Vercel or Cloudflare Pages and deploy it with the default settings. There is no build command and no output directory to configure.
