const path = require('path');
const fs = require('fs');

const sourcePath = path.resolve(__dirname, './src');
const entryPoints = fs.readdirSync(sourcePath)
    .filter(fileName => /\.ts$/.test(fileName))
    .reduce((acc, fileName) => {
        acc[fileName.replace('.ts', '')] = path.join(__dirname, '/src/', fileName);
        return acc;
    }, {});

module.exports = {
    entry: entryPoints,
    target: "node",
    mode: 'production',
    externals: {
        'aws-sdk': 'aws-sdk'
    },
    output: {
        libraryTarget: "commonjs2",
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                use: 'ts-loader',
                exclude: /node_modules/,
                test: /\.ts?$/
            }
        ]
    }
}