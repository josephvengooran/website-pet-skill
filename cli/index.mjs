#!/usr/bin/env node
import { HELP, parse, run, version } from "./install.mjs";

try {
  const options = parse(process.argv.slice(2));
  if (options.help) console.log(HELP);
  else if (options.version) console.log(version);
  else process.exitCode = run(options);
} catch (error) {
  console.error(`website-pet-skill: ${error.message}`);
  process.exitCode = 1;
}
