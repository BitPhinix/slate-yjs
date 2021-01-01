module.exports = {
  extends: [
    'eslint-config-airbnb-typescript-prettier',
  ],
  rules: {
    'no-underscore-dangle': 'off',
  },
  parserOptions: {
    project: './tsconfig.eslint.json',
  }
};
