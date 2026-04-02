# mtngTOOLS Overview

**mtngTOOLS** is a suite of tools and code libraries for conferences and meetings, primarily those delivering presentations organized into sessions.

Domain and mtngTOOLS organization terms are summarized in [GLOSSARY.md](GLOSSARY.md).

## Solution Domains

### Current Focus

*   **Watch**: Live and on-demand video for **virtual** attendees.
*   **Interact**: Q&A and polling **integrations with external providers**, not native mtngTOOLS.

### Planned and Future

*   **Watch**: On-site session viewing.
*   **Produce**: Data-driven run-of-show, presentation timers, digital displays.
*   **Interact**: Chat through **integrations with external providers**, not native mtngTOOLS.

## Product Surfaces

Where the tools are deployed:

*   **Online Applications**
    *   **Attendee Portal**: Live streaming and VOD playback. Future expansion to additional areas.
    *   **Administration**: 
        *   Data management and visualization.
        *   Resource assignment (staff, live stream, etc.).
        *   Live and archived video workflows (marking, encoding, publishing, quality control).
        *   Integrations with other meeting vendors and video platforms (e.g., Mux).
*   **On-site Tools**: Speaker timers and digital displays.
    *   **Logistics**: Data management and visualization for staff.

## Context & Motivation

*   **Fit and Integration**: Organizations share core needs (video, schedules) but differ in requirements, budgets, data sources, and workflows. The platform is meant to **integrate** with existing systems instead of mandating one stack.
*   **Why Structure Matters**: These products are interconnected; a cohesive, tested foundation limits reliance on ad hoc glue, including when AI tools make generating code inexpensive.

## Guiding Principles

*   **Data-Driven**: Core underlying data model, transformed as needed.
*   **Shared Components**: Shared libraries for UI and logic—usable as-is or as a starting point to fork and extend.
*   **Composability**: Prefer reusable pieces with clear boundaries (see **Code Organization**).
*   **Reference Architectures**: Composable stacks you can extend; shared layers rather than a single fixed application.
*   **Deployment Flexibility**: On-prem, cloud, or hybrid.
*   **Scale**: Online applications structured for traffic bursts and high concurrency.
*   **Maintainability**: Modules that can evolve and be tested on their own.

## Code Organization

Repositories are organized into groups to enforce modularity and dependencies:

*   **UTILS** (`utils-core`, `utils-hls`, `utils-unstorage`)
    *   Domain-agnostic technical libraries and helpers.
    *   External dependencies limited to types and interfaces.
*   **CORE** (`core`, `core-types`, `core-plus`)
    *   Pure business logic, types, and interfaces specific to the conference and meeting domain.
    *   Can depend on: `UTILS`.
*   **FRAME** (`frame-vue`, `frame-nuxt`)
    *   Implementation libraries using a structured framework (such as Vue.js or Nuxt).
    *   Can depend on: `UTILS` and `CORE`.
*   **PROVIDE** (`provide-aws`, `provide-aws-unstorage`, `provide-mux`): Implementations of core interfaces for specific services.
    *   Can depend on: `UTILS` and `CORE`.
*   **COMPOSE**: Working reference solutions and concrete implementations using the above layers.
    *   Can depend on: `UTILS`, `CORE`, `FRAME`, and `PROVIDE`.
*   **DEVELOP**: Additional sites and libraries to assist in the development process (e.g., sandbox sites, mock meeting data for tests and demos).
    *   Can depend on: `UTILS`, `CORE`, `FRAME`, and `PROVIDE`.
*   **BUILD**: Infrastructure shell (gitmodules, pnpm workspaces, turbo build).

### Why this structure?

Dependency management is difficult. Reference solutions keep dependencies small by splitting work into narrower packages.

See [package-directory.md](package-directory.md) for details.
