var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var env = process.env.NODE_ENV;

var config = {
    // cache: true,
    entry: {
        index: './src/index.js',
    },

    output: {
        path: __dirname + '/dist',
        filename: '[name].bundle.js'
    },

    resolve: {
        extensions: ['', '.js', '.jsx', '.css', '.scss', 'jpg', 'png']
    },

    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        'three': 'THREE',
        'fabric': 'fabric'
    },

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel', // 'babel-loader' is also a legal name to reference
                query: {
                    presets: ['es2015', 'react', 'stage-0']
                }
            }, {
                test: /\.scss$/,
                loader: 'style!css!sass'
            }, {
                test: /\.(jpg|png|woff|woff2|eot|ttf|svg)$/,
                loader: 'url?limit=8192?name=dist/[hash:8].[name].[ext]'
            }
        ]
    },

    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(env)
        }),
        new webpack.NoErrorsPlugin(),
        new HtmlWebpackPlugin({
            hash: true,
            template: 'htmls/template.html'
        })
    ]
};

if (env === 'production') {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        screw_ie8: true,
        warnings: false
      }
    })
  );
} else {
    config['devtool'] = 'eval-source-map';// devtool: 'inline-source-map',
}

module.exports = config;
