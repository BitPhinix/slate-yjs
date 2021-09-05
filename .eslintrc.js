module.exports = {
  extends: ['eslint-config-airbnb-typescript-prettier'],
  rules: {
    'no-restricted-syntax': 'off',
    'no-continue': 'off',
    'no-underscore-dangle': 'off',
    'no-plusplus': 'off',
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'error',
    'consistent-return': 'off',
  },
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
};
