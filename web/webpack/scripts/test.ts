// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'test';

// Override process env as any since NODE_ENV is readonly.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(process.env as any).NODE_ENV = 'test';

// Override process env as any since PUBLIC_URL is readonly.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(process.env as any).PUBLIC_URL = '';

// Makes the script crash on unhandled rejections instead of silently ignoring
// them. In the future, promise rejections that are not handled will terminate
// the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  throw err;
});

// Ensure environment variables are read.
await import('../configuration/environment');

import { execSync } from 'child_process';

import jest from 'jest-cli';

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const argv = process.argv.slice(2);

function isInGitRepository(): boolean {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });

    return true;
  } catch (_) {
    return false;
  }
}

function isInMercurialRepository(): boolean {
  try {
    execSync('hg --cwd . root', { stdio: 'ignore' });

    return true;
  } catch (_) {
    return false;
  }
}

// Watch unless on CI or explicitly running all tests.
if (
  !process.env.CI &&
  !argv.includes('--watchAll') &&
  !argv.includes('--watchAll=false')
) {
  // https://github.com/facebook/create-react-app/issues/5210
  const hasSourceControl = isInGitRepository() || isInMercurialRepository();
  argv.push(hasSourceControl ? '--watch' : '--watchAll');
}

jest.run(argv);
