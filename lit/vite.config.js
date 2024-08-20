import {defineConfig} from 'vite';
import {moveHtmlFilesBasedOnRollupOutputPlugin} from "./config/vite/plugins/moveHtmlFilesBasedOnRollupOutput.js";
import {generateManifestPlugin} from "./config/vite/plugins/generateManifest.js";
import {generateAppInfosPlugin} from "./config/vite/plugins/generateAppInfos.js";
import {generateLicensesPlugin} from "./config/vite/plugins/generateLicensesList.js";
import {watchDir} from "./config/vite/plugins/watchDir.js";
import {disableChunks} from "./config/vite/plugins/disableChunks.js";
import commonjs from "vite-plugin-commonjs";

export default defineConfig(({mode}) => {
  const targetBrowser = process.env.TARGET || 'chrome';

  return {
    root: '', // Define the new root folder
    build: {
      outDir: './dist', // Exit path (relative to new root)
      emptyOutDir: true, // Empty the output directory before building
      minify: false,
      //define input path (relative to new root)
      rollupOptions: {
        input: {
          index: './src/pages/index.html',
          background: './src/scripts/background/background.js',
          tab: './src/scripts/content/tab.js',
          // You can add other files here if needed
        },
        output: {
          // format: 'es',
          // format: 'iife',
          // format: 'umd',
          // format: 'esm',
          entryFileNames: (chunkInfo) => {
            const fileName = chunkInfo.name;
            if (fileName === 'background' || fileName === 'tab') {
              // Place background.js and tab.js at the root of the output directory
              return '[name].js';
            } else {
              const path = chunkInfo.facadeModuleId.split('/src/').pop();
              const folder = path.substring(0, path.lastIndexOf('/'));
              return folder ? `${folder}/[name].js` : '[name].js';
            }
          },
        },
      }
    },
    plugins: [
      commonjs(),
      disableChunks(['./src/scripts/background/background.js', './src/scripts/content/tab.js']),
      generateManifestPlugin(targetBrowser),
      generateAppInfosPlugin(mode),
      moveHtmlFilesBasedOnRollupOutputPlugin(),
      generateLicensesPlugin(),
      watchDir('public')
    ]
  };
});

