import { writeFileSync } from 'node:fs';

import { detect } from 'detect-package-manager';
import { execa } from 'execa';
import { createSpinner } from 'nanospinner';

import { trycatch } from './trycatch.js';

/**
 * @description Installs packages using the detected package manager.
 * @param packages The packages to install.
 * @param dev Whether to install the packages as dev dependencies.
 * @param onFail The function to run when the installation fails.
 */
export const installPackages = async (packages: string[], dev: boolean, onFail: Function) => {
    const spinner = createSpinner('Installing packages...');

    const pm = await detect();
    const [, err] = await trycatch(() => execa(pm, [pm === 'npm' ? 'install' : 'add', dev ? '-D' : '', ...packages], {
        cwd: process.cwd(),
    }));

    if (err) {
        spinner.error({
            text: 'Failed to install packages. Log file has been saved to quantum-install.log.',
        });

        writeFileSync('quantum-install.log', err.stdout, 'utf-8');

        return onFail();
    }
};

/**
 * @description Uninstalls packages using the detected package manager.
 * @param packages The packages to uninstall.
 * @param onFail The function to run when the uninstallation fails.
 */
export const uninstallPackages = async (packages: string[], onFail: Function) => {
    const spinner = createSpinner('Uninstalling packages...');

    const pm = await detect();
    const [, err] = await trycatch(() => execa(pm, [pm === 'npm' ? 'uninstall' : 'remove', ...packages], {
        cwd: process.cwd(),
    }));

    if (err) {
        spinner.error({
            text: 'Failed to uninstall packages. Log file has been saved to quantum-uninstall.log.',
        });

        writeFileSync('quantum-uninstall.log', err.stdout, 'utf-8');

        return onFail();
    }
};
