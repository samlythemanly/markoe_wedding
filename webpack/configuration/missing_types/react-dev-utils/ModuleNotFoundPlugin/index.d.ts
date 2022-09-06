declare module 'react-dev-utils/ModuleNotFoundPlugin' {
  import * as webpack from 'webpack';

  const bind = webpack.ResolvePluginInstance;
  export default bind;
}
