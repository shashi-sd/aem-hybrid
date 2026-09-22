const path = require("path");

module.exports = {
    webpack: {
        alias: {
            "@calix-com": path.resolve(__dirname, "../site/scripts/components"),
            "@styles": path.resolve(__dirname, "../site/styles/utils/variables"),
        },
        configure: (webpackConfig) => {
            const sassRule = webpackConfig.module.rules
                .find(rule => rule.oneOf)
                ?.oneOf.find(rule => rule.test && rule.test.toString().includes('scss|sass'));

            if (sassRule) {
                const sassLoaderIndex = sassRule.use.findIndex(loader =>
                    loader.loader && loader.loader.includes('sass-loader')
                );

                if (sassLoaderIndex !== -1) {
                    const sassLoader = sassRule.use[sassLoaderIndex];
                    if (!sassLoader.options) {
                        sassLoader.options = {};
                    }
                    if (!sassLoader.options.sassOptions) {
                        sassLoader.options.sassOptions = {};
                    }

                    sassLoader.options.sassOptions.includePaths = [
                        path.resolve(__dirname, "../site/scripts"),
                        path.resolve(__dirname, "../site/scripts/components"),
                        path.resolve(__dirname, "../site/styles/utils/variables"),
                    ];
                }

                const cssLoaderIndex = sassRule.use.findIndex(loader =>
                    loader.loader && loader.loader.includes('css-loader')
                );

                if (cssLoaderIndex !== -1) {
                    const cssLoader = sassRule.use[cssLoaderIndex];
                    if (!cssLoader.options) {
                        cssLoader.options = {};
                    }
                    cssLoader.options.url = false;
                }
            }

            return webpackConfig;
        },
    },
    devServer: {
        static: [
            path.resolve(__dirname, 'public'),
        ],
    },
};
