# PetMySite JavaScript API

Official page: https://petmysite.com/help/api/javascript

`pet.js` defines one global, `window.petMySite` (alias `window.PetMySite`, same object). Nothing else to load. For React projects use `@petmysite/react` instead (`react.md`); it wraps this same object.

## Timing

- A script placed **after** the `pet.js` tag can call methods and add handlers immediately. Calls made while the pet loads wait and run in order.
- When load order is not guaranteed (`async`/`defer` scripts, Tag Manager, delay-JS plugins, bundles), use the queue. It works before or after `pet.js`:

```html
<script>
  (window.petMySiteQueue = window.petMySiteQueue || []).push(function (pet) {
    pet.onClick(function (e) { /* … */ });
    if (location.pathname.startsWith("/checkout")) pet.hide();
  });
</script>
```

- To act only once the pet is visible: `window.addEventListener("petmysite:ready", fn)`.
- If the pet cannot load (wrong domain, invalid config), calls are dropped and handlers never run. The page keeps working.

## Methods

All return `undefined` except `open()`. None throw; invalid arguments log `[PetMySite] …` and are ignored.

| Method | Behaviour |
|---|---|
| `show()` | Shows the pet after `hide()`. |
| `hide()` | Hides pet, menu and bubble. Not remembered across full page loads: call it on each page. Separate from the automatic hiding while chat is open. |
| `showBubble(message, linkText?, action?, options?)` | Speech bubble. `message`: plain text, 1–160 chars (HTML shown as text). `linkText`: button label ≤40 chars, requires `action`. `action`: absolute or relative `http(s)` URL, or a function; other schemes (`javascript:`, `mailto:`) are rejected. Without `linkText`, clicking the message runs the action. `options.newTab: true` opens a URL in a new tab (default same tab). Replaces any Smart Bubble or invite; stays until closed, `hideBubble()`, or navigation. Nothing shows while hidden. |
| `hideBubble()` | Closes the bubble opened with `showBubble()`. |
| `play(state)` | One of `wave`, `celebrate`, `excited`, `surprised`, `curious`, `loved`, `look_around`, `peek`. Skipped while hidden, while the visitor is holding/stroking the pet, or under `prefers-reduced-motion`. |
| `open()` | Does what a click does (opens chat, or the contact menu). Returns `false` if nothing can open or the pet is not mounted. **Not queued.** Does not fire `click`. |
| `chatOpened()` | Tell PetMySite that *your* code opened a chat. Counted once per pet click or bubble action, within 60 s of it. Dropped before mount. |
| `on(type, handler)` | `type`: `"click"`, `"petting"`, `"rightClick"`. Returns an unsubscribe function. |
| `off(type, handler)` | Removes a handler. |
| `onClick(h)`, `onPetting(h)`, `onRightClick(h)` | Shortcuts for `on(...)`; return unsubscribe functions. |

## Events

| Type | When | Cancelable |
|---|---|---|
| `click` | Click, tap, or Enter/Space while focused. Runs before the configured chat/menu opens. | Yes: `e.preventDefault()` skips the configured action |
| `petting` | Visitor finished stroking the pet (once per petting session). | No |
| `rightClick` | Right-click or touch long-press on the pet. The browser menu is suppressed on the pet only. | No |

Event object: `{ type, pet: { id, play(state) }, cancelable, defaultPrevented, preventDefault() }`. `pet.id` is the pet's id, e.g. `"piko"`. No visitor data, pointer positions or page content. A throwing handler is reported to the console and does not stop other handlers.

## Recipes

```js
// Celebrate an add to cart
document.querySelector("#add-to-cart").addEventListener("click", () => {
  petMySite.play("celebrate");
  petMySite.showBubble("Nice pick! Your cart is ready.", "Check out", "/checkout");
});

// Replace the click action with your own panel
petMySite.onClick((e) => {
  e.preventDefault();
  e.pet.play("wave");
  openMyHelpPanel();
});

// Open your own chat and have it counted
petMySite.onClick((e) => {
  e.preventDefault();
  myChat.open();
});
myChat.on("open", () => petMySite.chatOpened());

// Function action and new-tab URL
petMySite.showBubble("Want a tour?", "Start the tour", () => startProductTour());
petMySite.showBubble("Read our sizing guide", "Open guide", "https://example.com/sizes", { newTab: true });

// Listen, then stop
const stop = petMySite.onPetting(() => petMySite.showBubble("That tickles!"));
stop();
```

## TypeScript (script installs)

```ts
type PetPlayState =
  | "wave" | "celebrate" | "excited" | "surprised"
  | "curious" | "loved" | "look_around" | "peek";
type PetEventType = "click" | "petting" | "rightClick";
interface PetEvent {
  readonly type: PetEventType;
  readonly pet: { readonly id: string; play(state: PetPlayState): void };
  readonly cancelable: boolean; // true only for "click"
  readonly defaultPrevented: boolean;
  preventDefault(): void;
}
interface PetMySiteApi {
  show(): void;
  hide(): void;
  showBubble(message: string, linkText?: string, action?: string | (() => void), options?: { newTab?: boolean }): void;
  hideBubble(): void;
  play(state: PetPlayState): void;
  open(): boolean;
  chatOpened(): void;
  on(type: PetEventType, handler: (event: PetEvent) => void): () => void;
  off(type: PetEventType, handler: (event: PetEvent) => void): void;
  onClick(handler: (event: PetEvent) => void): () => void;
  onPetting(handler: (event: PetEvent) => void): () => void;
  onRightClick(handler: (event: PetEvent) => void): () => void;
}
declare global {
  interface Window {
    petMySite: PetMySiteApi;
    PetMySite: PetMySiteApi;
    petMySiteQueue?: Array<(api: PetMySiteApi) => void> | { push(...fns: Array<(api: PetMySiteApi) => void>): number };
  }
}
export {};
```

## Limits

- The API runs in the visitor's browser. It cannot change dashboard settings, plan or attribution.
- Local pages (`localhost`, `127.0.0.1`, `[::1]`, `*.local`, `*.test`) use live settings but are never counted and never verify installation.
