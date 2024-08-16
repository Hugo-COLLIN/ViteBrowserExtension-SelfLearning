import { defineConfig } from 'vite';
import path from "path";
import fs from "fs";

export default defineConfig({
  root: '', // Define the new root folder
  build: {
    outDir: './dist', // Exit path (relative to new root)
    rollupOptions: {
      input: {
        index: './src/pages/index.html',
        background: './src/background.ts',
        // You can add other HTML files here if needed
      },
      output: {
        entryFileNames: (chunkInfo) => {
          const path = chunkInfo.facadeModuleId.split('/src/').pop();
          const folder = path.substring(0, path.lastIndexOf('/'));
          return folder ? `${folder}/[name].js` : '[name].js';
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  plugins: [
    generateManifestPlugin('chrome'),
    {
      name: 'watch-external',
      async buildStart(){
        // Copy new files added to public/ into dist/
        this.addWatchFile('public');
      }
    }
  ]
});

function generateManifestPlugin(targetBrowser) {
  return {
    name: 'generate-manifest',
    async buildStart(){
      const srcManifestPath = path.join(__dirname, 'src', 'manifest.json');
      const distManifestPath = path.join(__dirname, 'dist', 'manifest.json');
      const pkgPath = path.join(__dirname, 'package.json');

      const srcManifest = readJsonFile(srcManifestPath);
      const pkg = readJsonFile(pkgPath);

      const manifest = {
        name: pkg.name,
        description: pkg.description,
        version: pkg.version,
        icons: srcManifest.icons,
        background: {},
        ...(targetBrowser === 'chrome' ? {
          manifest_version: 3,
          action: srcManifest['{{chrome}}.action'],
          background: {
            service_worker: srcManifest.background['{{chrome}}.service_worker'].replace('src/', '')
          }
        } : {
          manifest_version: 2,
          browser_action: srcManifest['{{firefox}}.browser_action'],
          background: {
            scripts: srcManifest.background['{{firefox}}.scripts'].map(script => script.replace('src/', ''))
          }
        }),
        host_permissions: [
          "http://localhost/*"
        ],
        content_security_policy: {
          extension_pages: "script-src 'self' 'wasm-unsafe-eval' http://localhost:*; object-src 'self';"
        }
      };

      writeJsonFile(distManifestPath, manifest);
    }
  }
}

function readJsonFile(filePath) {
  const json = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(json);
}

function writeJsonFile(filePath, data) {
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, json, 'utf8');
}
