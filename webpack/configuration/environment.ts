import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

import paths from './paths';

const NODE_ENV = process.env.NODE_ENV;

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
const dotenvFiles = [
  `${paths.dotenv}.${NODE_ENV}.local`,

  // Don't include `.env.local` for `test` environment since normally tests are
  // expected to always produce the same results.

  ...(NODE_ENV === 'test' ? [] : [`${paths.dotenv}.local`]),
  `${paths.dotenv}.${NODE_ENV}`,
  paths.dotenv,
];

// Load environment variables from .env* files. Suppress warnings using silent
// If this file is missing. dotenv will never modify any environment variables
// That have already been set.  Variable expansion is supported in .env files.
// https://github.com/motdotla/dotenv
// https://github.com/motdotla/dotenv-expand
dotenvFiles.forEach((dotenvFile) => {
  if (fs.existsSync(dotenvFile)) {
    dotenvExpand(dotenv.config({ path: dotenvFile }));
  }
});

// We support resolving modules according to `NODE_PATH`.
// This lets you use absolute paths in imports inside large monorepos:
// https://github.com/facebook/create-react-app/issues/253.
// It works similar to `NODE_PATH` in Node itself:
// https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders
// Note that unlike in Node, only *relative* paths from `NODE_PATH` are honored.
// Otherwise, we risk importing Node.js core modules into an app instead of
// Webpack shims.
// https://github.com/facebook/create-react-app/issues/1023#issuecomment-265344421
// We also resolve them to make sure all tools using them work consistently.
const appDirectory = fs.realpathSync(process.cwd());
process.env.NODE_PATH = (process.env.NODE_PATH ?? '')
  .split(path.delimiter)
  .filter((folder) => folder && !path.isAbsolute(folder))
  .map((folder) => path.resolve(appDirectory, folder))
  .join(path.delimiter);

function environmentWith(publicUrl: string): {
  raw: NodeJS.ProcessEnv;
  stringified: { 'process.env': NodeJS.ProcessEnv };
} {
  const raw: NodeJS.ProcessEnv = Object.keys(process.env)
    .filter((key) => key.startsWith('REACT_APP_'))
    .reduce<NodeJS.ProcessEnv>(
      (environment, key) => {
        environment[key] = process.env[key];

        return environment;
      },
      {
        // Useful for determining whether we’re running in production mode.
        // Most importantly, it switches React into the correct mode.
        NODE_ENV: process.env.NODE_ENV,

        // Useful for resolving the correct path to static assets in `public`.
        // For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
        // This should only be used as an escape hatch. Normally you would put
        // Images into the `src` and `import` them in code to get their paths.
        PUBLIC_URL: publicUrl,

        // We support configuring the sockjs pathname during development.
        // These settings let a developer run multiple simultaneous projects.
        // They are used as the connection `hostname`, `pathname` and `port`
        // In webpackHotDevClient. They are used as the `sockHost`, `sockPath`
        // And `sockPort` options in webpack-dev-server.
        ...(process.env.WDS_SOCKET_HOST && {
          WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST,
        }),
        ...(process.env.WDS_SOCKET_PATH
          ? {
              WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH,
            }
          : {}),
        ...(process.env.WDS_SOCKET_PORT && {
          WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT,
        }),

        // Whether or not react-refresh is enabled.
        // It is defined here so it is available in the webpackHotDevClient.
        FAST_REFRESH: String(process.env.FAST_REFRESH !== 'false'),
      },
    );

  // Stringify all values so we can feed into webpack DefinePlugin
  const stringified = {
    'process.env': Object.keys(raw).reduce<Partial<NodeJS.ProcessEnv>>(
      (environment, key) => {
        environment[key] = JSON.stringify(raw[key]);

        return environment;
      },
      {},
    ) as NodeJS.ProcessEnv,
  };

  return { raw, stringified };
}

export default environmentWith;
