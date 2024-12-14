export type RemoteUrl = `${string}/${string}@${string}` | `http://${string}` | `https://${string}` | `/${string}` | string;

/**
 * @description Configuration interface for a project.
 */
export interface Config {
    /**
     * @description The schema of the configuration file.
     */
    $schema: string;

    /**
     * @description The version of the configuration file. (Do not modify it manually.)
     */
    $version: number;

    /**
     * @description The remote repository and branch to pull components from.
     * @example "Zyrenth/Quantum@main"
     * remote: `${string}/${string}@${string}`;
     * @example "<user|org>/<repo>@<branch>"
     */
    remotes: RemoteUrl[];

    /**
     * @description The file format of the components.
     */
    format: 'tsx' | 'jsx';

    /**
     * @description Whether to use server-side components.
     */
    server_components: boolean;

    /**
     * @description The path to the Tailwind CSS configuration file.
     */
    tailwind_config: string;

    /**
     * @description The color palette for the components.
     */
    palette: {
        [key: string]: {
            value: `#${string}`,
            tag?: string;
        };
    };

    /**
     * @description The main background colors of your app.
     */
    backgrounds: {
        [key: string]: `#${string}`;
    }

    /**
     * @description The paths to the components and utilities. (Make sure to configure it in tsconfig.json or jsconfig.json as well.)
     */
    paths: {
        components: string;
        utils: string;
        [key: string]: string;
    };

    /**
     * @description The installed components in the project. (Used for tracking and updating. Do not modify it manually.)
     */
    components?: {
        [key: string]: {
            /**
             * @description The remote repository and branch to pull the component from. (Used for tracking and updating. Do not modify it manually.)
             */
            remote: RemoteUrl;

            /**
             * @description The remote name of the component. (Used for tracking and updating. Do not modify it manually.)
             */
            id: string;

            /**
             * @description The semantic version of the component.
             */
            version: string;

            /**
             * @description The hash of the component. (Used for tracking and updating. Do not modify it manually.)
             */
            hash: string;
        };
    };

    /**
     * @description The installed utilities in the project. (Used for tracking and updating. Do not modify it manually.)
     */
    utils?: {
        [key: string]: {
            /**
             * @description The remote repository and branch to pull the utility from. (Used for tracking and updating. Do not modify it manually.)
             */
            remote: RemoteUrl;

            /**
             * @description The remote name of the utility. (Used for tracking and updating. Do not modify it manually.)
             */
            id: string;

            /**
             * @description The semantic version of the utility.
             */
            version: string;

            /**
            * @description The hash of the utility. (Used for tracking and updating. Do not modify it manually.)
            */
            hash: string;
        };
    };
}

/**
 * @description Configuration interface for a remote repository.
 */
export interface RemoteConfig {
    /**
     * @description The version of the configuration file. (Do not modify it manually.)
     */
    $version: number;

    /**
     * @description The remote repository's name. Maximum 24 characters.
     */
    name: string;

    /**
     * @description Whether this remote is enabled.
     */
    enabled: boolean;

    /**
     * @description The environment in which this remote is used.
     */
    environment: 'development' | 'production';

    /**
     * @description Paths configuration for various remote directories.
     */
    paths: {
        components: string;
        utils: string;
        [key: string]: string;
    };

    /**
     * @description The components in the remote.
     */
    components: {
        [key: string]: {
            /**
             * @description The semantic version of the component.
             * @example "1.0.0"
             */
            version: string;
            /**
             * @description The utilities used in the component requiring a specific version.
             */
            utils: {
                /**
                 * @description The utility version required by the component.
                 * @example "1.0.0"
                 */
                [key: string]: string;
            }
        }
    };

    /**
     * @description Semantic versioning of the utilities in this remote.
     */
    utils: {
        [key: string]: string;
    };
}
