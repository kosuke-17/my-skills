#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function formatLocalTimestamp(d) {
  const pad = (n) => String(n).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms}`;
}

function ensureObject(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  return { value };
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outputFile = process.env.AGENT_AUDIT_OUTPUT_FILE
  ? path.resolve(process.env.AGENT_AUDIT_OUTPUT_FILE)
  : path.join(scriptDir, "agent-audit.json");

const REDACT_KEYS = new Set([
  "conversation_id",
  "generation_id",
  "user_email",
  "transcript_path",
  "workspace_roots",
  "tool_use_id",
]);

function parseAuditFileToObject(filePath) {
  let txt = "";
  try {
    txt = fs.readFileSync(filePath, "utf8").trim();
  } catch {
    return {};
  }

  if (!txt) return {};

  // まず通常のJSON（{ ... }）として解釈
  try {
    const obj = JSON.parse(txt);
    if (obj && typeof obj === "object" && !Array.isArray(obj)) return obj;
  } catch {
    // NDJSONの可能性があるので後続で処理する
  }

  // 旧形式（NDJSON: 1行1JSON）をマイグレーション
  const out = {};
  const lines = txt.split(/\r?\n/).filter(Boolean);

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
        continue;
      if (typeof parsed.timestamp !== "string" || !parsed.timestamp) continue;
      const { timestamp: _timestamp, ...rest } = parsed;
      for (const k of REDACT_KEYS) delete rest[k];
      out[parsed.timestamp] = rest;
    } catch {
      // ignore invalid line
    }
  }
  return out;
}

let rawInput = "";
for await (const chunk of process.stdin) {
  rawInput += chunk.toString("utf8");
}
rawInput = rawInput.trim();

let parsed;
try {
  parsed = rawInput ? JSON.parse(rawInput) : {};
} catch {
  parsed = { raw: rawInput };
}

const json_input = ensureObject(parsed);
const timestamp = formatLocalTimestamp(new Date());
json_input.timestamp = timestamp;

const entry = (() => {
  // `timestamp` はキーにするので、値側からは除外（例に合わせる）
  const { timestamp: _timestamp, ...rest } = json_input;
  for (const k of REDACT_KEYS) delete rest[k];
  return rest;
})();

function upsert(filePath) {
  const obj = parseAuditFileToObject(filePath);
  obj[timestamp] = entry;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(obj)}\n`, "utf8");
}

try {
  upsert(outputFile);
} catch (err) {
  // Sandbox/権限都合で `.cursor` 配下に書けないケースがあるため、フォールバックします。
  if (err && (err.code === "EPERM" || err.code === "EACCES")) {
    const fallbackFile = "/tmp/agent-audit.json";
    upsert(fallbackFile);
  } else {
    throw err;
  }
}

process.exit(0);
