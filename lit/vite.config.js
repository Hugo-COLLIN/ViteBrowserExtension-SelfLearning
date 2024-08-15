import { defineConfig } from 'vite';
import webExtension, { readJsonFile } from "vite-plugin-web-extension";

function generateManifest() {
  const manifest = readJsonFile("src/manifest.json");
  const pkg = readJsonFile("package.json");
  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    ...manifest,
  };
}

export default defineConfig({
  root: '', // Define the new root folder
  build: {
    outDir: './dist', // Exit path (relative to new root)
    rollupOptions: {
      input: {
        main: './src/pages/index.html',
        // You can add other HTML files here if needed
      }
    }
  },
  plugins: [
    webExtension({
      manifest: generateManifest,
      watchFilePaths: ["package.json", "manifest.json"],
    }),
    {
      name: 'watch-external',
      async buildStart(){
        // Copy new files added to public/ into dist/
        this.addWatchFile('public');
      }
    }
  ]
});
