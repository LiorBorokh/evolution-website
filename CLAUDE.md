# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Hebrew evolution learning website for a school science project. No build step — open `index.html` directly in a browser.

## Architecture

Static site: 4 HTML pages share one CSS file and one JS file.

```
index.html              ← home (DNA hero, feature cards, stats, CTA)
pages/
  games.html            ← 6 game cards (currently all disabled/placeholder)
  glossary.html         ← 15 term cards with live search + category filter
  about.html            ← team, project description, sources
css/
  style.css             ← all shared styles (design tokens, every component)
  games.css             ← game-card-only styles, loaded only on games.html
js/
  main.js               ← all interactivity (single file, runs on DOMContentLoaded)
assets/favicon.svg
```

**`css/style.css`** is the single source of truth for design. All colors, spacing, and typography are CSS custom properties on `:root` — change tokens there to restyle the whole site.

**`js/main.js`** handles: navbar scroll effect + hamburger toggle, active-link detection, IntersectionObserver scroll-reveal (`.reveal` → `.revealed`), DNA dot animation delays, glossary live search, and glossary filter chips. It guards every feature behind an existence check so the same file works on all pages.

**Navbar HTML** is duplicated in each page (not injected by JS) to avoid path-resolution issues when opened as `file://`. When editing navbar links, update all 4 files.

## Key Conventions

**RTL / Hebrew:** `<html dir="rtl" lang="he">` on every page. Use `inset-inline-start/end`, `padding-inline`, `margin-inline`, and `border-inline-start` in CSS — never `left`/`right` properties. Flexbox direction flips automatically in RTL.

**Design tokens:** `--accent: #00ff88` (neon green), `--bg: #0a0a0a`, `--bg-card: #111111`, font is Rubik (Google Fonts, loaded via `@import` at top of `style.css`).

**Relative paths:** Sub-pages in `pages/` use `../css/style.css`, `../js/main.js`, `../assets/favicon.svg`. `index.html` uses `css/style.css` etc. (no `../`).

**Placeholder content:** All user-facing text that still needs real content is wrapped in `[square brackets]`. Glossary term definitions use `data-term` and `data-category` attributes for search/filter.

**Activating a game:** Remove `disabled` from the button, change class `game-badge soon` to `game-badge`, and point the button to the game URL or page.
