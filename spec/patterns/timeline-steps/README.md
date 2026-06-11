# Timeline & steps

- **Idea:** model evolving state as a **timeline** with explicit **steps**; transitions are defined, not ad hoc; UI, APIs, and jobs key off the current step.
- **Define terms**:
    - **Timeline**: A timeline is discrete phase of an entity lifecycle (see session example below).
    - **Step**: A step unit of work that needs to happen in support of managing the state and resources as an entity moves through the phases of a timeline (see example steps below). There can be multiple steps to support a particular phase of a timeline (see session example below).
    - **Step Pre-requisite**: A condition to check whether a step is ready to worked on.
    - **Step List**: A list of steps to moves through all the phases of a timeline.
- **Why:** avoids scattered flags and implicit “phase” logic when many surfaces must agree on the same moment in the lifecycle.

## Session example

### Session timeline

Session state moves through it's timeline:

- **unknown**: not yet classified or loaded
- **pre-live**: scheduled / setup, not broadcasting
- **live**: active, audience-facing, live player needs playback info
- **post-live**: live ended but archive hasn't been deployed yet
- **archive**: archive deployed, archive player needs playback info
- **retired**: no longer available for playback

### Session steps

Base session steps to support the timeline (named by CTA for the step):

- **pre-live** 
    - **set-to-prelive**
- **live**
    - **set-to-live**: requires playback info (typically from resource assignment on session's room) 
- **post-live**: 
    - **set-to-postlive**
- **archive**: 
    - **import-source**: (optional) add new media to the list of available inputs (in addition to the existing source recordings)
    - **select-source**: select input(s) for archive
    - **edit-players**: 
        - build list of players (in display order), often one for each presentation in the session
        - each player needs:
            - selected source to use
            - start and end timestamps within that source
            - which presentations are included in the player
        - the happy path is to have a single source recording and one player for each presentation in the session
        - when edits are required, alternate sources may be used for some or all of the players
    - **submit-encode**:
        - submit players to encoding jobs for processing
        - skipping by default in the player with same source and timestamps have already been encoded
        - but allowing override to re-encode same source and timestamps if prior encoding job was not successful
    - **publish-media**: (only if meeting configured to publish media from location other than encoding output)
        - review output from submit-encode
        - publish media from encoding output to delivery network
    - **publish-players**: 
        - review output from publish-media (or submit-encode if deployed to end-users directly from encoding output, for example Mux CDN after Mux encode)
        - creates a preview available to admin staff (directly on "attend" app) before publishing to end-users
    - **set-to-archive**: 
        - archive players are available for playback from the "attend" app
- **retired**: no longer available for playback
    - **set-to-retired**: 

## General implementation considerations

- Named by the CTA for the step
- Code divided, living in:
    - Generic typescript packages
    - Front-end framework packages
    - Backend framework packages

## CORE implementation: `core-admin[-XXXX]` (or similar package)

### STEP

Example folder structure:
```
core-admin/session/state/timeline/step/
    - set-to-prelive
      - index.ts
      - types.ts
      - functions.ts
    - ... other steps ...
    - submit-encode
      - index.ts
      - types.ts
      - functions.ts
    - common/
      - index.ts
      - types.ts
      - functions.ts
```

Each step folder extending and exporting it's version of the following name prefixed with `id`:

- `TimelineStep`: Timeline step base type
- `StepCTAInput`: Step CTA input base type
- `StepCTAOutput`: Step CTA output base type
- default function implementations where appropriate to support the step, but allowing overrides to customize.
- additional types, function, objects as needed

#### TYPE: extend `TimelineStep`

- `id`: ID for the step (unique within the timeline)
- `label`: Display label for the step
- `ctaLabel`: Label for the CTA for the step
- `description`: Description for the step
- `prerequisites`: Ordered array of `StepPrerequisite`
    - `check`: Function with prerequisite checks with:
        - `message`: Explanation message (for example before submit-encode, must have edited players)
        - `resolveId`: 
            - Optional `id` of step to attempt to fix, typically the prior step in the sequence  (for example, if no players exist to encode, link to edit-players)
- `validatePrerequisites`: Optional validate step prerequisites (defaulting to generic function that call each function in prerequisite checks array)
- `ctaValidationSchema`: Optional standard schema to validate the CTA input => drives `StepCTAInput` type (below)

#### TYPE: `StepCTAInput`

Input params for the CTA, driven by `ctaValidationSchema` (above). Used by backend and typically prepared by UI layer. 

#### TYPE: `StepCTAOutput`

Output from the CTA, often used as input to the next step, while this is a dedicated type it should try to share types with other inputs/outputs as appropriate. 

For example, if the ctaValidationSchema => a `StepCTAInput` type, that perfectly matches the an output then the `StepCTAOutput` type, then that schema (and the type if creates) should live in the `common` folder (or another shared location) with the various `StepCTAInput` and `StepCTAOutput` types just referencing that common type. In some cases, this might be true of just a portion of the type.

Generated by backend and typically used by UI layer.

### STEP PRE-REQUISITE

Example folder structure:
```
core-admin/session/state/timeline/step-pre-req/
    - must-have-players.ts
    - ... [other prerequisites].ts
```

#### TYPE: `StepPrerequisite` ()

- `check`: Function with prerequisite checks with:
- `failMessage`: Explanation message (for example before submit-encode, must have edited players)
- `resolveId`: 
    - Optional `id` of step to attempt to fix, typically the prior step in the sequence  (for example, if no players exist to encode, link to edit-players)

### STEP LIST

Example folder structure:
```
core-admin/session/state/timeline/step-list/
    - base/
      - index.ts
    - ... other step lists ...
    - with-media-publishing/
      - index.ts
```

A composed list of steps providing full solutions for walking through all the phases of a timeline. These are the various recipes. 

The goal is to have a few of these recipes that can be customized by passing parameters to the step list constructor. However, new recipes can be created if needing additional steps, differing step order, or customization beyond what parameters allow. 



#### TYPE: implement `StepList` interface with:

- `timelineSteps`: Ordered array of `TimelineStep`








## Frontend implementation: `frame-vue-admin[-XXXX]` (or similar package)

For all types in this package, any value that might change should be either Ref<T> or ComputedRef<T>. This Vue-specific typing is the reason for this code doesn't live in the core-admin package. Future packages may abstract this to allow for implementation in other frontend frameworks, but for now it's specific to Vue.


### Common

Base types (interfaces), shared components, and functions generic to many (or all) steps or many (or all) step lists.

Example folder structure:
```
core-admin/session/state/timeline/common/
    - index.ts
    - types.ts 
    - utils/
        - index.ts
        - ... additional files if needed
    - components/
        - SessionTimelineStepCTA.vue
    - composables/
        - index.ts
        - ... common composables if needed
```

### STEP

Example folder structure:
```
core-admin/session/state/timeline/step/
    - set-to-prelive
      - index.ts
      - SetToPreliveSessionStep.vue
      - SetToPreliveSessionStep.test.ts
      - types.ts
      - demo.vue
    - ... other steps ...
    - submit-encode
      - index.ts
      - SubmitEncodeSessionStep.vue
      - SubmitEncodeSessionStep.test.ts
      - types.ts
      - demo.vue
```

#### TYPE: extend `VueTimelineStep`

- `icon`: Icon for the step
- `paramsAvailable` Optional check if loadParams function is needed
- `loadParams`: Optional load params for step if paramsAvailable is false
- `saveWorkInProgress`: 
    - Optional save Work In Progress, for steps requiring more complex user interaction that can't be lost if user navigates away from the step (for example, edit-players)
    - When this is used, either `loadParams` will need to incorporate loading the WIP or a dedicated `loadWorkInProgress` function will need to be implemented.
- `loadWorkInProgress`: Optional load prior Work In Progress
- `generateCTAInput`: Optional generate the CTA input, helping standardize `runCTA` implementations
- `componentProps`
- `runCTA`: Run the CTA
- `handleCTAResponse`: Handle the CTA response
    - Success: move to next step
    - Error: show error message and stay on step
- Additional data or functions needed for the step, so composed solution can use default implementation of pass an override function to customize. 

### STEP LIST

Same example folder structure as above, but in the `frame-vue-admin` package. 

#### TYPE: `StepListContext`

- Essentially a "god" object that provides the necessary data to the step list to walk through the timeline. 
- To avoid complexity found in "god" object, use only union of other types:
    - Typically with TypeScript Partial<SOME_STEP_SPECIFIC_TYPE> 
    - Allowing steps to check if their data is there 
    - Coordinating types in steps to avoid unnecessary duplication, but allowing for flexibility when a different shape is required and can't easily be transformed on the fly
    - Allowing sharing of loaded data between steps, especially when the output CTA data is needed as input to the next step

#### COMPONENT: 

### For each step

- May have additional supporting actions
- Primary timeline when expected to be used
- Ordered array of functions with prerequisite checks with:
    - Additional info if not passed:
        - Explanation message (for example before submit-encode, must have edited players)
        - Optional link to step to attempt to fix (for example link to edit-players), typically the prior step in the sequence
- Dedicated types :
  
- Composable:

### UI

- Might only show steps appropriate for the current timeline state
    - Exceptions include "set-to-XXXX" steps not usually called from the current timeline, but available for edge cases (if prerequisites are met), but might be shown as "Additional" steps in the UI

## Backend implementation

See : multiple Nuxt, Nitro, and provider specific packages

`frame-nitro`, `frame-nitro-admin` 

- Split Nitro code into:
    - Generic types and interfaces in 
    - Provider-specific implementing interfaces defined in `frame-nitro` and `frame-nitro-admin` :
        - `compose-mux-admin` backed by `provide-mux` 
        - `compose-aws` and `compose-aws-admin` backed by `provide-aws` implementing 
        - `compose-mux` 


## Pattern goals

- Provide consistency for implementing each step
- Minimize effort to add, replace, modify, or reorder steps in a step list.
- Limit provider dependency to Nitro backend, even that split between generic and provider-specific:
