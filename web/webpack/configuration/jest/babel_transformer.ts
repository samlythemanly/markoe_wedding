import babelJest from 'babel-jest';
import resolve from 'resolve';

function hasJsxRuntime(): boolean {
  if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') return false;

  if (!import.meta.resolve) return false;

  try {
    resolve.sync('react/jsx-runtime');
  } catch (_) {
    return false;
  }

  return true;
}

const createTransformer = babelJest.createTransformer({
  presets: [
    [
      resolve.sync('babel-preset-react-app'),
      { runtime: hasJsxRuntime() ? 'automatic' : 'classic' },
    ],
  ],
  babelrc: false,
  configFile: false,
});

export default createTransformer;
