---
name: integrating-petmysite
description: Use when adding the PetMySite website pet to a website or web app (HTML, React, Next.js, Vite, Vue, Svelte, Astro, Shopify, Webflow, WordPress, Google Tag Manager), or when writing code that uses window.petMySite, petMySiteQueue, or the @petmysite/react package (PetMySite component, petMySite, usePetMySiteEvent) to show bubbles, play animations, hide the pet or handle click, petting and right-click events.
---

# Integrating PetMySite

## Overview

PetMySite adds an animated pet to a website that opens the site's existing chat or contact menu. Integration is one public script (or the React package that loads it) plus an optional page API. Everything visual and behavioural (pet, corner, chat provider, Smart Bubbles, click actions) is configured in the PetMySite dashboard, not in code.

**Only use the API documented here.** There is no `init()`, config object, pet-choice option or npm package other than `@petmysite/react`. If a request needs something not listed, say it is a dashboard setting or not supported.

## Choose the install method

| Project | Method | Reference |
|---|---|---|
| React, Next.js (App or Pages Router), Vite + React | `npm install @petmysite/react`, render `<PetMySite siteKey=… />` once in the root layout | `references/react.md` |
| Plain HTML, server templates, Vue, Svelte, Astro, Angular, Rails, Django, Laravel | Script tag before `</body>` in the shared layout | `references/install.md` |
| Shopify, Webflow, Squarespace, Wix, Framer, WordPress, Tag Manager | Platform steps | `references/install.md` |

Then, for calling the pet from code: `references/javascript-api.md` (script installs) or `references/react.md` (package installs). Failures: `references/troubleshooting.md`.

## Non-negotiables

1. **Exactly one install per page.** Script tag *or* package, never both. Place it in the layout that persists across routes, not in a page.
2. **The site key is public.** `pms_` + 32 lowercase hex characters, from the dashboard's **Installation** page. Put it in a browser-visible env var (`NEXT_PUBLIC_PETMYSITE_KEY`, `VITE_PETMYSITE_KEY`), never a server-only secret. If the user has not given one, use a clearly named placeholder env var and tell them where to get the key; never invent a key.
3. **Keep the chat provider's own script installed.** The pet opens Tawk.to, Intercom, Crisp or Zendesk Messaging; it does not replace them. Never remove or hide their snippet.
4. **Domain-bound.** The pet loads only on the registered domain (`www.` ignored) plus `localhost`, `127.0.0.1`, `[::1]`, `*.local`, `*.test`. Staging subdomains do not match.
5. **CSP:** allow `https://cdn.petmysite.com` and `https://petmysite.com` in `script-src`, `connect-src`, `img-src`, `font-src`, and permit WebAssembly (`'wasm-unsafe-eval'`). Inline styles must be allowed.
6. Do not hide or remove PetMySite attribution, add hidden links, or fake analytics events.

## API quick reference

```js
petMySite.show(); petMySite.hide(); petMySite.hideBubble();
petMySite.showBubble(message, linkText?, action?, { newTab? }); // 1–160 chars; label ≤40; action = http(s) URL or function
petMySite.play(state);   // wave celebrate excited surprised curious loved look_around peek
petMySite.open();        // boolean; does NOT queue
petMySite.chatOpened();  // only after YOUR code opened chat following a pet click/bubble
const stop = petMySite.onClick(e => { e.preventDefault(); /* own action */ }); // also onPetting, onRightClick, on(type, fn), off
```

Methods never throw; bad arguments log a `[PetMySite]` warning and do nothing.

## Common mistakes

| Mistake | Fix |
|---|---|
| Calling `window.petMySite` in an async/GTM script that may run before `pet.js` | Use `(window.petMySiteQueue = window.petMySiteQueue \|\| []).push(fn)` |
| `<PetMySite>` inside a page component | Root layout / app shell only |
| Touching `window` during SSR | Use the package's `petMySite` export (no-op on server) |
| Bubble URL action in a SPA | Pass a function that calls the router |
| Expecting `play()` under reduced motion or while hidden | It is skipped by design |
| `chatOpened()` on every chat open | Only counts within 60 s of a pet click or bubble action |
| Adding `integrity=` (SRI) to the `pet.js` tag | Don't: `pet.js` updates in place, a pinned hash breaks the pet |

## Verify

Run the app, confirm the pet appears (localhost works but does not verify installation), then deploy and use **Verify installation** in the dashboard.
