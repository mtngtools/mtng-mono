# Package Directory

Dependency management is hard. In order for each reference solution to minimize dependencies, components are broken down into smaller, more manageable pieces.

Ultimately the packages will be groups into multiple monorepos, but initially a single monorepo will be used for most packages.

## UTILS

Domain-agnostic technical libraries and helpers. External dependencies limited to types and interfaces.

| Package | Description | Repo | Status |
| :--- | :--- | :--- | :--- |
| `utils-core` | Core utility functions shared across packages. | [mtng-mono](https://github.com/mtngtools/mtng-mono) | alpha |
| `utils-hls-types`¹ | Core types and interfaces for HLS utilities. | [hls](https://github.com/mtngtools/hls) | alpha |
| `utils-hls-parser`¹ | HLS manifest parser for main and variant manifests. | [hls](https://github.com/mtngtools/hls) | alpha |
| `utils-hls-core`¹ | HLS pipeline orchestration and interfaces. | [hls](https://github.com/mtngtools/hls) | alpha |
| `utils-unstorage` | Storage drivers and utilities based on unstorage. | [mtng-mono](https://github.com/mtngtools/mtng-mono) | planned |
| `utils-date` | Dependency-free utilities for date manipulation. | [mtng-mono](https://github.com/mtngtools/mtng-mono) | planned |

## CORE

Pure business logic, types, and interfaces specific to the mtngTOOLS domain. Can depend on: `UTILS`.

| Package | Description | Repo | Status |
| :--- | :--- | :--- | :--- |
| `core-types` | TypeScript definitions and interfaces. | [mtng-mono](https://github.com/mtngtools/mtng-mono) | planned |
| `core` | Main core library. | [mtng-mono](https://github.com/mtngtools/mtng-mono) | alpha |
| `core-admin` | Core types, constants and functions shared across admin mtngTOOLS packages. | [mtng-mono](https://github.com/mtngtools/mtng-mono) | alpha |
| `core-plus` | Extended core functionality. | [mtng-mono](https://github.com/mtngtools/mtng-mono) | planned |

## FRAME

Framework-specific libraries. Can depend on: `UTILS` and `CORE`.

| Package | Description | Repo | Status |
| :--- | :--- | :--- | :--- |
| `frame-vue` | Vue.js component and composable library. | [mtng-mono](https://github.com/mtngtools/mtng-mono) | alpha |
| `frame-vue-mux` | Mux Vue.js component and composable library. | [mtng-mono](https://github.com/mtngtools/mtng-mono) | planned |
| `frame-vue-admin` | Vue.js admin component and composable library. | [mtng-mono](https://github.com/mtngtools/mtng-mono) | planned |
| `frame-h3` | h3 event handler library. | [mtng-mono](https://github.com/mtngtools/mtng-mono) | planned |
| `frame-h3-admin` | h3 admin event handler library. | [mtng-mono](https://github.com/mtngtools/mtng-mono) | planned |
| `frame-nuxt` | Nuxt.js module and layer library. | [mtng-mono](https://github.com/mtngtools/mtng-mono) | alpha |
| `frame-nuxt-admin` | Nuxt.js admin module and layer library. | [mtng-mono](https://github.com/mtngtools/mtng-mono) | planned |
| `frame-date` | Advanced date utilities wrapping date library (Luxon). | [mtng-mono](https://github.com/mtngtools/mtng-mono) | planned |
| `frame-hls-base`¹ | Default HLS client implementation (Core + Transfer). | [hls](https://github.com/mtngtools/hls) | alpha |
| `frame-hls-cli`¹ | Basic CLI for HLS transfer (no custom transfer options). | [hls](https://github.com/mtngtools/hls) | alpha |
| `frame-hls-transfer`¹ | HLS transfer implementations (fetch, storage). | [hls](https://github.com/mtngtools/hls) | alpha |

## PROVIDE

Utilities and implementations of core interfaces for specific deployment providers. Can depend on: `UTILS` and `CORE`.

| Package | Description | Repo | Status |
| :--- | :--- | :--- | :--- |
| `provide-aws` | AWS implementation of core interfaces. | [mtng-mono](https://github.com/mtngtools/mtng-mono) | alpha |
| `provide-aws-unstorage` | AWS specific storage drivers. | [mtng-mono](https://github.com/mtngtools/mtng-mono) | planned |
| `provide-hls-aws`¹ | AWS S3 implementation of HLS Storage. | [hls](https://github.com/mtngtools/hls) | alpha |
| `provide-mux` | Mux video platform integration. | [mtng-mono](https://github.com/mtngtools/mtng-mono) | planned |

## COMPOSE

Working reference solutions and concrete implementations. Can depend on: `UTILS`, `CORE`, `FRAME`, and `PROVIDE`.

| Repository | Description | Repo | Status |
| :--- | :--- | :--- | :--- |
| `compose-ref-attend-aws-nuxt-mux` | Reference attendee site for AWS + Nuxt + Mux. | [compose-ref-attend-aws-nuxt-mux](https://github.com/mtngtools/compose-ref-attend-aws-nuxt-mux) | alpha |
| `compose-ref-admin-aws-nuxt-mux` | Reference admin site for AWS + Nuxt + Mux. | [compose-ref-admin-aws-nuxt-mux](https://github.com/mtngtools/compose-ref-admin-aws-nuxt-mux) | planned |
| `compose-ref-api-aws-nuxt-mux` | Reference integration for AWS + Nuxt (Nitro) + Mux. | [compose-ref-api-aws-nuxt-mux](https://github.com/mtngtools/compose-ref-api-aws-nuxt-mux) | planned |
| `compose-hls`¹ | Composed HLS core orchestrator with AWS S3 support. | [hls](https://github.com/mtngtools/hls) | alpha |
| `compose-hls-cli`¹ | CLI extending frame-hls-cli with AWS S3 support. | [hls](https://github.com/mtngtools/hls) | alpha |

## DEVELOP

Additional sites and libraries to assist in the development process, such as sandbox sites to show use of library items in a working site.

| Repository | Description | Repo | Status |
| :--- | :--- | :--- | :--- |
| `develop-attend-nuxt` | Development attendee site for Nuxt. | [mtng-mono](https://github.com/mtngtools/mtng-mono) | alpha |
| `develop-mock-data` | Mocking library for various types of meetings for demos and code tests. | [mtng-mono](https://github.com/mtngtools/mtng-mono) | planned |

## BUILD (future)

Infrastructure shell. Once packages are split from the initial mono-repo, build repositories will provide the pnpm workspace and turbo build configuration. 

| Repository | Description | Repo | Status |
| :--- | :--- | :--- | :--- |
| `build` | Gitmodules, pnpm workspace, turbo build config. | [build](https://github.com/mtngtools/build) | planned |

[^1]: These packages live in the **hls** repository, not the main monorepo.
