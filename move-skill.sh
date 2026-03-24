#!/usr/bin/env bash

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_ROOT="${SCRIPT_DIR}/.agents/skills"

OPT_COPY=false
OPT_ALL=false
OPT_FORCE=false
TARGET_DIR=""
REQUESTED_SKILLS=()

usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS] <target-dir> [skill-name...]

Arguments:
  <target-dir>     リンク/コピー先のskillsディレクトリ
                   (例: .claude/skills, /path/to/project/.cursor/skills)
  [skill-name...]  対象スキル名（省略時は対話選択）
                   名前空間付きスキルは "best-practices/rails" のように指定

Options:
  --copy           シンボリックリンクでなくディレクトリをコピー
  --all            全スキルを対象にする
  --force          既存スキルを上書き（デフォルトはスキップ）
  -h, --help       このヘルプを表示

Examples:
  $(basename "$0") .claude/skills
  $(basename "$0") .claude/skills frontend-dev-workflow
  $(basename "$0") .claude/skills best-practices/rails
  $(basename "$0") --copy --all /path/to/project/.claude/skills
  $(basename "$0") --force .cursor/skills coding-principals
EOF
}

# --- 引数パース ---
while [[ $# -gt 0 ]]; do
  case "$1" in
    --copy)  OPT_COPY=true;  shift ;;
    --all)   OPT_ALL=true;   shift ;;
    --force) OPT_FORCE=true; shift ;;
    -h|--help) usage; exit 0 ;;
    -*)
      echo "ERROR: 不明なオプション: $1" >&2
      usage >&2
      exit 1
      ;;
    *)
      if [[ -z "$TARGET_DIR" ]]; then
        TARGET_DIR="$1"
      else
        REQUESTED_SKILLS+=("$1")
      fi
      shift
      ;;
  esac
done

if [[ -z "$TARGET_DIR" ]]; then
  echo "ERROR: <target-dir> を指定してください" >&2
  usage >&2
  exit 1
fi

# --- SKILLS_ROOT の存在確認 ---
if [[ ! -d "$SKILLS_ROOT" ]]; then
  echo "ERROR: スキルディレクトリが見つかりません: $SKILLS_ROOT" >&2
  exit 1
fi

# --- 利用可能スキル一覧を構築 ---
AVAILABLE=()
for entry in "$SKILLS_ROOT"/*/; do
  [[ -d "$entry" ]] || continue
  entry="${entry%/}"
  name="$(basename "$entry")"
  if [[ -f "$entry/SKILL.md" ]]; then
    AVAILABLE+=("$name")
  else
    # 名前空間ディレクトリ: 子ディレクトリを検索
    for child in "$entry"/*/; do
      [[ -d "$child" ]] || continue
      child="${child%/}"
      if [[ -f "$child/SKILL.md" ]]; then
        AVAILABLE+=("${name}/$(basename "$child")")
      fi
    done
  fi
done

if [[ ${#AVAILABLE[@]} -eq 0 ]]; then
  echo "ERROR: 利用可能なスキルが見つかりません: $SKILLS_ROOT" >&2
  exit 1
fi

# --- 処理対象スキルの決定 ---
SELECTED=()

if $OPT_ALL; then
  SELECTED=("${AVAILABLE[@]}")
elif [[ ${#REQUESTED_SKILLS[@]} -gt 0 ]]; then
  # 引数で指定されたスキルを検証
  invalid=false
  for req in "${REQUESTED_SKILLS[@]}"; do
    found=false
    for avail in "${AVAILABLE[@]}"; do
      if [[ "$req" == "$avail" ]]; then
        found=true
        break
      fi
    done
    if ! $found; then
      echo "ERROR: 不明なスキル: $req" >&2
      invalid=true
    fi
  done
  $invalid && exit 1
  SELECTED=("${REQUESTED_SKILLS[@]}")
else
  # 対話選択
  echo "利用可能なスキル:"
  for i in "${!AVAILABLE[@]}"; do
    printf "  %2d) %s\n" "$((i+1))" "${AVAILABLE[$i]}"
  done
  echo ""
  read -r -p "番号をスペース区切りで入力（'a' で全選択）: " input
  if [[ "$input" == "a" || "$input" == "A" ]]; then
    SELECTED=("${AVAILABLE[@]}")
  else
    for num in $input; do
      if [[ "$num" =~ ^[0-9]+$ ]] && (( num >= 1 && num <= ${#AVAILABLE[@]} )); then
        SELECTED+=("${AVAILABLE[$((num-1))]}")
      else
        echo "ERROR: 無効な番号: $num" >&2
        exit 1
      fi
    done
  fi
fi

if [[ ${#SELECTED[@]} -eq 0 ]]; then
  echo "対象スキルが選択されませんでした。終了します。"
  exit 0
fi

# --- 相対パス計算関数 ---
relative_path() {
  local src="$1"
  local base="$2"
  if command -v python3 &>/dev/null; then
    python3 -c "import os,sys; print(os.path.relpath(sys.argv[1], sys.argv[2]))" "$src" "$base"
  elif realpath --relative-to="$base" "$src" 2>/dev/null; then
    : # realpath が成功した場合はすでに出力済み
  else
    # フォールバック: 絶対パスを使用
    echo "$src"
  fi
}

# --- TARGET_DIR の準備 ---
TARGET_DIR_ABS="$(cd "$TARGET_DIR" 2>/dev/null && pwd || echo "$(pwd)/$TARGET_DIR")"
if [[ ! -d "$TARGET_DIR" ]]; then
  echo "INFO: ディレクトリを作成します: $TARGET_DIR"
  mkdir -p "$TARGET_DIR"
  TARGET_DIR_ABS="$(cd "$TARGET_DIR" && pwd)"
fi

# --- 各スキルを処理 ---
count_ok=0
count_skip=0
count_fail=0

for skill in "${SELECTED[@]}"; do
  src="$SKILLS_ROOT/$skill"
  dest="$TARGET_DIR/$skill"
  dest_abs="$TARGET_DIR_ABS/$skill"
  dest_parent_abs="$(dirname "$dest_abs")"

  # 名前空間ディレクトリを作成
  if [[ "$dest_parent_abs" != "$TARGET_DIR_ABS" ]]; then
    mkdir -p "$dest_parent_abs"
  fi

  # 既存チェック
  if [[ -e "$dest" || -L "$dest" ]]; then
    if ! $OPT_FORCE; then
      echo "SKIP: $skill （既に存在します。上書きするには --force を使用してください）"
      ((count_skip++)) || true
      continue
    else
      rm -rf "$dest"
    fi
  fi

  if $OPT_COPY; then
    if cp -r "$src" "$dest"; then
      echo "COPY: $skill -> $dest"
      ((count_ok++)) || true
    else
      echo "FAIL: $skill のコピーに失敗しました" >&2
      ((count_fail++)) || true
    fi
  else
    rel="$(relative_path "$src" "$dest_parent_abs")"
    if ln -s "$rel" "$dest"; then
      echo "LINK: $skill -> $rel"
      ((count_ok++)) || true
    else
      echo "FAIL: $skill のシンボリックリンク作成に失敗しました" >&2
      ((count_fail++)) || true
    fi
  fi
done

# --- サマリー ---
echo ""
echo "完了: 成功=${count_ok}, スキップ=${count_skip}, 失敗=${count_fail}"

if [[ $count_fail -gt 0 ]]; then
  exit 1
fi
