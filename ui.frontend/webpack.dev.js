const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    performance: { hints: 'warning' },
    devServer: {
        port: 3000,
        hot: true,
        open: true
    }
});
