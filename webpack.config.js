const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

// Настройки для GitHub Pages
const publicPath = '/mesto-project-ff/';

module.exports = {
  entry: './src/scripts/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    publicPath: publicPath,
    clean: true
  },
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
      publicPath: '/'
    },
    compress: true,
    port: 8080,
    open: true,
    hot: true,
    historyApiFallback: true,
    devMiddleware: {
      writeToDisk: true
    },
    client: {
      overlay: {
        errors: true,
        warnings: false
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: '/node_modules/'
      },

        {
            test: /\.(png|svg|jpg|gif|woff(2)?|eot|ttf|otf)$/,
            type: 'asset/resource',
            generator: {
                filename: 'assets/[name][ext]',
                publicPath: '/mesto-project-ff/'
            }
        },

        {
            test: /\.css$/,
            use: [MiniCssExtractPlugin.loader, {
                    loader: 'css-loader',
                    options: { importLoaders: 1 }
                },
                'postcss-loader',
            ]
        },

        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
          template: './src/index.html',
          filename: 'index.html',
          inject: 'body',
          publicPath: '/mesto-project-ff/'
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        }),
        new CopyPlugin({
          patterns: [
            { 
              from: 'src/images', 
              to: 'images',
              noErrorOnMissing: true
            },
            {
              from: 'src/vendor',
              to: 'vendor',
              noErrorOnMissing: true
            }
          ],
        }),
      ],
};