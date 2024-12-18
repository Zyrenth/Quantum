# Contributing to Quantum Components

This document provides a guide to contributing to Quantum Components.

## Table of Contents

-   [Introduction](#introduction)
-   [Setting Up the Development Environment](#setting-up-the-development-environment)
-   [Before modifying a component or utility](#before-modifying-a-component-or-utility)
-   [Adding a Component](#adding-a-component)
-   [Adding a Utility](#adding-a-utility)
-   [Creating a Pull Request](#creating-a-pull-request)

## Introduction

Quantum Components is a collection of components and utilities for use in web development. This document provides a guide to contributing to Quantum Components.

Before contributing, you need to have this repository cloned to your local machine and have the development environment set up.

## Setting Up the Development Environment

You can visit the [Introduction](./creating-a-remote.md#introduction) section of the [Creating a Remote](./creating-a-remote.md) for more information on setting up the development environment.

## Before modifying a component or utility

Please keep in mind that some of the components and utilities are core to the other components and utilities. Before modifying a component or utility, make sure that the changes do not break the existing components and utilities. You can test the changes in the development environment before creating a pull request by following the steps in the [Testing the Remote](./creating-a-remote.md#testing-the-remote) section of the [Creating a Remote](./creating-a-remote.md).

## Adding a Component

You can visit the [Creating a Component](./creating-a-remote.md#creating-a-component) section of the [Creating a Remote](./creating-a-remote.md) for more information on adding a component.

If you are modifying an existing component, install it in the development environment and make the necessary changes then follow the steps in the [Creating a Component](./creating-a-remote.md#creating-a-component) section of the [Creating a Remote](./creating-a-remote.md) to add back the component to the remote in an appropriate format. Please make sure to update the component's version in `quantum.remote.json` based on semantic versioning and update the component's documentation if necessary.

## Adding a Utility

You can visit the [Creating a Utility](./creating-a-remote.md#creating-a-utility) section of the [Creating a Remote](./creating-a-remote.md) for more information on adding a utility.

If you are modifying an existing utility, install it in the development environment and make the necessary changes then follow the steps in the [Creating a Utility](./creating-a-remote.md#creating-a-utility) section of the [Creating a Remote](./creating-a-remote.md) to add back the utility to the remote in an appropriate format. Please make sure to update the utility's version in `quantum.remote.json` based on semantic versioning and update the utility's documentation if necessary.

## Creating a Pull Request

After making the necessary changes, create a pull request to the `main` branch of the repository. The pull request should include a description of the changes made and the reason for the changes. The pull request will be reviewed and merged if the changes are approved and do not break the existing components and utilities.

### Back to [Remote Development](./README.md).

### Back to [Development Documentation](../README.md).
