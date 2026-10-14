import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Your backend formatting rules adapted for frontend:
      "max-len": ["error", { "code": 132 }],
      "brace-style": ["error", "allman", { "allowSingleLine": true }],
      "comma-spacing": ["error", { "before": false, "after": true }],
      "func-call-spacing": ["error", "never"],
      "indent": ["error", 4, {
        "SwitchCase": 1,
        "VariableDeclarator": 1,
        "ArrayExpression": 1,
        "ObjectExpression": 1,
        "ImportDeclaration": 1,
        "flatTernaryExpressions": false
      }],
      "keyword-spacing": ["error", { "before": true, "after": true, "overrides": {
        "if": { "after": false },
        "for": { "after": false },
        "while": { "after": false }
      }}],
      "no-multi-spaces": ["error"],
      "no-multiple-empty-lines": ["error", { "max": 1 }],
      "object-curly-spacing": ["error", "always"],
      "space-before-blocks": ["error", "always"],
      "space-before-function-paren": ["error", {
        "anonymous": "never",
        "named": "never",
        "asyncArrow": "always"
      }],
      "space-in-parens": ["error", "always"],
      "space-infix-ops": ["error", { "int32Hint": false }],
      "semi": ["error", "always"],

      // Relax TypeScript rules to be less extreme
      '@typescript-eslint/no-explicit-any': 'off', //annoying the fuck out of me...
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },

  // DataStore implementation details must not be exposed outside the module.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/services/dataStore/dataStore.dexie.ts',
      'src/services/dataStore/dataStore.types.ts',
      'src/services/domain/createDomainStore.ts',
      'src/services/domain/joins.ts',
      'src/services/domain/requestState.ts',
      'src/services/realtime/realtime.socketio.ts',
    ],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [
          { name: 'dexie', message: 'Dexie is confined to dataStore.dexie.ts — use the DataStore port.' },
          { name: 'rxjs', message: 'Use Stream<T> from the DataStore port.' },
          { name: 'socket.io-client', message: 'Socket.IO is confined to realtime.socketio.ts — use the Realtime port.' },
        ],
        patterns: ['dexie/*', 'rxjs/*', 'socket.io-client/*'],
      }],
    },
  },
)