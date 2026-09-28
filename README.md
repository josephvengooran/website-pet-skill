# PetMySite plugin for Claude Code and Codex

Teaches coding agents to add the [PetMySite](https://petmysite.com) website pet to a website and control it from code, using only the real, documented API.

The plugin contains one skill, `integrating-petmysite`, with references for:

- **Installing:** script tag, React/Next.js package, Vue, Svelte, Astro, server templates, Shopify, Webflow, Squarespace, Wix, Framer, WordPress and Google Tag Manager
- **JavaScript API:** `window.petMySite`, `window.petMySiteQueue`, methods, events and TypeScript declarations
- **React library:** `@petmysite/react` (`<PetMySite>`, `petMySite`, `usePetMySiteEvent`, `withPetMySite`, `loadPetMySite`)
- **Troubleshooting:** domains, CSP, chat providers, delayed-JavaScript plugins

## Install in Claude Code

```text
/plugin marketplace add josephvengooran/website-pet-skill
/plugin install petmysite@website-pet-skill
```

## Install in Codex

```sh
codex plugin marketplace add josephvengooran/website-pet-skill
codex plugin add petmysite@website-pet-skill
```

## Use

Ask your agent, for example:

- "Add the PetMySite pet to this Next.js app."
- "Make the pet celebrate when someone adds to cart."
- "Hide the pet on checkout routes."
- "When visitors click the pet, open our own help panel instead of chat."

You need a PetMySite website and its public site key (`pms_…`) from the website's **Installation** page. The agent will ask for it or use an environment variable placeholder.

## What it runs and sends

The plugin is instructions only. It has no hooks, MCP servers, commands or scripts that run on install or use, and it sends nothing anywhere. `scripts/validate.mjs` is a maintainer check that you run by hand; the agent never runs it.

The code your agent writes with it loads `https://cdn.petmysite.com/pet.js` in your visitors' browsers, the same script shown on your PetMySite **Installation** page. That script uses no cookies or storage and reports only aggregate counts; see the [PetMySite privacy policy](https://petmysite.com/privacy).

## Layout

```text
.claude-plugin/plugin.json        Claude Code plugin manifest
.claude-plugin/marketplace.json   Claude Code marketplace (this repo)
.codex-plugin/plugin.json         Codex plugin manifest
.agents/plugins/marketplace.json  Codex marketplace (this repo)
skills/integrating-petmysite/     The skill and its references
scripts/validate.mjs              Manifest and API-accuracy checks
```

## Maintaining

Run `node scripts/validate.mjs` before each release. It checks that both manifests agree and that the docs mention only real `petMySite` methods and `play()` states. When the PetMySite API changes, update the references and the `METHODS`/`PLAY_STATES` lists together, and bump `version` in `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` and `.codex-plugin/plugin.json`.

Help and API docs: https://petmysite.com/help · Support: support@petmysite.com

MIT licensed.
