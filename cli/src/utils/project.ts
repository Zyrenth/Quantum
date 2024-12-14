import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import semver from 'semver';

import { Config } from '../interfaces/configs.js';
import { resolvePath } from './imports.js';
import { fail } from './log.js';

export enum InstallStatus {
    NotInstalled = 0,
    FileExistsNotInstalled = 1,
    FileDoesNotExistInstalled = 2,
    NotInstalledAndConflicting = 3,
    FullyInstalled = 4,
}

export enum ValidationResult {
    Passed = 0,
    ConfigurationMissing = 1,
    PathsNotConfigured = 2,
    FormatNotConfigured = 3,
    FormatInvalid = 4,
    RemoteMissing = 5,
    RemoteInvalid = 6,
    TailwindConfigMissing = 7,
    TailwindConfigInvalid = 8,
    PaletteMissing = 9,
    BackgroundsMissing = 10,
    Failed = 11,
}

export default class Project {
    public static readonly defaultConfig: Config = {
        // TODO: Modify this.
        $schema: '...',
        $version: 1,
        remotes: [
            'Zyrenth/Quantum@main',
        ],
        format: 'tsx',
        server_components: false,
        tailwind_config: 'tailwind.config.js',
        palette: {},
        backgrounds: {
            dark: '#000000',
            light: '#ffffff',
        },
        paths: {
            components: '@/components',
            utils: '@/utils',
        },
        components: {},
        utils: {},
    };

    private static config: Config;

    constructor() { }

    private static loadConfig(): void {
        if (Project.config) return;

        try {
            if (!existsSync('quantum.config.json') || statSync('quantum.config.json').isDirectory()) {
                fail('Failed to read configuration file. Using default built-in configuration.', '\n> File does not exist or is a directory.');

                this.config = Project.defaultConfig;

                return;
            }

            this.config = JSON.parse(readFileSync('quantum.config.json', 'utf-8'));
        } catch (error) {
            fail('Failed to read configuration file. Using default built-in configuration.', `\n> ${error}`);
            this.config = Project.defaultConfig;
        }
    }

    public getConfig(): Config {
        Project.loadConfig();
        return Project.config;
    }

    public static getDefaultConfig(): Config {
        return Project.defaultConfig;
    }

    public generateConfig(config: Config): void {
        // @ts-ignore
        delete config.$schema;
        // @ts-ignore
        delete config.$version;

        const defaultConfig = JSON.parse(JSON.stringify(Project.defaultConfig));

        defaultConfig.remotes = [];
        defaultConfig.backgrounds = {};
        defaultConfig.paths = {};

        Project.config = {
            ...defaultConfig,
            ...config,
        };

        Project.save();
    }

    public setRemotes(remotes: string[]): void {
        Project.loadConfig();
        Project.config.remotes = remotes;
        Project.save();
    }

    public setPalette(palette: {
        [key: string]: {
            value: `#${string}`;
            tag?: string;
        };
    }): void {
        Project.loadConfig();
        Project.config.palette = palette;
        Project.save();
    }

    public static save(): void {
        Project.loadConfig();

        writeFileSync('quantum.config.json', JSON.stringify(Project.config, null, 4), 'utf-8');
    }

    public addComponent(localName: string, id: string, remote: string, version: string, content: string): void {
        Project.loadConfig();

        const hash = createHash('sha256').update(content).digest('hex');
        const path = join(resolvePath(Project.config.paths.components) as string, `${localName}.${Project.config.format === 'tsx' ? 'tsx' : 'jsx'}`);

        writeFileSync(path, content, 'utf-8');

        if (!Project.config.components) Project.config.components = {};

        Project.config.components[localName] = {
            remote,
            id,
            version,
            hash,
        };

        Project.save();
    }

    public addUtil(localName: string, id: string, remote: string, version: string, content: string): void {
        Project.loadConfig();

        const hash = createHash('sha256').update(content).digest('hex');
        const path = join(resolvePath(Project.config.paths.utils) as string, `${localName}.${Project.config.format === 'tsx' ? 'ts' : 'js'}`);

        writeFileSync(path, content, 'utf-8');

        if (!Project.config.utils) Project.config.utils = {};

        Project.config.utils[localName] = {
            remote,
            id,
            version,
            hash,
        };

        Project.save();
    }

    public getComponent(id: string, remote?: string): string | null {
        Project.loadConfig();

        const installStatus = this.getComponentInstallStatus(id, remote);

        if (installStatus === InstallStatus.NotInstalled || installStatus === InstallStatus.FileDoesNotExistInstalled) {
            return null;
        }

        const componentData = Object.entries(Project.config?.components ?? {}).find(([, component]) => component.id === id && component.remote === remote);
        const component = !remote ? (Project.config?.components ?? {})[id] !== undefined : componentData?.[1] !== undefined;

        if (componentData !== undefined && componentData?.[1] !== undefined && component !== undefined) {
            id = componentData[0];
        }

        const path = join(resolvePath(Project.config.paths.components) as string, `${id}.${Project.config.format === 'tsx' ? 'tsx' : 'jsx'}`);

        if (!existsSync(path)) {
            return null;
        }

        if (statSync(path).isDirectory()) {
            return null;
        }

        return readFileSync(path, 'utf-8');
    }

    public getUtil(id: string, remote?: string): string | null {
        Project.loadConfig();

        const installStatus = this.getUtilInstallStatus(id, remote);

        if (installStatus === InstallStatus.NotInstalled || installStatus === InstallStatus.FileDoesNotExistInstalled) {
            return null;
        }
        const utilData = Object.entries(Project.config?.utils ?? {}).find(([, util]) => util.id === id && util.remote === remote);
        const util = !remote ? (Project.config?.utils ?? {})[id] !== undefined : utilData?.[1] !== undefined;

        if (utilData !== undefined && utilData?.[1] !== undefined && util !== undefined) {
            id = utilData[0];
        }

        const path = join(resolvePath(Project.config.paths.utils) as string, `${id}.${Project.config.format === 'tsx' ? 'ts' : 'js'}`);

        if (!existsSync(path)) {
            return null;
        }

        if (statSync(path).isDirectory()) {
            return null;
        }

        return readFileSync(path, 'utf-8');
    }

    /**
     * @description Get the install status of a component.
     * @param id The local name of the component.
     * @returns The install status of the component.
     */
    public getComponentInstallStatus(id: string, remote?: string): InstallStatus {
        Project.loadConfig();

        const componentData = Object.entries(Project.config?.components ?? {}).find(([, component]) => component.id === id && component.remote === remote);
        const hasComponent = !remote ? (Project.config?.components ?? {})[id] !== undefined : componentData?.[1] !== undefined;

        if (componentData !== undefined && componentData?.[1] !== undefined && hasComponent !== undefined) {
            id = componentData[0];
        }

        const path = join(resolvePath(Project.config.paths.components) as string, `${id}.${Project.config.format === 'tsx' ? 'tsx' : 'jsx'}`);

        if (hasComponent && existsSync(path) && !statSync(path).isDirectory()) {
            return InstallStatus.FullyInstalled;
        } else if (hasComponent && !existsSync(path)) {
            return InstallStatus.FileDoesNotExistInstalled;
        } else if (!hasComponent && existsSync(path) && !statSync(path).isDirectory()) {
            if (Object.entries(Project.config?.components ?? {}).some(([name, component]) => Object.keys(Project.config?.components ?? {}).some(cn => name.toLowerCase() === cn.toLowerCase()) && component.remote !== remote)) {
                return InstallStatus.NotInstalledAndConflicting;
            } else {
                return InstallStatus.FileExistsNotInstalled;
            }
        } else {
            return InstallStatus.NotInstalled;
        }
    }

    /**
     * @description Get the install status of a util.
     * @param id The local name of the util.
     * @returns The install status of the util.
     * @status 0 - Not installed.
     * @status 1 - File exists, but not installed.
     * @status 2 - Installed, but file does not exist.
     * @status 3 - Fully installed.
     */
    public getUtilInstallStatus(id: string, remote?: string): InstallStatus {
        Project.loadConfig();

        const utilData = Object.entries(Project.config?.utils ?? {}).find(([, util]) => util.id === id && util.remote === remote);
        const hasUtil = !remote ? (Project.config?.utils ?? {})[id] !== undefined : utilData?.[1] !== undefined;

        if (utilData !== undefined && utilData?.[1] !== undefined && hasUtil !== undefined) {
            id = utilData[0];
        }

        const path = join(resolvePath(Project.config.paths.utils) as string, `${id}.${Project.config.format === 'tsx' ? 'ts' : 'js'}`);

        if (hasUtil && existsSync(path) && !statSync(path).isDirectory()) {
            return InstallStatus.FullyInstalled;
        } else if (hasUtil && !existsSync(path)) {
            return InstallStatus.FileDoesNotExistInstalled;
        } else if (!hasUtil && existsSync(path) && !statSync(path).isDirectory()) {
            if (Object.entries(Project.config?.utils ?? {}).some(([name, util]) => Object.keys(Project.config?.utils ?? {}).some(un => name.toLowerCase() === un.toLowerCase()) && util.remote !== remote)) {
                return InstallStatus.NotInstalledAndConflicting;
            } else {
                return InstallStatus.FileExistsNotInstalled;
            }
        } else {
            return InstallStatus.NotInstalled;
        }
    }

    public isComponentInstalled(id: string, remote?: string): boolean {
        return this.getComponentInstallStatus(id, remote) === InstallStatus.FullyInstalled;
    }

    public isUtilInstalled(id: string, remote?: string): boolean {
        return this.getUtilInstallStatus(id, remote) === InstallStatus.FullyInstalled;
    }

    public verifyComponentIntegrity(localName: string): boolean {
        Project.loadConfig();

        if (!Project.config.components) return false;

        const component = Project.config.components[localName];
        const path = join(resolvePath(Project.config.paths.components) as string, `${localName}.${Project.config.format === 'tsx' ? 'tsx' : 'jsx'}`);

        if (!existsSync(path)) return false;
        if (statSync(path).isDirectory()) return false;

        const content = readFileSync(path, 'utf-8');
        const hash = createHash('sha256').update(content).digest('hex');

        return hash === component?.hash;
    }

    public verifyUtilIntegrity(localName: string): boolean {
        Project.loadConfig();

        if (!Project.config.utils) return false;

        const util = Project.config.utils[localName];
        const path = join(resolvePath(Project.config.paths.utils) as string, `${localName}.${Project.config.format === 'tsx' ? 'ts' : 'js'}`);

        if (!existsSync(path)) return false;
        if (statSync(path).isDirectory()) return false;

        const content = readFileSync(path, 'utf-8');
        const hash = createHash('sha256').update(content).digest('hex');

        return hash === util?.hash;
    }

    public isComponentUpToDate(localName: string, version: string): boolean {
        Project.loadConfig();
        return !semver.gt(version, Project.config.components?.[localName]?.version ?? '0.0.0');
    }

    public isUtilUpToDate(localName: string, version: string): boolean {
        Project.loadConfig();
        return !semver.gt(version, Project.config.utils?.[localName]?.version ?? '0.0.0');
    }

    public getComponentId(localName: string): string {
        Project.loadConfig();
        return Project.config.components?.[localName]?.id ?? localName;
    }

    public getUtilId(localName: string): string {
        Project.loadConfig();
        return Project.config.utils?.[localName]?.id ?? localName;
    }

    public removeComponent(localName: string): void {
        Project.loadConfig();

        const path = join(resolvePath(Project.config.paths.components) as string, `${localName}.${Project.config.format === 'tsx' ? 'tsx' : 'jsx'}`);

        if (existsSync(path)) {
            if (statSync(path).isDirectory()) {
                return;
            }

            unlinkSync(path);
        }

        if (Project.config.components) delete Project.config.components[localName];
        Project.save();
    }

    public removeUtil(localName: string): void {
        Project.loadConfig();

        const path = join(resolvePath(Project.config.paths.utils) as string, `${localName}.${Project.config.format === 'tsx' ? 'ts' : 'js'}`);

        if (existsSync(path)) {
            if (statSync(path).isDirectory()) {
                return;
            }

            unlinkSync(path);
        }

        if (Project.config.utils) delete Project.config.utils[localName];
        Project.save();
    }

    public validate(): ValidationResult {
        Project.loadConfig();

        if (!existsSync('quantum.config.json') || statSync('quantum.config.json').isDirectory()) {
            return ValidationResult.ConfigurationMissing;
        }

        if (
            !Project.config.paths ||
            (!Project.config.paths.components || !Project.config.paths.utils) ||
            (!resolvePath(Project.config.paths.components) || !resolvePath(Project.config.paths.utils)) ||
            (!existsSync(resolvePath(Project.config.paths.components) as string) || !existsSync(resolvePath(Project.config.paths.utils) as string))
        ) {
            return ValidationResult.PathsNotConfigured;
        }

        if (Project.config.format !== 'tsx' && Project.config.format !== 'jsx') {
            return ValidationResult.FormatInvalid;
        }

        if (!Project.config.remotes || Project.config.remotes.length === 0) {
            return ValidationResult.RemoteMissing;
        }

        if (!Project.config.tailwind_config) {
            return ValidationResult.TailwindConfigMissing;
        }

        if (!existsSync(Project.config.tailwind_config) || statSync(Project.config.tailwind_config).isDirectory()) {
            return ValidationResult.TailwindConfigInvalid;
        }

        if (!Project.config.palette) {
            return ValidationResult.PaletteMissing;
        }

        if (!Project.config.backgrounds || !Project.config.backgrounds.dark || !Project.config.backgrounds.light) {
            return ValidationResult.BackgroundsMissing;
        }

        return ValidationResult.Passed;
    }
}
