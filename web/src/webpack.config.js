var webpack = require('webpack');

module.exports = {
    entry: ['./app/app.jsx'],
    externals: {},
    plugins: [new webpack.ProvidePlugin({})],
    output: {
        path: __dirname,
        filename: './public/bundle.js'
    },
    resolve: {
        modules: [
            __dirname, 'node_modules', './app/components/auth', './app/components/user', './app/components/tasks'
        ],
        alias: {
            Main: 'app/components/Main.jsx',
            Nav: 'app/components/Nav.jsx',
            Error: 'app/components/Error.jsx',
            applicationStyles: 'app/styles/app.scss',
            actions: 'app/actions/index.jsx',
            taskActions: 'app/actions/task.jsx',
            userActions: 'app/actions/user.jsx',
            config: 'app/config/index.jsx'
        },
        extensions: ['*', '.js', '.jsx']
    },
    module: {
        loaders: [{
            loader: 'babel-loader',
            query: {
                presets: ['react', 'es2015', 'stage-0']
            },
            test: /\.jsx?$/,
            exclude: /(node_modules|bower_components)/
        }, {
            loader: 'style-loader!css-loader',
            test: /\.css$/
        }, {
            loader: 'file-loader',
            test: /(\.woff|\.woff2|\.svg|\.ttf|\.eot)/
        }]
    }
}