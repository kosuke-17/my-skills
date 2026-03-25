#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

/**
 * Cursor Agent Audit Hook
 *
 * Cursor Hooksの全イベントを受け取り、コマンド・スキル・サブエージェントの
 * 実行回数をJSONログに記録する。
 *
 * 対応イベント:
 *   beforeSubmitPrompt, beforeShellExecution, beforeMCPExecution,
 *   beforeReadFile, afterFileEdit, stop
 */

// ---------------------------------------------------------------------------
// 1. stdin からペイロードを読み取り
// ---------------------------------------------------------------------------
const input = readFileSync("/dev/stdin", "utf-8");
let payload;
try {
  payload = JSON.parse(input);
} catch {
  // JSON パース失敗時はそのまま終了（ブロックしない）
  process.stdout.write(JSON.stringify({}));
  process.exit(0);
}

const {
  hook_event_name: eventName,
  workspace_roots: workspaceRoots,
  conversation_id: conversationId,
  // beforeShellExecution
  command,
  // beforeMCPExecution
  tool_name: toolName,
  arguments: toolArgs,
  // beforeReadFile / afterFileEdit
  file_path: filePath,
  // afterFileEdit
  edits,
  // stop
  status,
  // beforeSubmitPrompt
  prompt,
} = payload;

// ---------------------------------------------------------------------------
// 2. audit ログファイルのパスを決定
// ---------------------------------------------------------------------------
const workspaceRoot =
  workspaceRoots && workspaceRoots.length > 0
    ? workspaceRoots[0]
    : process.cwd();
const auditDir = join(workspaceRoot, ".cursor");
const auditLogPath = join(auditDir, "agent-audit-log.json");

// ---------------------------------------------------------------------------
// 3. 既存ログの読み込み or 初期化
// ---------------------------------------------------------------------------
const emptyLog = {
  version: 1,
  updated_at: null,
  sessions: {},
  totals: {
    beforeSubmitPrompt: 0,
    beforeShellExecution: 0,
    beforeMCPExecution: 0,
    beforeReadFile: 0,
    afterFileEdit: 0,
    stop: 0,
  },
  commands: {},
  mcp_tools: {},
  files_read: {},
  files_edited: {},
};

let log;
try {
  if (existsSync(auditLogPath)) {
    log = JSON.parse(readFileSync(auditLogPath, "utf-8"));
  } else {
    log = structuredClone(emptyLog);
  }
} catch {
  log = structuredClone(emptyLog);
}

const now = new Date().toISOString();
log.updated_at = now;

// ---------------------------------------------------------------------------
// 4. セッション（conversation）別の追跡
// ---------------------------------------------------------------------------
if (conversationId) {
  if (!log.sessions[conversationId]) {
    log.sessions[conversationId] = {
      first_seen: now,
      last_seen: now,
      status: null,
      events: {},
    };
  }
  const session = log.sessions[conversationId];
  session.last_seen = now;
  session.events[eventName] = (session.events[eventName] || 0) + 1;

  if (eventName === "stop") {
    session.status = status || "completed";
  }
}

// ---------------------------------------------------------------------------
// 5. 全体カウントの更新
// ---------------------------------------------------------------------------
if (!log.totals) log.totals = {};
log.totals[eventName] = (log.totals[eventName] || 0) + 1;

// ---------------------------------------------------------------------------
// 6. イベント種別ごとの詳細記録
// ---------------------------------------------------------------------------

// Shell コマンド
if (eventName === "beforeShellExecution" && command) {
  const key = command.trim().substring(0, 200);
  if (!log.commands[key]) log.commands[key] = { count: 0, last_seen: null };
  log.commands[key].count++;
  log.commands[key].last_seen = now;
}

// MCP ツール / スキル / サブエージェント
if (eventName === "beforeMCPExecution" && toolName) {
  if (!log.mcp_tools[toolName])
    log.mcp_tools[toolName] = { count: 0, last_seen: null };
  log.mcp_tools[toolName].count++;
  log.mcp_tools[toolName].last_seen = now;
}

// ファイル読み取り
if (eventName === "beforeReadFile" && filePath) {
  if (!log.files_read[filePath])
    log.files_read[filePath] = { count: 0, last_seen: null };
  log.files_read[filePath].count++;
  log.files_read[filePath].last_seen = now;
}

// ファイル編集
if (eventName === "afterFileEdit" && filePath) {
  if (!log.files_edited[filePath])
    log.files_edited[filePath] = { count: 0, last_seen: null };
  log.files_edited[filePath].count++;
  log.files_edited[filePath].last_seen = now;
}

// ---------------------------------------------------------------------------
// 7. ログファイルの書き込み
// ---------------------------------------------------------------------------
try {
  if (!existsSync(auditDir)) {
    mkdirSync(auditDir, { recursive: true });
  }
  writeFileSync(auditLogPath, JSON.stringify(log, null, 2) + "\n");
} catch {
  // 書き込み失敗してもアクションをブロックしない
}

// ---------------------------------------------------------------------------
// 8. stdout に応答を出力（アクションを通過させる）
// ---------------------------------------------------------------------------
let response = {};

switch (eventName) {
  case "beforeSubmitPrompt":
    // continue: true でプロンプト送信を許可
    response = { continue: true };
    break;
  case "beforeShellExecution":
    // 元のコマンドをそのまま返す（変更なし）
    response = { command };
    break;
  case "beforeMCPExecution":
    // allow で MCP ツール実行を許可
    response = { permission: "allow" };
    break;
  case "beforeReadFile":
    // allow でファイル読み取りを許可
    response = { permission: "allow" };
    break;
  case "afterFileEdit":
    // 通知のみ（応答不要）
    response = {};
    break;
  case "stop":
    // 通知のみ（応答不要）
    response = {};
    break;
  default:
    response = {};
}

process.stdout.write(JSON.stringify(response));
