# Contributing

Welcome to the Quantum project! We appreciate your interest in contributing to the project. This document tells you how you can help us improve Quantum.

## Table of Contents

-   [Code of Conduct](#code-of-conduct)
-   [How to Contribute](#how-to-contribute)
    -   [Reporting Bugs](#reporting-bugs)
    -   [Suggesting Improvements](#suggesting-improvements)
    -   [Submitting Pull Requests](#submitting-pull-requests)
-   [Development Process](#development-process)
-   [Style Guide](#style-guide)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue on our [GitHub Issues](https://github.com/Zyrenth/Quantum/issues) page. Provide as much detail as possible, including steps to reproduce the bug, the expected behavior, the browser you are using, and any relevant screenshots or error messages.

### Suggesting Improvements

Since Quantum is still in the early stages of development, we welcome any suggestions for improvements. You can create an issue on our [GitHub Issues](https://github.com/Zyrenth/Quantum/issues) page to suggest new features, enhancements, or changes to existing functionality. Please keep in mind that we may not be able to implement every suggestion.

### Submitting Pull Requests

1. Fork and clone the repository.
2. Create a new branch for your feature or bugfix: `git checkout -b my-feature-branch`
3. Make your changes and commit them with clear and concise commit messages.
4. Push your changes to your fork: `git push origin my-feature-branch`
5. Create a pull request on the main repository. Provide a detailed description of your changes and reference any fixed or related issues.

## Development Process

Check out the [Development Documentation](./docs/development/README.md) to get started with setting up your development environment.

## Style Guide

Please follow the existing code style and conventions used in the project. We use ESLint and Prettier to enforce code quality and formatting. Husky should automatically run these tools when you commit changes, but you can also run them manually with `pnpm lint` where it is available.
