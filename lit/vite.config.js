import {defineConfig} from 'vite';
import {moveHtmlFilesBasedOnRollupOutputPlugin} from "./config/vite/plugins/moveHtmlFilesBasedOnRollupOutput.js";
import {generateManifestPlugin} from "./config/vite/plugins/generateManifest.js";
import {generateAppInfosPlugin} from "./config/vite/plugins/generateAppInfos.js";
import {generateLicensesPlugin} from "./config/vite/plugins/generateLicensesList.js";

export default defineConfig(({mode}) => {
  const targetBrowser = process.env.TARGET || 'chrome';

  return {
    root: '', // Define the new root folder
    build: {
      outDir: './dist', // Exit path (relative to new root)
      emptyOutDir: true, // Empty the output directory before building
      //define input path (relative to new root)
      rollupOptions: {
        input: {
          index: './src/pages/index.html',
          background: './src/background.ts',
          // You can add other files here if needed
        },
        output: {
          entryFileNames: (chunkInfo) => {
            const path = chunkInfo.facadeModuleId.split('/src/').pop();
            const folder = path.substring(0, path.lastIndexOf('/'));
            return folder ? `${folder}/[name].js` : '[name].js';
          },
        },
      }
    },
    plugins: [
      generateManifestPlugin(targetBrowser),
      generateAppInfosPlugin(mode),
      moveHtmlFilesBasedOnRollupOutputPlugin(),
      generateLicensesPlugin(),
      {
        name: 'watch-external',
        async buildStart() {
          // Copy new files added to public/ into dist/
          this.addWatchFile('public');
        }
      }
    ]
  };
});

