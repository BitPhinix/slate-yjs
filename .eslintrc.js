module.exports = {
  extends: [
    'eslint-config-airbnb-typescript-prettier',
  ],
  rules: {
    'no-underscore-dangle': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
  parserOptions: {
    project: './tsconfig.eslint.json',
  }
};
