# eleventy-theme-aurora

A drop-in Eleventy theme built on
[`@eleventy-plugin-themer/core`](https://www.npmjs.com/package/@eleventy-plugin-themer/core).

Aurora started as a clone of
[`@eleventy-plugin-themer/theme-base`](https://github.com/artislismanis/eleventy-plugin-themer/tree/main/packages/themes/base)
and preserves its full contract — the same layout names (`base.njk`, `home.njk`,
`post.njk`), the same partials, the same CSS class names, and the same
`theme.config.mjs` keys. That means it is a **drop-in replacement**: switch themes
by changing only the theme name in your Eleventy config.

> Status: early. The visual identity is intentionally identical to theme-base for
> now and will diverge in a follow-up ("clone, then iterate").

## Installation

```bash
npm install @eleventy-plugin-themer/core eleventy-theme-aurora @11ty/eleventy-plugin-syntaxhighlight
```

With Vite build optimizations:

```bash
npm install -D @eleventy-plugin-themer/build-vite @11ty/eleventy-plugin-vite
```

## Usage

Point your themer config at this package instead of `theme-base`:

```js
// eleventy.config.mjs
import { eleventyPluginThemer } from '@eleventy-plugin-themer/core';

export default async function (eleventyConfig) {
  const { dir } = await eleventyPluginThemer(eleventyConfig, {
    theme: 'eleventy-theme-aurora',
    projectRoot: import.meta.dirname,
    input: 'content',
    output: '_site',
  });
  return { dir };
}
```

Everything else (overrides, `content/_data/theme.js`, features) works exactly as it
does with theme-base — see the theme-base README for the full configuration,
override, shortcode, and feature reference.

## Features

Two self-contained, per-page opt-in features ship with the theme:

- **code-highlighting** — PrismJS syntax highlighting with copy button, optional line
  numbers, and diff highlighting.
- **back-to-top** — a floating button that smooth-scrolls to the top.

Enable per page via front matter, e.g. `feature: code-highlighting`.

## Documentation

- [Shortcodes](docs/shortcodes.md) — layout shortcodes (`contentGrid`, `box`,
  `hero`, `heroButton`) and post shortcodes (`pinnedPost`, `latestPosts`,
  `relatedPosts`), with every argument and its default.
- [Filters](docs/filters.md) — all Nunjucks filters (escaping, dates, tags,
  content, social, utilities) with signatures.

## Local development

This repo lives alongside the
[`eleventy-plugin-themer`](https://github.com/artislismanis/eleventy-plugin-themer)
monorepo. To develop against **unpublished** core/build-vite changes, override the
dependency with a local path instead of the published version:

```text
// package.json (local only — do not commit)
"dependencies": {
  "@eleventy-plugin-themer/core": "file:../eleventy-plugin-themer/packages/core"
}
```

```bash
npm install
npm test        # unit tests for filters + shortcodes
npm run lint
```

## License

MIT © Artis Lismanis
