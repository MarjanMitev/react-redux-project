const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const PATHS = {
    app: path.resolve(__dirname, './scripts'),
    styles: path.resolve(__dirname, './styles'),
    assets: path.resolve(__dirname, './assets'),
    build: path.resolve(__dirname, './dist')
}

const PLUGINS = [
    new CleanWebpackPlugin(['dist'], {
      root: './',
      verbose: true, 
      dry: false
    }),
    new CopyWebpackPlugin([
        {
            from: PATHS.assets,
            to: 'assets'
        }
    ]),
    new HtmlWebpackPlugin(),
    // Shared code
    new webpack.optimize.CommonsChunkPlugin('vendor', 'scripts/vendor.bundle.js'),
    // Avoid publishing files when compilation fails
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
        __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    }),
    // This plugin moves all the CSS into a separate stylesheet
    new ExtractTextPlugin('styles/app.css', { allChunks: true })
];

const sassLoaders = [
  'css-loader?sourceMap',
  'postcss-loader',
  'sass-loader?outputStyle=compressed'
];

module.exports = {
    entry: {
        app: path.resolve(PATHS.app, 'index.js'),
        vendor: ['react']
    },
    output: {
        path: PATHS.build,
        filename: 'scripts/[name].js',
        publicPath: '/'
    },
    stats: {
        colors: true
    },
    resolve: {
        // We can now require('file') instead of require('file.jsx')
        extensions: ['', '.js', '.jsx', '.scss']
    },
    module: {
        noParse: /\.min\.js$/,
        loaders: [
        {
            test: /\.jsx?$/,
            loaders: ['react-hot', 'babel'],
            include: PATHS.app
        },
        {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract('style-loader', sassLoaders.join('!'))
        },
        {
            test: /\.css$/,
            include: PATHS.styles,
            loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader')
        },
        // Inline base64 URLs for <=8k images, direct URLs for the rest
        {
            test: /\.(png|jpg|jpeg|gif|svg)$/,
            loader: 'url-loader?limit=8192&name=assets/[name].[ext]?[hash]'
        },
        {
            test: /\.(woff|woff2)$/,
            loader: 'url-loader?limit=8192&name=fonts/[name].[ext]?[hash]'
        }
        ]
    },
    plugins: PLUGINS,
    postcss: function () {
        return [autoprefixer({
            browsers: ['last 2 versions']
        })];
    },
    devtool: 'source-map'
};
