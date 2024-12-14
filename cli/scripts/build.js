import { readdirSync, statSync, watch as watchDir } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import esbuild from 'esbuild';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

let args = process.argv.slice(2);
const watch = args.includes('--watch');
if (watch) args = args.filter(script => script !== '--watch');

async function findFiles(dir, ext) {
    let results = [];

    try {
        const list = readdirSync(dir);

        for (const file of list) {
            const filePath = join(dir, file);
            const fileStat = statSync(filePath);

            if (fileStat.isDirectory()) {
                results = results.concat(await findFiles(filePath, ext));
            } else if (extname(file) === ext) {
                results.push(filePath);
            }
        }
    } catch (err) {
        // Slient error, skip.
    }

    return results;
}

async function build(files, exit = true) {
    console.log('Building...');

    const start = Date.now();
    const basePath = join(__dirname, '..');

    try {
        await esbuild.build({
            entryPoints: files,
            bundle: false,
            outdir: join(__dirname, '..', 'dist'),
            platform: 'node',
            target: 'esnext',
            format: 'esm',
            sourcemap: true,
            packages: 'external',
        });
    } catch (err) {
        console.error('[ESBuild]', err);
        if (exit) process.exit(1);
    }

    console.log([
        '',
        `Built ${files.length} files:`,
        files.map(file => `  - ${file.replace(basePath, '')}`).join('\n'),
        ''
    ].join('\n'));

    console.log(`Build completed in ${Date.now() - start}ms.`);
}

const srcDir = join(__dirname, '..', args[0] ?? 'src');

const files = await findFiles(srcDir, args[1] ?? '.ts');

if (watch) {
    let lastBuild = Date.now();

    watchDir(srcDir, { recursive: true }, async (_, filename) => {
        if (Date.now() - lastBuild < 1000) return;
        lastBuild = Date.now();

        console.log(`File changed: ${filename}`);

        const files = await findFiles(srcDir, args[1] ?? '.ts');
        await build(files, false);
    });
} else build(files);
