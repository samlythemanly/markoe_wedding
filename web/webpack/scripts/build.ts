/* eslint-disable no-console */

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';

// Override process env as any since NODE_ENV is readonly.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(process.env as any).NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  throw err;
});

// Ensure environment variables are read.
await import('../configuration/environment');

import path from 'path';

import bfj from 'bfj';
import chalk from 'chalk';
import fs from 'fs-extra';
import { checkBrowsers } from 'react-dev-utils/browsersHelper';
import checkRequiredFiles from 'react-dev-utils/checkRequiredFiles';
import FileSizeReporter from 'react-dev-utils/FileSizeReporter';
import formatWebpackMessages from 'react-dev-utils/formatWebpackMessages';
import printBuildError from 'react-dev-utils/printBuildError';
import printHostingInstructions from 'react-dev-utils/printHostingInstructions';
import webpack from 'webpack';

import type { Rule } from 'postcss';

import createConfiguration from '../configuration/configuration';
import paths from '../configuration/paths';

const measureFileSizesBeforeBuild =
  FileSizeReporter.measureFileSizesBeforeBuild;
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;
const useYarn = fs.existsSync(paths.yarnLock);
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const warnAfterBundleGzipSize = 512 * 1024;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const warnAfterChunkGzipSize = 1024 * 1024;

const isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.html, paths.index])) {
  process.exit(1);
}

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const argv = process.argv.slice(2);
const shouldWriteStatistics = argv.includes('--stats');

const configuration = createConfiguration('production');

function copyPublicFolder(): void {
  fs.copySync(paths.public, paths.build, {
    dereference: true,
    filter: (filePath: string) => filePath !== paths.html,
  });
}

/**
 * Create the production build and print the deployment instructions.
 */
async function build(): Promise<{
  statistics?: webpack.Stats;
  warnings: string[];
}> {
  console.log('Creating an optimized production build...');

  const compiler = webpack(configuration);

  return new Promise((resolve, reject) => {
    compiler.run(async (compilationError, statistics) => {
      let messages: {
        errors: string[];
        warnings: string[];
      };

      if (compilationError) {
        if (!compilationError.message) {
          throw compilationError;
        }

        let errorMessage = compilationError.message;

        // Add additional information for postcss errors.
        if (
          Object.prototype.hasOwnProperty.call(compilationError, 'postcssNode')
        ) {
          errorMessage +=
            '\nCompileError: Begins at CSS selector ' +
            `${
              (compilationError as Error & { postcssNode: Rule }).postcssNode
                .selector
            }`;
        }

        messages = formatWebpackMessages({
          errors: [errorMessage],
          warnings: [],
        });
      } else if (statistics) {
        messages = formatWebpackMessages(
          statistics.toJson({ all: false, warnings: true, errors: true }),
        );
      } else {
        messages = formatWebpackMessages({
          errors: [
            'No compilation errors occurred but statistics were not found.',
          ],
          warnings: [],
        });
      }

      if (messages.errors.length > 0) {
        // Only keep the first error. Others are often indicative of the same
        // problem, but confuse the reader with noise.
        return reject(new Error(messages.errors[0]));
      }

      if (
        process.env.CI &&
        (typeof process.env.CI !== 'string' ||
          process.env.CI.toLowerCase() !== 'false') &&
        messages.warnings.length
      ) {
        // Ignore sourcemap warnings in CI builds. See #8227 for more info.
        const filteredWarnings = messages.warnings.filter(
          (warning) => !warning.includes('Failed to parse source map'),
        );
        if (filteredWarnings.length) {
          console.log(
            chalk.yellow(
              '\nTreating warnings as errors because process.env.CI = true.\n' +
                'Most CI servers set it automatically.\n',
            ),
          );

          return reject(new Error(filteredWarnings.join('\n\n')));
        }
      }

      if (shouldWriteStatistics) {
        try {
          await bfj.write(
            `${paths.build}/bundle-stats.json`,
            statistics?.toJson(),
          );
        } catch (error) {
          return reject(
            error instanceof String ? new Error(error as string) : error,
          );
        }
      }

      resolve({
        statistics,
        warnings: messages.warnings,
      });
    });
  });
}

try {
  // Browsers are required to be explicitly set browsers and do not fall back to
  // browserslist defaults.
  await checkBrowsers(paths.app, isInteractive);

  // Track current file sizes in order to monitor how much they change.
  const previousFileSizes = await measureFileSizesBeforeBuild(paths.build);

  // Remove all content but keep the directory so the current directory doesn't
  // accidentally get moved to trash.
  fs.emptyDirSync(paths.build);

  // Merge with the public folder.
  copyPublicFolder();

  try {
    // Start the webpack build.
    const { statistics, warnings } = await build();

    if (warnings.length) {
      console.log(chalk.yellow('Compiled with warnings.\n'));
      console.log(warnings.join('\n\n'));
      console.log(
        `\nSearch for the ${chalk.underline(
          chalk.yellow('keywords'),
        )} to learn more about each warning.`,
      );
      console.log(
        `To ignore, add ${chalk.cyan(
          '// eslint-disable-next-line',
        )} to the line before.\n`,
      );
    } else {
      console.log(chalk.green('Compiled successfully.\n'));
    }

    if (!statistics) {
      console.log(chalk.red('Compilation failed.\n'));
      process.exit(1);
    }

    console.log('File sizes after gzip:\n');
    printFileSizesAfterBuild(
      statistics,
      previousFileSizes,
      paths.build,
      warnAfterBundleGzipSize,
      warnAfterChunkGzipSize,
    );
    console.log();

    const appPackage = await import(paths.packageJson, {
      assert: { type: 'json' },
    });
    const publicUrl = paths.publicUrlOrPath;
    const publicPath = configuration.output?.publicPath ?? '';
    const buildFolder = path.relative(process.cwd(), paths.build);
    printHostingInstructions(
      appPackage,
      publicUrl,
      publicPath instanceof Function ? publicPath({}) : publicPath,
      buildFolder,
      useYarn,
    );
  } catch (error) {
    const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === 'true';
    if (tscCompileOnError) {
      console.log(
        chalk.yellow(
          'Compiled with the following type errors (you may want to check ' +
            'these before deploying your app):\n',
        ),
      );
      printBuildError(error as Error);
    } else {
      console.log(chalk.red('Failed to compile.\n'));
      printBuildError(error as Error);
      process.exit(1);
    }
  }
} catch (error) {
  if (error instanceof Error && error.message) {
    console.log(error.message);
  }
  process.exit(1);
}
