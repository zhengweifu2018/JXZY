module.exports = (isService = false) => {
    const uglifyJs = isService 
        ? "        new webpack.optimize.UglifyJsPlugin({compressor: {pure_getters: true,unsafe: true,unsafe_comps: true,screw_ie8: true,warnings: false}})," : '';
    const definePlugin = !isService 
        ? "        new webpack.DefinePlugin({'process.env.NODE_ENV': undefined}),"
        : "        new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify('production')}),";
    const devtool = !isService 
        ? "    devtool: 'inline-source-map', /*eval-source-map*/"
        : '';//"    devtool: 'cheap-module-source-map',";
    const gz = "        new CompressionPlugin({asset: '[path].gz[query]', algorithm: 'gzip', test: /\.(js|html)$/, minRatio: 0.8}),";
    const app = "App";
    console.log(app);
    const webpackConfig = [
        "var webpack = require('webpack');",
        "var path = require('path');",
        "var HtmlWebpackPlugin = require('html-webpack-plugin');",
        "var PUBLIC_PATH = require('../src/config').PUBLIC_PATH;",
        "var CompressionPlugin = require('compression-webpack-plugin');",
        "var HappyPack = require('happypack');",
        "var os = require('os');",
        "var happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });",
        "module.exports = {",
        "    resolve: {",
        "        extensions: ['*', '.js', '.jsx', '.css', '.scss', 'jpg', 'png']",
        "    },",
        "    externals: {",
        "        // 'react': 'React',",
        "        // 'react-dom': 'ReactDOM',",
        "        'three': 'THREE'",
        "    },",
        "    module: {",
        "        rules: [{",
        "            test: /.(js|jsx)$/,",
        "            exclude: /(node_modules)/,",
        "            use: [{",
        "                loader: 'babel-loader',",
        "                options: {",
        "                    presets: [['es2015', {modules: false}], 'react', 'stage-0'],",
        "                    plugins: ['syntax-dynamic-import', ['import', { libraryName: 'antd', style: 'css' }]]",
        "                }",
        "            }]",
        "        }, {",
        "            test: /.css$/,",
        "            use: ['style-loader', 'css-loader']",
        "        }, {",
        "            test: /.(jpg|png|eot|svg|ttf|woff|woff2)$/,",
        "            use: 'file-loader?name=assets/[hash:8].[name].[ext]'",
        "        }, {",
        "            test: /.pro$/,",
        "            use: [{",
        "                loader: 'pro-loader',",
        "                options: {",
        "                   subKeys: {'image': ['imagePath'], 'code': 'scriptPath'}",
        "                }",
        "            }]",
        "        }]",
        "    },",
        "    plugins: [",
        "        new HappyPack({id: 'js', threadPool: happyThreadPool, verbose: true, loaders: ['babel-loader']}),",
        "        new webpack.optimize.ModuleConcatenationPlugin(),",
        "        new webpack.NoEmitOnErrorsPlugin(),",
        "        new HtmlWebpackPlugin({hash: true, template: path.resolve(__dirname, '../template.html'), filename: path.resolve(__dirname, '../index.html'), chunks: ['vendor', 'app']}),",
        definePlugin,
        "        new webpack.optimize.CommonsChunkPlugin({",
        "            name: 'vendor',",
        "            minChunks (module) {",
        "               return module.context && module.context.indexOf('node_modules') >= 0;",
        "            }",
        "        }),",
        uglifyJs,
        gz,
        "    ],",
        devtool,
        "    output:{",
        "        path: path.resolve(__dirname, '../dist'),",
        "        publicPath: PUBLIC_PATH,",
        "        filename: '[name].bundle.js',",
        "        chunkFilename: '[name].[chunkhash:5].chunk.js'",
        "    },",
        "    entry: {",
        `        app: path.resolve(__dirname, '../src/${app}.js'),`,
        "        vendor: ['react', 'react-dom', 'react-router-dom', 'axios']",
        "    }",
        "};",
    ];

    return webpackConfig.join('\n');
}