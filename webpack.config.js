/**
 *  Created by shiyanlin
 *  810975746@qq.com
 */

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const optimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

// ant  使用Icon需要
const svgDirs = [
    require.resolve('antd-mobile').replace(/warn\.js$/, ''), // 1. 属于 antd-mobile 内置 svg 文件
    // path.resolve(__dirname, 'src/my-project-svg-foler'),  // 2. 自己私人的 svg 存放目录
];

module.exports = {
    context: path.resolve(__dirname, './src'),
    // 配置服务器
    devServer: {
        contentBase: path.resolve(__dirname, './src'), // New
        port: 1024,
        proxy: { // 跨域代理
            '/wapapi/User/taskOverView': {
                changeOrigin: true,
                target: 'http://fw1.1.lishenglan.cn',
                secure: false,
            },
        }

    },
    entry: {
        app: './app.js',
        home: './home.js'
    },
    output: {
        path: path.resolve(__dirname, './output'),
        filename: '[name].[chunkhash:8].bundle.js', // 推荐使用 ，但是--hot会报错，
        // filename: '[name].[hash:8].bundle.js',       // --hot时使用，不推荐
        chunkFilename: '[name]-[id].[chunkhash:8].bundle.js', // 代码分割
    },
    module: {
        rules: [{
            test: /\.less$/,
            // use: ['style-loader', 'css-loader', 'less-loader'],      // 将css打包到js里面
            // 将css单独打包，需要plugins
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                //resolve-url-loader may be chained before lesss-loader if necessary
                use: ['css-loader', 'less-loader']
            })
        }, {
            test: /\.js[x]?$/,
            use: [{
                loader: 'babel-loader',
                options: { presets: ['es2015', 'stage-0', 'react'] }
            }],
            exclude: /node_modules/
        }, {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }, {
            test: /\.(woff|woff2|eot|ttf)(\?.*$|$)/,
            use: ['url-loader']
        }, {
            test: /\.(svg)$/i,
            use: ['svg-sprite-loader'],
            include: svgDirs, // 把 svgDirs 路径下的所有 svg 文件交给 svg-sprite-loader 插件处理
        }, {
            test: /\.(png|jpg)$/,
            use: ['url-loader?limit=8192&name=images/[hash:8].[name].[ext]']
        }],
    },
    // ant需要
    resolve: {
        modules: ['node_modules', path.join(__dirname, './node_modules')],
        extensions: ['.web.js', '.js', '.json'], // webpack2 不再需要一个空的字符串
    },
    // 不需要打包的模块
    externals: {
        "react": 'React',
        "react-dom": "ReactDOM",
        "zepto": "Zepto"
    },
    plugins: [
        // new ExtractTextPlugin('style.css'),     // 指定css文件名 打包成一个css
        // 分开打包多个css
        new ExtractTextPlugin({
            filename: '[name].[contenthash:8].bundle.css',
            allChunks: true,
        }),


        // 独立拆分公共模块
        // new webpack.optimize.CommonsChunkPlugin('common'),


        // js压缩
        new uglifyJsPlugin({
            compress: {
                warnings: false,
            }
        }),
        // css压缩
        new optimizeCssAssetsPlugin({
        }),


        // html 文件生成配置 需要确保和入口对应
        new HtmlWebpackPlugin({
            template: 'template.ejs',
            title: 'app页面',
            filename: 'app.html',
            chunks: ['app']
        }),
        new HtmlWebpackPlugin({
            template: 'template.ejs',
            title: 'home页面',
            filename: 'home.html',
            chunks: ['home']
        }),

    ]
};