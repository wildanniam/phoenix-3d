# Rise Again Design System

## Register and context

- Register: brand experience / experimental landing page.
- Audience: anyone exploring a playful 3D web demo.
- Primary path: arrive, see the phoenix in motion, scroll through the rebirth story, inspect the model, and restart the experience.
- Visual read: mythic sci-fi editorial, dark, sparse, cinematic.
- Dials: design variance 9, motion intensity 8, visual density 3.

## Existing-site audit

- The original repo was a single cream-colored donut demo with no reusable visual system.
- Its useful foundation was the direct manipulation of a real GLB asset and a scroll-responsive camera.
- Generic cards, placeholder copy, the exposed camera readout, external CDN imports, and the old donut asset are retired.
- There are no established brand, analytics, route, form, or SEO constraints to preserve.

## Visual principles

- The phoenix is always the primary visual. Text frames its movement instead of competing with it.
- The page uses one locked dark theme: soot, charcoal, ash, and one ember-orange accent.
- Composition is asymmetric on desktop and deliberately collapses into a clear single-column mobile story.
- No floating cards. Hierarchy comes from space, scale, and controlled contrast.
- Background atmosphere is a real bitmap asset, not a CSS blob or decorative gradient substitute.

## Typography

- Display: Unbounded, self-hosted through `@fontsource`, uppercase and tightly spaced.
- Body: Manrope, self-hosted through `@fontsource`.
- Utility labels are sparse, never repeated above every section.

## Motion

- Motion communicates the phoenix's journey: arrival, fall, turn, ascent, and return.
- The model's embedded wing animation runs continuously unless paused.
- Scroll is read inside the render loop and mapped to model position, rotation, scale, light, and camera.
- Pointer drag provides direct object inspection.
- Reduced motion pauses the embedded animation, freezes particles, and removes entrance choreography.

## Component vocabulary

- `Experience`: page shell and interaction state.
- `PhoenixScene`: fixed WebGL layer and scene lighting.
- `Phoenix`: normalized GLB model, embedded animation, scroll choreography.
- `EmberField`: deterministic instanced particle atmosphere.
- `LoadingScreen`: meaningful progress state matching the final composition.
- `SceneErrorBoundary`: readable error recovery when the model cannot load.
- Fixed header, narrative chapters, source credit, and restart action.

## State and accessibility requirements

- Default: animated model and ambient embers.
- Hover/focus/active: visible, high-contrast states on all controls.
- Loading: percentage and progress line until the GLB is ready.
- Error: inline retry guidance if WebGL or the model fails.
- Paused: control label and animation state stay synchronized.
- Reduced motion: no autoplaying wings or drifting particles.
- Canvas is decorative to screen readers; story and controls remain semantic HTML.

## Responsive behavior

- Desktop: phoenix occupies the right or left field according to the chapter while copy alternates with intentional negative space.
- Mobile: the phoenix stays mostly above the active copy, model scale is reduced, header actions condense, and chapter text uses a single column.
- Minimum supported checks: 1440 x 900 and 390 x 844.

## Performance budget

- Cap device pixel ratio at 1.75.
- Keep particle count below 500 and use one instanced points geometry.
- Mutate refs inside `useFrame`; never update React state per frame.
- Reuse the 1.6 MB supplied GLB and avoid remote HDR environments.
- Stop nonessential motion when the tab is hidden or reduced motion is enabled.

## Anti-patterns

- No purple/cyan gradients, glass-card stacks, numbered section eyebrows, scroll cue labels, fake metrics, custom cursors, or decorative status dots.
- No duplicate calls to action or repeated card grids.
- No uncredited third-party model use.
