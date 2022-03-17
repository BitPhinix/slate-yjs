/* eslint-disable import/no-default-export  */
/* eslint-disable import/no-extraneous-dependencies  */
import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src'],
    outDir: 'dist',
    format: ['esm'],
    platform: 'node',
    splitting: false,
    bundle: false,
    sourcemap: false,
    dts: false,
    clean: true,
    loader: {
      '.json': 'json',
    },
  },
]);
