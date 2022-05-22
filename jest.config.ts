const { getJestProjects } = require('@nrwl/jest')

export default {
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
	collectCoverageFrom: ['<rootDir>/packages/*/src/**/*.tsx?'],
	coveragePathIgnorePatterns: ['index.ts'],
}
