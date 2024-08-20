import path from "path";
import fs from "fs";

export function moveHtmlFilesBasedOnRollupOutputPlugin() {
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
      if (fs.existsSync(path.resolve(options.dir, 'src'))) {
        console.log('Removing src folder')
        fs.rmdirSync(path.resolve(options.dir, 'src'), {recursive: true});
      }
    }
  };
}
