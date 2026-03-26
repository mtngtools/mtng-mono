# mtngTOOLS Overview

**mtngTOOLS** is a suite of tools and libraries for medical conference video platforms, covering attendee experiences and production logistics.

## High-Level Overview

**Online Applications**
*   **Attendee Portal**: Live streaming and VOD playback. Future expansion to additional areas.
*   **Administration**: Content management and integrations with meeting vendors and video platforms (e.g., Mux).

**Production & Post-production**
*   **Media Automation**: Provisioning live streams and managing archive workflows (marking, encoding, publishing, quality control).
*   **In-Room Tools**: Speaker timers and digital displays.
*   **Logistics**: Data visualization for staff.

**Common Foundation**
*   **Data-Driven**: Unified data source ensures consistency across all tools, transformed as necessary.
*   **Shared Components**: Consistent UI and logic via shared libraries.
*   **Composable**: Reference architectures adaptable to specific organizational needs.

## Context & Motivation

*   **Varied Requirements**: Organizations share core needs (video delivery, schedule management) but differ in specific requirements and budget/time trade-offs.
*   **Managed Complexity**: While modern tooling facilitates code generation, a cohesive, tested architecture is essential to manage the complexity of interconnected systems. Even if AI can generate the code, give it a reliable starting point.
*   **Flexible Integration**: Data sources and decision-making processes vary by organization. The platform is designed to integrate with existing systems rather than mandating a specific workflow.

## Guiding Principles

*   **Composability**: Solutions built from reusable components with clear separation of concerns.
*   **Customization**: Reference architectures designed as extensible starting points.
*   **Deployment Flexibility**: Support for various environments (on-prem, cloud, hybrid).
*   **Maintainability**: Modular architecture promoting independent component evolution and testability.

## Code Organization

Repositories are organized into groups to enforce modularity and dependencies:

*   **UTILS** (`utils-core`, `utils-hls`, `utils-unstorage`)
    *   Domain-agnostic technical libraries and helpers.
    *   External dependencies limited to types and interfaces.
*   **CORE** (`core`, `core-types`, `core-plus`)
    *   Pure business logic, types, and interfaces specific to the Medical Conference domain.
    *   Can depend on: `UTILS`.
*   **FRAME** (`frame-vue`, `frame-nuxt`)
    *   Implementation libraries using a structured framework (such as VueJS or Nuxt).
    *   Can depend on: `UTILS` and `CORE`.
*   **PROVIDE** (`provide-aws`, `provide-aws-unstorage`, `provide-mux`): Implementations of core interfaces for specific services.
    *   Can depend on: `UTILS` and `CORE`.
*   **COMPOSE**: Working reference solutions and concrete implementations using the above layers.
    *   Can depend on: `UTILS`, `CORE`, `FRAME`, and `PROVIDE`.
*   **DEVELOP**: Additional sites and libraries to assist in the development process (e.g., sandbox sites, mock meeting data for tests and demos).
    *   Can depend on: `UTILS`, `CORE`, `FRAME`, and `PROVIDE`.
*   **BUILD**: Infrastructure shell (gitmodules, pnpm workspaces, turbo build).

### This is complicated. Why the complexity? 
Dependency management is hard. In order for each reference solution to minimize dependencies, components are broken down into smaller, more manageable pieces.

See [package-directory.md](package-directory.md) for details.
