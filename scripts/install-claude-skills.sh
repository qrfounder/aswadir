#!/usr/bin/env bash
# Installs the curated set of Claude / Cursor agent skills for the Massar project.
#
# Why these five?
#   1. nextlevelbuilder/ui-ux-pro-max-skill — landing + checkout design polish
#   2. anthropics/skills                    — official frontend-design, webapp-testing, mcp-builder
#   3. garrytan/gstack                      — solo-founder workflow (CEO / Designer / EngMgr / QA slash commands)
#   4. obra/superpowers                     — TDD + spec + subagent discipline
#   5. wshobson/agents                      — specialist agents (Stripe, security, React perf, Express)
#
# Big repos are sparse-checked-out so we only pull the subskills we actually use.
# Re-running the script updates everything to latest main.

set -euo pipefail

cd "$(dirname "$0")/.."
SKILLS_DIR=".claude/skills"
AGENTS_DIR=".claude/agents"
mkdir -p "$SKILLS_DIR" "$AGENTS_DIR"

# ---- helpers -----------------------------------------------------------------

clone_or_update() {
  local repo="$1" dest="$2"
  if [ -d "$dest/.git" ]; then
    echo "→ updating $dest"
    git -C "$dest" fetch --depth 1 origin HEAD
    git -C "$dest" reset --hard FETCH_HEAD
  else
    echo "→ cloning $repo into $dest"
    git clone --depth 1 "https://github.com/$repo.git" "$dest"
  fi
}

sparse_clone() {
  # sparse_clone <repo> <dest> <path1> <path2> ...
  local repo="$1" dest="$2"
  shift 2
  if [ -d "$dest/.git" ]; then
    echo "→ updating sparse $dest"
    git -C "$dest" fetch --depth 1 origin HEAD
    git -C "$dest" reset --hard FETCH_HEAD
    return
  fi
  echo "→ sparse-cloning $repo into $dest (paths: $*)"
  git clone --depth 1 --filter=blob:none --sparse "https://github.com/$repo.git" "$dest"
  git -C "$dest" sparse-checkout set "$@"
}

# ---- skills ------------------------------------------------------------------

clone_or_update "garrytan/gstack"                       "$SKILLS_DIR/gstack"
clone_or_update "nextlevelbuilder/ui-ux-pro-max-skill"  "$SKILLS_DIR/ui-ux-pro-max"
clone_or_update "obra/superpowers"                      "$SKILLS_DIR/superpowers"

sparse_clone "anthropics/skills" "$SKILLS_DIR/anthropic-skills" \
  "skills/frontend-design" \
  "skills/webapp-testing" \
  "skills/mcp-builder" \
  "skills/theme-factory"

# ---- specialist agents (full shallow clone of wshobson/agents) ---------------
# wshobson/agents lays files out flat in agents/*.md; a sparse cone over that
# directory ends up pulling everything anyway, so just shallow-clone it.

clone_or_update "wshobson/agents" "$AGENTS_DIR/wshobson"

echo
echo "Installed skills:"
ls -1 "$SKILLS_DIR"
echo
echo "Installed agents:"
ls -1 "$AGENTS_DIR"
echo
echo "Done. Restart Claude Code / Cursor to pick up new skills."
