import {defineConfig} from 'vite';
import {moveHtmlFilesBasedOnRollupOutputPlugin} from "./config/vite/plugins/moveHtmlFilesBasedOnRollupOutput.js";
import {generateManifestPlugin} from "./config/vite/plugins/generateManifest.js";
import {generateAppInfosPlugin} from "./config/vite/plugins/generateAppInfos.js";
import {generateLicensesPlugin} from "./config/vite/plugins/generateLicensesList.js";
import {watchDir} from "./config/vite/plugins/watchDir.js";
import {disableChunks} from "./config/vite/plugins/disableChunks.js";
import inlineChunksPlugin from "./config/vite/plugins/inlineChunks.js";

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
          // tab: './src/tab.ts',
          tab: './src/scripts/content/tab.js',
          // You can add other files here if needed
        },
        output: {
          // format: 'es',
          // format: 'iife',
          // format: 'umd',
          // format: 'esm',
          entryFileNames: (chunkInfo) => {
            const path = chunkInfo.facadeModuleId.split('/src/').pop();
            const folder = path.substring(0, path.lastIndexOf('/'));
            return folder ? `${folder}/[name].js` : '[name].js';
          },
          // manualChunks: () => 'all-in-one',
          // preserveModules: true,
          // manualChunks: {},
          // inlineDynamicImports: false,
          // preserveEntrySignatures: 'strict',
        },
        // preserveEntrySignatures: 'strict',
        // inlineDynamicImports: true,
      }
    },
    plugins: [
      // {
      //   name: "hackly resolve modules for disabling code-splitting",
      //   enforce: "pre",
      //   resolveId(source, importer, options) {
      //     return this.resolve(source, importer, { skipSelf: true }).then(resolved => {
      //       if (resolved && targets.some(file => resolved.id.includes(file))) {
      //         return { id: `${resolved.id}?unique=${Math.random()}`, moduleSideEffects: 'no-treeshake' };
      //       }
      //       return resolved;
      //     });
      //   },
      //   load(id) {
      //     if (id.endsWith("src/share/presetColors.ts?is_copied")) {
      //       return readFile("src/share/presetColors.ts", "utf-8");
      //     }
      //   },
      // },
      disableChunks(['./src/scripts/background/background.js', './src/scripts/content/tab.js']),
      // inlineChunksPlugin(),
      generateManifestPlugin(targetBrowser),
      generateAppInfosPlugin(mode),
      moveHtmlFilesBasedOnRollupOutputPlugin(),
      generateLicensesPlugin(),
      watchDir('public')
    ]
  };
});

