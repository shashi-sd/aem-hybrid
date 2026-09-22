const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const SOURCE_ROOT = path.resolve(__dirname, 'site');

module.exports = {
    entry: {
        site: SOURCE_ROOT + '/scripts/main.ts'
    },
    output: {
        chunkFilename: 'clientlib-site/resources/chunks/[name].[contenthash].js',
        filename: (chunkData) => {
            if (chunkData.chunk.name === 'site') return 'clientlib-site/site.js';
            return '[name].js';
        },
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                    options: { transpileOnly: true }
                }
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /\.(woff2?|ttf|eot)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'clientlib-site/resources/fonts/[name][ext]'
                }
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'clientlib-site/resources/images/[name][ext]'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.scss', '.css']
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: (pathData) => {
                if (pathData.chunk.name === 'site') return 'clientlib-site/site.css';
                return '[name].css';
            },
            chunkFilename: 'clientlib-site/resources/chunks/[name].[contenthash].css'
        })
    ]
};
