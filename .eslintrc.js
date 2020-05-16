module.exports = {
	root: true,
	env: {
		node: true,
		browser: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.eslint.json',
		extraFileExtensions: ['.json'],
	},
	plugins: ['@typescript-eslint'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
	],
	rules: {
		'@typescript-eslint/member-delimiter-style': [
			2,
			{
				multiline: {
					delimiter: 'none',
					requireLast: false,
				},
				singleline: {
					delimiter: 'semi',
					requireLast: false,
				},
			},
		],
		'@typescript-eslint/no-use-before-define': 0,
		'@typescript-eslint/explicit-function-return-type': 0,
		'@typescript-eslint/ban-ts-comment': 2,
		'@typescript-eslint/await-thenable': 2,
		'@typescript-eslint/ban-types': 2,
		'@typescript-eslint/class-literal-property-style': 2,
		'@typescript-eslint/naming-convention': 2,
		'@typescript-eslint/no-unused-vars': 2,
		'@typescript-eslint/no-empty-interface': 0,
	},
}
