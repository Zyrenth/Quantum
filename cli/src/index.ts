import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { Command } from 'commander';

import { fail, info } from './utils/log.js';
import { trycatch } from './utils/trycatch.js';

declare global {
    namespace NodeJS {
        interface Process {
            packageVersion: string;
        }
    }
}

const program = new Command();

const [packageVersion] = await trycatch(async () => JSON.parse(readFileSync(join(import.meta.dirname, '..', 'package.json'), 'utf-8')).version);

process.packageVersion = packageVersion ?? '1.0.0';

program
    .name('quantum-cli')
    .version(process.packageVersion, '-v, --version', 'Output the current version')
    .description('CLI for Quantum Components')
    .option('-cwd, --current-working-directory <path>', 'Specify the current working directory', (path) => {
        if (!existsSync(path) || statSync(path).isFile()) {
            fail('Invalid path. Please specify a valid path to a folder.');
            process.exit(1);
        }

        process.chdir(path);

        info(`Working directory for this command is set to ${process.cwd()}`);
    });

const commandsDir = join(import.meta.dirname, 'commands');

function toFileUrl(filePath: string) {
    if (process.platform === 'win32') {
        const resolvedPath = join(filePath).replace(/\\/g, '/');
        return `file:///${resolvedPath}`;
    }

    return filePath;
}

await Promise.all(readdirSync(commandsDir).map(async (file) => {
    if (!file.endsWith('.js')) return;
    const fileUrl = toFileUrl(join(commandsDir, file));
    program.addCommand((await import(fileUrl)).default);
}));

program.parse();
