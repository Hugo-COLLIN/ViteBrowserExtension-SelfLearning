import path from "path";

import {readJsonFile, writeJsonFile} from "./jsonUtils.js";

export function generateAppInfosPlugin(app_mode) {
  return {
    name: 'generate-app-infos',
    async generateBundle() {
      //TODO se baser sur infos.json pour générer manifest.json
      const distAppInfosPath = path.join(process.cwd(), 'dist', 'infos.json');
      const pkgPath = path.join(process.cwd(), 'package.json');
      const infosPath = path.join(process.cwd(), 'src', 'infos.json');

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
