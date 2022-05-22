export default {
	testRunner: 'jasmine2',
	displayName: 'react',
	preset: '../../jest.preset.js',
	globals: {
		'ts-jest': {
			tsconfig: '<rootDir>/tsconfig.spec.json',
		},
	},
	testMatch: ['./**/*.spec.(ts|tsx)'],
	transform: {
		'^.+\\.[tj]sx?$': 'ts-jest',
	},
	moduleFileExtensions: ['ts', 'js', 'html', 'tsx'],
	coverageDirectory: '../../coverage/packages/react',
}
