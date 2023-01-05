const workspaces = require('./workspace.json')
const path = require('path')

const ROOT = path.resolve(__dirname)

module.exports = {
	root: true,
	env: {
		node: true,
		browser: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		extraFileExtensions: ['.json'],
	},
	plugins: ['@nrwl/nx', 'jest', 'import', 'unicorn'],
	extends: [
		'plugin:@nrwl/nx/typescript',
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:import/typescript',
	],
	rules: {
		semi: 'off',
		'@typescript-eslint/semi': [2, 'never'],
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
		'@typescript-eslint/explicit-module-boundary-types': 0,
		'@typescript-eslint/explicit-function-return-type': 0,
		'@typescript-eslint/ban-ts-comment': 2,
		'@typescript-eslint/await-thenable': 2,
		'@typescript-eslint/ban-types': 2,
		'@typescript-eslint/class-literal-property-style': 2,
		'@typescript-eslint/naming-convention': 0,
		'@typescript-eslint/no-unused-vars': 2,
		'no-mixed-spaces-and-tabs': 0,
		'@typescript-eslint/no-explicit-any': 2,
		'no-restricted-syntax': [2, "TSAsExpression[typeAnnotation.typeName.name!='const']"],
		'@typescript-eslint/prefer-readonly': 2,
		'@typescript-eslint/prefer-readonly-parameter-types': 0,
		'@typescript-eslint/no-empty-function': [2, { allow: ['arrowFunctions'] }],
		'@typescript-eslint/no-empty-interface': 0,
		'@typescript-eslint/no-non-null-assertion': 2,
		'no-warning-comments': [2, { terms: ['@todo'] }],
		'jest/consistent-test-it': [2, { fn: 'it' }],
		'jest/no-test-prefixes': 2,
		'jest/require-top-level-describe': 2,
		'jest/valid-title': [2, { disallowedWords: ['should'] }],
		'@typescript-eslint/strict-boolean-expressions': [2],
		'import/no-default-export': 2,
		'import/no-extraneous-dependencies': [
			2,
			{
				packageDir: [ROOT, ...Object.values(workspaces.projects).map((p) => path.resolve(ROOT, p))],
				devDependencies: [
					path.resolve(ROOT, './*.@(js|ts|tsx)'),
					...Object.values(workspaces.projects).map((p) =>
						path.resolve(ROOT, `${p}/**/*.@(stories|mock|test|spec).@(ts|tsx|js|jsx)`),
					),
				],
			},
		],
		'import/namespace': 0,
		'import/no-unresolved': 0,
		'unicorn/consistent-function-scoping': 0,
		'unicorn/custom-error-definition': 2,
		'unicorn/filename-case': [
			2,
			{
				case: 'kebabCase',
			},
		],
		'unicorn/no-abusive-eslint-disable': 2,
		'unicorn/no-array-for-each': 2,
		'unicorn/no-array-push-push': 2,
		'unicorn/no-array-reduce': 2,
		'unicorn/no-console-spaces': 0,
		'unicorn/no-instanceof-array': 2,
		'unicorn/no-lonely-if': 2,
		'unicorn/no-nested-ternary': 2,
		'unicorn/no-this-assignment': 2,
		'unicorn/no-unsafe-regex': 2,
		'unicorn/no-zero-fractions': 2,
		'unicorn/prefer-add-event-listener': 2,
		'unicorn/prefer-array-find': 2,
		'unicorn/prefer-array-flat-map': 2,
		'unicorn/prefer-array-index-of': 2,
		'unicorn/prefer-array-some': 2,
		'unicorn/prefer-date-now': 2,
		'unicorn/prefer-dom-node-append': 2,
		'unicorn/prefer-dom-node-dataset': 2,
		'unicorn/prefer-dom-node-remove': 2,
		'unicorn/prefer-dom-node-text-content': 2,
		'unicorn/prefer-includes': 2,
		'unicorn/prefer-keyboard-event-key': 2,
		'unicorn/prefer-modern-dom-apis': 2,
		'unicorn/prefer-reflect-apply': 2,
		'unicorn/prefer-set-has': 2,
		'unicorn/prefer-string-replace-all': 2,
		'unicorn/prefer-string-slice': 2,
		'unicorn/prefer-string-starts-ends-with': 2,
		'unicorn/prefer-string-trim-start-end': 2,
		'unicorn/prefer-ternary': 0,
		'unicorn/prefer-type-error': 2,
		'unicorn/throw-new-error': 2,
		/**
		 * https://eslint.org/docs/rules/no-empty
		 */
		'no-empty': [
			2,
			{
				// allows empty `catch` blocks
				allowEmptyCatch: true,
			},
		],
		eqeqeq: 2,
		'@nrwl/nx/enforce-module-boundaries': [
			'error',
			{
				enforceBuildableLibDependency: true,
				allow: [],
				depConstraints: [
					{
						sourceTag: '*',
						onlyDependOnLibsWithTags: ['*'],
					},
				],
			},
		],
	},
	overrides: [
		{
			files: ['*.js', '*.jsx'],
			// extends: ['plugin:@nrwl/nx/javascript'],
			rules: {
				'@typescript-eslint/no-var-requires': 0,
				'@typescript-eslint/no-unsafe-assignment': 0,
			},
		},
		{
			files: ['jest.config.ts'],
			rules: {
				'import/no-default-export': 'off',
			},
		},
	],
}
