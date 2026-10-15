# 0004. 서버 상태는 TanStack Query

- 상태: 채택
- 출처: AI 제안 → 수용

## 맥락

페이지네이션 목록 2종, 상세 조회, 쓰기 요청 6종이 있고, 발행 후 목록을 갱신해야 합니다.

## 대안

- A. TanStack Query
- B. fetch와 직접 만든 훅

## 결정

A. 페이지 캐시, invalidate, Suspense 연동이 기본으로 있어서 화면마다 로딩·에러 처리 방식이 같아집니다.

## 결과

- 의존성이 하나 늘었습니다.
- 쿼리 키가 흩어지지 않도록 `queryOptions`를 `src/api/`에 모았습니다.
- 조회는 Suspense와 ErrorBoundary로, 쓰기는 `isPending`으로 처리합니다.
- 관련 커밋: `0dc75ed`, `543890e`
