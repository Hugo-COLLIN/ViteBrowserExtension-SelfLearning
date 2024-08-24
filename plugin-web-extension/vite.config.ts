import { defineConfig } from "vite";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";
import {generateLicensesPlugin} from "./config/vite/plugins/generateLicensesList";
import {generateAppInfosPlugin} from './config/vite/plugins/generateAppInfos'
import commonjs from "vite-plugin-commonjs";

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

export default defineConfig(({mode}) => {
  return {
    build: {
      minify: false,
    },
    plugins: [
      commonjs(), // used to compile requires
      webExtension({
        manifest: generateManifest,
        watchFilePaths: ["package.json", "manifest.json"],
        disableAutoLaunch: true,
        browser: process.env.TARGET || "chrome",
      }),
      generateAppInfosPlugin(mode),
      generateLicensesPlugin(),
    ],
  }
});
