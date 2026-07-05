# Shortcodes

Aurora ships two kinds of Nunjucks shortcodes:

- **Paired** (block) shortcodes wrap inner content between an opening and closing
  tag: `{% name %} … {% endname %}`.
- **Simple** shortcodes take only keyword arguments: `{% name arg=value %}`.

All arguments are keyword arguments. Multiple arguments are comma-separated:
`{% hero title="Hi", align="center" %}`. Every interpolated value is HTML-escaped,
and URLs pass through a scheme allowlist, so untrusted content is safe to pass.

---

## Layout shortcodes (paired)

### `contentGrid`

Responsive grid wrapper for `box` cards. Columns collapse automatically: the
requested count on wide screens → max 2 at ≤768px → 1 at ≤480px.

```njk
{% contentGrid cols=3, gap="1.5rem" %}
  {% box title="Fast" %}Content{% endbox %}
  {% box title="Simple" %}Content{% endbox %}
{% endcontentGrid %}
```

| Argument | Type | Default | Description |
| --- | --- | --- | --- |
| `cols` | number | `3` | Columns on wide screens. |
| `gap` | string | `"1rem"` | Grid gap (any CSS length). |
| `className` | string | `""` | Extra class on the grid element. |

### `box`

A content card, used inside `contentGrid`.

```njk
{% box title="Fast Performance", link="/about", linkText="Learn more" %}
  <p>Optimized for speed.</p>
{% endbox %}
```

| Argument | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | string | `""` | Card heading (omitted if empty). |
| `link` | string | `""` | Action-link URL (omitted if empty). |
| `linkText` | string | `"Learn More"` | Action-link label. |
| `span` | number | `0` | Columns to span (e.g. `2` for a wide card). |
| `className` | string | `""` | Extra class on the box. |

### `hero`

Full-width hero band with an optional background image/colour, title, subtitle,
and action buttons (`heroButton`). Without a background it uses the theme's
`--hero-gradient`.

```njk
{% hero title="Welcome", subtitle="Build with ease", align="center", height="350px" %}
  {% heroButton url="/start", variant="primary" %}Get Started{% endheroButton %}
  {% heroButton url="/docs", variant="secondary" %}Learn More{% endheroButton %}
{% endhero %}
```

| Argument | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | string | `""` | Main heading. |
| `subtitle` | string | `""` | Subtitle / blurb. |
| `background` | string | `""` | Background image URL. |
| `backgroundColor` | string | `""` | Background colour fallback (used when no image). |
| `align` | string | `"center"` | Text alignment: `left` \| `center` \| `right`. |
| `height` | string | `"auto"` | Minimum height (sets `--hero-height`). |
| `overlay` | boolean | `true` | Dark overlay over a background image (for legible text). |
| `headingLevel` | number | `2` | Title heading level (`1`–`6`). Defaults to `h2` so it sits under the page's `h1`; use `1` when the hero is the page's main heading. |
| `className` | string | `""` | Extra class on the hero. |

### `heroButton`

An action button for use inside `hero`.

```njk
{% heroButton url="/start", variant="primary" %}Get Started{% endheroButton %}
```

| Argument | Type | Default | Description |
| --- | --- | --- | --- |
| `url` | string | `"#"` | Link URL. |
| `variant` | string | `"primary"` | Button style: `primary` \| `secondary`. |
| `className` | string | `""` | Extra class on the button. |

---

## Post shortcodes (simple)

These read the site's `posts` collection and the current page's data, so they can
be dropped on any page. Cards render in a responsive grid (`.post-card`); an
optional `display="list"` renders the same numbered list used on the home/archive.

Images: today `pinnedPost` takes an image via the `image` argument. `latestPosts`
and `relatedPosts` cards are text-only unless a post declares an `image` (and
optional `imageAlt`) in its front matter — the resolver already reads those.

### `pinnedPost`

Feature one specific post as a wide card (image beside text above 768px).

```njk
{% pinnedPost url="/posts/my-post/" %}
{% pinnedPost url="/posts/my-post/", image="/assets/cover.jpg", split=50 %}
```

| Argument | Type | Default | Description |
| --- | --- | --- | --- |
| `url` | string | — | **Required.** The post's URL (trailing slash optional). Unknown → renders nothing. |
| `image` | string | — | Cover image URL. |
| `imageAlt` | string | post title | Alt text for the image. |
| `blurb` | string | post `description` | Teaser text. |
| `linkText` | string | `"Read more"` | Read-more link label. |
| `split` | number | ≈58 | Image column width as a percent (1–99). |

### `latestPosts`

The most recent posts, newest first, excluding the current page.

```njk
{% latestPosts %}
{% latestPosts count=4, columns=2 %}
{% latestPosts start=1, count=3 %}   {# skip the newest; show 2nd–4th #}
{% latestPosts display="list" %}
```

`start` (0-based) lets you compose layouts — e.g. `start=0 count=1 columns=1` for a
hero post, then `start=1 count=3 columns=3` for the next three.

| Argument | Type | Default | Description |
| --- | --- | --- | --- |
| `count` | number | `3` | How many posts to show. |
| `start` | number | `0` | 0-based index of the first post. |
| `display` | string | `"cards"` | `cards` (grid) or `list` (numbered list). |
| `columns` | number | `3` | Grid columns (cards only). |

### `relatedPosts`

Posts that share tags with the **current page**, ranked by shared-tag count then
date. Renders nothing if the page has no (non-system) tags or nothing shares one.
Best placed at the foot of a post.

```njk
{% relatedPosts %}
{% relatedPosts count=3, columns=3 %}
{% relatedPosts display="list" %}
```

| Argument | Type | Default | Description |
| --- | --- | --- | --- |
| `count` | number | `3` | How many posts to show. |
| `display` | string | `"cards"` | `cards` (grid) or `list` (numbered list). |
| `columns` | number | `3` | Grid columns (cards only). |

---

## Overriding a shortcode

Consumers can add or shadow a shortcode by name from `overrides/lib/shortcodes.mjs`
(default-export object; keys become names). Entries registered there run after the
theme's, so a same-named entry wins. Only **simple** shortcodes are auto-discovered
from overrides; paired ones are registered by the theme.
