/**
 * eleventy-theme-aurora
 *
 * A drop-in Eleventy theme using @eleventy-plugin-themer/core. Started from
 * theme-base; preserves the same layout names + config/class contract so it can
 * replace theme-base by swapping the theme name in a consumer's config.
 * This theme is consumed via eleventyPluginThemer() which uses the default export.
 */

import markdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';

import pkg from '../package.json' with { type: 'json' };

import filters from './filters.mjs';
import shortcodes, { pairedShortcodes } from './shortcodes.mjs';
import buildData from './build-data.mjs';
import externalLinks from './external-links.mjs';

/**
 * Theme-level Eleventy configuration.
 *
 * Themes own how content renders. This hook is invoked by `eleventyPluginThemer`
 * after helpers are registered. Use it to set the markdown library, transforms
 * that depend on theme-specific decisions, etc.
 */
function configure(eleventyConfig) {
  // Provide build metadata (git commit, timestamp) as the `build` global so the
  // footer can show the deployed commit without the consumer wiring up a data file.
  eleventyConfig.addGlobalData('build', buildData);

  const md = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  }).use(markdownItAnchor, {
    level: 2,
    permalink: markdownItAnchor.permalink.linkAfterHeader({
      style: 'visually-hidden',
      assistiveText: (title) => `Permalink to "${title}"`,
      visuallyHiddenClass: 'visually-hidden',
      wrapper: ['<div class="heading-wrapper">', '</div>'],
    }),
    slugify: eleventyConfig.getFilter('slugify'),
  });
  eleventyConfig.setLibrary('md', md);
}

export default {
  name: pkg.name,
  filters,
  shortcodes,
  pairedShortcodes,
  transforms: { externalLinks },
  configure,
};
