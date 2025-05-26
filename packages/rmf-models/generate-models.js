import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Khởi tạo __dirname thủ công trong ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rmfMsgs = process.argv.slice(2);

console.log('generate models:');
(async () => {
  execSync(`pipenv run python -m ros_translator -t=typescript -o=lib/ros ${rmfMsgs.join(' ')}`, {
    stdio: 'inherit',
  });
  fs.writeFileSync(
    path.join(__dirname, 'lib', 'ros', 'GENERATED'),
    'THIS DIRECTORY IS GENERATED, DO NOT EDIT!!',
  );
  execSync(`../../node_modules/.bin/prettier -w lib/ros`, { stdio: 'inherit' });
})();
