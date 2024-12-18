# Creating a Remote

This document provides a guide to creating your own remote with your own components and utilities.

## Table of Contents

-   [Introduction](#introduction)
-   [Initializing the Remote](#initializing-the-remote)
-   [Configuring the Remote](#configuring-the-remote)
-   [Creating a Component](#creating-a-component)
-   [Creating a Utility](#creating-a-utility)
-   [Placeholders](#placeholders)
-   [Testing the Remote](#testing-the-remote)
-   [Using the Remote](#using-the-remote)

## Introduction

A remote is a collection of components and utilities that can be used in a project. A remote can be created to share components and utilities with others or to keep components and utilities organized in a project.

Before creating a remote, you need to have a development environment AKA. a blank Next.js project set up. If you do not have a Next.js project set up, you can create one by running the following command:

```bash
pnpx create-next-app@latest my-remote
```

```bash
cd my-remote
```

Make sure you are using Typescript with Tailwind CSS and you're using React Server Components. If you are not using these, recreate the Next.js project and select the options for Typescript and Tailwind CSS. To use React Server Components, you need to add `'use client';` to the top of your page files. (`page.tsx`)

## Initializing the Remote

Create a new directory that is not inside the Next.js project directory. This directory will be the root of the remote. Inside this directory, run the following command:

```bash
pnpx quantum-cli remote generate
```

This command will create the necessary files and directories for the remote.

## Configuring the Remote

To configure the remote, you need to update the `quantum.remote.json` file in the root of the remote. The `quantum.remote.json` file contains the following properties:

| Property      | Description                                                                                |
| ------------- | ------------------------------------------------------------------------------------------ |
| `$version`    | The version of the configuration file. (Do not modify it manually.)                        |
| `name`        | The remote repository's name. Maximum 24 characters.                                       |
| `enabled`     | Whether this remote is enabled.                                                            |
| `environment` | The environment in which this remote is used. Can be either `development` or `production`. |
| `paths`       | Paths configuration for various remote directories.                                        |
| `components`  | The components in the remote.                                                              |
| `utils`       | Semantic versioning of the utilities in this remote.                                       |

## Creating a Component

In the Next.js project, create a new directory inside the `src` directory and name it `components`. Inside the `components` directory, create a new file and name it `MyComponent.tsx`. In this file you can write the component code. If you need to use a utility, you can visit the [Creating a Utility](#creating-a-utility) section and import the utility. After writing the component code, you can copy the file to the `src/components` directory in the remote. (The path can be different if you have changed the paths configuration in the `quantum.remote.json` file.) After copying the file, replace parts of the code with placeholders as needed. You can visit the [Placeholders](#placeholders) section for more information. When you are done, you can add the component to the `components` object in the `quantum.remote.json` file. The component object should look like this:

```json
{
    ...,
    "components": {
        ...,
        "MyComponent": {
            "version": "1.0.0",
            "utils": {
                "MyUtility": "1.0.0"
            }
        }
    }
}
```

## Creating a Utility

In the Next.js project, create a new directory inside the `src` directory and name it `utils`. Inside the `utils` directory, create a new file and name it `MyUtility.ts`. In this file you can write the utility code. After writing the utility code, you can copy the file to the `src/utils` directory in the remote. (The path can be different if you have changed the paths configuration in the `quantum.remote.json` file.) When you are done, you can add the utility to the `utils` object in the `quantum.remote.json` file. The utility object should look like this:

```json
{
    ...,
    "utils": {
        ...,
        "MyUtility": "1.0.0"
    }
}
```

If you need to use placeholders in the utility, you can visit the [Placeholders](#placeholders) section for more information.

## Placeholders

Placeholders are used to replace parts of the code with dynamic values. Placeholders are used in components and utilities. There are three types of placeholders: `palette array`, `color by tag` and `path alias`.

### Palette Array

The palette array is used to replace colors in the code in bulk. The palette array is an array of colors that can be used in the code. The palette array is defined in the `quantum.remote.json` file.

To use the palette array placeholder in the code, you can use the following syntax:

```tsx
const classes = cva(
    [...],
    {
        variants: {
            variant: {
                ...,
                /* <<
                '{{color}}': 'bg-{{color}}-soft-light-bg/30 text-{{color}}-soft-light-text dark:bg-{{color}}-soft-dark-bg/20 dark:text-{{color}}-soft-dark-text',
                >> */
            },
        }
    }
);
```

This will replace `{{color}}` with the names of the colors in the palette object. This example will result in the following code:

```tsx
const classes = cva(
    [...],
    {
        variants: {
            variant: {
                ...,
                'success': 'bg-success-soft-light-bg/30 text-success-soft-light-text dark:bg-success-soft-dark-bg/20 dark:text-success-soft-dark-text',
                'danger': 'bg-danger-soft-light-bg/30 text-danger-soft-light-text dark:bg-danger-soft-dark-bg/20 dark:text-danger-soft-dark-text',
            },
        }
    }
);
```

Assuming that the palette object contains `success` and `danger` entries.

For Tailwind color names, you can visit the [Tailwind color names](#tailwind-color-names) section.

### Color by Tag

The color by tag placeholder is used to replace colors in the code based on tags. The palette colors can be tagged, with this placeholder you can replace colors based on the tags.

To use the color by tag placeholder in the code, you can use the following syntax:

```tsx
const classes = cva(
    [...],
    {
        variants: {
            variant: {
                ...,
                /* <<
                '{{tag:dangerColor}}': 'bg-{{tag:dangerColor}}-soft-light-bg/30 text-{{tag:dangerColor}}-soft-light-text dark:bg-{{tag:dangerColor}}-soft-dark-bg/20 dark:text-{{tag:dangerColor}}-soft-dark-text',
                >> */
            },
        }
    }
);
```

This will replace `{{tag:dangerColor}}` with the first name of the color in the palette object that is tagged with `dangerColor`. This example will result in the following code:

```tsx
const classes = cva(
    [...],
    {
        variants: {
            variant: {
                ...,
                'danger': 'bg-danger-soft-light-bg/30 text-danger-soft-light-text dark:bg-danger-soft-dark-bg/20 dark:text-danger-soft-dark-text',
            },
        }
    }
);
```

Assuming that the palette object contains `success` and `danger` entries and the `danger` entry is tagged with `dangerColor`.

For Tailwind color names, you can visit the [Tailwind color names](#tailwind-color-names) section.

### Path Alias

The path alias placeholder is used to replace paths in the code. The paths are defined in the `quantum.remote.json` file.

To use the path alias placeholder in the code, you can use the following syntax:

```tsx
import { MyComponent } from '<{component}>/MyComponent';
```

This will replace `<{component}>` with the path to the components directory in the remote. This example will result in the following code:

```tsx
import { MyComponent } from '@/components/MyComponent';
```

Assuming that the `components` path alias is set to `@/components`.

### Tailwind color names

Available Tailwind color names are:

| Color Name                   | Description                   |
| ---------------------------- | ----------------------------- |
| `{{color}}-soft-light-bg`    | Soft light background color.  |
| `{{color}}-soft-light-text`  | Soft light text color.        |
| `{{color}}-soft-dark-bg`     | Soft dark background color.   |
| `{{color}}-soft-dark-text`   | Soft dark text color.         |
| `{{color}}-solid-light-bg`   | Solid light background color. |
| `{{color}}-solid-light-text` | Solid light text color.       |
| `{{color}}-solid-dark-bg`    | Solid dark background color.  |
| `{{color}}-solid-dark-text`  | Solid dark text color.        |

Solid and soft colors are used for different tones. Soft tone has an opaque background and colorful text, while solid tone has a solid background and white or dark text.

## Testing the Remote

To test the remote before publishing it, you can use the CLI to add the remote to a project by its local path. Follow the steps in the [Using the Remote](#using-the-remote) section to add the remote to a project. Instead of adding the remote by its URL, you can add the remote by its local path. The local path should be the path to the root of the remote. After adding the remote, you can install the components and utilities in the project. This will install the components and utilities from the local path. You can then test the components and utilities in the project.

## Using the Remote

After you have added components and utilities to the remote and added the necessary placeholders, you can publish the remote to GitHub or host it on a HTTP server. To use the remote in a project, you need to add the remote to the `quantum.config.json` file in the root of the project. This can be easily done by using the CLI:

```bash
pnpx quantum-cli remote add
```

This command will prompt you to enter the URL of the remote, for GitHub remotes you can enter the URL in the following format:

```
https://raw.githubusercontent.com/username/repo/branch/
```

or

```
username/repo@branch
```

For HTTP remotes you can enter the URL in the following format:

```
https://example.com/remote/
```

This is if the remote configuration file is located at `https://example.com/remote/quantum.remote.json`.

After adding the remote, you can install the components and utilities in the project. For that you can use the CLI:

```bash
pnpx quantum-cli install
```

This will prompt you to select the remote you want to install the components and utilities from. After selecting the remote, you can select the components you want to install. The CLI will then install the components and utilities with the appropriate packages and will replace the placeholders with the dynamic values.

After installing the components and utilities, you can use them in the project. You can import the components and utilities in the project just like you would import any other component or utility.

### Back to [Remote Development](./README.md).

### Back to [Development Documentation](../README.md).
