#!/usr/bin/env bash
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
for progress in "$root"/assignments/*/notes/progress.md; do
  [[ -f "$progress" ]] || continue
  grep -q '상태: 진행 중' "$progress" || continue
  name=$(basename "$(dirname "$(dirname "$progress")")")
  criteria=$(grep -m1 '중점 평가 기준' "$progress" | sed 's/^- //')
  step=$(grep -m1 '^현재 단계' "$progress")
  echo "[fe-task] 진행 중 과제: $name | $step | $criteria — G는 모든 규칙보다 우선 (상세: assignments/$name/notes/company.md)"
done
exit 0
