const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = env => {
  const production = env === 'production';
  return {
    entry: production ? ['./src/main.ts'] : ['webpack/hot/poll?100', './src/main.ts'],
    watch: !production,
    target: 'node',
    node: {
      __dirname: false,
      __filename: false,
    },
    externals: [
      nodeExternals({
        modulesDir: path.join(__dirname, '../node_modules'),
        whitelist: production ? undefined : ['webpack/hot/poll?100']
      }),
    ],
    module: {
      rules: [
        {
          test: /.tsx?$/,
          use: 'ts-loader'
        },
      ],
    },
    mode: production ? 'production' : 'development',
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin()
    ],
    output: {
      path: path.join(__dirname, '../dist'),
      filename: 'server.js',
    },
  }
};
