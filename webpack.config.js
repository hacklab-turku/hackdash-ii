const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

const jsSdkSrcDir = path.resolve(require.resolve("matrix-js-sdk/package.json"), '..', 'src');

module.exports = {
	entry: {
		bundle: ['./src/main.js'],
	},
	resolve: {
		alias: {
			svelte: path.resolve('node_modules', 'svelte'),
			"matrix-js-sdk": path.resolve(__dirname, 'node_modules/matrix-js-sdk'),
		},
		extensions: ['.mjs', '.js', '.ts', '.svelte'],
		mainFields: ['matrix_src_browser', 'matrix_src_main', 'svelte', 'browser', 'module', 'main'],
		aliasFields: ['matrix_src_browser', 'browser'],
	},
	output: {
		path: __dirname + '/public',
		filename: '[name].js',
		chunkFilename: '[name].[id].js'
	},
	module: {
		rules: [
			{
				test: /\.svelte$/,
				use: {
					loader: 'svelte-loader',
					options: {
						emitCss: true,
						hotReload: true
					}
				}
			},
			{
				test: /\.(ts|js)x?$/,
				include: (f) => f.startsWith(jsSdkSrcDir),
				loader: 'babel-loader',
				options: {
					cacheDirectory: true
				}
			},
			{
				test: /\.css$/,
				use: [
					/**
					 * MiniCssExtractPlugin doesn't support HMR.
					 * For developing, use 'style-loader' instead.
					 * */
					prod ? MiniCssExtractPlugin.loader : 'style-loader',
					'css-loader'
				]
			}
		]
	},
	mode,
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css'
		}),
		new HtmlWebpackPlugin({
			template: './src/index.html',

			minify: prod,
		}),
	],
	devtool: prod ? false: 'source-map',
	devServer: {
		host: '0.0.0.0',
		disableHostCheck: true
	}
};
