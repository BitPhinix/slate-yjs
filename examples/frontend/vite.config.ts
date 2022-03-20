/* eslint-disable import/no-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import windi from 'vite-plugin-windicss';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({ fastRefresh: false }), windi()],
  server: { open: true },
  resolve: {
    dedupe: ['slate', 'slate-react', 'yjs', 'y-protocols'],
  },
});
