/* eslint-disable import/no-default-export  */
/* eslint-disable import/no-extraneous-dependencies  */
import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    outDir: 'dist',
    format: ['cjs', 'iife', 'esm'],
    globalName: 'SlateYjsReact',
    platform: 'browser',
    splitting: false,
    bundle: true,
    sourcemap: true,
    dts: false,
    minify: false,
    clean: true,
  },
  {
    entry: ['src'],
    outDir: 'dist',
    format: [],
    platform: 'browser',
    splitting: false,
    bundle: false,
    sourcemap: true,
    dts: true,
    minify: false,
    clean: true,
  },
]);
