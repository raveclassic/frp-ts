const { getJestProjects } = require('@nrwl/jest')

module.exports = {
	projects: getJestProjects(),
	testRunner: 'jasmine2',
	collectCoverage: false,
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
	},
	collectCoverageFrom: ['<rootDir>/packages/*/src/**/*.ts'],
	coveragePathIgnorePatterns: ['index.ts'],
}
