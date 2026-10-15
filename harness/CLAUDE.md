# FE 과제 워크스페이스

프론트엔드 과제(약 5시간)를 AI와 함께 수행하는 작업 공간. 목표: **AI를 잘 활용하되, 판단 근거가 분명하고, 안정적이며, 과하지 않은 서비스**를 만든다. 완성도가 최우선이다.

## 구조

```
fe-task/                       ← 항상 여기서 실행
├─ references/                 code-style, design-patterns, evaluation-rubric, ai-smell, templates/
│                              (toss-frontend-style.md = 위 규칙들의 원본 조사 자료)
├─ tools/e2e/                  과제 공용 Playwright + TypeScript (레포 밖)
├─ tuning-log.md               파이프라인 자체의 문제·수정 기록 (/fe-tune)
└─ assignments/<과제명>/
   ├─ repo/                    제출물 (git)
   └─ notes/                   과정 기록 (git 아님)
      progress.md · assignment.md · company.md · decisions.md · strategy.md · plan.md · board.html · e2e/ · qa/
```

`notes/progress.md`가 진행 상태의 단일 기준이다. 새 세션이나 `/compact` 후에는 `/fe`로 이어간다.

## 파이프라인

`/fe`가 순서·gate·시간을 관리한다.

| # | 단계 | skill | 예산 | gate |
|---|---|---|---|---|
| 0 | 시작 (모드: 처음부터 / 스타터 / 주어진 레포) | fe-start, lint-setup | 15m | |
| 1 | 이해 (요구사항·시안·코드, 테스트 대상) | fe-understand | 30m | 🚦 |
| 2 | 전략 | fe-strategy | 10m | |
| 3 | 커밋 계획 | fe-plan | 15m | 🚦 |
| 4 | 구현 → 그룹 QA → 단위별 커밋 | fe-implement, fe-qa | 155m | 그룹마다 🚦 |
| 5 | 리뷰 (품질 + 영향 범위) | fe-review | 25m | 🚦 |
| 6 | README | fe-readme | 15m | |
| 7 | 면접관 평가 · 리허설 · 제출 점검 | fe-evaluate | 20m | 🚦 |

언제든: `decide` — D(핵심 결정, 4~6개) / N(한 줄 메모) / X(거절한 AI 제안).
파이프라인 자체를 고칠 때: `fe-tune` — note(기록만) / fix / review. 과제 결정(`decide`)과 섞지 않는다.

## 역할

- **AI**: 분석, 시각화, 대안과 트레이드오프 제시, 사용자 결정의 사이드 이펙트 검토, 구현, 검증(테스트·e2e·리뷰·평가), 초안
- **사용자**: 요구사항 해석, 가정, 대안 선택과 이유, 리뷰 지적의 수정/수용/거절, QA 승인, 최종 문장, 면접 답변

AI는 결정을 대신 내리지 않는다. 대안에는 추천을 붙이되, 선택과 이유는 사용자 원문으로 기록한다.

## 절대 규칙

0. **과제가 명시한 요구·평가 기준(`G-n`)이 이 문서의 모든 규칙보다 우선한다.** `notes/progress.md` 상단의 G 목록은 hook이 매 메시지마다 맥락에 넣어 준다. 아래 규칙과 충돌하면 G를 따르고 `decide`(D)로 기록한다. 우선순위: G > JD 신호 > 공통 평가 기준표 > code-style·design-patterns.
1. **주석 금지** (ts/tsx/js/jsx). 예외: 도구 지시 주석, 그리고 G가 주석을 요구하는 과제(`notes/allow-comments` 파일로 hook 해제). "왜"는 decisions.md로. 기존 코드의 주석은 건드리지 않는다 (hook은 새로 추가한 줄만 검사).
2. **코드 스타일**: 주어진 레포의 lint/formatter/tsconfig와 테스트·커밋 컨벤션을 따르고, 나머지는 `references/code-style.md`, `references/design-patterns.md`. 회사가 토스가 아니어도 동일.
3. **커밋은 사용자 승인 후에만.** 단위별, plan 순서대로, 사용자 git 계정으로. attribution·co-author 금지.
4. **과정 산출물은 레포에 넣지 않는다** (notes/, e2e, 보드).
5. **과하지 않게**: 요구사항과 근거가 없는 추상화·라이브러리·기능·방어 코드를 추가하지 않는다. 의심되면 `decide`.
6. **기존 공통 모듈은 기본적으로 수정하지 않는다.** 필요하면 `decide`. 발견한 문제는 README 개선 제안으로 남길 수 있다.
7. **보드 artifact**(`notes/board.html`, 같은 URL로 갱신)는 "이해", "계획", "리뷰" 섹션만 쓴다. QA 카드와 나머지는 채팅으로 짧게. 처음 쓰기 전에 artifact-design skill을 로드한다.
8. 단계를 마치면 progress.md를 갱신하고 `/compact`를 권한다.
9. 응답은 한국어, 간결하게.
