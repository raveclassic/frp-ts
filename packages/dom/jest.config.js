module.exports = {
	testRunner: 'jasmine2',
	displayName: 'dom',
	preset: '../../jest.preset.js',
	globals: {
		'ts-jest': {
			tsconfig: '<rootDir>/tsconfig.spec.json',
		},
	},
	transform: {
		'^.+\\.[tj]sx?$': 'ts-jest',
	},
	moduleFileExtensions: ['ts', 'js', 'html', 'tsx'],
	coverageDirectory: '../../coverage/packages/dom',
}
