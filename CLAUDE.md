# Tech Stack

- Next.js 16 + React 19 + TypeScript + Nextra 4.6 (nextra-theme-blog)
- Tailwind CSS 4 + shadcn/ui (new-york style) + Motion + Tabler Icons + Lucide Icons
- Yarn as package manager

# Development

- `yarn dev` — dev server with Turbopack
- `yarn build` — production build (includes Pagefind search index via postbuild)

# Project Structure

- `src/app/[lang]/` — App Router with i18n dynamic segments
- `src/components/` — React components (`ui/` for shadcn primitives, `animated-icons/` for motion icons, feature dirs like `redis-sorted-set-simulator/`)
- `src/lib/` — Utilities (`format-date.ts`, `get-posts.ts`, `get-tags.ts`)
- `src/styles/globals.css` — Theme variables and global styles
- `src/mdx-components.tsx` — Custom MDX component registry
- `content/{en,vi}/posts/` — Blog content per locale (MDX)
- `public/` — Static assets (SVGs, images, WebP)

# Content Conventions

- Blog posts live in `content/{lang}/posts/*.mdx`
- Frontmatter fields: `title`, `date` (ISO format), `tags` (string array), `description`, `enableComment` (boolean)
- Post filenames use kebab-case
- Every post must exist in both `en/` and `vi/` directories
- When creating a new blog post, write the Vietnamese version first (`content/vi/posts/`), finalize it, then create the English translation (`content/en/posts/`)
- Available MDX components: `<Posts />`, `<Tags />`, `<Avatar />`, and feature-specific components registered in `src/mdx-components.tsx`

# Code Style

- Prettier: no semicolons, single quotes, 120 print width, 2-space indent
- Never include comments in code — code should be self-explanatory through clear naming
- Functional components only; use `'use client'` directive for client components
- Path alias: `@/*` maps to `./src/*`
- Prefer named imports; use default imports only for components

# Naming Conventions

- Components: `PascalCase.tsx` (e.g., `AnimatedThemeSwitch.tsx`)
- Utilities: `kebab-case.ts` (e.g., `format-date.ts`)
- MDX content files: `kebab-case.mdx`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`

# Styling

- Tailwind CSS 4 via PostCSS plugin (no separate tailwind.config file)
- Theme variables use OKLCH color space, defined in `src/styles/globals.css`
- Dark mode via `.dark` class with CSS variable overrides
- shadcn/ui components live in `src/components/ui/`
- Custom container class: `.x\:container` (max-width 700px)

# Internationalization

- Locales: `en` (default), `vi`
- Content duplicated per locale under `content/{lang}/`
- UI text uses conditional rendering: `lang === 'vi' ? '...' : '...'`
- Locale persisted in localStorage + cookies; detection handled by `src/proxy.ts`

# Diagrams & Visualization

- Always generate SVG files for diagrams instead of ASCII art
- Save SVG files to the `public/` directory
- Reference SVGs using standard markdown or MDX image syntax
- All text content inside SVG files must be written in English

# Git Conventions

- Conventional commits: `feat:`, `fix:`, `refactor:`
- Commit messages in English
