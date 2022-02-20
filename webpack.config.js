const path = require("path")
const CopyWebpackPlugin = require('copy-webpack-plugin')
// const CreateFileWebpack = require('create-file-webpack')
const execSync = require('child_process').execSync
const webpack = new require('webpack')

module.exports = () => {

    const SOURCE_FOLDER = path.resolve(__dirname, 'src')
    const DIST_FOLDER = path.resolve(__dirname, 'dist')
    const PUBLIC_FOLDER = path.resolve(__dirname, 'public')

    const VERSION = process.env.SOURCE_VERSION || execSync('git rev-parse --short HEAD').toString().trim()

    const mode = process.env.NODE_ENV || 'development'

    const COPY = {
        patterns: [
            {
                from: PUBLIC_FOLDER,
                to: DIST_FOLDER
            }
        ]
    }

    const plugins = []

    plugins.push(new CopyWebpackPlugin(COPY))

    // plugins.push(new CreateFileWebpack({
    //     path: './dist/',
    //     fileName: 'VERSION',
    //     content: VERSION
    // }))

    plugins.push(new webpack.DefinePlugin({VERSION: JSON.stringify(VERSION)}))

    return {
        mode,
        entry: {
            index: path.resolve(SOURCE_FOLDER, 'index.js'),
            '../serviceWorker': path.resolve(SOURCE_FOLDER, 'serviceWorker.ts'),
            serviceWorkerRegistration: path.resolve(SOURCE_FOLDER, 'serviceWorkerRegistration.ts'),
        },
        output: {
            filename: 'js/[name].js',
            path: DIST_FOLDER,
            publicPath: './',
        },
        devtool: 'inline-source-map',
        plugins,
        module: {
            rules: [
                {
                    test: /\.(jsx?)$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader'
                },
                {
                    test: /\.css$/i,
                    use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.ts?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".styl", ".css", ".png", ".jpg", ".gif", ".svg", ".woff", ".woff2", ".ttf", ".otf"]
        },
    }
}