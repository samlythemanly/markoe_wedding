declare module 'react-dev-utils/ForkTsCheckerWarningWebpackPlugin' {
  import * as webpack from 'webpack';

  const bind = webpack.ResolvePluginInstance;
  export default bind;
}
