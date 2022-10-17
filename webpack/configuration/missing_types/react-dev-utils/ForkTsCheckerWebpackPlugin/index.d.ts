declare module 'react-dev-utils/ForkTsCheckerWebpackPlugin' {
  import * as webpack from 'webpack';

  const bind = webpack.ResolvePluginInstance;
  export default bind;
}
