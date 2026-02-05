import Encore from '@symfony/webpack-encore';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV = process.env.NODE_ENV;
const isDevServer = process.argv.includes('dev-server');
const isProduction = Encore.isProduction();

function configureEnvironment() {
    if (!Encore.isRuntimeEnvironmentConfigured()) {
        Encore.configureRuntimeEnvironment(process.env.PROJECT_DOMAIN);
    } else {
        dotenv.config({ 
            path: new URL(`./env/${!ENV || ENV === 'undefined' ? '.local.env' : `.${ENV}.env`}`, import.meta.url).pathname,
        });
    }
}

function configurePlatformEntries() {
    const platform = process.env.PROJECT_PLATFORM;
    const domain = process.env.PROJECT_DOMAIN;
    const source = process.env.PROJECT_SOURCE;

    Encore
        .addEntry(`${domain}-preloader`, `./${source}/${domain}/js/preloader.js`)
        .addEntry(`${domain}-apps`, `./${source}/${domain}/js/app.js`)
        .addEntry(`${domain}-frameworks`, `./${source}/${domain}/js/framework.js`)
        .addEntry(`${domain}-library`, `./${source}/${domain}/js/library.js`);

    const platformEntries = {
        shopify: ['products', 'collections', 'collection-list', 'single-post', 'blogs', 'pages', 'search', 'lost', 'giftcard', 'cart', 'account', 'password'],
        wordpress: ['singlepost', 'blogs', 'pages', 'store', 'singleproduct', 'cart', 'checkout', 'account', 'lost'],
        custom: ['pages']
    };

    if (platformEntries[platform]) {
        platformEntries[platform].forEach(entry => {
            Encore.addEntry(`${domain}-${entry}`, `./${source}/${domain}/js/${platform}/${entry}.js`);
        });
    }
}

function configureEncore() {
    const domain = process.env.PROJECT_DOMAIN;
    
    Encore
        .setOutputPath(`${process.env.PROJECT_DEST}/${domain}/assets`)
        .copyFiles(
            {
                from: `./${process.env.PROJECT_SOURCE}/${domain}/images`,
                pattern: /\.(png|jpg|jpeg|svg|JPG)$/,
                to: 'images/[path][name].[ext]'
            },
            {
                from: `./${process.env.PROJECT_SOURCE}/${domain}/fonts`,
                pattern: /\.(ttf|eot|woff|svg|woff2)$/,
                to: 'fonts/[path][name].[ext]'
            }
        )
        .setPublicPath('/assets')
        .enableSassLoader(options => { options.api = 'modern-compiler'; })
        .enablePostCssLoader(options => {
            options.postcssOptions = { config: new URL('./postcss.config.js', import.meta.url).pathname };
        })
        .disableSingleRuntimeChunk()
        .configureBabel(configureBabel)
        .configureBabelPresetEnv(configureBabelPresetEnv)
        .enableBuildNotifications()
        .enableSourceMaps(!isProduction);

    configurePlatformEntries();
}

function configureBabel(config) {
    // Only include plugins for features not supported by target browsers
    // Removed Baseline features: optional-chaining, nullish-coalescing, logical-assignment, class-properties
    config.plugins.push(
        '@babel/plugin-transform-runtime'
    );
}

function configureBabelPresetEnv(config) {
    Object.assign(config, {
        // Disable polyfills for modern browsers - they support ES6+ natively
        // preset-env will automatically exclude Baseline features based on targets
        useBuiltIns: false,
        // Enable bugfix transforms for better compatibility
        bugfixes: true,
        // Include shipped proposals (features already in browsers)
        shippedProposals: true,
        targets: {
            browsers: ['last 2 versions', 'Chrome >= 120', 'Firefox >= 121', 'Safari >= 17', 'Edge >= 120']
        },
        modules: 'auto'
    });
}

function cleanOutputDirectory() {
    const outputPath = `${process.env.PROJECT_DEST}/${process.env.PROJECT_DOMAIN}/assets`;
    
    if (!fs.existsSync(outputPath)) return;
    
    function removeDirectoryContents(dirPath) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                removeDirectoryContents(filePath);
                fs.rmdirSync(filePath);
            } else {
                fs.unlinkSync(filePath);
            }
        }
    }
    
    removeDirectoryContents(outputPath);
}

configureEnvironment();
configureEncore();

if (!isDevServer) cleanOutputDirectory();

const webpackConfig = Encore.getWebpackConfig();
const domain = process.env.PROJECT_DOMAIN || 'local';

webpackConfig.output = {
    ...webpackConfig.output,
    filename: '[name].js',
    chunkFilename: '[name].js',
    assetModuleFilename: 'assets/[name][ext]',
    library: { type: 'var', name: 'MifanStudio' },
    globalObject: 'this',
    environment: {
        arrowFunction: true,
        const: true,
        destructuring: true,
        dynamicImport: true,
        forOf: true,
        optionalChaining: true,
        templateLiteral: true
    }
};

webpackConfig.experiments = {
    ...webpackConfig.experiments,
    topLevelAwait: true,
    outputModule: false
};

webpackConfig.plugins = webpackConfig.plugins.filter(
    plugin => plugin.constructor.name !== 'WebpackManifestPlugin'
);

webpackConfig.optimization = {
    ...webpackConfig.optimization,
    minimize: isProduction,
    
    splitChunks: isProduction ? false : {
        chunks: 'all',
        cacheGroups: {
            vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: 10
            },
            common: {
                name: 'common',
                minChunks: 2,
                chunks: 'all',
                priority: 5,
                reuseExistingChunk: true
            }
        }
    }
};

if (!isProduction) {
    webpackConfig.devtool = 'eval-source-map';
    webpackConfig.mode = 'development';
    
    webpackConfig.devServer = {
        ...webpackConfig.devServer,
        static: [{ directory: path.join(__dirname, 'preview', domain), publicPath: '/', watch: true }],
        hot: false,
        liveReload: true,
        watchFiles: [`preview/${domain}/**/*`],
        open: true,
        compress: true,
        port: 8080,
        headers: { 'Access-Control-Allow-Origin': '*' },
        devMiddleware: { writeToDisk: true, publicPath: '/assets/' }
    };
}

webpackConfig.resolve = {
    ...webpackConfig.resolve,
    fallback: {
        path: path.resolve(__dirname, 'node_modules/path-browserify'),
        fs: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false
    }
};

if (!isDevServer) {
    webpackConfig.plugins.push({
        apply: (compiler) => compiler.hooks.beforeRun.tap('CleanOutputPlugin', cleanOutputDirectory)
    });
}

export default webpackConfig;
