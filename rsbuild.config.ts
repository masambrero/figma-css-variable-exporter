import { defineConfig } from '@rsbuild/core';
import path from 'path';

export default defineConfig({
  source: {
    entry: {
      code: {
        import: path.resolve(__dirname, './src/code.ts'),
        html: false,
      },
      ui: path.resolve(__dirname, './src/index.ts'),
    },
  },
  html: {
    title: 'CSS Variable Exporter',
    template: path.resolve(__dirname, './src/index.html'),
    inject: 'body',
    appIcon: {
      name: 'CSS Variable Exporter',
      icons: [{ src: path.resolve(__dirname, './public/icon.png'), size: 192 }],
    },
  },
  output: {
    inlineScripts: true,
    injectStyles: true,
    filenameHash: false,
    distPath: {
      js: '',
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  performance: {
    buildCache: true,
  },
});
