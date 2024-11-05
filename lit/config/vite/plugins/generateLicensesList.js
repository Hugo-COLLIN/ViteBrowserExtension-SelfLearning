import {exec} from "child_process";
import fs from "fs";
import path from "path";

export function generateLicensesPlugin() {
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
