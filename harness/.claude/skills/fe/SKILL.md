---
name: fe
description: FE 과제 파이프라인 진입점. 새 과제 시작, 진행 상태 확인, 다음 단계 실행, 특정 단계 이동. "/fe new <과제명> <소스>", "/fe", "/fe status", "/fe goto <단계>"
argument-hint: "[new <과제명> <소스> [JD URL] | status | goto <단계>]"
---

# /fe — 파이프라인 관리자

인자: `$ARGUMENTS`

## 활성 과제 찾기

`assignments/*/notes/progress.md` 중 `상태: 진행 중`인 것. 여러 개면 사용자에게 묻는다. 없고 인자가 `new`가 아니면 `/fe new`를 안내한다.

## 동작

| 인자 | 동작 |
|---|---|
| `new <과제명> <소스> [JD URL]` | `.claude/skills/fe-start/SKILL.md`를 Read해서 수행 |
| (없음) | progress.md의 현재 단계 skill의 SKILL.md를 Read해서 수행 |
| `status` | 상태 요약만 출력 |
| `goto <단계>` | 이전 gate 미승인이면 경고 후 확인, 현재 단계 변경 |

skill은 다른 skill을 직접 호출할 수 없으므로 **단계 skill은 SKILL.md를 Read해서 따른다.** 이때 그 문서의 `$ARGUMENTS`는 `/fe`에 넘어온 인자로 해석한다.

## 단계와 기본 시간 예산 (5시간, progress.md에서 조정)

| # | 단계 | skill | 예산 | gate |
|---|---|---|---|---|
| 0 | 시작 | fe-start (+ lint-setup) | 15m | |
| 1 | 이해 | fe-understand | 30m | 🚦 |
| 2 | 전략 | fe-strategy | 10m | |
| 3 | 계획 | fe-plan | 15m | 🚦 (2·3 함께) |
| 4 | 구현 | fe-implement (+ fe-qa) | 155m | 그룹마다 🚦 |
| 5 | 리뷰 | fe-review | 25m | 🚦 |
| 6 | README | fe-readme | 15m | |
| 7 | 평가 | fe-evaluate | 20m | 🚦 |
| | 버퍼 | | 15m | |

과정 단계는 짧게, 구현에 시간을 몰아준다. 완성도가 최우선이다.

## 단계 시작 시 매번

1. progress.md 상단의 **중점 평가 기준(G)** 을 읽는다. 상세는 `notes/company.md`.
2. 이번 단계에서 어떤 G가 관련되는지 한 줄로 사용자에게 알린다 (예: "이번 계획 단계: G-2 테스트 → 핵심 로직 단위에 테스트 포함").

## Gate

- 🚦 단계는 사용자의 명시적 승인 후에만 다음으로 넘어간다. 승인 시각을 progress.md에 기록한다.

## 시간

- 단계 시작·종료마다 `date "+%H:%M"`으로 현재 시각을 얻어 progress.md에 기록한다.
- 누적 지연이 15분을 넘으면 plan의 축소선 조정안(Nice → Should 순으로 제외)을 제시하고 사용자가 고른다 → `decide` (N, `[범위]`).
- 남은 시간이 60분 이하면 리뷰·README·평가 시간을 구현보다 우선 확보한다.

## 컨텍스트

- 단계를 마칠 때마다 progress.md·plan.md를 최신으로 만든 뒤, 사용자에게 `/compact`를 권한다 (특히 1·3·4단계 후).
- 압축 후나 새 세션에서는 progress.md(G 포함) → company.md의 G 표 → plan.md → decisions.md 순으로 다시 읽고 이어간다.

## status 형식

```
과제: <이름> (<모드>) | 14:12 · 경과 2:10 / 5:00 | 지연 +8m
현재: 4 구현 — 커밋 5/9 (Must 5/6 · Should 0/2 · Nice 0/1)
G 대응: G-1 ✅ U2,U5 · G-2 ⏳ U7 예정 · G-3 ⚠️ 대응 단위 없음
dev 서버: http://localhost:5173 (실행 중)
결정: D 5 · N 9 · X 2 | 출처: 사용자 발의 3 · AI→수용 6 · AI→수정 3 · AI→거절 2
보드: <artifact URL>
```
출처 비율은 표시만 한다. 비율을 맞추려고 거절을 만들지 않는다.
