# Troubleshooting PetMySite

## The pet does not appear

| Check | How |
|---|---|
| Script present once | View the rendered page source and search for `pet.js` and the `pms_` key. Missing: change not deployed, or a page/CDN cache serves an old page. |
| Right domain | The key only works on the website's registered domain (`www.` ignored) and local dev hosts (`localhost`, `127.0.0.1`, `[::1]`, `*.local`, `*.test`). Preview and staging URLs (`*.vercel.app`, `*.netlify.app`, `staging.example.com`) do not match. |
| Key intact | Editors can turn quotes curly or strip `data-site`. Key format: `pms_` + 32 lowercase hex. |
| Persistent layout | In SPAs, the script or `<PetMySite>` must live in the root layout, not a page that unmounts. |
| Delayed JavaScript | "Delay JS until interaction" and script-combining optimisers (WP Rocket, LiteSpeed Cache, Autoptimize, Cloudflare Rocket Loader) delay or break it. Exclude `pet.js`. |
| Tag Manager | Container published (not just saved), trigger All Pages, tag not paused, no ad blocker while testing. |
| Console | Look for `[PetMySite]` messages and CSP violations. |

## Content Security Policy

Add to the site's existing policy (do not replace it):

```
script-src  ... https://cdn.petmysite.com https://petmysite.com 'wasm-unsafe-eval';
connect-src ... https://cdn.petmysite.com https://petmysite.com;
img-src     ... https://cdn.petmysite.com https://petmysite.com;
font-src    ... https://cdn.petmysite.com https://petmysite.com;
```

- Without WebAssembly the pet shows a still pose instead of animating.
- The widget currently needs inline styles (`style-src 'unsafe-inline'` or no `style-src` restriction). A policy that forbids them blocks the widget: tell the user to contact support@petmysite.com rather than weakening their policy silently.
- In Next.js, CSP usually lives in `next.config.*` `headers()` or `middleware.ts`; on Netlify/Cloudflare Pages in `_headers`.

## Do not add Subresource Integrity

Do not add `integrity="sha…"` to the `pet.js` tag, even if a linter or security hook suggests it. `pet.js` is a small bootstrap that is updated in place (10-minute cache) and loads immutable content-hashed files; a pinned hash breaks the pet on the next release. The site key is domain-bound and the script collects no cookies, storage or visitor identities.

## The pet appears but chat does not open

- The chat provider's own script/plugin must be installed and loading on the same pages (Tawk.to, Intercom, Crisp, Zendesk Messaging). If it loads through Tag Manager, it must fire on the same pages.
- Zendesk: Web Widget Classic is not supported. Do not turn off Zendesk's native launcher in Admin Center; it is the fallback.
- If the provider fails to confirm opening, PetMySite restores the provider's own launcher. That is intended.
- A `click` handler calling `e.preventDefault()` intentionally stops the configured action.

## API calls do nothing

- Calls made before `pet.js` exists throw `petMySite is not defined`: use `window.petMySiteQueue`, or the React package's `petMySite`.
- Invalid arguments only warn (`[PetMySite] showBubble() needs a message of 1 to 160 characters.`, `play() takes one of: …`, `showBubble() action must be an http(s) URL or a function.`, `showBubble() link text needs an action: a URL or a function.`).
- `play()` is skipped under reduced motion, while hidden, or while the visitor is petting.
- `open()` returns `false` before mount and is never queued.
- If the pet failed to load (wrong domain, invalid config) every call is dropped silently by design.

## React-specific

- `PetMySite is already installed with a different site key.`: a script tag with another key is on the page. Keep one install.
- `PetMySite needs a valid public site key from Installation.`: `siteKey` missing or malformed; often an unset env var (`NEXT_PUBLIC_` / `VITE_` prefix missing, or not set in the deploy environment).
- Strict Mode double effects are handled; there is still one script.
