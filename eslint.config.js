import tseslint from 'typescript-eslint'
import importX from 'eslint-plugin-import-x'
import eslintPluginPrettier from 'eslint-plugin-prettier'

export default tseslint.config(
  {
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
    extends: [tseslint.configs.base],
    plugins: {
      'import-x': importX,
      prettier: eslintPluginPrettier
    },
    rules: {
      '@typescript-eslint/no-implicit-any': 'off',
      'prettier/prettier': 'error'
    }
  },
  {
    ignores: ['**/dist/', '**/temp/', '**/coverage/']
  }
)
