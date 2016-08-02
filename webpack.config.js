const webpack = require('webpack');
const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = env => {
    /** Build Paths **/
    const paths = {
        context: resolve(__dirname, 'src'),
        app: resolve(__dirname, 'src/scripts'),
        styles: resolve(__dirname, 'src/styles'),
        assets: resolve(__dirname, 'src/assets'),
        build: resolve(__dirname, './dist'),
    };

    /** Add Plugins Utility **/
    const addPlugin = (shouldAdd, plugin) => shouldAdd ? plugin : undefined;
    const ifProd = plugin => addPlugin(env.prod, plugin);
    const rmEmpty = array => array.filter(p => !!p);
    
    return {
        entry: {
            app: resolve(paths.app, 'index.jsx'),
            vendor: ['react'],
        },
        output: {
            filename: 'scripts/bundle.[name].js',
            path: paths.build,
            pathinfo: !env.prod,
        },
        context: paths.context,
        devtool: env.prod ? 'source-map' : 'eval',
        bail: env.prod,
        module: {
            loaders: [
                { test: /\.jsx$/, loader: 'babel', exclude: /node_modules/ },
                { test: /\.scss$/, loader: 'css-loader?sourceMap!sass-loader?outputStyle=compressed' },
            ],
        },
        plugins: rmEmpty([
            /**
             * If we are using test env to execute tests with Karma,
             * then do not add optimize chunk plugin because tests will fail.
             * Chunk plugin is splitting our vendor and app code into separate files,
             * and it does this in a optimized way.
             */
            env.test ? undefined : new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
            }),
            /**
             * Webpack html plugin to copy static html into dist.
             * We need to specify template which will be used to copy from.
             * By default plugin adds vendor and app bunddles at the bottom of
             * the body section.
             */
            new HtmlWebpackPlugin({
                template: './index.html'
            }),
            /** 
             * DedupePlugin looks all modules and determines if any of them are same in 
             * order to deduplicate and leave one copy of them inside bundle.
            */
            ifProd(new webpack.optimize.DedupePlugin()),
            /**
             * LoaderOptionsPlugin is the same plugin started with webpac -p.
             * We are using it here to add additional debug property to optimze
             * builds to be faster.
             */
            ifProd(new webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false,
            })),
            /**
             * Set NODE_ENV to production with define webpack plugin
             * which is used to define system variables.
             */
            ifProd(new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: '"production"',
                },
            })),
            /**
             * UglifyJsPlugin minifies javascript files to take less space
             * and loading of javascript files will be much faster in browser.
             */
            ifProd(new webpack.optimize.UglifyJsPlugin({
                sourceMap: true,
                compress: {
                    screw_ie8: true,
                    warnings: false,
                }
            })),
        ])
    }
}