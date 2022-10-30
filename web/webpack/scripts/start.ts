/* eslint-disable no-console */

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';

// Override process env as any since NODE_ENV is readonly.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(process.env as any).NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently ignoring
// them. In the future, promise rejections that are not handled will terminate
// the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (error) => {
  throw error;
});

// Ensure environment variables are read.
await import('../configuration/environment.js');

import fs from 'fs';

import chalk from 'chalk';
import react from 'react';
import { checkBrowsers } from 'react-dev-utils/browsersHelper';
import checkRequiredFiles from 'react-dev-utils/checkRequiredFiles';
import clearConsole from 'react-dev-utils/clearConsole';
import openBrowser from 'react-dev-utils/openBrowser';
import {
  choosePort,
  createCompiler,
  prepareProxy,
  prepareUrls,
} from 'react-dev-utils/WebpackDevServerUtils';
import semver from 'semver';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import type { CreateCompilerOptions } from 'react-dev-utils/WebpackDevServerUtils';

import createConfiguration from '../configuration/configuration';
import devServerConfiguration from '../configuration/dev_server';
import createEnvironment from '../configuration/environment';
import paths from '../configuration/paths';

async function start(): Promise<void> {
  try {
    const environment = createEnvironment(paths.publicUrlOrPath.slice(0, -1));
    const useYarn = fs.existsSync(paths.yarnLock);
    const isInteractive = process.stdout.isTTY;
    const defaultPort = 3000;

    // Warn and crash if required files are missing.
    if (!checkRequiredFiles([paths.html, paths.index])) {
      process.exit(1);
    }

    // Tools like Cloud9 rely on this.
    const desiredPort = process.env.PORT
      ? parseInt(process.env.PORT, 10)
      : defaultPort;
    const host = process.env.HOST ?? '0.0.0.0';

    if (process.env.HOST) {
      console.log(
        chalk.cyan(
          `Attempting to bind to HOST environment variable: ${chalk.yellow(
            chalk.bold(process.env.HOST),
          )}`,
        ),
      );
      console.log(
        "If this was unintentional, check that you haven't mistakenly set it " +
          'in your shell.',
      );
      console.log(
        `Learn more here: ${chalk.yellow('https://cra.link/advanced-config')}`,
      );
      console.log();
    }

    // Explicitly set browsers are required and do not fall back to browserslist
    // defaults.
    await checkBrowsers(paths.app, isInteractive);

    // The next available port is chosen if the desired port isn't available.
    const actualPort = await choosePort(host, desiredPort);

    if (!actualPort) {
      return;
    }

    const configuration = createConfiguration('development');
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
    const packageJson = await import(paths.packageJson, {
      assert: { type: 'json' },
    });
    const appName = packageJson.name;
    const urls = prepareUrls(protocol, host, actualPort);

    // Create a webpack compiler that is configured with custom messages.
    const compiler = createCompiler({
      appName,
      config: configuration,
      urls,
      useYarn,
      useTypeScript: true,
      webpack,
    } as CreateCompilerOptions);

    const proxyConfiguration = prepareProxy(
      packageJson.proxy,
      paths.public,
      paths.publicUrlOrPath,
    );

    // Serve webpack assets generated by the compiler over a web server.
    const serverConfiguration = {
      ...devServerConfiguration(proxyConfiguration, urls.lanUrlForConfig),
      host,
      port: actualPort,
    };
    const devServer = new WebpackDevServer(serverConfiguration, compiler);

    // Launch WebpackDevServer.
    devServer.startCallback(() => {
      if (isInteractive) {
        clearConsole();
      }

      if (environment.raw.FAST_REFRESH && semver.lt(react.version, '16.10.0')) {
        console.log(
          chalk.yellow(
            'Fast Refresh requires React 16.10 or higher. You are using React' +
              `${react.version}.`,
          ),
        );
      }

      console.log(chalk.cyan('Starting the development server...\n'));
      openBrowser(urls.localUrlForBrowser);
    });

    ['SIGINT', 'SIGTERM'].forEach((sig) => {
      process.on(sig, () => {
        devServer.close();
        process.exit();
      });
    });

    if (process.env.CI !== 'true') {
      // Gracefully exit when stdin ends.
      process.stdin.on('end', () => {
        devServer.close();
        process.exit();
      });
    }
  } catch (error) {
    console.log((error as Error).message);
    process.exit(1);
  }
}

await start();