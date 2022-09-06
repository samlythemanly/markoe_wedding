import path from 'path';

import camelcase from 'camelcase';

import type {
  SyncTransformer,
  TransformedSource,
  TransformOptions,
} from '@jest/transform';

/**
 * This is a custom Jest transformer turning file imports into filenames.
 *
 * See http://facebook.github.io/jest/docs/en/webpack.html.
 */
const fileTransformer: SyncTransformer = {
  process(
    _: string,
    filename: string,
    __: TransformOptions,
  ): TransformedSource {
    const assetFilename = JSON.stringify(path.basename(filename));

    if (filename.match(/\.svg$/u)) {
      // Based on how SVGR generates a component name:
      // See https://github.com/smooth-code/svgr/blob/01b194cf967347d43d4cbe6b434404731b87cf27/packages/core/src/state.js#L6.
      const pascalCaseFilename = camelcase(path.parse(filename).name, {
        pascalCase: true,
      });
      const componentName = `Svg${pascalCaseFilename}`;

      return {
        code: `import * as React from 'react';
      module.exports = {
        __esModule: true,
        default: ${assetFilename},
        ReactComponent: React.forwardRef(function ${componentName}(props, ref) {
          return {
            $$typeof: Symbol.for('react.element'),
            type: 'svg',
            ref: ref,
            key: null,
            props: Object.assign({}, props, {
              children: ${assetFilename}
            })
          };
        }),
      };`,
      };
    }

    return { code: `module.exports = ${assetFilename};` };
  },
};

export default fileTransformer;
