import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const SELF = path.resolve(__dirname)

const config = {
	entry: path.resolve(SELF, './index.tsx'),
	mode: 'development',
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(SELF, './index.html'),
		}),
	],
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
	},
}

// eslint-disable-next-line import/no-default-export
export default config
