# Module Guide 22: Luoyin Static Third-Person Avatar

## Purpose

Luoyin is an optional project-curated guide layer for the Li & Miao, Aerospace,
Dongfang Rosewood and Beautiful Villages immersive halls. It helps visitors
move through each SPZ world from a small third-person viewpoint, while the
five-hall navigation, exhibit index and free-camera fallback remain usable.

The avatar is not a historical person, government symbol, official mascot or
commercial character. The supplied GLB is a project asset. Its cloud-like base
is part of the supplied visual design and is not presented as a real object or
heritage artifact.

## Asset Boundary

- `luoyin_body.glb` remains the untouched source asset.
- The browser uses static, Draco-compressed desktop and mobile GLBs generated
  by `scripts/export_luoyin_static.py`.
- The web exports contain one mesh only: no armature, skin, animation, camera,
  light or helper primitive.
- PBR textures are retained and the browser supplies local guide lighting so
  the character does not depend on the SPZ renderer for illumination.
- The source mesh is Z-up in Blender; the export keeps glTF's Y-up convention
  and the browser applies one Y-up-to-Z-up root rotation.  The desktop export
  keeps roughly 35% of the source geometry and the mobile export roughly 20%,
  preserving the fine silhouette without the earlier collapse artifacts.
- The desktop/mobile exports target approximately `0.92`/`0.84` world units.
  This keeps the SPZ world visually dominant while allowing the avatar to read
  as a visitor on the scene floor.

## Interaction and Safety

- The avatar is hidden by default and loaded only after `Show Luoyin`.
- `WASD`/arrow keys move, `Shift` increases speed, and `Space` performs a
  short root-node hop. These are simple presentation controls, not a promise
  of skeletal walking or game-grade physics.
- Dragging orbits the camera with a limited pitch; wheel and pinch adjust a
  bounded camera distance.
- Each hall has its own spawn, calibrated walkable floor, cloud-base inset,
  radius and rectangular safety bounds. Spark SPZ scenes do not expose a
  reliable surface query or navigation mesh, so object-level collision is not
  claimed and the controller does not pretend to detect hidden structures.
- The root node is normalized once so the local cloud-platform base is at
  `z = 0`. Position updates use the calibrated hall floor plus a separate
  cloud-base inset; the camera target is deliberately not moved by that inset.
  This keeps the cloud platform visually in the captured floor rather than
  leaving the character suspended at the camera's mathematical origin.
- The upright Y-up-to-Z-up model is kept as a child of a separate movement
  root.  Walking turns only that root around Z, so WASD/arrow movement cannot
  roll or flip the standing model.
- While the avatar is active, Spark free-camera movement is paused. Hiding the
  avatar restores the existing free camera.
- Spark's Gaussian depth can completely hide ordinary meshes in some halls.
  The high-detail avatar therefore uses a late visibility layer with its own
  depth buffer, while the cloud-platform contact shadow uses a separate ground
  layer. This preserves the model's internal PBR depth and makes the authored
  contact plane readable across all four SPZ worlds.

## Failure and Privacy

If the character GLB fails to load, the page states that the 3D character is
unavailable and keeps free-camera browsing, exhibit navigation and Luoyin
conversation available. Static SPZ fallback views never mount the avatar.

No avatar position, preference, camera data or movement history is written to
`localStorage`, `sessionStorage`, the URL, the server, or the knowledge base.
No camera permission or new API endpoint is used.

## Acceptance

- The character is visible with normal color and no black-clump artifact.
- The four halls use the same controls but independent world parameters.
- The model stays within configured bounds, does not invert during orbit, and
  returns to its floor after jumping.
- Desktop and mobile assets load through `GLTFLoader` with Draco decoding.
- `npm run build`, `npm run test:server`, `node --check server.mjs` and
  `git diff --check` pass before the next immersive-hall module is started.

## Third-Person Calibration Update

- Camera drag changes only the orbit yaw/pitch. The camera keeps looking at
  Luoyin; camera yaw does not rotate the avatar model.
- Movement turns the outer avatar root around Z using the movement direction
  relative to the current camera, plus a fixed source-model facing correction.
  X/Y rotations remain zero, and releasing movement preserves the last heading.
- Runtime verification of the supplied mesh shows its visible front is opposite
  the controller's mathematical heading, so the shared facing correction is a
  single `Math.PI` half-turn. Holding `W` shows the avatar's back while moving
  away from the camera, and holding `S` turns the visible face toward the camera.
- Each hall owns an authored camera floor and an independent `contactSink`.
  This separation is important: moving both the avatar and camera floor by the
  same amount leaves the character centered on screen and cannot fix visible
  hovering. SPZ global `min.z` remains excluded because it may be a Gaussian
  point-cloud outlier.
- The largest character mesh is the only source used for local bounds. The
  normalized base is re-anchored after scaling, so helper objects or imported
  scene nodes cannot lift the visible cloud platform.
- The desktop and mobile exports are cleaned immediately before export so only
  the high-detail Luoyin mesh reaches the browser; Blender startup cube, camera
  and light objects cannot contaminate runtime contact bounds.
- The contact shadow stays on the authored contact plane during a hop and
  fades/shrinks while the avatar rises. On landing, the cloud platform returns
  to the same contact height and the shadow regains its full size.
- Entry framing now reads the real SPZ bounding box, aims at its lower third,
  fits the horizontal and vertical spans to the camera FOV, and clamps the
  orbit inside padded bounds. Spawn coordinates are authored per hall from the
  measured world ranges, so entering a hall cannot begin outside the captured
  scene.
- The third-person camera computes an orbit radius from the current heading and
  the hall safety rectangle, so rotating near an edge cannot place the camera
  outside the authored SPZ space. Huali uses a deeper contact inset because
  its scene floor reads lower than the shared zero plane.
