import { escapeHtml, escapeCssValue, safeUrl } from './escape.mjs';

// ---------------------------------------------------------------------------
// Post-card helpers (shared by pinnedPost / latestPosts / relatedPosts)
// ---------------------------------------------------------------------------

const SYSTEM_TAGS = new Set(['all', 'nav', 'post', 'posts']);
const stripSystemTags = (tags) =>
  (Array.isArray(tags) ? tags : tags ? [tags] : []).filter((t) => !SYSTEM_TAGS.has(t));

// Trailing-slash / query / hash insensitive; Eleventy urls end in "/".
const normalizeUrl = (u) => {
  if (typeof u !== 'string' || u === '') return '';
  const s = u.split(/[?#]/)[0];
  return s.endsWith('/') ? s : `${s}/`;
};

// The `posts` collection is date-ascending, so sort explicitly for newest-first.
const sortByDateDesc = (posts) =>
  [...posts].sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));

// UTC matches `dateToFormat` (luxon zone:'utc') and dodges a local off-by-one.
const formatDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return { text: '', iso: '' };
  const iso = date.toISOString().slice(0, 10);
  const text = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
  return { text, iso };
};

// Precedence: explicit arg > post front matter > none.
const resolveImage = (opts, post) => ({
  src: opts.image ?? post?.data?.image ?? null,
  alt: opts.imageAlt ?? post?.data?.imageAlt ?? post?.data?.title ?? '',
});

// Omit the media block when there's no src (a src-less <img> trips eleventy-img).
const renderImg = (src, alt, { eager = false } = {}) => {
  if (!src) return '';
  const attrs = [
    `src="${escapeHtml(safeUrl(src))}"`,
    `alt="${escapeHtml(alt)}"`,
    eager ? 'loading="eager"' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return `<div class="post-card__media"><img class="post-card__image" ${attrs}></div>`;
};

const renderPostCard = (post, opts = {}, { featured = false } = {}) => {
  const data = post?.data ?? {};
  const url = escapeHtml(safeUrl(post?.url ?? '#'));
  const { src, alt } = resolveImage(opts, post);
  const { text: dateText, iso } = formatDate(post?.date);
  const blurb = opts.blurb ?? data.description ?? '';
  const linkText = opts.linkText ?? 'Read more';

  const displayTags = stripSystemTags(data.tags);
  const tagChip = displayTags.length
    ? `<span class="post-card__tag">#${escapeHtml(displayTags[0].toLowerCase().replace(/\s+/g, '-'))}</span>`
    : '';
  const media = renderImg(src, alt, { eager: featured });
  const title = escapeHtml(data.title || post?.url || '');
  const dateHtml = dateText
    ? `<time class="post-card__date" datetime="${iso}">${escapeHtml(dateText)}</time>`
    : '';
  const excerpt = blurb ? `<p class="post-card__excerpt">${escapeHtml(blurb)}</p>` : '';

  // `split` (featured only) drives the image column width via --post-card-split.
  const split = Number(opts.split);
  const splitStyle =
    featured && split > 0 && split < 100
      ? ` style="--post-card-split: ${split}fr ${100 - split}fr;"`
      : '';

  // Single line: shortcode output is re-parsed by markdown-it (breaks:true), so a
  // newline would become a <br>. CSS (`.post-card__body { gap }`) owns spacing.
  // aria-label carries the post title so repeated "Read more" links stay descriptive.
  const linkAria = title ? ` aria-label="${escapeHtml(linkText)}: ${title}"` : '';
  return `<article class="post-card${featured ? ' post-card--featured' : ''}"${splitStyle}>${media}<div class="post-card__body">${tagChip}<h3 class="post-card__title"><a href="${url}">${title}</a></h3>${dateHtml}${excerpt}<a class="post-card__link" href="${url}"${linkAria}>${escapeHtml(linkText)}</a></div></article>`;
};

const renderGrid = (cards, columns) => {
  const cols = Number(columns) > 0 ? Number(columns) : 3;
  return `<div class="content-grid post-card-grid" style="--grid-cols: ${cols};">${cards.join('')}</div>`;
};

// Numbered list matching the home/archive `.postlist`; newest-first counts down.
const renderList = (posts) => {
  const items = posts.map((post) => {
    const url = escapeHtml(safeUrl(post?.url ?? '#'));
    const title = escapeHtml(post?.data?.title || post?.url || '');
    const { text, iso } = formatDate(post?.date);
    const date = text
      ? `<time class="postlist-date" datetime="${iso}">${escapeHtml(text)}</time>`
      : '';
    return `<li class="postlist-item"><a href="${url}" class="postlist-link">${title}</a>${date}</li>`;
  });
  return `<ol reversed class="postlist" style="--postlist-index: ${posts.length + 1};">${items.join('')}</ol>`;
};

// `display: 'list'` → the theme list; otherwise the card grid.
const renderPosts = (posts, opts) =>
  opts.display === 'list'
    ? renderList(posts)
    : renderGrid(
        posts.map((p) => renderPostCard(p, opts)),
        opts.columns,
      );

// Simple shortcodes (non-paired). These read the render context via `this`, so
// they must be `function`s (Eleventy binds `this` to the template context).
export default {
  // Pin one post (by url) as a featured card. Args: url (required), image,
  // imageAlt, blurb (default: post description), linkText, split (image width %).
  pinnedPost(opts = {}) {
    const posts = this.ctx?.collections?.posts ?? [];
    const target = normalizeUrl(opts.url);
    const post = target && posts.find((p) => normalizeUrl(p.url) === target);
    if (!post) return `<!-- pinnedPost: no post found at "${escapeHtml(String(opts.url ?? ''))}" -->`;
    return renderPostCard(post, opts, { featured: true });
  },

  // Latest N posts, newest first, excluding the current page. Args: count (3),
  // start (0-based offset), display (cards|list), columns (3, cards only).
  latestPosts(opts = {}) {
    const count = Number(opts.count) > 0 ? Number(opts.count) : 3;
    const start = Number(opts.start) > 0 ? Number(opts.start) : 0;
    const currentUrl = normalizeUrl(this.page?.url);
    const posts = sortByDateDesc(this.ctx?.collections?.posts ?? [])
      .filter((p) => normalizeUrl(p.url) !== currentUrl)
      .slice(start, start + count);
    return posts.length ? renderPosts(posts, opts) : '';
  },

  // N posts sharing tags with the current page, ranked by shared-tag count then
  // date. Args: count (3), display (cards|list), columns (3, cards only).
  relatedPosts(opts = {}) {
    const count = Number(opts.count) > 0 ? Number(opts.count) : 3;
    const currentUrl = normalizeUrl(this.page?.url);
    const myTags = new Set(stripSystemTags(this.ctx?.tags));
    if (!myTags.size) return '';
    const scored = (this.ctx?.collections?.posts ?? [])
      .filter((p) => normalizeUrl(p.url) !== currentUrl)
      .map((p) => ({
        post: p,
        shared: stripSystemTags(p.data?.tags).filter((t) => myTags.has(t)).length,
      }))
      .filter((x) => x.shared > 0)
      .sort(
        (a, b) => b.shared - a.shared || (b.post.date?.getTime() ?? 0) - (a.post.date?.getTime() ?? 0),
      )
      .slice(0, count);
    return scored.length ? renderPosts(scored.map((x) => x.post), opts) : '';
  },
};

// Paired shortcodes (have opening and closing tags with content between)
export const pairedShortcodes = {
  /**
   * Content Grid - Creates a responsive grid layout for content boxes
   *
   * Usage:
   * {% contentGrid cols=3, gap="1rem" %}
   *   {% box title="Feature 1" %}Content{% endbox %}
   * {% endcontentGrid %}
   *
   * @param {string} content - The inner content (box shortcodes)
   * @param {Object} options - Configuration options
   * @param {number} options.cols - Number of columns (default: 3)
   * @param {string} options.gap - Gap between items (default: "1rem")
   * @param {string} options.className - Additional CSS class
   */
  contentGrid: function (content, { cols = 3, gap = '1rem', className = '' } = {}) {
    return `<div class="content-grid ${escapeHtml(className)}" style="--grid-cols: ${Number(cols)}; --grid-gap: ${escapeCssValue(gap)};">
	${content}
</div>`;
  },

  /**
   * Box - A content box for use within contentGrid
   *
   * Usage:
   * {% box title="Feature", link="/path", linkText="Learn More" %}
   *   Description content here
   * {% endbox %}
   *
   * @param {string} content - The box content
   * @param {Object} options - Configuration options
   * @param {string} options.title - Box heading
   * @param {string} options.link - URL for the call-to-action link
   * @param {string} options.linkText - Text for the link (default: "Learn More")
   * @param {number} options.span - Number of grid columns to span (default: 1).
   *   Combine unequal spans within a contentGrid for layouts like 2/3 + 1/3
   *   (cols=3, spans 2 and 1) or 1/4 + 3/4 (cols=4, spans 1 and 3).
   * @param {string} options.className - Additional CSS class
   */
  box: function (
    content,
    { title = '', link = '', linkText = 'Learn More', span = 0, className = '' } = {},
  ) {
    const safeLink = link ? escapeHtml(safeUrl(link)) : '';
    const linkAria = title ? ` aria-label="${escapeHtml(linkText)}: ${escapeHtml(title)}"` : '';
    const linkHtml = safeLink
      ? `<a href="${safeLink}" class="content-box__link"${linkAria}>${escapeHtml(linkText)}</a>`
      : '';
    const spanStyle = Number(span) > 0 ? ` style="grid-column: span ${Number(span)};"` : '';

    return `<div class="content-box ${escapeHtml(className)}"${spanStyle}>
	${title ? `<h3 class="content-box__title">${escapeHtml(title)}</h3>` : ''}
	<div class="content-box__content">${content}</div>
	${linkHtml}
</div>`;
  },

  /**
   * Hero - A hero section with title, subtitle, and action buttons
   *
   * Usage:
   * {% hero title="Welcome", subtitle="A great subtitle", background="/images/hero.jpg" %}
   *   {% heroButton url="/start", variant="primary" %}Get Started{% endheroButton %}
   * {% endhero %}
   *
   * @param {string} content - Inner content (usually heroButton shortcodes)
   * @param {Object} options - Configuration options
   * @param {string} options.title - Main heading
   * @param {string} options.subtitle - Subtitle/blurb
   * @param {string} options.background - Background image URL
   * @param {string} options.backgroundColor - Background color (fallback)
   * @param {string} options.align - Text alignment: left, center, right (default: center)
   * @param {string} options.height - Minimum height (default: auto)
   * @param {boolean} options.overlay - Show dark overlay on background image (default: true)
   * @param {string} options.className - Additional CSS class
   */
  hero: function (content, options = {}) {
    const {
      title = '',
      subtitle = '',
      background = '',
      backgroundColor = '',
      align = 'center',
      height = 'auto',
      overlay = true,
      className = '',
      headingLevel = 2,
    } = options;
    // Default h2 so a hero placed under the page's h1 keeps headings in order;
    // pass headingLevel=1 when the hero is the page's main heading.
    const hTag = `h${Math.min(6, Math.max(1, Number(headingLevel) || 2))}`;

    let styleStr = '';
    if (background) {
      styleStr += `background-image: url('${escapeCssValue(background)}');`;
    } else if (backgroundColor) {
      styleStr += `background-color: ${escapeCssValue(backgroundColor)};`;
    }
    if (height !== 'auto') {
      styleStr += ` --hero-height: ${escapeCssValue(height)};`;
    }

    const safeAlign = escapeCssValue(align);
    const overlayClass = background && overlay ? 'hero--overlay' : '';

    return `<section class="hero hero--${safeAlign} ${overlayClass} ${escapeHtml(className)}" style="${styleStr}">
	<div class="hero__content">
		${title ? `<${hTag} class="hero__title">${escapeHtml(title)}</${hTag}>` : ''}
		${subtitle ? `<p class="hero__subtitle">${escapeHtml(subtitle)}</p>` : ''}
		${content ? `<div class="hero__actions">${content}</div>` : ''}
	</div>
</section>`;
  },

  /**
   * Hero Button - An action button for use within hero sections
   *
   * Usage:
   * {% heroButton url="/path", variant="primary" %}Button Text{% endheroButton %}
   *
   * @param {string} content - Button text
   * @param {Object} options - Configuration options
   * @param {string} options.url - Link URL
   * @param {string} options.variant - Button style: primary, secondary (default: primary)
   * @param {string} options.className - Additional CSS class
   */
  heroButton: function (content, { url = '#', variant = 'primary', className = '' } = {}) {
    return `<a href="${escapeHtml(safeUrl(url))}" class="hero__button hero__button--${escapeHtml(variant)} ${escapeHtml(className)}">${content}</a>`;
  },
};
