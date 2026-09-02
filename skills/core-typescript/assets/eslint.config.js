// Baseline ESLint flat config for the `core-typescript` skill.
// Referenced from SKILL.md (Configure mode). It matches the `lint` Ruleset group:
// typescript-eslint running type-checked, the four named rules explicitly on, and
// formatting left entirely to Prettier.
//
// Install: eslint typescript-eslint eslint-config-prettier  (and Prettier).

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,

  // `strict-type-checked` matches this skill's stance. Drop to
  // `...tseslint.configs.recommendedTypeChecked` only if strict is too noisy to
  // adopt at once — it is the softer floor the `lint` reference names.
  ...tseslint.configs.strictTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        // Type-aware linting needs the program. `projectService` is the modern
        // form of `parserOptions.project`.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Named explicitly by the `lint` Ruleset — keep them on even though
      // `strict-type-checked` already enables most.
      '@typescript-eslint/no-floating-promises': 'error', // -> async
      '@typescript-eslint/no-explicit-any': 'error', // -> unsafe-types
      '@typescript-eslint/consistent-type-imports': 'error', // -> modules
      '@typescript-eslint/switch-exhaustiveness-check': 'error', // -> narrowing
    },
  },

  // Must be last: turns off every rule that would fight Prettier, so style is
  // never a lint or review topic.
  prettier,
);
