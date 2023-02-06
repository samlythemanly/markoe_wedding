import babelJest from 'babel-jest';

async function hasJsxRuntime(): Promise<boolean> {
  if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') return false;

  try {
    await import('react/jsx-runtime');
  } catch (_) {
    return false;
  }

  return true;
}

const createTransformer = babelJest.createTransformer({
  presets: [
    [
      await import('babel-preset-react-app'),
      { runtime: (await hasJsxRuntime()) ? 'automatic' : 'classic' },
    ],
  ],
  babelrc: false,
  configFile: false,
});

export default createTransformer;
