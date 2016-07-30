const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

/** Build Paths **/
const paths = {
    context: path.resolve(__dirname, './src'),
    app: path.resolve(__dirname, './src/scripts'),
    styles: path.resolve(__dirname, './src/styles'),
    assets: path.resolve(__dirname, './src/assets'),
    build: path.resolve(__dirname, './dist')
};

let plugins = [
    /*DEV and PROD build variables*/
    new webpack.DefinePlugin({
        DEV: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
        PROD: JSON.stringify(JSON.parse(process.env.BUILD_PROD || 'false'))
    }),
    new CleanWebpackPlugin(['dist'], {
      root: paths.context,
      verbose: true, 
      dry: false
    }),
    new CopyWebpackPlugin([
        {
            from: paths.assets,
            to: paths.build + '/assets'
        }
    ]),
    new HtmlWebpackPlugin(),
    // Shared code
    new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: Infinity,
        filename: 'scripts/vendor.bundle.js'
    }),
    // Avoid publishing files when compilation fails
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    // This plugin moves all the CSS into a separate stylesheet
    new ExtractTextPlugin('./src/styles/app.css', { allChunks: true })
];

/** Add Uglify for prodaction **/
if(process.env.BUILD_PROD) {
    plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            sourceMap: true,
            mangle: false
        })
    );
}

/** Loaders **/
const sassLoaders = ['css-loader?sourceMap', 'postcss-loader', 'sass-loader?outputStyle=compressed'];

module.exports = {
    entry: {
        app: path.resolve(paths.app, 'index.js'),
        vendor: ['react']
    },
    output: {
        path: paths.build,
        filename: 'scripts/[name].js',
        publicPath: '/'
    },
    devtool: 'cheap-module-source-map',
    stats: {
        colors: true
    },
    resolve: {
        // We can now require('file') instead of require('file.jsx')
        extensions: ['', '.js', '.jsx', '.scss']
    },
    module: {
        loaders: [
            {
                loader: "babel-loader",
                include: [
                    paths.context,
                ],
                exclude: [
                    path.resolve(__dirname, "node_modules"),
                ],
                test: /\.jsx?$/,
                query: {
                    plugins: ['transform-runtime'],
                    presets: ['es2015', 'stage-0', 'react'],
                }
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('style-loader', sassLoaders.join('!'))
            },
            {
                test: /\.css$/,
                include: paths.styles,
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
    plugins: plugins,
    postcss: function () {
        return [autoprefixer({
            browsers: ['last 2 versions']
        })];
    },
    devServer: {
        contentBase: paths.context,
        hot: true
    }
};
