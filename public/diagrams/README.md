# diagrams

Diagrams for the case write-ups, as **SVG** exported from Excalidraw.

## Workflow

1. Draw in Excalidraw (excalidraw.com or the app).
2. Export as **SVG** with a transparent background and the dark theme, so it sits
   well on the site's dark background.
3. Save it here, e.g. `public/diagrams/<case-slug>-<name>.svg`.
4. Reference it from the case markdown:

   ```markdown
   ![Architecture](/diagrams/zero-downtime-overview.svg)
   ```

SVG keeps diagrams crisp at any size with no runtime dependency. Mermaid fenced
blocks still work too (rendered client-side); use whichever fits the diagram.
