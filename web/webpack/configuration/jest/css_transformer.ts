import type { SyncTransformer, TransformedSource } from '@jest/transform';

/**
 * Custom Jest transformer which transforms style imports into empty objects.
 * See http://facebook.github.io/jest/docs/en/webpack.html.
 */
const cssTransformer: SyncTransformer = {
  process(): TransformedSource {
    return { code: 'module.exports = {};' };
  },
  getCacheKey(): string {
    // The output is always the same.
    return 'cssTransform';
  },
};

export default cssTransformer;
