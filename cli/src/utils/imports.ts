
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { loadConfig } from 'tsconfig-paths';
import validatePackage from 'validate-npm-package-name';

/**
 * @description Parse imports from a file string.
 * @param fileString The content of the file.
 * @returns The imports in the file.
 */
export function parseImports(fileString: string): string[] {
    const importRegex = /import\s.*?from\s['"](.*?)['"]/gs;
    const imports: string[] = [];

    let match;
    while ((match = importRegex.exec(fileString))) {
        const modulePath = match[1];
        if (!modulePath) continue;

        imports.push(modulePath);
    }

    return imports;
}

/**
 * @description Core modules that should be excluded from the imports.
 */
export const coreModules = [
    'react',
    'react-dom',
    '@types/react',
    '@types/react-dom',
];

/**
 * @description Trim the imports to only include the package name.
 * @param imports The imports to trim.
 * @returns The trimmed imports.
 */
export function trimImports(imports: string[]): string[] {
    return imports.map((modulePath) => {
        return modulePath.split('/').slice(0, 2).join('/');
    });
}

/**
 * @description Filter out core modules and non-packages from the imports.
 * @param imports The imports to filter.
 * @returns The filtered imports.
 */
export function filterImports(imports: string[]): string[] {
    return imports.filter((modulePath) => {
        return [!coreModules.includes(modulePath), validatePackage(modulePath).validForNewPackages].every(Boolean);
    });
}

/**
 * @description Filter out alias placeholder imports.
 * @param imports The imports to filter.
 * @param placeholder The placeholder to filter.
 * @returns The filtered imports.
 */
export function filterPlaceholderImports(imports: string[], placeholder: string, custom?: boolean): string[] {
    return imports.filter((modulePath) => {
        return modulePath.startsWith(!custom ? `<{${placeholder}}>/` : placeholder) /* && modulePath.split('/').length === 2 */;
    }).map((modulePath) => {
        return modulePath.split('/')[2];
    }) as string[];
}

/**
 * @description Get the package imports from a file.
 * @param fileString The content of the file.
 * @returns The imports in the file.
 */
export function getImports(fileString: string): string[] {
    return filterImports(trimImports(parseImports(fileString)));
}

/**
 * @description Get the alias placeholder imports from a file.
 * @param fileString The content of the file.
 * @param placeholder The placeholder to filter.
 * @returns The imports in the file.
 */
export function getPlaceholderImports(fileString: string, placeholder: string, custom?: boolean): string[] {
    return filterPlaceholderImports(parseImports(fileString), placeholder, custom);
}

export const tsConfig = loadConfig() as any;
export const resolvedPaths: {
    [key: string]: string[];
} = {};

for (const path in tsConfig.paths) {
    let paths = tsConfig.paths[path].map((modulePath: string) => {
        return join(tsConfig.absoluteBaseUrl, modulePath.replace(/\*$/, ''));
    });

    const filteredPaths = paths.filter((modulePath: string) => {
        if (!existsSync(modulePath)) return false;
        if (statSync(modulePath).isDirectory()) return true;
    });

    paths = filteredPaths.length === 0 ? [paths[0]] : filteredPaths;

    resolvedPaths[path.replace(/\*$/, '')] = paths;
}

/**
 * @description Resolve an alias inside a path.
 * @param modulePath The path to resolve.
 * @returns The resolved path.
 */
export const resolvePath = (modulePath: string): string | undefined => {
    for (const path in resolvedPaths) {
        if (!modulePath.startsWith(path)) continue;
        if (resolvedPaths[path]?.[0] === undefined) continue;

        return modulePath.replace(path, resolvedPaths[path][0]);
    }

    return undefined;
};
