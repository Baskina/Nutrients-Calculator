const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	mode: 'development',
	devtool: 'source-map',
	entry: ['./src/js/main.js', './src/scss/style.scss'],
	output: {
		path: path.resolve(__dirname, './dist/'),
		filename: 'js/bundle.js'
	},

	module : {

		rules: [
		{
			test: /\.scss$/,
			use: [
			{
				loader: 'file-loader',
				options: {
					name: 'css/style.css',
				}
			},

			{
				loader: 'extract-loader'
			},
			{
				loader: 'css-loader?-url'
			},
			{
				loader: 'sass-loader'
			}
			]
		},

		{
			test: /\.js$/,
			loader: 'babel-loader'
		}

		]
	},

	plugins: [

	new CopyWebpackPlugin([
		{from: './src/index.html', to: path.resolve(__dirname, './dist/index.html')},
		{from: './src/images', to: path.resolve(__dirname, './dist/images')},
		{from: './src/db', to: path.resolve(__dirname, './dist/db')}
		])
	]

};