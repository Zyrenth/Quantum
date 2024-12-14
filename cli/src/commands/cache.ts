
import { join } from 'node:path';

import { Command } from 'commander';
import { createSpinner } from 'nanospinner';
import prompts from 'prompts';

import { default as UCache } from '../utils/cache.js';
import { info, item } from '../utils/log.js';
import Project from '../utils/project.js';
import { Remote } from '../utils/remote.js';
import { trycatch } from '../utils/trycatch.js';

class Cache {
    private project: Project;
    private remote: Remote;

    private spinner = createSpinner('');

    constructor() {
        this.project = new Project();

        this.remote = new Remote(Project.getDefaultConfig());
    }

    build() {
        return new Command()
            .name('cache')
            .description('Manage the local remote cache.')
            .addCommand(
                new Command()
                    .name('clear')
                    .description('Clear the local remote cache.')
                    .option('-y, --yes', 'Skip all prompts and use default values.')
                    .action((...args: any[]) => {
                        // @ts-ignore
                        this.clear(...args);
                    }),
                {}
            )
            .addCommand(
                new Command()
                    .name('info')
                    .description('Get information about the local remote cache.')
                    .action((...args: any[]) => {
                        // @ts-ignore
                        this.info(...args);
                    }),
                {
                    isDefault: true,
                }
            );
    }

    async clear(options: {
        yes: boolean;
    }) {
        const failTask = this.spinner.error;
        const concludeTask = this.spinner.success;

        const confirm = options.yes ? { value: true } : await prompts({
            type: 'confirm',
            name: 'value',
            message: 'Are you sure you want to clear the local remote cache?',
        }, {
            onCancel: () => {
                process.exit(1);
            },
        });

        if (!confirm.value) {
            failTask({
                text: 'Aborted clearing the local remote cache.',
            });

            process.exit(1);
        }

        UCache.clearCache();

        concludeTask({
            text: 'Cleared the local remote cache.',
        });

        process.exit(0);
    }

    async info() {
        const cacheTree = UCache.getTree();

        info('Full cache size:', '\x1b[96m' + this.bytesToSize(UCache.getSizeInBytes()) + '\x1b[0m');

        const sizes = [];
        for (const remoteData of Object.values(cacheTree)) {
            const overallSize = this.filesToSize(remoteData.files);
            if (overallSize > 0) {
                sizes.push(overallSize);
            }
        }

        sizes.sort((a, b) => a - b);
        const lowThreshold = sizes[Math.floor(sizes.length / 3)] || Infinity;
        const midThreshold = sizes[Math.floor((sizes.length * 2) / 3)] || Infinity;

        for (const [remote, remoteData] of Object.entries(cacheTree).sort(([, ct1], [, ct2]) => this.filesToSize(ct2.files) - this.filesToSize(ct1.files))) {
            const overallSize = this.filesToSize(remoteData.files);

            if (overallSize === 0) continue;

            let color;
            if (overallSize > midThreshold) {
                color = '\x1b[31m';
            } else if (overallSize > lowThreshold) {
                color = '\x1b[33m';
            } else {
                color = '\x1b[32m';
            }

            console.log(`\n${color}${remote} \x1b[90m(${this.bytesToSize(overallSize)})\x1b[0m:`);

            for (const [path, component] of Object.entries(remoteData.files)) {
                const [, error] = await trycatch(async () => item(join(...JSON.parse(path)), '\x1b[96m' + this.bytesToSize(component.size), '\x1b[90m' + new Date(component.date).toLocaleString() + '\x1b[0m'));

                if (error) {
                    item('\x1b[31m✖', path, '\x1b[96m' + this.bytesToSize(component.size), '\x1b[90m' + new Date(component.date).toLocaleString() + '\x1b[0m');
                }
            }
        }
    }

    private bytesToSize(bytes: number) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

        if (bytes === 0) {
            return '0 Byte';
        }

        const i = Math.floor(Math.log(bytes) / Math.log(1024));

        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    }

    private filesToSize(files: { [key: string]: { size: number } }) {
        return [0, ...Object.values(files).map(f => f.size)].reduce((a, b) => a + b, 0);
    }
}

export default new Cache().build();
