import fs from 'fs';

import evalSourceMapMiddleware from 'react-dev-utils/evalSourceMapMiddleware';
import ignoredFiles from 'react-dev-utils/ignoredFiles';
import noopServiceWorkerMiddleware from 'react-dev-utils/noopServiceWorkerMiddleware';
import redirectServedPath from 'react-dev-utils/redirectServedPathMiddleware';

import type WebpackDevServer from 'webpack-dev-server';

import createHttpsConfiguration from './https_configuration';
import paths from './paths';

const host = process.env.HOST ?? '0.0.0.0';
const sockHost = process.env.WDS_SOCKET_HOST;
const sockPath = process.env.WDS_SOCKET_PATH;
const sockPort = process.env.WDS_SOCKET_PORT;

export default function devServerConfiguration(
  proxy?:
    | WebpackDevServer.ProxyConfigArrayItem
    | WebpackDevServer.ProxyConfigMap
    | WebpackDevServer.ProxyConfigArray,
  allowedHost?: string,
): WebpackDevServer.Configuration {
  const disableFirewall =
    !proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true';
  const httpsConfiguration = createHttpsConfiguration();

  return {
    // WebpackDevServer 2.4.3 introduced a security fix that prevents remote
    // websites from potentially accessing local content through DNS rebinding:
    // https://github.com/webpack/webpack-dev-server/issues/887
    // https://medium.com/webpack/webpack-dev-server-middleware-security-issues-1489d950874a
    // However, it made several existing use cases such as development in cloud
    // environment or subdomains in development significantly more complicated:
    // https://github.com/facebook/create-react-app/issues/2271
    // https://github.com/facebook/create-react-app/issues/2233
    // While we're investigating better solutions, for now we will take a
    // compromise. Since our WDS configuration only serves files in the `public`
    // folder we won't consider accessing them a vulnerability. However, if you
    // use the `proxy` feature, it gets more dangerous because it can expose
    // remote code execution vulnerabilities in backends like Django and Rails.
    // So we will disable the host check normally, but enable it if you have
    // specified the `proxy` setting. Finally, we let you override it if you
    // really know what you're doing with a special environment variable.
    // Note: ["localhost", ".localhost"] will support subdomains - but we might
    // want to allow setting the allowedHosts manually for more complex setups
    allowedHosts: disableFirewall
      ? 'all'
      : [...(allowedHost ? [allowedHost] : [])],
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },

    // Enable gzip compression of generated files.
    compress: true,
    static: {
      // By default WebpackDevServer serves physical files from current
      // directory in addition to all the virtual build products that it serves
      // from memory. This is confusing because those files won’t automatically
      // be available in production build folder unless they are copied.
      // However, copying the whole project directory is dangerous because
      // sensitive files may be exposed. Instead, only files in `public`
      // directory get served and the build script will copy `public` into the
      // `build` folder. In `index.html`, you can get URL of `public` folder
      // with %PUBLIC_URL%:
      //   <link rel="icon" href="%PUBLIC_URL%/favicon.ico">
      // In JavaScript code, it can be accessed with `process.env.PUBLIC_URL`.
      // Note: the `public` folder is only recommend to be used as an escape
      // hatch for files like `favicon.ico`, `manifest.json`, and libraries that
      // are for some reason broken when imported through webpack. Images should
      // be put in `lib` and then imported it from JavaScript, instead.
      directory: paths.public,
      publicPath: [paths.publicUrlOrPath],

      // By default files from `contentBase` will not trigger a page reload.
      watch: {
        // Reportedly, this avoids CPU overload on some systems.
        // https://github.com/facebook/create-react-app/issues/293
        // src/node_modules is not ignored to support absolute imports
        // https://github.com/facebook/create-react-app/issues/1065
        ignored: ignoredFiles(paths.app),
      },
    },
    client: {
      webSocketURL: {
        // Enable custom sockjs pathname for websocket connection to hot
        // reloading server. Enable custom sockjs hostname, pathname and port
        // for websocket connection to hot reloading server.
        hostname: sockHost,
        pathname: sockPath,
        port: sockPort,
      },
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    devMiddleware: {
      // It is important to tell WebpackDevServer to use the same "publicPath"
      // path as specified in the webpack configuration. When homepage is '.',
      // default to serving from the root. Remove last slash such that `/test`
      // is landed on instead of `/test/`.
      publicPath: paths.publicUrlOrPath.slice(0, -1),
    },

    https: httpsConfiguration.serverOptions ?? httpsConfiguration.isHttps,
    host,
    historyApiFallback: {
      // Paths with dots should still use the history fallback.
      // See https://github.com/facebook/create-react-app/issues/387.
      disableDotRule: true,
      index: paths.publicUrlOrPath,
    },

    // The `proxy` is run between `before` and `after` `webpack-dev-server`
    // hooks.
    proxy,
    async onBeforeSetupMiddleware(devServer) {
      // Keep `evalSourceMapMiddleware` middlewares before `redirectServedPath`,
      // otherwise it will not have any effect. This allows source contents to
      // be fetched from webpack for the error overlay.
      devServer.app?.use(evalSourceMapMiddleware(devServer));

      if (fs.existsSync(paths.proxySetup)) {
        const proxySetup = await import(paths.proxySetup);

        // This registers user provided middleware for proxy reasons.
        proxySetup.default(devServer.app);
      }
    },
    onAfterSetupMiddleware(devServer) {
      // Redirect to `PUBLIC_URL` or `homepage` from `package.json` if the url
      // doesn't match.
      devServer.app?.use(redirectServedPath(paths.publicUrlOrPath));

      // This service worker file is effectively a 'no-op' that will reset any
      // previous service worker registered for the same host:port combination.
      // We do this in development to avoid hitting the production cache if
      // it used the same host and port.
      // https://github.com/facebook/create-react-app/issues/2272#issuecomment-302832432
      devServer.app?.use(noopServiceWorkerMiddleware(paths.publicUrlOrPath));
    },
  };
}
