import Encore from '@symfony/webpack-encore';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV = process.env.NODE_ENV;

function configureEnviroment() {
    if(!Encore.isRuntimeEnvironmentConfigured()) {
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

    // Common entries for all platforms
    Encore
        .addEntry(`${domain}-preloader`, `./${source}/${domain}/js/preloader.js`)
        .addEntry(`${domain}-apps`, `./${source}/${domain}/js/app.js`)
        .addEntry(`${domain}-frameworks`, `./${source}/${domain}/js/framework.js`)
        .addEntry(`${domain}-library`, `./${source}/${domain}/js/library.js`);

    // Platform-specific entries
    switch (platform) {
        case 'shopify':
            Encore
                .addEntry(`${domain}-products`, `./${source}/${domain}/js/shopify/products.js`)
                .addEntry(`${domain}-collection`, `./${source}/${domain}/js/shopify/collections.js`)
                .addEntry(`${domain}-collectionlist`, `./${source}/${domain}/js/shopify/collection-list.js`)
                .addEntry(`${domain}-singlepost`, `./${source}/${domain}/js/shopify/single-post.js`)
                .addEntry(`${domain}-blogs`, `./${source}/${domain}/js/shopify/blogs.js`)
                .addEntry(`${domain}-pages`, `./${source}/${domain}/js/shopify/pages.js`)
                .addEntry(`${domain}-search`, `./${source}/${domain}/js/shopify/search.js`)
                .addEntry(`${domain}-lost`, `./${source}/${domain}/js/shopify/lost.js`)
                .addEntry(`${domain}-giftcard`, `./${source}/${domain}/js/shopify/giftcard.js`)
                .addEntry(`${domain}-cart`, `./${source}/${domain}/js/shopify/cart.js`)
                .addEntry(`${domain}-account`, `./${source}/${domain}/js/shopify/account.js`)
                .addEntry(`${domain}-password`, `./${source}/${domain}/js/shopify/password.js`);
            break;
        case 'wordpress':
            // Encore array entry
            Encore
                .addEntry(`${domain}-singlepost`, `./${source}/${domain}/js/wordpress/single-post.js`)
                .addEntry(`${domain}-blogs`, `./${source}/${domain}/js/wordpress/blogs.js`)
                .addEntry(`${domain}-pages`, `./${source}/${domain}/js/wordpress/pages.js`)
                .addEntry(`${domain}-store`, `./${source}/${domain}/js/wordpress/store.js`)
                .addEntry(`${domain}-singleproduct`, `./${source}/${domain}/js/wordpress/single-product.js`)
                .addEntry(`${domain}-cart`, `./${source}/${domain}/js/wordpress/cart.js`)
                .addEntry(`${domain}-checkout`, `./${source}/${domain}/js/wordpress/checkout.js`)
                .addEntry(`${domain}-account`, `./${source}/${domain}/js/wordpress/account.js`)
                .addEntry(`${domain}-lost`, `./${source}/${domain}/js/wordpress/lost.js`);
            break;
        case 'components':
            break;
        case 'default':
        default:
            // Default platform - no additional entries
            break;
    }
}

function configureEncore() {
    Encore
        .setOutputPath(`${process.env.PROJECT_DEST}/${process.env.PROJECT_DOMAIN}/assets`)
        .copyFiles(
            {
                from: `./${process.env.PROJECT_SOURCE}/${process.env.PROJECT_DOMAIN}/images`,
                pattern: /\.(png|jpg|jpeg|svg|JPG)$/,
                to: 'images/[path][name].[ext]'
            },
            {
                from: `./${process.env.PROJECT_SOURCE}/${process.env.PROJECT_DOMAIN}/fonts`,
                pattern: /\.(ttf|eot|woff|svg|woff2)$/,
                to: 'fonts/[path][name].[ext]'
            }
        )
        .setPublicPath('/assets');
        // .enableHotModuleReplacementPlugin(); // Enable HMR

    // Configure platform-specific entries
    configurePlatformEntries();

    Encore
        .enableSassLoader( options => {
            options.api = 'modern-compiler';
        })
        .enablePostCssLoader( options => {
            options.postcssOptions = {
                config: new URL('./postcss.config.js', import.meta.url).pathname,
            }
        })
        .splitEntryChunks()
        .configureSplitChunks(configureSplitChunks)
        .disableSingleRuntimeChunk()
        .configureBabel(configureBabel)
        .configureBabelPresetEnv(configureBabelPresetEnv)
        .enableBuildNotifications()
        .enableSourceMaps(!Encore.isProduction());
};

function configureSplitChunks(splitChunks) {
    splitChunks.chunks = 'async';
    splitChunks.minSize = 20000;
    splitChunks.minRemainingSize = 0;
    splitChunks.minChunks = 1;
    splitChunks.maxAsyncRequests = 30;
    splitChunks.maxInitialRequests = 30;
    splitChunks.enforceSizeThreshold = 50000;
    splitChunks.cacheGroups = {
        defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
        },
        default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
        },
    };
}

function configureBabel(config) {
    config.plugins.push('@babel/plugin-proposal-class-properties');
    config.plugins.push('@babel/plugin-transform-runtime');
    config.plugins.push('@babel/plugin-transform-optional-chaining');
    config.plugins.push('@babel/plugin-transform-nullish-coalescing-operator');
    config.plugins.push('@babel/plugin-transform-logical-assignment-operators');
}

function configureBabelPresetEnv(config) {
    config.useBuiltIns = 'usage';
    config.corejs = 3;
    config.targets = {
        browsers: [
            'last 2 versions',
            'Chrome >= 120',
            'Firefox >= 121',
            'Safari >= 17',
            'Edge >= 120'
        ]
    };
    config.modules = 'auto'; // Let Babel handle module transformation
}

function cleanOutputDirectory() {
    const outputPath = `${process.env.PROJECT_DEST}/${process.env.PROJECT_DOMAIN}/assets`;
    
    if (fs.existsSync(outputPath)) {
        
        function removeDirectoryContents(dirPath) {
            if (fs.existsSync(dirPath)) {
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
        }
        
        removeDirectoryContents(outputPath);
    }
}

configureEnviroment();
configureEncore();

// Clean output directory before build (skip for dev-server)
if (!process.argv.includes('dev-server')) {
    cleanOutputDirectory();
}

const webpackConfig = Encore.getWebpackConfig();

// Beautify build when PROJECT_STATUS is not production
if (process.env.PROJECT_STATUS !== 'production') {
    webpackConfig.optimization = {
        ...webpackConfig.optimization,
        minimize: false
    };
}

// Configure modern JavaScript output for ES2025
webpackConfig.experiments = {
    ...webpackConfig.experiments,
    topLevelAwait: true,
    outputModule: false
};

// Additional configuration for development mode
if (!Encore.isProduction()) {
    webpackConfig.devtool = 'eval-source-map';
    webpackConfig.mode = 'development';
    const domain = process.env.PROJECT_DOMAIN || 'local';
    
    // Configure dev server for better compatibility
    webpackConfig.devServer = {
        ...webpackConfig.devServer,
        static: [
            {
                directory: path.join(__dirname, 'preview', `${domain}`),
                publicPath: '/',
                watch: true // Enable file watching
            }
        ],
        hot: 'only', // Enable HMR without page refresh as fallback
        liveReload: true, // Enable live reload
        watchFiles: [`preview/${domain}/**/*`], // Watch all files in preview directory
        open: true,
        compress: true,
        port: 8080,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        devMiddleware: {
            writeToDisk: true,
            publicPath: '/assets/'
        }
    };
}

// Set output format for modern browsers with ES2025 support
webpackConfig.output = {
    ...webpackConfig.output,
    library: {
        type: 'var',
        name: 'MifanStudio'
    },
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

// Configure module resolution
webpackConfig.resolve = {
    ...webpackConfig.resolve,
    fallback: {
        "path": path.resolve(__dirname, 'node_modules/path-browserify'),
        "fs": false,
        "crypto": false,
        "stream": false,
        "util": false,
        "buffer": false,
        "process": false
    }
};

// Add custom plugin for cleanup (skip for dev-server)
if (!process.argv.includes('dev-server')) {
    webpackConfig.plugins.push({
        apply: (compiler) => {
            compiler.hooks.beforeRun.tap('CleanOutputPlugin', () => {
                cleanOutputDirectory();
            });
        }
    });
}

export default webpackConfig;