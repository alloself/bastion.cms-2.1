# Project Rules

## General
- Follow the existing code style and patterns.
- Use Vuetify 4 components with TailwindCSS 4 utilities.
- Do NOT use Vuetify utility classes — they are disabled (`utilities: false`). Use Tailwind instead.
- Theme-aware colors use CSS variables: `--v-theme-primary`, `--v-theme-surface`, etc.
- For light/dark variants use Tailwind custom variants: `light:` and `dark:`.
- Breakpoints are synced between Vuetify and Tailwind: xs/sm/md/lg/xl/xxl.
