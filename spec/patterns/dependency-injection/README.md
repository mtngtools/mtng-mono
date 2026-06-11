# Dependency Injection

mtngTOOLS adopts a multi-package strategy to enable composability and minimize dependencies, especially provider-specific dependencies. While provider-specific dependencies are ultimately needed to implement the final solutions, that should happen at final app assembly. 

Generically this is an application context, but for mtngTOOLS, the principal tool for Typescript apps is a Nuxt modules to provide composable "meeting context" objects to be made available to every Nuxt page route and server api route. 

Goal: limit provider-specific dependencies to backend, where possible.

See [meeting-context/README.md](./meeting-context/README.md) for more details.


- CORE packages define abstract interfaces/types, builders, and composition functions for the meeting context will be to satisfy

## Context modules

- Avoid overly complex "god" by grouping into larger "modules" or "services" so the final composition is not this overwhelming and unwieldy. 
    - For example, a simple meeting context might be composed of three context modules:
        - BaseMeetingContext: application and meeting configuration
        - MeetingDataService
        - SessionStateService
- There might be many recipes for each module, with varying interfaces and implementations, but that complexity should be hidden 



