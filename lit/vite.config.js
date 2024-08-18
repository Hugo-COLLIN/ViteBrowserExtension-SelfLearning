import {defineConfig, loadEnv} from 'vite';
import path from "path";
import fs from "fs";
import { exec } from 'child_process';

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
      rollupOutputBasedHtmlFilesLocationPlugin(),
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

function rollupOutputBasedHtmlFilesLocationPlugin() {
  return {
    name: 'move-html-files-based-on-rollup-output',
    writeBundle(options, bundle) {
      Object.keys(bundle).forEach(fileName => {
        if (fileName.endsWith('.html')) {
          const srcPath = path.resolve(options.dir, fileName);
          // destPath is srcPath but without the 'src/' part
          const destPath = path.resolve(options.dir, fileName.replace('src/', ''));
          // const destPath = path.resolve(options.dir, path.dirname(fileName), 'pages', path.basename(fileName));
          fs.mkdirSync(path.dirname(destPath), {recursive: true});
          fs.renameSync(srcPath, destPath);
        }
      });
      fs.rmdirSync(path.resolve(options.dir, 'src'), {recursive: true});
    }
  };
}

function generateManifestPlugin(targetBrowser) {
  return {
    name: 'generate-manifest',
    async generateBundle() {
      const srcManifestPath = path.join(__dirname, 'src', 'manifest.json');
      const distManifestPath = path.join(__dirname, 'dist', 'manifest.json');
      const pkgPath = path.join(__dirname, 'package.json');

      const srcManifest = readJsonFile(srcManifestPath);
      const pkg = readJsonFile(pkgPath);

      const mv = srcManifest[`{{${targetBrowser}}}.manifest_version`];

      // --- Manifest version depending attributes ---
      let mvAttributes = {};
      if (mv === 3)
        mvAttributes = {
          action: srcManifest[`{{${targetBrowser}}}.action`],
          host_permissions: srcManifest.host_permissions || ["http://localhost/*"],
        }
      else if (mv === 2)
        mvAttributes = {
          browser_action: srcManifest[`{{${targetBrowser}}}.action`]
        }
      // --- End of manifest version depending attributes ---

      // --- Browser depending attributes ---
      let browserAttributes = {};
      if (targetBrowser === 'firefox')
        browserAttributes = {
          background: {
            scripts: srcManifest.background['{{firefox}}.scripts']
          },
          ...(srcManifest['browser_specific_settings']['gecko'] && {
            browser_specific_settings: {
              gecko: srcManifest['browser_specific_settings']['gecko']
            }
          })
        }
      else if (targetBrowser === 'chrome')
        browserAttributes = {
          background: {
            service_worker: srcManifest.background['{{chrome}}.service_worker']
          }
        }
      // --- End of browser depending attributes ---

      const manifest = {
        manifest_version: mv,
        name: srcManifest['name'] || pkg.name,
        version: pkg.version,
        description: pkg.description,
        icons: srcManifest.icons,
        content_scripts: srcManifest.content_scripts,
        web_accessible_resources: srcManifest.web_accessible_resources,
        permissions: srcManifest.permissions,
        content_security_policy: srcManifest.content_security_policy && mv === 3
          ? {extension_pages: srcManifest.content_security_policy}
          : srcManifest.content_security_policy,
        ...mvAttributes,
        ...browserAttributes,
      };

      writeJsonFile(distManifestPath, manifest);
    }
  }
}

function generateAppInfosPlugin(app_mode) {
  return {
    name: 'generate-app-infos',
    async generateBundle() {
      //TODO se baser sur infos.json pour générer manifest.json
      const distAppInfosPath = path.join(__dirname, 'dist', 'infos.json');
      const pkgPath = path.join(__dirname, 'package.json');
      const infosPath = path.join(__dirname, 'src', 'infos.json');

      const pkg = readJsonFile(pkgPath);

      const appInfos = {
        "APP_VERSION": pkg.version,
        "APP_DESCRIPTION": pkg.description,
        ...(app_mode === 'production'
          ? {"APP_MODE": 'prod'}
          : {"APP_MODE": 'dev'}
        ),
        ...infosPath && readJsonFile(infosPath)
      };

      writeJsonFile(distAppInfosPath, appInfos);
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

function generateLicensesPlugin() {
  return {
    name: 'generate-licenses',
    async buildStart() {
      exec('npx license-checker --production --json', (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }

        const licenses = JSON.parse(stdout);

        let formatted = '';
        for (let dep in licenses) {
          formatted += `${dep}\n`;

          // Filter out 'path' and 'licenseFile' before the loop
          let props = Object.keys(licenses[dep]).filter(prop => prop !== 'path' && prop !== 'licenseFile');

          for (let i = 0; i < props.length; i++) {
            let prop = props[i];
            let prefix = (i === props.length - 1) ? '└─' : '├─';
            formatted += `${prefix} ${prop}: ${licenses[dep][prop]}\n`;
          }
          formatted += '\n';
        }


        fs.writeFileSync(path.join('dist/', 'licenses.txt'), formatted);
      });
    }
  };

}
