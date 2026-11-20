import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: { SUPPRESS_NO_CONFIG_WARNING: 'true' },
  },
});
