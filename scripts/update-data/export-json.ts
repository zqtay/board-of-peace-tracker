import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OUTPUT_FILE_PATH } from "./constant";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const main = (data: Object) => {
  // Write to /public/data.json
  const outputPath = path.join(__dirname, OUTPUT_FILE_PATH);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
};

export default main;