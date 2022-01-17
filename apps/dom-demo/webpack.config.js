const path = require('path')
// import HtmlWebpackPlugin from 'html-webpack-plugin'
const SELF = path.resolve(__dirname)
//
// const config = {
// 	entry: path.resolve(SELF, './src/index.tsx'),
// 	mode: 'development',
// 	plugins: [
// 		new HtmlWebpackPlugin({
// 			template: path.resolve(SELF, './src/index.html'),
// 		}),
// 	],
// 	optimization: {
// 		runtimeChunk: 'single',
// 		moduleIds: 'deterministic',
// 		splitChunks: {
// 			cacheGroups: {
// 				vendor: {
// 					test: /[\\/]node_modules[\\/]/,
// 					name: 'vendors',
// 					chunks: 'all',
// 				},
// 			},
// 		},
// 	},
// 	module: {
// 		rules: [
// 			{
// 				test: /.tsx?$/,
// 				use: [
// 					{
// 						loader: 'ts-loader',
// 						options: {
// 							configFile: path.resolve(SELF, './tsconfig.demo.json'),
// 						},
// 					},
// 				],
// 				exclude: /node_modules/,
// 			},
// 		],
// 	},
// 	devtool: false,
// 	resolve: {
// 		extensions: ['.tsx', '.ts', '.js'],
// 	},
// }
//
// // eslint-disable-next-line import/no-default-export
// export default config

// eslint-disable-next-line import/no-default-export
module.exports = function override(config, context) {
	config.module = {
		...config.module,
		rules: [
			{
				test: /.tsx?$/,
				use: [
					{
						loader: 'ts-loader',
						options: {
							// `nx build` passes `options`
							// `nx serve` passes `buildOptions`
							configFile: (context.options ?? context.buildOptions).tsConfig,
						},
					},
				],
				exclude: /node_modules/,
			},
		],
	}
	return config
}
