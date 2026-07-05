# Filters

Nunjucks filters aurora registers. Use with the pipe syntax: `{{ value | filter }}`
or `{{ value | filter(arg) }}`. Consumers can add or shadow any of these by name
from `overrides/lib/filters.mjs` (entries there win over the theme's).

> Autoescape is **off** in aurora's Nunjucks, so filters that emit HTML (e.g.
> `wordmark`, `socialIcon`) return trusted markup — pipe through `| safe` to render
> it. Filters that take untrusted input escape it themselves.

## Escaping / security

| Filter | Signature | Description |
| --- | --- | --- |
| `escapeHtml` | `str \| escapeHtml` | Escape `& < > " '` for HTML text/attributes. |
| `escapeAttr` | `str \| escapeAttr` | Alias of `escapeHtml`, for attribute values. |
| `escapeCssValue` | `str \| escapeCssValue` | Strip characters that could break out of a CSS value (quotes, brackets, comments, `;`, `\`). |
| `escapeJsString` | `str \| escapeJsString` | Escape a string for embedding inside a JS string literal. |
| `safeUrl` | `url \| safeUrl` | Return the URL if its scheme is allowed (`http`, `https`, `mailto`, `tel`, or a relative `/ # ? .` path); otherwise `#`. |

## Dates

| Filter | Signature | Description |
| --- | --- | --- |
| `dateToFormat` | `date \| dateToFormat(format)` | Format a JS `Date` with a [Luxon format](https://moment.github.io/luxon/#/formatting) (UTC). e.g. `dateToFormat("LLLL yyyy")` → `"September 2025"`. |
| `dateToISO` | `date \| dateToISO` | ISO-8601 string (UTC, no offset/ms) — for `<time datetime>`. |
| `currentYear` | `currentYear()` | The current year as a number. |
| `copyrightYear` | `copyrightYear(startYear)` | `"2026"`, or a range `"2024-2026"` when `startYear` is earlier. |

## Tags

| Filter | Signature | Description |
| --- | --- | --- |
| `filterTagList` | `tags \| filterTagList` | Drop the system tags (`all`, `nav`, `post`, `posts`), leaving real topic tags. |
| `formatTag` | `tag \| formatTag` | `"Another Tag"` → `"#another-tag"` (lowercased, hyphenated, `#`-prefixed). |

## Content

| Filter | Signature | Description |
| --- | --- | --- |
| `readingTime` | `text \| readingTime` | Estimated reading time in minutes (~200 wpm, minimum 1). |
| `wordmark` | `text \| wordmark(accent)` | Text wordmark HTML with the first `accent` substring wrapped in `<span class="logo-accent">`. Pipe through `\| safe`. e.g. `'insightsdude.uk' \| wordmark('.')`. |

## Social

| Filter | Signature | Description |
| --- | --- | --- |
| `socialIcon` | `platform \| socialIcon` | Inline brand SVG (simple-icons, `currentColor`) for a platform, or `""` if unknown. Pipe through `\| safe`. |
| `socialLabel` | `social \| socialLabel` | Display label for a social entry (its `label`, else the capitalised platform). |
| `socialUrl` | `account \| socialUrl` | Expand a handle to a profile URL. Provided by `@eleventy-plugin-themer/core`; pipe the result through `\| safeUrl`. |

## Collections & utilities

| Filter | Signature | Description |
| --- | --- | --- |
| `head` | `array \| head(n)` | First `n` items, or the **last** `n` when `n` is negative. |
| `min` | `min(a, b, …)` | Smallest of the arguments. |
| `sortAlphabetically` | `strings \| sortAlphabetically` | Locale-sorted copy of a string array. |
| `getKeys` | `object \| getKeys` | `Object.keys(object)`. |
| `obfuscate` | `str \| obfuscate` | HTML entity-encode every character (light email obfuscation). |
| `safeFeatureName` | `name \| safeFeatureName` | The name if it's `[a-z0-9-]+`, else `""` — safe for a script `src`. |
| `cssVarKey` | `key \| cssVarKey` | camelCase → kebab-case, sanitised, for custom-property segments (e.g. `linkHover` → `link-hover`). |
