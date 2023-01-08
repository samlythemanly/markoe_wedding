import * as fs from 'fs';
import * as path from 'path';

import getPublicUrlOrPath from 'react-dev-utils/getPublicUrlOrPath';

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());

function resolveApp(relativePath: string): string {
  return path.resolve(appDirectory, relativePath);
}

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
const publicUrlOrPath = getPublicUrlOrPath(
  process.env.NODE_ENV === 'development',
  (
    await import(resolveApp('package.json'), {
      assert: { type: 'json' },
    })
  ).homepage,
  process.env.PUBLIC_URL,
);

const buildPath = process.env.BUILD_PATH ?? '../build';

const moduleFileExtensions = [
  '.web.mjs',
  '.mjs',
  '.web.js',
  '.js',
  '.web.ts',
  '.ts',
  '.web.tsx',
  '.tsx',
  '.json',
  '.web.jsx',
  '.jsx',
];

/**
 * Resolves filepaths in the same order as webpack.
 */
function resolveModule(
  resolve: (path: string) => string,
  filePath: string,
): string {
  const moduleExtension = moduleFileExtensions.find((extension: string) =>
    fs.existsSync(resolve(`${filePath}${extension}`)),
  );

  if (moduleExtension) {
    return resolve(`${filePath}${moduleExtension}`);
  }

  return resolve(`${filePath}.js`);
}

type Path =
  | 'app'
  | 'assets'
  | 'build'
  | 'common'
  | 'dotenv'
  | 'html'
  | 'index'
  | 'jsConfig'
  | 'nodeModules'
  | 'packageJson'
  | 'project'
  | 'proxySetup'
  | 'public'
  | 'publicUrlOrPath'
  | 'services'
  | 'serviceWorker'
  | 'testSetup'
  | 'tsBuildInfo'
  | 'tsConfig'
  | 'views'
  | 'webpackCache'
  | 'widgets'
  | 'yarnLock';

// Config after eject: we're in ./config/
const paths: Record<Path, string> & { moduleFileExtensions: string[] } = {
  app: resolveApp('.'),
  assets: resolveApp('assets'),
  build: resolveApp(buildPath),
  common: resolveApp('common'),
  dotenv: resolveApp('../.env'),
  html: resolveApp('public/index.html'),
  index: resolveModule(resolveApp, 'index'),
  jsConfig: resolveApp('jsconfig.json'),
  nodeModules: resolveApp('node_modules'),
  packageJson: resolveApp('package.json'),
  project: resolveApp('..'),
  proxySetup: resolveApp('setupProxy.js'),
  public: resolveApp('public'),
  publicUrlOrPath,
  services: resolveApp('services'),
  serviceWorker: resolveModule(resolveApp, 'service-worker'),
  testSetup: resolveModule(resolveApp, 'setupTests'),
  tsBuildInfo: resolveApp('node_modules/.cache/tsconfig.tsbuildinfo'),
  tsConfig: resolveApp('tsconfig.json'),
  views: resolveApp('views'),
  webpackCache: resolveApp('node_modules/.cache'),
  widgets: resolveApp('widgets'),
  yarnLock: resolveApp('yarn.lock'),

  moduleFileExtensions,
};

export default paths;
