import { fileURLToPath } from 'node:url';

import fs from 'fs';
import path from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const dir = process.argv[2];

console.log('[Build]', 'Cleaning up previous build...');

const removeDirectoryRecursive = (dirPath) => {
    if (!fs.existsSync(dirPath)) return;

    fs.readdirSync(dirPath).forEach((file) => {
        const curPath = path.join(dirPath, file);
        if (fs.lstatSync(curPath).isDirectory()) removeDirectoryRecursive(curPath);
        else fs.unlinkSync(curPath);
    });

    fs.rmdirSync(dirPath);
};

const distDirectory = path.join(__dirname, '..', dir);

removeDirectoryRecursive(distDirectory);

console.log('[Build]', 'Cleanup complete.');
