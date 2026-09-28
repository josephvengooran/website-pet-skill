// Checks the plugin manifests agree and that the skill documents only the real PetMySite API.
// Run: node scripts/validate.mjs
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");
const json = (path) => JSON.parse(read(path));
const errors = [];
const check = (ok, message) => ok || errors.push(message);

const claude = json(".claude-plugin/plugin.json");
const codex = json(".codex-plugin/plugin.json");
const claudeMarket = json(".claude-plugin/marketplace.json");
const codexMarket = json(".agents/plugins/marketplace.json");

check(claude.name === codex.name, "plugin names differ between Claude Code and Codex manifests");
check(claude.version === codex.version, "plugin versions differ between Claude Code and Codex manifests");
const npmPackage = json("package.json");
check(npmPackage.version === claude.version, "package.json version differs from the plugin manifests");
check(claudeMarket.plugins.some((p) => p.name === claude.name && p.version === claude.version),
  "Claude marketplace entry does not match plugin name/version");
check(codexMarket.plugins.some((p) => p.name === codex.name), "Codex marketplace entry does not match plugin name");
for (const icon of [codex.interface.logo, codex.interface.composerIcon])
  check(existsSync(join(root, icon)), `missing Codex icon ${icon}`);

const skillsDir = join(root, "skills");
const docs = [];
const skillNames = readdirSync(skillsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
for (const skill of skillNames) {
  const body = read(`skills/${skill}/SKILL.md`);
  const front = body.match(/^---\n([\s\S]*?)\n---\n/);
  check(front, `${skill}: SKILL.md has no frontmatter`);
  const name = front?.[1].match(/^name: (.+)$/m)?.[1];
  const description = front?.[1].match(/^description: (.+)$/m)?.[1] ?? "";
  check(name === skill, `${skill}: frontmatter name must equal the folder name`);
  check(/^[a-z0-9-]+$/.test(name ?? ""), `${skill}: name must be lowercase letters, digits and hyphens`);
  check(description.startsWith("Use when") && description.length <= 1024, `${skill}: description must start with "Use when" and fit 1024 chars`);
  for (const ref of body.matchAll(/`(references\/[\w.-]+)`/g))
    check(existsSync(join(skillsDir, skill, ref[1])), `${skill}: links missing ${ref[1]}`);
  docs.push(body);
  const refs = join(skillsDir, skill, "references");
  if (existsSync(refs)) for (const file of readdirSync(refs).filter((f) => f.endsWith(".md"))) docs.push(read(`skills/${skill}/references/${file}`));
}

// The public API as shipped in pet.js and @petmysite/react 0.2.x.
const METHODS = new Set(["show", "hide", "showBubble", "hideBubble", "play", "open", "chatOpened",
  "on", "off", "onClick", "onPetting", "onRightClick"]);
const PLAY_STATES = new Set(["wave", "celebrate", "excited", "surprised", "curious", "loved", "look_around", "peek"]);
const text = docs.join("\n");
for (const [, method] of text.matchAll(/\b(?:petMySite|PetMySite|pet|api)\.(\w+)\(/g))
  check(METHODS.has(method) || method === "id", `documented method petMySite.${method}() does not exist`);
for (const [, state] of text.matchAll(/\bplay\("(\w+)"\)/g))
  check(PLAY_STATES.has(state), `documented play state "${state}" does not exist`);

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log(`✓ ${claude.name} ${claude.version}: manifests agree, ${docs.length} skill files reference only the real API`);
