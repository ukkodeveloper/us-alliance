---
name: fe-review
description: FE 과제 5단계. 새 맥락의 fe-reviewer 에이전트 2개(품질 / 영향 범위)로 base 이후 변경을 리뷰하고, 메인이 사실 확인·중복 제거한 지적을 사용자가 수정/수용/거절한다. Gate 단계.
---

# 5단계: 리뷰

입력: progress.md(base), `notes/plan.md`, `notes/decisions.md`. `<R>` = `assignments/<과제명>/repo`.

## 1. 리뷰 (병렬, 새 맥락)

`fe-reviewer` 두 개를 한 메시지에서 띄운다. 넘기는 것: `<R>` 절대경로, base, 모드, mode, **G 목록 원문**.
- `mode=quality`: code-style / design-patterns(신호 없이 쓴 패턴, 신호가 있는데 안 쓴 곳) / FF 4기준 / ai-smell
- `mode=impact`: 기존 모듈 변경과 사용처, 회귀 위험, 전체 typecheck·lint·test·build, 회귀 e2e 후보

decisions.md는 넘기지 않는다. 결정 기록 없이도 코드가 설명되는지 봐야 한다.

## 2. 메인 검증

- 지적마다 코드를 직접 열어 **사실인지 확인**하고 틀린 지적은 버린다.
- 이미 D/N으로 의도된 선택이면 "의도됨"으로 표시하되, 리뷰어가 의도를 못 읽었다면 이름·구조·README 보강이 필요한지 함께 표시한다.
- 회귀 e2e 후보 중 핵심만 `fe-qa all`로 실행한다.

## 3. 사용자 판단 (Gate)

보드 "리뷰" 섹션에 심각도순 표로 올리고 결정받는다:
- **수정** → 수정 단위로 묶어 fe-qa → 승인 → 커밋 (`refactor(...)`/`fix(...)`, 본문에 이유 한 줄)
- **수용(수정 안 함)** → `decide` N `[리뷰]` — README "한계"의 재료
- **거절(리뷰가 틀림)** → `decide` X

🔴는 수정을 기본값으로 제안, 🟡는 시간이 남을 때만. 결정과 수정 커밋을 마치면 gate 승인 기록.
