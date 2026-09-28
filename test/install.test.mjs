import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, existsSync, writeFileSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse, run } from "../cli/install.mjs";

const quiet = () => {};
const temp = () => mkdtempSync(join(tmpdir(), "website-pet-skill-"));
const skillAt = (root, folder) => join(root, folder, "integrating-petmysite", "SKILL.md");

test("installs for both agents in the user folder by default", () => {
  const home = temp();
  assert.equal(run(parse(["install"]), { home, cwd: temp(), log: quiet }), 0);
  for (const folder of [".claude/skills", ".agents/skills"]) {
    assert.match(readFileSync(skillAt(home, folder), "utf8"), /^name: integrating-petmysite$/m);
    assert.ok(existsSync(join(home, folder, "integrating-petmysite", "references", "react.md")));
  }
});

test("installs into the project and for one agent only", () => {
  const cwd = temp();
  assert.equal(run(parse(["install", "--project", "--agent", "codex"]), { home: temp(), cwd, log: quiet }), 0);
  assert.ok(existsSync(skillAt(cwd, ".agents/skills")));
  assert.ok(!existsSync(skillAt(cwd, ".claude/skills")));
});

test("reinstalls over an earlier copy or a skills.sh symlink, then uninstalls", () => {
  const home = temp();
  run(parse([]), { home, cwd: temp(), log: quiet });
  const linked = join(home, ".claude/skills/integrating-petmysite");
  const elsewhere = temp();
  run(parse(["uninstall", "--agent", "claude"]), { home, cwd: temp(), log: quiet });
  symlinkSync(elsewhere, linked);
  assert.equal(run(parse(["install"]), { home, cwd: temp(), log: quiet }), 0);
  assert.ok(existsSync(skillAt(home, ".claude/skills")));
  assert.equal(run(parse(["uninstall"]), { home, cwd: temp(), log: quiet }), 0);
  assert.ok(!existsSync(skillAt(home, ".claude/skills")) && !existsSync(skillAt(home, ".agents/skills")));
});

test("leaves a different skill with the same folder name alone", () => {
  const home = temp();
  const foreign = join(home, ".claude/skills/integrating-petmysite");
  mkdirSync(foreign, { recursive: true });
  writeFileSync(join(foreign, "SKILL.md"), "---\nname: something-else\n---\n");
  assert.equal(run(parse(["install", "--agent", "claude"]), { home, cwd: temp(), log: quiet }), 1);
  assert.match(readFileSync(join(foreign, "SKILL.md"), "utf8"), /something-else/);
});

test("rejects unknown agents and arguments", () => {
  assert.throws(() => parse(["--agent", "cursor"]), /Unknown agent/);
  assert.throws(() => parse(["--frobnicate"]), /Unknown argument/);
  assert.deepEqual(parse(["-a", "claude-code"]).agents, ["claude"]);
});
