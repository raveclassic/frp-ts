module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	collectCoverage: false,
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100
		}
	},
	testPathIgnorePatterns: [
		'node_modules',
		'perf'
	]
};
