#!/usr/bin/env ts-node
import { execSync } from "node:child_process";
import fs from "node:fs";
import yaml from "js-yaml";

type OpMap = Record<string, { method: string; path: string; opId?: string }>;

function loadYamlAtRef(ref: string, file: string) {
  const raw = execSync(`git show ${ref}:${file}`, { stdio: ["ignore", "pipe", "ignore"] }).toString("utf8");
  return yaml.load(raw) as any;
}

function loadYamlLocal(file: string) {
  const raw = fs.readFileSync(file, "utf8");
  return yaml.load(raw) as any;
}

function collectOps(doc: any): OpMap {
  const out: OpMap = {};
  const paths = doc?.paths || {};
  for (const p of Object.keys(paths)) {
    const obj = paths[p] || {};
    for (const m of ["get","post","put","patch","delete","options","head"]) {
      if (obj[m]) {
        const opId = obj[m].operationId;
        const key = `${m.toUpperCase()} ${p}`;
        out[key] = { method: m.toUpperCase(), path: p, opId };
      }
    }
  }
  return out;
}

function main() {
  const file = "docs/openapi.yaml";
  if (!fs.existsSync(file)) {
    console.log("OpenAPI diff: docs/openapi.yaml not found locally. Skipping.");
    process.exit(0);
  }

  const baseRef = process.env.GITHUB_BASE_REF || "origin/main";
  let baseDoc: any = null;
  try { baseDoc = loadYamlAtRef(baseRef, file); } catch {}
  const headDoc = loadYamlLocal(file);

  if (!baseDoc) {
    console.log(`### OpenAPI Contract Changes\n\n- New spec added in this PR (${file}).`);
    process.exit(0);
  }

  const baseOps = collectOps(baseDoc);
  const headOps = collectOps(headDoc);

  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];

  const baseKeys = new Set(Object.keys(baseOps));
  const headKeys = new Set(Object.keys(headOps));
  for (const k of headKeys) if (!baseKeys.has(k)) added.push(k);
  for (const k of baseKeys) if (!headKeys.has(k)) removed.push(k);
  for (const k of headKeys) {
    if (baseKeys.has(k)) {
      const b = baseOps[k]?.opId || "";
      const h = headOps[k]?.opId || "";
      if (b !== h) changed.push(`${k} (operationId: "${b}" → "${h}")`);
    }
  }

  let md = "### OpenAPI Contract Changes\n";
  if (!added.length && !removed.length && !changed.length) {
    md += "- No added/removed/changed operations.\n";
  } else {
    if (added.length) { md += "\n**Added**\n"; for (const a of added) md += `- ${a}\n`; }
    if (removed.length) { md += "\n**Removed**\n"; for (const r of removed) md += `- ${r}\n`; }
    if (changed.length) { md += "\n**Changed**\n"; for (const c of changed) md += `- ${c}\n`; }
  }
  console.log(md);
}

main();
