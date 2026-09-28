# Directory listing kit

Everything needed to list this plugin in Anthropic's plugin directory (Claude Code, claude.ai, Cowork) and OpenAI's Plugins Directory (Codex, ChatGPT). Both are submitted by a person from a signed-in account; neither accepts a pull request.

## Anthropic plugin directory

Requires a Pro, Max, Team or Enterprise Claude plan (Team/Enterprise: an Owner or a member with the Directory permission) and the GitHub account that can push to this repository connected on claude.ai.

1. Open https://claude.ai/directory/manage → **Submit new** → **Plugin bundle**.
2. **Source**
   - Repository: `josephvengooran/website-pet-skill`
   - Plugin path: leave empty (the plugin is the repository root)
   - Branch or tag: leave empty to follow `main`
   - Select **Validate**. Fix anything marked **Blocking**, push, then **Re-validate**.
3. **Listing details** come from `.claude-plugin/plugin.json` and `README.md`. Edit those files, not the form.
4. **Data handling**
   - Reads or stores personal data: **No**. The plugin is instructions only.
   - Sends data to other services: **No**. It runs nothing. (The code it helps write loads `https://cdn.petmysite.com/pet.js` in the website's own pages; this is disclosed in the README.)
   - Data retention: **None**.
   - Intended for people under 18: **No**.
5. **Compliance**: contact email `support@petmysite.com`; read and select the four acknowledgements.
6. **Review and submit**: keep **GitHub push webhook**, then **Submit for review**. Set up push updates afterwards (needs admin on the repository).
7. When the version passes, select **Publish**.

Later releases: bump `version` in `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` and `.codex-plugin/plugin.json`, run `node scripts/validate.mjs`, and push to `main`.

## OpenAI Plugins Directory

Requires an OpenAI Platform organization role with **Apps Management** write access (owners have it) and a verified individual or business identity.

1. Build the skill bundle:

   ```sh
   mkdir -p dist && rm -f dist/integrating-petmysite.zip
   (cd skills && zip -r ../dist/integrating-petmysite.zip integrating-petmysite -x '*.DS_Store')
   ```

2. Open https://platform.openai.com/plugins → **Create plugin** → **Skills only**, and upload `dist/integrating-petmysite.zip`.
3. Fill in the form with the values below, choose countries and regions, and **Submit for review**.

### Listing

| Field | Value |
|---|---|
| Name | PetMySite |
| Short description | Add the PetMySite website pet to any website and control it from code |
| Long description | Install the PetMySite website pet with the script tag, the @petmysite/react package, WordPress or a site builder, then show bubbles, play animations, hide it on some routes and handle click, petting and right-click events with the JavaScript API or React hooks. |
| Category | Developer Tools |
| Logo | `assets/icon.png` (512 × 512) |
| Website | https://petmysite.com |
| Support URL | https://petmysite.com/help/website-pet-skill/codex-claude-code |
| Privacy policy | https://petmysite.com/privacy |
| Terms | https://petmysite.com/terms |

### Starter prompts

- Add the PetMySite pet to this Next.js app
- Add the website pet to my website
- Celebrate with the pet when a visitor adds to cart
- Hide the PetMySite pet on checkout routes

### Test cases

Positive (the skill should load and the result should use only the documented API):

1. "Add the PetMySite pet to this Next.js App Router app." Expected: installs `@petmysite/react`, renders `<PetMySite siteKey={process.env.NEXT_PUBLIC_PETMYSITE_KEY!} />` once in `app/layout.tsx`, adds the variable to `.env.example`, does not also add a script tag.
2. "Add PetMySite to this static HTML site." Expected: one `<script async src="https://cdn.petmysite.com/pet.js" data-site="…">` before `</body>` in the shared layout; asks for the key or leaves a clearly marked placeholder; no `integrity` attribute.
3. "When someone adds an item to the cart, make the pet celebrate and offer checkout." Expected: `petMySite.play("celebrate")` and `petMySite.showBubble(message, "Check out", "/checkout")` with a message of 160 characters or fewer.
4. "Hide the pet on /checkout routes in our React app." Expected: the `hidden` prop driven by the current path, not unmounting the component.
5. "Our Tag Manager tag should open our own help panel when the pet is clicked." Expected: `window.petMySiteQueue` push with an `onClick` handler that calls `e.preventDefault()`.

Negative (the skill should not load, or should decline to invent behaviour):

1. "Add an Intercom chat widget to this site." Expected: the skill is not used; PetMySite is not added.
2. "Use petMySite.init() to choose Dottie as the pet from code." Expected: explains there is no `init()` and the pet is chosen in the PetMySite dashboard; no invented API.
3. "Remove the 'by PetMySite' attribution with CSS." Expected: declines; attribution is a plan setting in the dashboard.

### Release notes (1.0.1)

First public release. Teaches Codex to install the PetMySite website pet (script tag, React/Next.js package, site builders, WordPress, Tag Manager) and to use the `window.petMySite` JavaScript API and `@petmysite/react`, with troubleshooting for domains, CSP and chat providers.
