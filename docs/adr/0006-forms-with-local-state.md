# 0006. 폼은 직접 상태와 순수 검증 함수

- 상태: 채택
- 출처: AI 제안 → 수용

## 맥락

폼이 5개이고 필드는 4개 이하입니다. 조건부 필드는 발행 모달에만 있습니다.

## 대안

- A. `useState`와 `validateXxx(values) → { ok: true } | { ok: false, errors }` 순수 함수
- B. react-hook-form + zod

## 결정

A. 이 규모에서는 라이브러리로 얻는 이득이 작고, 검증 함수가 그대로 단위 테스트 대상이 됩니다.

## 결과

- 에러는 제출을 한 번 시도한 뒤부터 보여주는 것으로 모든 폼을 통일했습니다.
- 검증 함수마다 테스트가 있습니다(`validateContent`, `validatePublish`, `validateNotification`, `validateAuth`).
- 관련 커밋: `2531c61`, `97042d2`, `c747dcf`
