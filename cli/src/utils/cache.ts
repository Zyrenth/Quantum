import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { fail } from './log.js';

interface CacheData {
    [key: string]: {
        remote: string;
        date: number;
        files: {
            [key: string]: {
                hash: string;
                date: number;
            }
        }
    }
}

export default class Cache {
    private static cacheTime = 1000 * 60 * 60 * 24 * 7; // 1 week

    public static getLocalCacheFolder() {
        if (process.platform === 'win32') {
            return process.env.LOCALAPPDATA;
        } else if (process.platform === 'darwin') {
            return process.env.HOME + '/Library/Caches';
        } else {
            return process.env.XDG_CACHE_HOME || process.env.HOME + '/.cache';
        }
    }

    private static cacheFolder = Cache.getLocalCacheFolder() || join(process.cwd(), '.cache');
    private static cacheFile = join(this.cacheFolder, 'quantum-cli', 'cache.json');
    private static cache: CacheData = (() => {
        try {
            const parentFolder = dirname(Cache.cacheFile);

            if (!existsSync(parentFolder)) {
                mkdirSync(parentFolder, { recursive: true });
            }

            if (!existsSync(Cache.cacheFile)) {
                writeFileSync(Cache.cacheFile, '{}');
            }

            if (statSync(Cache.cacheFile).isDirectory()) {
                fail('Cache file is a directory. Cannot continue.', `\n> ${Cache.cacheFile}`);

                process.exit(1);
            }

            return existsSync(Cache.cacheFile) ? JSON.parse(readFileSync(Cache.cacheFile, 'utf-8')) : {};
        } catch (error) {
            return {};
        }
    })();

    private remote: string;
    private remoteHash: string;
    private cachePath;

    constructor(remote: string) {
        this.remote = remote;
        this.remoteHash = createHash('sha256').update(remote).digest('hex');
        this.cachePath = join(Cache.cacheFolder, 'quantum-cli', 'remotes', this.remoteHash);

        if (!existsSync(this.cachePath)) {
            Cache.cache[this.remoteHash] = {
                remote,
                date: Date.now(),
                files: {}
            };

            mkdirSync(this.cachePath, { recursive: true });
        } else if (!Cache.cache[this.remoteHash] && existsSync(this.cachePath)) {
            Cache.cache[this.remoteHash] = {
                remote,
                date: Date.now(),
                files: {}
            };

            rmSync(this.cachePath, { recursive: true });
            mkdirSync(this.cachePath, { recursive: true });
        } else {
            if (!Cache.cache[this.remoteHash]) {
                Cache.cache[this.remoteHash] = {
                    remote,
                    date: Date.now(),
                    files: {}
                };
            }

            Cache.getCache(this.remoteHash).date = Date.now();
        }
    }

    private static getCache(hash: string): CacheData[string] {
        return Cache.cache[hash] as CacheData[string];
    }

    public addFile(path: string[], data: string) {
        const fileHash = createHash('sha256').update(data).digest('hex');
        const fileParent = dirname(join(this.cachePath, fileHash));
        const parentHash = createHash('sha256').update(fileParent).digest('hex');
        const filePath = join(this.cachePath, ...(fileParent === '.' ? [fileHash] : [parentHash, fileHash]));

        Cache.getCache(this.remoteHash).files[JSON.stringify(path)] = {
            hash: fileHash,
            date: Date.now()
        };

        const parentFolder = dirname(filePath);
        if (!existsSync(parentFolder)) {
            mkdirSync(parentFolder, { recursive: true });
        } else if (statSync(parentFolder).isFile()) {
            fail('Parent folder is a file. Cannot continue.', `\n> ${parentFolder}`);
        }

        writeFileSync(filePath, data);
        this.save();
    }

    public getFile(path: string[]) {
        const file = Cache.getCache(this.remoteHash).files[JSON.stringify(path)];

        if (!file) {
            return null;
        }

        if (Date.now() - file.date > Cache.cacheTime) {
            return null;
        }

        const fileParent = dirname(join(this.cachePath, file.hash));
        const parentHash = createHash('sha256').update(fileParent).digest('hex');
        const filePath = join(this.cachePath, ...(fileParent === '.' ? [file.hash] : [parentHash, file.hash]));

        if (!existsSync(filePath)) {
            return null;
        } else if (statSync(filePath).isDirectory()) {
            fail('File is a directory. Cannot continue.', `\n> ${filePath}`);
        }

        const content = readFileSync(filePath, 'utf-8');

        if (file.hash !== createHash('sha256').update(content).digest('hex')) {
            return null;
        }

        return content;
    }

    public removeFile(path: string[]) {
        const file = Cache.getCache(this.remoteHash).files[JSON.stringify(path)];

        if (!file) {
            return;
        }

        const fileParent = dirname(join(this.cachePath, file.hash));
        const parentHash = createHash('sha256').update(fileParent).digest('hex');
        const filePath = join(this.cachePath, ...(fileParent === '.' ? [file.hash] : [parentHash, file.hash]));

        if (existsSync(filePath)) {
            rmSync(filePath);
        }

        delete Cache.getCache(this.remoteHash).files[JSON.stringify(path)];
        this.save();
    }

    public save() {
        writeFileSync(Cache.cacheFile, JSON.stringify(Cache.cache, null, 4));
    }

    public getRemote() {
        return this.remote;
    }

    public getRemoteHash() {
        return this.remoteHash;
    }

    public getCacheFolder() {
        return Cache.cacheFolder;
    }

    public static clearCache() {
        const parentFolder = dirname(Cache.cacheFile);

        if (existsSync(parentFolder)) {
            rmdirSync(parentFolder, { recursive: true });
        }
    }

    public static getSizeInBytes() {
        const parentFolder = dirname(Cache.cacheFile);

        if (!existsSync(parentFolder)) {
            return 0;
        }

        const calculateSize = (folder: string): number => {
            const files = readdirSync(folder);
            let size = 0;

            for (const file of files) {
                const filePath = join(folder, file);
                const stats = statSync(filePath);

                if (stats.isDirectory()) {
                    size += calculateSize(filePath);
                } else {
                    size += stats.size;
                }
            }

            return size;
        };

        return calculateSize(parentFolder);
    }

    public static getTree() {
        const parentFolder = dirname(Cache.cacheFile);

        if (!existsSync(parentFolder)) {
            return {};
        }

        const tree: {
            [key: string]: {
                date: number;
                files: {
                    [key: string]: {
                        size: number;
                        date: number;
                    }
                }
            };
        } = {};

        for (const remoteHash of Object.keys(Cache.cache)) {
            const remote = Cache.getCache(remoteHash);
            const remoteFolder = join(parentFolder, 'remotes', remoteHash);

            tree[remote.remote] = {
                date: remote.date,
                files: {}
            };

            for (const path of Object.keys(remote.files)) {
                const file = remote.files[path];
                const fileParent = dirname(join(remoteFolder, file?.hash ?? ''));
                const parentHash = createHash('sha256').update(fileParent).digest('hex');
                const filePath = join(remoteFolder, ...(fileParent === '.' ? [file?.hash ?? ''] : [parentHash, file?.hash ?? '']));

                // @ts-ignore - Stupid TS thinking it might be undefined
                tree[remote.remote].files[path] = {
                    size: statSync(filePath).size,
                    date: file?.date ?? 0
                };
            }
        }

        return tree;
    }
}
