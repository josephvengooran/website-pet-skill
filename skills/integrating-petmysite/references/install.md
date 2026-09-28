# Installing PetMySite

## Before writing code

- The user needs a PetMySite website whose domain matches the site being edited. Create one at https://petmysite.com.
- The public key is on that website's **Installation** page: the `data-site` value, `pms_` followed by 32 lowercase hex characters. It is not a secret.
- The site's chat provider (Tawk.to, Intercom, Crisp or Zendesk Messaging; not Zendesk Web Widget Classic) must stay installed on the same pages. The pet has no chat of its own.

## The script tag

```html
<script async src="https://cdn.petmysite.com/pet.js" data-site="YOUR_SITE_KEY"></script>
```

- Add it once, on every page, just before `</body>`, in the shared layout/footer template.
- Keep `async` and the `data-site` attribute exactly as shown. A second copy on the same page is ignored.
- It loads nothing until the page is visible and uses no cookies or storage.

### Where the layout lives

| Stack | File |
|---|---|
| Static HTML | Every page, or the shared include |
| Vite / CRA single-page app without the package | `index.html` |
| Next.js without the package | `app/layout.tsx` (or `pages/_app.tsx`) with `next/script`, see below |
| Vue (Vite), Svelte (Vite), Solid, Angular | `index.html` (Angular: `src/index.html`) |
| Nuxt | `app.head.script` in `nuxt.config.ts`: `{ src: "https://cdn.petmysite.com/pet.js", async: true, "data-site": "…", tagPosition: "bodyClose" }` |
| SvelteKit | `src/app.html`, before `</body>` |
| Astro | The base layout component (`src/layouts/*.astro`), with `is:inline` on the script tag |
| Remix / React Router framework mode | `app/root.tsx`, or use the React package |
| Rails / Django / Laravel / PHP | The application layout template (`application.html.erb`, `base.html`, `app.blade.php`, `footer.php`) |
| Hugo / Jekyll / Eleventy | The base layout or footer partial |

### Next.js with `next/script` (no package)

```tsx
// app/layout.tsx, inside <body>
import Script from "next/script";

<Script
  src="https://cdn.petmysite.com/pet.js"
  data-site={process.env.NEXT_PUBLIC_PETMYSITE_KEY}
  strategy="afterInteractive"
/>
```

Prefer the React package in React projects; it adds typed controls. Use one or the other.

## Site builders

Paste the same script tag. Always test the **published** site on the registered domain.

| Platform | Where |
|---|---|
| Shopify | Online Store → Themes → (duplicate as backup) → Edit code → `layout/theme.liquid`, immediately before `</body>`, on the **published** theme. Checkout pages are outside the theme. |
| Webflow | Site settings → Custom code → **Footer code** (site-wide), then publish. |
| Squarespace | Code Injection → **Footer**. Requires a plan with Code Injection. Not on checkout. |
| Wix | Settings → Custom Code → Add Custom Code → All pages, **Load code once**, **Body - end**. Needs a connected domain. |
| Framer | Project Settings → Custom Code → Add Script → all pages, end of body, run **Once**. Canvas preview does not show it. |

In a Shopify theme repo, edit `layout/theme.liquid` directly.

## WordPress

Use the plugin, not a pasted script: Plugins → Add New Plugin → search **PetMySite** → Install → Activate → Settings → PetMySite → **Connect PetMySite**. Requires WordPress 6.3+ and PHP 7.4+. Shortcode for an inline launcher button: `[petmysite_launcher label="Chat with us"]`.

If a theme also contains the script tag, remove it so there is one source. Exclude `pet.js` from "delay JavaScript" / combine features (WP Rocket, LiteSpeed Cache, Autoptimize).

## Google Tag Manager

Only when editing the site's code is impossible: ad blockers block Tag Manager, so those visitors get no pet. New tag → Custom HTML → paste the script tag → trigger **All Pages** → Save → Submit → Publish. API code added in GTM must use `window.petMySiteQueue`.

## Verify

1. Load a page on the registered domain (or localhost) and confirm the pet appears.
2. Deploy, then in the dashboard's **Installation** page select **Verify installation**. Local visits never verify and are never counted.
