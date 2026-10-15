# 설계 기록

과제를 진행하며 내린 결정을 남긴 문서입니다. 큰 결정은 ADR로, 구현 중 내린 작은 판단은 [결정 로그](decision-log.md)에 한 줄씩 기록했습니다.

각 결정에는 출처를 적었습니다. "AI 제안 → 수용"은 AI가 대안과 추천을 내고 제가 고른 경우, "AI 판단"은 제가 검토하지 않은 AI의 기술 선택을 나중에 기록한 경우입니다.

| ADR                                                | 결정                                                 | 상태 |
| -------------------------------------------------- | ---------------------------------------------------- | ---- |
| [0001](0001-design-records-and-harness-in-repo.md) | 설계 기록과 AI 하네스를 레포에 포함                  | 채택 |
| [0002](0002-draft-only-for-new-content.md)         | 임시저장은 신규 작성에만                             | 채택 |
| [0003](0003-sequential-publish-plan.md)            | 발행 API는 순수 함수로 계획하고 순차 실행            | 채택 |
| [0004](0004-tanstack-query.md)                     | 서버 상태는 TanStack Query                           | 채택 |
| [0005](0005-token-storage-and-refresh.md)          | 토큰은 localStorage, 401이면 refresh 한 번 후 재시도 | 채택 |
| [0006](0006-forms-with-local-state.md)             | 폼은 직접 상태와 순수 검증 함수                      | 채택 |
| [0007](0007-datepicker.md)                         | 예약 시간 선택은 react-datepicker                    | 채택 |
