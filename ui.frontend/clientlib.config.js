const path = require('path');

const BUILD_DIR = path.join(__dirname, 'dist');
const CLIENTLIB_DIR = path.join(
    __dirname,
    '..',
    'ui.apps',
    'src',
    'main',
    'content',
    'jcr_root',
    'apps'
);

const libsBaseConfig = {
    allowProxy: true,
    serializationFormat: 'xml',
    cssProcessor: ['default:none', 'min:none'],
    jsProcessor: ['default:none', 'min:none']
};

module.exports = {
    context: BUILD_DIR,
    clientLibRoot: CLIENTLIB_DIR,
    libs: [
        {
            ...libsBaseConfig,
            name: 'aem-hybrid-calix/clientlibs/clientlib-site',
            categories: ['aem-hybrid-calix.site'],
            assets: {
                js: {
                    cwd: 'clientlib-site',
                    base: '.',
                    files: ['*.js'],
                    flatten: false
                },
                css: {
                    cwd: 'clientlib-site',
                    base: '.',
                    files: ['*.css'],
                    flatten: false
                },
                resources: {
                    cwd: 'clientlib-site',
                    base: '.',
                    files: ['resources/**/*.*'],
                    flatten: false,
                    ignore: ['**/*.map']
                }
            }
        },
        {
            ...libsBaseConfig,
            name: 'aem-hybrid-calix/clientlibs/clientlib-react',
            categories: ['aem-hybrid-calix.react'],
            assets: {
                js: {
                    cwd: '../react/build',
                    base: '.',
                    files: ['*.js'],
                    flatten: false
                },
                css: {
                    cwd: '../react/build',
                    base: '.',
                    files: ['*.css'],
                    flatten: false
                },
                resources: {
                    cwd: '../react/build',
                    base: '.',
                    files: ['resources/**/*.*'],
                    flatten: false
                }
            }
        }
    ]
};
