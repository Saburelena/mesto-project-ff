const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

// Настройки для GitHub Pages
const isProd = process.env.NODE_ENV === 'production';
const publicPath = isProd ? '/mesto-project-ff' : '/';
const baseHref = isProd ? '/mesto-project-ff/' : '/';

module.exports = {
  entry: './src/components/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    publicPath: publicPath + '/',
    clean: true,
    assetModuleFilename: 'assets/[name][ext]',
    pathinfo: false
  },
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
      publicPath: publicPath,
      serveIndex: true
    },
    compress: true,
    port: 8080,
    open: true,
    hot: true,
    historyApiFallback: true,
    devMiddleware: {
      writeToDisk: true,
      publicPath: publicPath
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]',
          publicPath: publicPath
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
          publicPath: publicPath
        }
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { importLoaders: 1 }
          },
          'postcss-loader'
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: 'body',
      publicPath: publicPath,
      base: baseHref,
      templateParameters: {
        baseHref: baseHref,
        publicPath: publicPath
      },
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: false,
        removeScriptTypeAttributes: false,
        removeStyleLinkTypeAttributes: false,
        useShortDoctype: true
      }
    }),
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
      cleanOnceBeforeBuildPatterns: [path.join(__dirname, 'dist/**/*')]
    }),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].css',
      chunkFilename: 'styles/[id].css'
    }),
    new CopyPlugin({
      patterns: [
        { 
          from: 'src/images/logo.svg', 
          to: 'images/logo.svg',
          toType: 'file'
        },
        { 
          from: 'src/images', 
          to: 'images',
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['**/.DS_Store', '**/logo.svg']
          }
        },
        {
          from: 'src/vendor',
          to: 'vendor',
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['**/.DS_Store']
          }
        }
      ]
    })
  ]
};