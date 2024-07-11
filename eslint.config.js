import { factory } from '@zzxming/eslint-config';

export default factory({
  overrides: [
    {
      rules: {
        'unicorn/prefer-dom-node-dataset': 'off',
      },
    },
  ],
});
