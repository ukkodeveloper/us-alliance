---
name: fe-qa
description: FE 과제 QA. 자동 검증(typecheck·lint·test)을 돌리고, 핵심 흐름 e2e를 레포 밖 Playwright로 백그라운드 실행하고, 사용자가 직접 확인할 QA 카드를 채팅으로 준다. 그룹 단위 또는 all(전체 회귀).
argument-hint: "[그룹 ID | all]"
---

# QA

인자: `$ARGUMENTS` (그룹 ID, 또는 `all`). `<A>` = `assignments/<과제명>`, `<R>` = `<A>/repo`.

## 1. 자동 검증

- typecheck, lint(기존 실패가 있으면 변경 파일만), 관련 테스트
- 기존 실패(0단계 기준선)와 새 실패를 구분해서 보고
- 그룹 마지막이거나 `all`이면 build까지

## 2. e2e (핵심 흐름만, 커밋하지 않음)

이 그룹에서 plan의 핵심 흐름(F1~F3)이 완성될 때만 실행한다.

- `<A>/notes/e2e/F1.spec.ts` 작성·갱신. 셀렉터는 `getByRole`, `getByLabel` (접근성 검증 겸함).
- 에러·빈 상태는 `page.route`로 응답을 바꿔 재현하고, 상태마다 `await page.screenshot({ path: testInfo.outputPath('<상태>.png') })`로 캡처 → README 재료.
- `<A>/notes/e2e/node_modules`가 없으면 `ln -s "$PWD/tools/e2e/node_modules" <A>/notes/e2e/node_modules`.
- 실행 (fe-task 루트에서, cwd를 바꾸지 않는다):
  ```
  BASE_URL=<dev URL> E2E_DIR="$PWD/<A>/notes/e2e" OUT_DIR="$PWD/<A>/notes/qa" \
    tools/e2e/node_modules/.bin/playwright test -c tools/e2e/playwright.config.ts --project=<desktop|mobile> [F1]
  ```
  `all`이면 흐름 필터 없이. 프로젝트는 회사 프로필이 모바일 제품이면 `mobile`, 아니면 `desktop` 하나만.
- `run_in_background`로 실행하고 그동안 QA 카드를 준비한다.

## 3. QA 카드 (채팅, 짧게)

```
그룹 B — U3 주문 상태 분기 · U4 주문 요약 카드
바뀐 것: (사용자 관점 2줄)
직접 해볼 것:
  1. /orders/1 → "결제 대기" 배지와 결제 버튼
  2. 네트워크 탭에서 /api/orders 차단 → 재시도 버튼
  3. ...
자동: typecheck ✅ lint ✅ test 9/9 ✅ e2e F1 ✅ (스크린샷: notes/qa/…)
확인 포인트: 알 수 없는 상태값 → ErrorBoundary (D-03)
시안 대조: (시안이 있으면 차이점)
```

## 4. 사용자 응답

- 승인 → fe-implement 커밋 절차로
- 문제 제기 → 원인 확인 후 수정, 1~3 반복. 해석 차이였다면 `decide` (N 또는 X) — 사용자 판단의 증거
