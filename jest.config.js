module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	collectCoverage: false,
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
	},
	collectCoverageFrom: ['./**/src/**/*.ts'],
	coveragePathIgnorePatterns: ['env.ts', 'index.ts'],
	testMatch: ['./**/*.spec.ts'],
	testPathIgnorePatterns: ['/coverage/', '/node_modules/', '/lib/'],
}
