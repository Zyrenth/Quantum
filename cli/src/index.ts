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

await Promise.all(readdirSync(commandsDir).map(async (file) => {
    if (!file.endsWith('.js')) return;
    program.addCommand((await import(join(commandsDir, file))).default);
}));

program.parse();
