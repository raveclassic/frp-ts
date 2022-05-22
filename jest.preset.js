const nxPreset = require('@nrwl/jest/preset').default;

module.exports = {
	...nxPreset,
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
	},
}
