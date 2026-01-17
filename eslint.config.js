// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    plugins: {
      prettier: require('eslint-plugin-prettier'),
    },
    ignores: ['dist/*'],
    rules: {
      // Prettier integration - this will enforce Prettier's formatting
      'prettier/prettier': 'warn',

      'react-hooks/exhaustive-deps': 'off',
      // Quote rules - enforce single quotes with warnings
      quotes: ['warn', 'single'],
      'jsx-quotes': ['warn', 'prefer-single'],

      // Import sorting rules - set to warning level
      'import/order': [
        'warn',
        {
          groups: [
            'builtin', // Node.js built-in modules
            'external', // npm packages
            'internal', // internal modules
            'parent', // parent directory imports
            'sibling', // same directory imports
            'index', // index file imports
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-unresolved': 'off', // Disable for React Native
      'import/extensions': 'off', // Disable for React Native
    },
  },
  // Prettier config - must be last to override other formatting rules
  require('eslint-config-prettier'),
]);
