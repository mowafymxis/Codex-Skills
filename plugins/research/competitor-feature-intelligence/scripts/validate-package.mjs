import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const manifest = JSON.parse(
  await readFile(path.join(root, ".codex-plugin", "plugin.json"), "utf8"),
);
if (manifest.name !== "competitor-feature-intelligence") throw new Error("Invalid plugin name");
if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) throw new Error("Invalid semantic version");
if (manifest.skills !== "./skills/") throw new Error("Invalid skill path");
await access(path.join(root, "skills", "competitor-feature-intelligence", "SKILL.md"));
const marketplace = JSON.parse(
  await readFile(path.resolve(root, "..", "..", ".agents", "plugins", "marketplace.json"), "utf8"),
);
const entry = marketplace.plugins.find((x) => x.name === manifest.name);
if (entry?.source?.path !== "./plugins/competitor-feature-intelligence")
  throw new Error("Invalid marketplace source path");
console.log("Package structure is valid.");
