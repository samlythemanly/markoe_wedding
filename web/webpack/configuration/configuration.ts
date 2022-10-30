/* eslint-disable @typescript-eslint/no-magic-numbers */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import getCSSModuleLocalIdent from 'react-dev-utils/getCSSModuleLocalIdent';
import InlineChunkHtmlPlugin from 'react-dev-utils/InlineChunkHtmlPlugin';
import InterpolateHtmlPlugin from 'react-dev-utils/InterpolateHtmlPlugin';
import ModuleNotFoundPlugin from 'react-dev-utils/ModuleNotFoundPlugin';
import ModuleScopePlugin from 'react-dev-utils/ModuleScopePlugin';
import resolve from 'resolve';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import WorkboxWebpackPlugin from 'workbox-webpack-plugin';

import environmentWith from './environment';
import paths from './paths';
import createEnvironmentHash from './persistent_cache/environment_hash';

const ForkTsCheckerWebpackPlugin =
  process.env.TSC_COMPILE_ON_ERROR === 'true'
    ? (await import('react-dev-utils/ForkTsCheckerWarningWebpackPlugin'))
        .default
    : (await import('react-dev-utils/ForkTsCheckerWebpackPlugin')).default;

// Source maps are resource heavy and can cause out of memory issue for large
// source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

const reactRefreshRuntimeEntry = resolve.sync('react-refresh/runtime');
const reactRefreshWebpackPluginRuntimeEntry = resolve.sync(
  '@pmmmwh/react-refresh-webpack-plugin',
);
const babelRuntimeEntry = resolve.sync('babel-preset-react-app');
const babelRuntimeEntryHelpers = resolve.sync(
  '@babel/runtime/helpers/esm/assertThisInitialized',
  { basedir: babelRuntimeEntry },
);
const babelRuntimeRegenerator = resolve.sync('@babel/runtime/regenerator', {
  basedir: babelRuntimeEntry,
});

// Some apps do not need the benefits of saving a web request, so not inlining
// the chunk makes for a smoother build process.
const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== 'false';

const shouldEmitErrorsAsWarnings = process.env.ESLINT_NO_DEV_ERRORS === 'true';
const shouldUseEslint = process.env.DISABLE_ESLINT_PLUGIN !== 'true';

const imageInlineSizeLimit = parseInt(
  process.env.IMAGE_INLINE_SIZE_LIMIT ?? '10000',
);

// Whether Tailwind has been configured.
const shouldUseTailwind = fs.existsSync(
  path.join(paths.app, 'tailwind.config.js'),
);

const cssRegex = /\.css$/u;
const cssModuleRegex = /\.module\.css$/u;
const sassRegex = /\.(?:scss|sass)$/u;
const sassModuleRegex = /\.module\.(?:scss|sass)$/u;

function hasJsxRuntime(): boolean {
  if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') return false;

  try {
    resolve.sync('react/jsx-runtime');

    return true;
  } catch (_) {
    return false;
  }
}

/**
 * This is the production and development configuration.
 * Webpack configuration focused on developer experience, fast rebuilds, and a
 * minimal bundle.
 */
export default function webpackConfiguration(
  environmentName: 'development' | 'production',
): webpack.Configuration {
  const isProduction = environmentName === 'production';
  const canUseNewJsx = hasJsxRuntime();

  // Variable used for enabling profiling in Production
  // passed into alias object. Uses a flag if passed into the build command
  const isProductionProfile =
    isProduction && process.argv.includes('--profile');

  // We will provide `paths.publicUrlOrPath` to our app
  // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
  // Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
  // Get environment variables to inject into our app.
  const environment = environmentWith(paths.publicUrlOrPath.slice(0, -1));

  const shouldUseReactRefresh = environment.raw.FAST_REFRESH;

  // Common function to get style loaders
  function styleLoaders(
    cssOptions: string | Record<string, unknown>,
    preProcessor?: string,
  ): webpack.RuleSetUseItem[] {
    const loaders: webpack.RuleSetUseItem[] = [
      ...(isProduction ? [] : [resolve.sync('style-loader')]),
      ...(isProduction
        ? [
            {
              loader: MiniCssExtractPlugin.loader,

              // Css is located in `static/css`; use '../../' to locate the
              // index.html folder. In production, `paths.publicUrlOrPath` can
              // be a relative path.
              options: paths.publicUrlOrPath.startsWith('.')
                ? { publicPath: '../../' }
                : {},
            },
          ]
        : []),
      {
        loader: resolve.sync('css-loader'),
        options: cssOptions,
      },
      {
        // Options for PostCSS as we reference these options twice
        // Adds vendor prefixing based on your specified browser support in
        // package.json
        loader: resolve.sync('postcss-loader'),
        options: {
          postcssOptions: {
            // Necessary for external CSS imports to work
            // https://github.com/facebook/create-react-app/issues/2677
            ident: 'postcss',
            config: false,
            plugins: shouldUseTailwind
              ? [
                  'tailwindcss',
                  'postcss-flexbugs-fixes',
                  [
                    'postcss-preset-env',
                    {
                      autoprefixer: { flexbox: 'no-2009' },
                      stage: 3,
                    },
                  ],
                ]
              : [
                  'postcss-flexbugs-fixes',
                  [
                    'postcss-preset-env',
                    {
                      autoprefixer: { flexbox: 'no-2009' },
                      stage: 3,
                    },
                  ],

                  // Adds PostCSS Normalize as the reset css with default
                  // options, so that it honors the `browserslist` configuration
                  // in `package.json`. This allows customization of the target
                  // behavior.
                  'postcss-normalize',
                ],
          },
          sourceMap: shouldUseSourceMap,
        },
      },
    ];
    if (preProcessor) {
      loaders.push(
        {
          loader: resolve.sync('resolve-url-loader'),
          options: {
            sourceMap: shouldUseSourceMap,
            root: paths.webapp,
          },
        },
        {
          loader: resolve.sync(preProcessor),
          options: { sourceMap: true },
        },
      );
    }

    return loaders;
  }

  const file = fileURLToPath(import.meta.url);
  const directory = path.dirname(file);
  const sourceMap = isProduction ? 'source-map' : 'cheap-module-source-map';

  return {
    target: ['browserslist'],

    // Constrain Webpack noise to errors and warnings.
    stats: 'errors-warnings',
    mode: isProduction ? 'production' : 'development',

    // Fail compilation fast in production.
    bail: isProduction,
    devtool: shouldUseSourceMap && sourceMap,

    // These are the "entry points" to the application. This means they will be
    // the "root" imports that are included in JS bundle.
    entry: paths.index,
    output: {
      // The build folder.
      path: paths.build,

      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: !isProduction,

      // There will be one main bundle, and one file per asynchronous chunk.
      // In development, it does not produce real files.
      filename: isProduction
        ? 'static/js/[name].[contenthash:8].js'
        : 'static/js/bundle.js',

      // There are also additional JS chunk files if code splitting is used.
      chunkFilename: isProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : 'static/js/[name].chunk.js',
      assetModuleFilename: 'static/media/[name].[hash][ext]',

      // Webpack uses `publicPath` to determine where the app is being served
      // from. It requires a trailing slash, or the file assets will get an
      // incorrect path. The "public path" (such as / or /my-project) is
      // inferred from the home page.
      publicPath: paths.publicUrlOrPath,

      // Point sourcemap entries to original disk location (format as URL on
      // Windows).
      devtoolModuleFilenameTemplate: isProduction
        ? (info: webpack.AssetInfo) =>
            path
              .relative(paths.webapp, info.absoluteResourcePath)
              .replace(/\\/u, '/')
        : (info: webpack.AssetInfo) =>
            path.resolve(info.absoluteResourcePath).replace(/\\/u, '/'),
    },
    cache: {
      type: 'filesystem',
      version: createEnvironmentHash(environment.raw),
      cacheDirectory: paths.webpackCache,
      store: 'pack',
      buildDependencies: {
        defaultWebpack: ['webpack/lib/'],
        config: [file],
        tsconfig: [paths.tsConfig, paths.jsConfig].filter((configuration) =>
          fs.existsSync(configuration),
        ),
      },
    },
    infrastructureLogging: { level: 'none' },
    optimization: {
      minimize: isProduction,
      minimizer: [
        // This is only used in production.
        new TerserPlugin({
          terserOptions: {
            parse: { ecma: 2019 },
            compress: {
              // Minify into ECMA 5, since otherwise Terser might apply
              // minifications steps that invalidates otherwise valid ECMA 5
              // code:
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 5,
              warnings: false,

              // Disabled because of an issue with Uglify breaking seemingly
              // valid code:
              // https://github.com/facebook/create-react-app/issues/2376
              // Pending further investigation:
              // https://github.com/mishoo/UglifyJS2/issues/2011
              comparisons: false,

              // Disabled because of an issue with Terser breaking valid code:
              // https://github.com/facebook/create-react-app/issues/5250
              // Pending further investigation:
              // https://github.com/terser-js/terser/issues/120
              inline: 2,
            },
            mangle: { safari10: true },

            // Added for profiling in devtools
            // eslint-disable-next-line camelcase
            keep_classnames: isProductionProfile,
            // eslint-disable-next-line camelcase
            keep_fnames: isProductionProfile,
            output: {
              // Ouput into ECMA 5, since otherwise Terser might apply
              // minifications steps that invalidates otherwise valid ECMA 5
              // code:
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 5,
              comments: false,

              // Turned on because emoji and regex is not minified properly
              // using default:
              // https://github.com/facebook/create-react-app/issues/2488
              // eslint-disable-next-line camelcase
              ascii_only: true,
            },
          },
        }),

        // This is only used in production.
        new CssMinimizerPlugin(),
      ],
    },
    resolve: {
      // This allows a fallback to be set for where webpack should look for
      // modules. These paths are second because `node_modules` should take
      // precendence if there are any conflicts. This matches the Node
      // resolution mechanism:
      // https://github.com/facebook/create-react-app/issues/253
      modules: ['node_modules', paths.nodeModules, paths.webapp],

      // These are the reasonable defaults supported by the Node ecosystem.
      // JSX is included as a common component filename extension to support
      // some tools, although it is not recommended to use it, see:
      // https://github.com/facebook/create-react-app/issues/290
      // `web` extension prefixes have been added for better support for React
      // Native Web.
      extensions: paths.moduleFileExtensions,
      alias: {
        // Support React Native Web:
        // https://www.smashixngmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
        'react-native': 'react-native-web',

        // Allows for better profiling with ReactDevTools.
        ...(isProductionProfile
          ? {
              'react-dom$': 'react-dom/profiling',
              'scheduler/tracing': 'scheduler/tracing-profiling',
            }
          : {}),
        src: paths.webapp,
      },
      plugins: [
        // Prevents importing files from outside of lib (or node_modules). This
        // often causes confusion because files are only processed within lib
        // with babel. To fix this, files are prevented from being imported out
        // of lib. If this is desired, link the files into node_modules and let
        // module-resolution kick in. Make sure the source files are compiled,
        // as they will not be processed in any way.
        new ModuleScopePlugin(paths.webapp, [
          paths.packageJson,
          reactRefreshRuntimeEntry,
          reactRefreshWebpackPluginRuntimeEntry,
          babelRuntimeEntry,
          babelRuntimeEntryHelpers,
          babelRuntimeRegenerator,
        ]) as unknown as webpack.ResolvePluginInstance,
      ],
    },
    module: {
      strictExportPresence: true,
      rules: [
        // Handle node modules that contain sourcemaps.
        shouldUseSourceMap
          ? {
              enforce: 'pre',
              exclude: /@babel(?:\/|\\{1,2})runtime/u,
              test: /\.(?:js|mjs|jsx|ts|tsx|css)$/u,
              loader: resolve.sync('source-map-loader'),
            }
          : {},
        {
          // "oneOf" will traverse all following loaders until one will match
          // the requirements. When no loader matches it will fall back to the
          // "file" loader at the end of the loader list.
          oneOf: [
            // TODO: Merge this config once `image/avif` is in the mime-db:
            // https://github.com/jshttp/mime-db
            {
              test: [/\.avif$/u],
              type: 'asset',
              mimetype: 'image/avif',
              parser: { dataUrlCondition: { maxSize: imageInlineSizeLimit } },
            },

            // "url" loader works like "file" loader except that it embeds
            // assets smaller than specified limit in bytes as data URLs to
            // avoid requests. A missing `test` is equivalent to a match.
            {
              test: [/\.bmp$/u, /\.gif$/u, /\.jpe?g$/u, /\.png$/u],
              type: 'asset',
              parser: { dataUrlCondition: { maxSize: imageInlineSizeLimit } },
            },
            {
              test: /\.svg$/u,
              use: [
                {
                  loader: resolve.sync('@svgr/webpack'),
                  options: {
                    prettier: false,
                    svgo: false,
                    svgoConfig: { plugins: [{ removeViewBox: false }] },
                    titleProp: true,
                    ref: true,
                  },
                },
                {
                  loader: resolve.sync('file-loader'),
                  options: { name: 'static/media/[name].[hash].[ext]' },
                },
              ],
              issuer: { and: [/\.(?:ts|tsx|js|jsx|md|mdx)$/u] },
            },

            // Process application JS with Babel. The preset includes JSX, Flow,
            // TypeScript, and some ESNext features.
            {
              test: /\.(?:js|mjs|jsx|ts|tsx)$/u,
              include: paths.webapp,
              loader: resolve.sync('babel-loader'),
              options: {
                customize: resolve.sync(
                  'babel-preset-react-app/webpack-overrides',
                ),
                presets: [
                  [
                    resolve.sync('babel-preset-react-app'),
                    { runtime: canUseNewJsx ? 'automatic' : 'classic' },
                  ],
                ],

                plugins: [
                  ...(!isProduction && shouldUseReactRefresh
                    ? [resolve.sync('react-refresh/babel')]
                    : []),
                ],

                // This is a feature of `babel-loader` for webpack (not Babel
                // itself). It enables caching results in the
                // ./node_modules/.cache/babel-loader/ directory for faster
                // rebuilds.
                cacheDirectory: true,

                // If a dev and prod build happens on the same machine (not
                // unlikely), cache compression actually increases disk space
                // usage:
                // https://github.com/facebook/create-react-app/issues/6846
                cacheCompression: false,
                compact: isProduction,
              },
            },

            // Process any JS outside of the app with Babel. Unlike the
            // application JS, only standard ES features are compiled.
            {
              test: /\.(?:js|mjs)$/u,
              exclude: /@babel(?:\/|\\{1,2})runtime/u,
              loader: resolve.sync('babel-loader', {
                basedir: paths.nodeModules,
              }),
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [
                  [
                    resolve.sync('babel-preset-react-app/dependencies', {
                      basedir: paths.nodeModules,
                    }),
                    { helpers: true },
                  ],
                ],
                cacheDirectory: true,

                // If a dev and prod build happens on the same machine (not
                // unlikely), cache compression actually increases disk space
                // usage:
                // https://github.com/facebook/create-react-app/issues/6846                cacheCompression: false,

                // Babel sourcemaps are needed for debugging into node_modules
                // code.  Without the options below, debuggers like VSCode
                // show incorrect code and set breakpoints on the wrong lines.
                sourceMaps: shouldUseSourceMap,
                inputSourceMap: shouldUseSourceMap,
              },
            },

            // The "postcss" loader applies autoprefixer to our CSS. The "css"
            // loader resolves paths in CSS and adds assets as dependencies.
            // The "style" loader turns CSS into JS modules that inject <style>
            // tags. In production, MiniCSSExtractPlugin is used to extract that
            // CSS to a file, but in development "style" loader enables hot
            // editing of CSS. By default, CSS Modules are supported with the
            // extension `.module.css`.
            {
              test: cssRegex,
              exclude: cssModuleRegex,
              use: styleLoaders({
                importLoaders: 1,
                sourceMap: shouldUseSourceMap,
                modules: { mode: 'icss' },
              }),

              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },

            // Adds support for CSS Modules using the extension `.module.css`.
            // https://github.com/css-modules/css-modules
            {
              test: cssModuleRegex,
              use: styleLoaders({
                importLoaders: 1,
                sourceMap: shouldUseSourceMap,
                modules: {
                  mode: 'local',
                  getLocalIdent: getCSSModuleLocalIdent,
                  localIdentName: '[name]_[local]_[hash:base64:6]',
                  exportLocalsConvention: 'camelCase',
                },
              }),
            },

            // Opt-in support for SASS (using .scss or .sass extensions).
            // By default we support SASS Modules with the
            // extensions .module.scss or .module.sass
            {
              test: sassRegex,
              exclude: sassModuleRegex,
              use: styleLoaders(
                {
                  importLoaders: 3,
                  sourceMap: shouldUseSourceMap,
                  modules: { mode: 'icss' },
                },
                'sass-loader',
              ),

              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },

            // Adds support for CSS Modules, but using SASS
            // using the extension .module.scss or .module.sass
            {
              test: sassModuleRegex,
              use: styleLoaders(
                {
                  importLoaders: 3,
                  sourceMap: shouldUseSourceMap,
                  modules: {
                    mode: 'local',
                    getLocalIdent: getCSSModuleLocalIdent,
                    localIdentName: '[name]__[local]___[hash:base64:5]',
                    exportLocalsConvention: 'camelCase',
                  },
                },
                'sass-loader',
              ),
            },

            // The "file" loader makes sure those assets get served by
            // WebpackDevServer. When an asset is imported, you its virtual
            // filename is returned. In production, these get copied to the
            // `build` folder. This loader doesn't use a "test" so it will catch
            // all modules that fall through the other loaders.
            {
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise be processed through "file"
              // loader. Also exclude `html` and `json` extensions so they get
              // processed by webpacks internal loaders.
              exclude: [
                /^$/u,
                /\.(?:js|mjs|jsx|ts|tsx)$/u,
                /\.html$/u,
                /\.json$/u,
              ],
              type: 'asset/resource',
            },

            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before the "file" loader.
          ],
        },
      ],
    },
    plugins: [
      // Generates an `index.html` file with the <script> injected.
      new HtmlWebpackPlugin({
        inject: true,
        template: paths.html,
        ...(isProduction
          ? {
              minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
              },
            }
          : undefined),
      }),

      // Inlines the webpack runtime script. This script is too small to warrant
      // a network request.
      // https://github.com/facebook/create-react-app/issues/5358
      ...(isProduction && shouldInlineRuntimeChunk
        ? [new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/u])]
        : []),

      // Makes some environment variables available in index.html.
      // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
      // <link rel="icon" href="%PUBLIC_URL%/favicon.ico">
      // It will be an empty string unless you specify "homepage"
      // in `package.json`, in which case it will be the pathname of that URL.
      new InterpolateHtmlPlugin(
        HtmlWebpackPlugin,
        environment.raw as Record<string, string>,
      ),

      // This gives some necessary context to module not found errors, such as
      // the requesting resource.
      new ModuleNotFoundPlugin(paths.app),

      // Makes some environment variables available to the JS code, for example:
      // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
      // It is absolutely essential that NODE_ENV is set to production
      // during a production build.
      // Otherwise React will be compiled in the very slow development mode.
      new webpack.DefinePlugin(environment.stringified),

      // Experimental hot reloading for React .
      // https://github.com/facebook/react/tree/main/packages/react-refresh
      ...(!isProduction && shouldUseReactRefresh
        ? [new ReactRefreshWebpackPlugin({ overlay: false })]
        : []),

      // Watcher doesn't work well if you mistype casing in a path so we use
      // a plugin that prints an error when you attempt to do this.
      // See https://github.com/facebook/create-react-app/issues/240
      ...(isProduction ? [] : [new CaseSensitivePathsPlugin()]),
      ...(isProduction
        ? [
            new MiniCssExtractPlugin({
              // Options similar to the same options in webpackOptions.output
              // both options are optional
              filename: 'static/css/[name].[contenthash:8].css',
              chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
            }),
          ]
        : []),

      // Generate an asset manifest file with the following content:
      // - "files" key: Mapping of all asset filenames to their corresponding
      //   output file so that tools can pick it up without having to parse
      //   `index.html`
      // - "entrypoints" key: Array of files which are included in `index.html`,
      //   can be used to reconstruct the HTML if necessary
      new WebpackManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath: paths.publicUrlOrPath,
        generate: (seed, files, entrypoints) => {
          const manifestFiles = files.reduce((manifest, nextFile) => {
            manifest[nextFile.name] = nextFile.path;

            return manifest;
          }, seed);
          const entrypointFiles = entrypoints.main.filter(
            (fileName) => !fileName.endsWith('.map'),
          );

          return {
            files: manifestFiles,
            entrypoints: entrypointFiles,
          };
        },
      }),

      // Moment.js is an extremely popular library that bundles large locale
      // files by default due to how webpack interprets its code. This is a
      // practical solution that requires the user to opt into importing
      // specific locales. This can be removed this if Moment.js isn't being
      // used.
      // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/u,
        contextRegExp: /moment$/u,
      }),

      // Generate a service worker script that will precache, and keep up to
      // date the HTML & assets that are part of the webpack build.
      ...(isProduction && fs.existsSync(paths.serviceWorker)
        ? [
            new WorkboxWebpackPlugin.InjectManifest({
              swSrc: paths.serviceWorker,
              dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./u,
              exclude: [/\.map$/u, /asset-manifest\.json$/u, /LICENSE/u],

              // Bump up the default maximum size (2mb) that's precached,
              // to make lazy-loading failure scenarios less likely.
              // See https://github.com/cra-template/pwa/issues/13#issuecomment-722667270
              // eslint-disable-next-line @typescript-eslint/no-magic-numbers
              maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
            }),
          ]
        : []),

      // TypeScript type checking.
      new ForkTsCheckerWebpackPlugin({
        async: !isProduction,
        typescript: {
          typescriptPath: resolve.sync('typescript', {
            basedir: paths.nodeModules,
          }),
          configOverwrite: {
            compilerOptions: {
              sourceMap: shouldUseSourceMap,
              skiplibCheck: true,
              inlineSourceMap: false,
              declarationMap: false,
              noEmit: true,
              incremental: true,
              tsBuildInfoFile: paths.tsBuildInfo,
            },
          },
          context: paths.app,
          diagnosticOptions: { syntactic: true },
          mode: 'write-references',
        },
        issue: {
          // This one is specifically to match during CI tests, as micromatch
          // doesn't match '../cra-template-typescript/template/src/App.tsx'
          // otherwise.
          include: [
            { file: '../**/lib/**/*.{ts,tsx}' },
            { file: '**/lib/**/*.{ts,tsx}' },
          ],
          exclude: [
            { file: '**/lib/**/__tests__/**' },
            { file: '**/lib/**/?(*.){spec|test}.*' },
            { file: '**/lib/setupProxy.*' },
            { file: '**/lib/setupTests.*' },
          ],
        },
        logger: { infrastructure: 'silent' },
      }),
      ...(shouldUseEslint
        ? [
            new ESLintPlugin({
              // Plugin options.
              extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
              formatter: resolve.sync('react-dev-utils/eslintFormatter'),
              eslintPath: resolve.sync('eslint'),
              failOnError: !isProduction || !shouldEmitErrorsAsWarnings,
              context: paths.webapp,
              cache: true,
              cacheLocation: path.resolve(
                paths.nodeModules,
                '.cache/.eslintcache',
              ),

              // ESLint class options.
              cwd: paths.app,
              resolvePluginsRelativeTo: directory,
              baseConfig: {
                extends: [resolve.sync('eslint-config-react-app/base')],
                rules: {
                  ...(canUseNewJsx
                    ? {}
                    : { 'react/react-in-jsx-scope': 'error' }),
                },
              },
            }),
          ]
        : []),
    ],

    // Turn off performance processing because we utilize custom hints via the
    // FileSizeReporter.
    performance: false,
  };
}
