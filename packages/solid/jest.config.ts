export default {
	testRunner: 'jasmine2',
	displayName: 'solid',
	preset: '../../jest.preset.js',
	globals: {
		'ts-jest': {
			tsconfig: '<rootDir>/tsconfig.spec.json',
			babelConfig: {
				presets: [
					'babel-preset-solid',
					[
						'@babel/preset-env',
						{
							targets: {
								node: 'current',
							},
						},
					],
				],
			},
		},
	},
	// insert setupFiles and other config
	// you probably want to test in browser mode:
	testEnvironment: 'jsdom',
	// unfortunately, solid cannot detect browser mode here,
	// so we need to manually point it to the right versions:
	moduleNameMapper: {
		'solid-js/web': '<rootDir>/node_modules/solid-js/web/dist/web.cjs',
		'solid-js': '<rootDir>/node_modules/solid-js/dist/solid.cjs',
	},
	testMatch: ['./**/*.spec.(ts|tsx)'],
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
	moduleFileExtensions: ['ts', 'js', 'html', 'tsx'],
	coverageDirectory: '../../coverage/packages/solid',
}
