# @petmysite/react

Official page: https://petmysite.com/help/api/react-nextjs · npm: https://www.npmjs.com/package/@petmysite/react

React 18+ (peer dependency), Next.js App Router and Pages Router, Vite, React Router, Remix. It loads the same `https://cdn.petmysite.com/pet.js` and adds typed controls. It renders no DOM and does nothing during server rendering. Do not also add the script tag.

```sh
npm install @petmysite/react
```

## Mount once in the persistent layout

```tsx
// Next.js App Router: app/layout.tsx (a server component is fine; the package is "use client")
import { PetMySite } from "@petmysite/react";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <PetMySite siteKey={process.env.NEXT_PUBLIC_PETMYSITE_KEY!} />
      </body>
    </html>
  );
}
```

```tsx
// Next.js Pages Router: pages/_app.tsx
import type { AppProps } from "next/app";
import { PetMySite } from "@petmysite/react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <PetMySite siteKey={process.env.NEXT_PUBLIC_PETMYSITE_KEY!} />
    </>
  );
}
```

```tsx
// Vite / React Router: src/App.tsx
<>
  <AppRoutes />
  <PetMySite siteKey={import.meta.env.VITE_PETMYSITE_KEY} />
</>
```

Add the key to `.env.local` (`NEXT_PUBLIC_PETMYSITE_KEY=pms_…`) or `.env` (`VITE_PETMYSITE_KEY=pms_…`) and to the deploy environment. Add a placeholder line to `.env.example` if the project has one.

## `<PetMySite>` props

| Prop | Type | Notes |
|---|---|---|
| `siteKey` | `string` | Required. Invalid key logs a `[PetMySite]` console error instead of throwing. |
| `hidden` | `boolean` | Hides while `true`, shows again when it turns `false`. Persists across client-side route changes. |
| `onClick` | `(event: PetEvent) => void` | Runs before the configured chat/menu; `event.preventDefault()` skips it. |
| `onPetting` | `(event: PetEvent) => void` | Visitor finished petting. |
| `onRightClick` | `(event: PetEvent) => void` | Right-click or long-press. |

Handlers may change every render; the latest runs (no `useCallback` needed). Unmounting does not remove the pet: use `hidden`. Switching to a different site key needs a full page load; a page already carrying the script with another key logs an error and is left unchanged.

## Exports

| Export | Use |
|---|---|
| `petMySite` | Frozen object with `show`, `hide`, `showBubble`, `hideBubble`, `play`, `chatOpened`, `open`, `on`, `onClick`, `onPetting`, `onRightClick`. Safe anywhere; calls before load wait and run in order; no-op on the server. `open()` does not wait: returns `false` until the pet has loaded. There is no `off`; use the function `on…` returns. |
| `usePetMySiteEvent(type, handler)` | Subscribes while the component is mounted. `handler` may be `undefined`. |
| `withPetMySite(callback)` | Runs `callback(api)` with the raw `window.petMySite` once `pet.js` loads (or immediately). |
| `onPetMySite(type, handler)` | Subscribe outside React; returns unsubscribe. |
| `loadPetMySite(siteKey, doc?)` | Inject the script without the component. Throws `TypeError` on an invalid key. |
| Types | `PetMySiteProps`, `PetMySiteApi`, `PetEvent`, `PetEventType`, `PetEventHandler`, `PetPlayState`, `PetBubbleOptions` |

Method semantics (bubble limits, play states, `chatOpened` counting) are identical to `javascript-api.md`.

## Recipes

Components that call `petMySite` from event handlers or use the hook must be client components in the App Router (`"use client"`).

```tsx
// Hide on some routes (App Router)
"use client";
import { usePathname } from "next/navigation";
import { PetMySite } from "@petmysite/react";

export function Pet() {
  const pathname = usePathname();
  return <PetMySite siteKey={process.env.NEXT_PUBLIC_PETMYSITE_KEY!} hidden={pathname.startsWith("/checkout")} />;
}
// Render <Pet /> in app/layout.tsx instead of <PetMySite />.
```

```tsx
// React to app events
"use client";
import { petMySite } from "@petmysite/react";

export function AddToCartButton() {
  return (
    <button onClick={() => {
      petMySite.play("celebrate");
      petMySite.showBubble("Nice pick! Your cart is ready.", "Check out", "/checkout");
    }}>
      Add to cart
    </button>
  );
}
```

```tsx
// Bubble link that keeps client-side navigation (a URL action does a full page load)
"use client";
import { useRouter } from "next/navigation";
import { petMySite } from "@petmysite/react";

export function TourPrompt() {
  const router = useRouter();
  return (
    <button onClick={() => petMySite.showBubble("Want a two-minute tour?", "Start the tour", () => router.push("/tour"))}>
      Show tip
    </button>
  );
}
```

```tsx
// Replace the click action with your own panel
"use client";
import { useState } from "react";
import { PetMySite } from "@petmysite/react";

export function Pet() {
  const [helpOpen, setHelpOpen] = useState(false);
  return (
    <>
      <PetMySite
        siteKey={process.env.NEXT_PUBLIC_PETMYSITE_KEY!}
        onClick={(e) => {
          e.preventDefault();
          e.pet.play("wave");
          setHelpOpen(true);
        }}
      />
      {helpOpen && <HelpPanel onClose={() => setHelpOpen(false)} />}
    </>
  );
}
```

```tsx
// Subscribe deeper in the tree
"use client";
import { petMySite, usePetMySiteEvent } from "@petmysite/react";

export function PettingThanks() {
  usePetMySiteEvent("petting", () => petMySite.showBubble("That tickles! Thanks for saying hi."));
  return null;
}
```

## Routing behaviour

The pet follows client-side navigation: on a route change it closes its bubble and menu and re-evaluates Smart Bubbles for the new path. `hidden` and `petMySite.hide()` persist across route changes until shown again.

## Testing components that use it

In Jest/Vitest (jsdom), calls just queue on `window.petMySiteQueue`; nothing loads. To assert calls, mock the module:

```ts
vi.mock("@petmysite/react", () => ({
  PetMySite: () => null,
  usePetMySiteEvent: vi.fn(),
  petMySite: { play: vi.fn(), showBubble: vi.fn(), hide: vi.fn(), show: vi.fn(), hideBubble: vi.fn(), open: vi.fn(() => false), chatOpened: vi.fn(), on: vi.fn(() => () => {}), onClick: vi.fn(() => () => {}), onPetting: vi.fn(() => () => {}), onRightClick: vi.fn(() => () => {}) },
}));
```
