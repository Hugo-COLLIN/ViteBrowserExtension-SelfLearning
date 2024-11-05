import fs from "fs";

export function readJsonFile(filePath) {
  const json = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(json);
}

export function writeJsonFile(filePath, data) {
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, json, 'utf8');
}
