// import { ForkTsCheckerWebpackPlugin } from 'fork-ts-checker-webpack-plugin/lib/ForkTsCheckerWebpackPlugin'
import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
// import WorkboxPlugin from 'workbox-webpack-plugin'
// import DotenvPlugin from 'dotenv-webpack'

const SELF = path.resolve(__dirname)

const config = {
	entry: path.resolve(SELF, './index.tsx'),
	// output: {
	// 	path: path.resolve(SELF, './build'),
	// 	filename: '[name].[contenthash].js',
	// },
	mode: 'development',
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(SELF, './index.html'),
		}),
		// isProduction
		// 	? noop
		// 	: new ForkTsCheckerWebpackPlugin({
		// 			async: true,
		// 	  }),
		// isProduction
		// 	? new WorkboxPlugin.GenerateSW({
		// 			clientsClaim: true,
		// 			skipWaiting: true,
		// 	  })
		// 	: noop,
		// new DotenvPlugin({
		// 	path: './.env',
		// }),
	],
	devServer: {
		// contentBase: './build',
	},
	optimization: {
		runtimeChunk: 'single',
		moduleIds: 'deterministic',
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all',
				},
			},
		},
	},
	module: {
		rules: [
			{
				test: /.tsx?$/,
				use: [
					{
						loader: 'ts-loader',
						options: {
							configFile: path.resolve(SELF, './tsconfig.demo.json'),
							// 	transpileOnly: true,
							// 	experimentalWatchApi: true,
						},
					},
				],
				exclude: /node_modules/,
			},
		],
	},
	devtool: false,
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
		alias: {
			// url: path.resolve(__dirname, 'lib/polyfills/url.js'),
			// ws: 'isomorphic-ws',
		},
	},
}

// eslint-disable-next-line import/no-default-export
export default config
