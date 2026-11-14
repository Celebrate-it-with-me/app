# design-sources

Original, full-resolution brand images (PNG). They are the source for the WebP files in
`src/assets/images/brand/` (1400, 800, 640 and 480 px) and are **not** imported by the app, so
they never enter the bundle. Regenerate the WebP files from these when the artwork changes.
