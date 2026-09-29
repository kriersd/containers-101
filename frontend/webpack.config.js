const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const APP_DIR = path.resolve(__dirname, 'src');
const BUILD_DIR = path.resolve(__dirname, 'dist');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    entry: path.join(APP_DIR, 'index.js'),
    output: {
      path: BUILD_DIR,
      filename: isProd ? '[name].[contenthash].js' : '[name].js',
      publicPath: '/',
      clean: true,
    },

    resolve: {
      extensions: ['.web.js', '.js', '.jsx'],
      alias: {
        /*
          Redirect all react-native imports to react-native-web.
          This is the core of the React Native Web strategy — no native modules,
          all platform primitives resolve to their web counterparts.
        */
        'react-native$': 'react-native-web',
      },
    },

    module: {
      rules: [
        {
          // App source — full transpilation including core-js polyfill injection
          test: /\.(js|jsx)$/,
          include: [APP_DIR],
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        },
        {
          // Third-party ESM packages that need syntax transpilation only (no polyfill injection)
          test: /\.(js|jsx|mjs)$/,
          include: [
            path.resolve(__dirname, 'node_modules/react-native-web'),
            path.resolve(__dirname, 'node_modules/@carbon'),
            path.resolve(__dirname, 'node_modules/@carbon/icons-react'),
          ],
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                ['@babel/preset-env', { targets: '>0.5%, not dead, not op_mini all', useBuiltIns: false }],
                ['@babel/preset-react', { runtime: 'automatic' }],
              ],
              plugins: ['react-native-web'],
            },
          },
        },
        {
          // Carbon ships SCSS; sass-loader compiles it, css-loader resolves @import,
          // style-loader injects into DOM at runtime in dev; in prod consider MiniCssExtractPlugin.
          test: /\.(css|scss|sass)$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
        {
          // Images — Webpack 5 built-in asset handling. Emits hashed files to dist/.
          test: /\.(png|jpe?g|gif|svg|webp)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name].[contenthash][ext]',
          },
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(APP_DIR, 'index.html'),
        filename: 'index.html',
        inject: 'body',
      }),
    ],

    devServer: {
      port: 3000,
      historyApiFallback: true,
      // Proxy API calls to the Liberty backend during development.
      // API_BASE_URL is not available at webpack build time; use the env var at runtime.
      proxy: process.env.API_BASE_URL
        ? [{ context: ['/api'], target: process.env.API_BASE_URL, changeOrigin: true }]
        : [],
    },

    performance: {
      // Carbon + RN Web bundles are large; raise hints threshold to avoid noise.
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
  };
};
