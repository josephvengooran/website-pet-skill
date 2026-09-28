// One-step installer for the integrating-petmysite skill.
// Copies the skill bundled in this package into the folders Claude Code
// (.claude/skills) and Codex (.agents/skills) read. No network, no dependencies.
import { cpSync, existsSync, lstatSync, readFileSync, rmSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SKILL = "integrating-petmysite";
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(packageRoot, "skills", SKILL);
export const { version } = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));

const AGENTS = {
  claude: { name: "Claude Code", folder: ".claude/skills" },
  codex: { name: "Codex", folder: ".agents/skills" },
};

export const HELP = `website-pet-skill ${version}
Install the PetMySite skill for Claude Code and Codex.

Usage:
  npx website-pet-skill install      Install for your user (all projects)
  npx website-pet-skill uninstall    Remove it again

Options:
  --project         Install into the current project instead of your user folder
  --agent <name>    Only one agent: claude or codex (default: both)
  -h, --help        Show this help
  -v, --version     Show the version

Skill folders:
  Claude Code  ~/.claude/skills/${SKILL}   (project: ./.claude/skills/${SKILL})
  Codex        ~/.agents/skills/${SKILL}   (project: ./.agents/skills/${SKILL})
`;

export function parse(argv) {
  const options = { command: "install", project: false, agents: Object.keys(AGENTS), help: false, version: false };
  const rest = [...argv];
  while (rest.length) {
    const arg = rest.shift();
    if (arg === "install" || arg === "add") options.command = "install";
    else if (arg === "uninstall" || arg === "remove") options.command = "uninstall";
    else if (arg === "--project" || arg === "-p") options.project = true;
    else if (arg === "--global" || arg === "-g") options.project = false;
    else if (arg === "--agent" || arg === "-a" || arg.startsWith("--agent=")) {
      const value = arg.includes("=") ? arg.split("=")[1] : rest.shift();
      const agent = value === "claude-code" ? "claude" : value;
      if (!AGENTS[agent]) throw new Error(`Unknown agent "${value}". Use claude or codex.`);
      options.agents = [agent];
    } else if (arg === "-h" || arg === "--help" || arg === "help") options.help = true;
    else if (arg === "-v" || arg === "--version") options.version = true;
    else throw new Error(`Unknown argument "${arg}". Run with --help.`);
  }
  return options;
}

/** A folder that already holds this skill, or nothing: safe to replace. */
function isOurs(target) {
  if (!existsSync(target)) return true;
  if (lstatSync(target).isSymbolicLink()) return true;
  try {
    return /^name: integrating-petmysite$/m.test(readFileSync(join(target, "SKILL.md"), "utf8"));
  } catch {
    return false;
  }
}

export function run(options, { cwd = process.cwd(), home = homedir(), log = console.log } = {}) {
  const base = options.project ? cwd : home;
  const where = options.project ? "this project" : "your user folder";
  let failed = false;
  for (const id of options.agents) {
    const agent = AGENTS[id];
    const target = join(base, agent.folder, SKILL);
    if (!isOurs(target)) {
      log(`✗ ${agent.name}: ${target} exists and is not this skill. Left it alone.`);
      failed = true;
      continue;
    }
    rmSync(target, { recursive: true, force: true });
    if (options.command === "uninstall") {
      log(`✓ ${agent.name}: removed from ${where}`);
      continue;
    }
    mkdirSync(dirname(target), { recursive: true });
    cpSync(source, target, { recursive: true, filter: (path) => !path.endsWith(".DS_Store") });
    log(`✓ ${agent.name}: ${options.project ? join(agent.folder, SKILL) : join("~", agent.folder, SKILL)}`);
  }
  if (options.command === "install" && !failed) {
    log(`\nStart a new session, then ask: "Add the PetMySite pet to this site."`);
    log(`Guide: https://petmysite.com/help/website-pet-skill/codex-claude-code`);
  }
  return failed ? 1 : 0;
}
