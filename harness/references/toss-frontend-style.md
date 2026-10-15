# 토스 프론트엔드 개발 스타일 정리

조사 범위: Frontend Fundamentals(frontend-fundamentals.com), toss GitHub OSS(slash, es-toolkit, overlay-kit, use-funnel, react-simplikit, suspensive, es-hangul), toss.tech 아티클, SLASH 21~24 세션. (2026-10 기준)

---

## 0. 과제 관점 핵심 — 토스가 직접 밝힌 평가 기준

출처: [토스 프론트엔드에 이력서 없이 리포지토리 링크로 지원하세요 (2025)](https://toss.tech/article/frontend-apply-without-resume)

- 평가 항목: **모듈화·코드 품질 / 명확한 디렉토리 구조 / TypeScript의 정확하고 엄격한 사용 / 제품 완성도(로딩·끊김 없는 UX) / 읽기 쉬운 커밋·PR 단위 / 프로젝트를 설명하는 README**
- "화려한 기술이나 코드 패턴은 중요하지 않아요" — FSD, TanStack Router 등을 아는지보다 **수정하기 쉬운 코드에 대한 고민과 철학**을 봄
- 함수·컴포넌트의 입출력을 TS 타입으로 정확히 표현하는 능력 강조

---

## 1. 철학 (10가지)

| # | 원칙 | 근거 |
|---|---|---|
| 1 | 좋은 코드 = **변경하기 쉬운 코드** | FF, 선언적 코드 글, 지원 가이드 |
| 2 | 추상화는 **변경을 예측한 만큼만**. 성급한 공통화보다 중복 허용 | FF 중복 코드 허용, SignUpForm 사례 |
| 3 | **선언적 인터페이스**로 "무엇"을 드러내고 "어떻게"는 숨김 | useOverlay, ImpressionArea, use-funnel |
| 4 | 한 번에 고려할 **맥락 줄이기** (6~7개 이하) | FF 가독성, SLASH21 Clean Code |
| 5 | 이름·파라미터·반환 타입만으로 **동작 예측 가능** | FF 예측 가능성 |
| 6 | **함께 바뀌는 것은 함께 둔다** (도메인 colocation) | FF 응집도, use-funnel 개발기 |
| 7 | **엄격한 TS**로 실수를 컴파일 타임에 잡기 (DU, exhaustive) | use-funnel #2, ts-pattern 글 |
| 8 | **비동기는 선언적으로** — Suspense / ErrorBoundary / React Query | SLASH21 비동기, Suspensive |
| 9 | 화려한 기술보다 본질. 새 기술은 **이득을 실측 후** 도입 | App Router 글, ts-pattern 글 |
| 10 | **협업 단위**로 일하기 — 읽히는 커밋/PR, 컨벤션은 도구로 강제 | 지원 가이드, 모노리포 희망편 |

---

## 2. Frontend Fundamentals — 변경하기 쉬운 코드의 4기준

출처: https://frontend-fundamentals.com/code-quality/code/

### 가독성 (Readability)
| 규칙 | 핵심 |
|---|---|
| 같이 실행되지 않는 코드 분리 | `isViewer` 분기가 곳곳에 섞인 컴포넌트 → `isViewer ? <ViewerSubmitButton/> : <AdminSubmitButton/>` |
| 구현 상세 추상화 | 로그인 체크 → `<AuthGuard>` / `withAuthGuard`, 다이얼로그 핸들러+버튼 → `<InviteButton>` |
| 로직 종류별로 합쳐진 함수 쪼개기 | 모든 쿼리 파라미터를 다루는 `usePageState` → `useCardIdQueryParam` 등 파라미터별 Hook |
| 복잡한 조건에 이름 붙이기 | `isSameCategory`, `isPriceInRange`. 단순·1회성이면 불필요 |
| 매직 넘버에 이름 붙이기 | `delay(300)` → `ANIMATION_DELAY_MS` |
| 시점 이동 줄이기 | 단순 권한이면 `POLICY_SET` 간접 참조 대신 `switch(role)` 또는 인라인 객체 |
| 삼항 연산자 단순하게 | 중첩 삼항 → IIFE + `if` early return |
| 왼→오로 읽히게 | `a >= b && a <= c` → `b <= a && a <= c` |

### 예측 가능성 (Predictability)
| 규칙 | 핵심 |
|---|---|
| 이름 겹치지 않게 | 라이브러리 `http` 래퍼를 `http`로 부르지 말고 `httpService.getWithAuth` |
| 같은 종류 함수는 반환 타입 통일 | API 훅은 모두 Query 객체 반환 / 검증 함수는 모두 `{ ok: true } \| { ok: false; reason }` |
| 숨은 로직 드러내기 | `fetchBalance` 내부 로깅 → 호출부로 이동 |

### 응집도 (Cohesion)
| 규칙 | 핵심 |
|---|---|
| 함께 수정되는 파일은 같은 디렉토리 | 아래 디렉토리 구조 참고 |
| 매직 넘버 없애기 | 한쪽만 바뀌어 조용히 깨지는 것 방지 |
| 폼의 응집도 | 필드 독립·비동기 검증·재사용 → 필드 단위(`register validate`) / 필드 간 의존·하나의 기능 → 폼 단위(zod 스키마) |

### 결합도 (Coupling)
| 규칙 | 핵심 |
|---|---|
| 책임을 하나씩 | 넓은 책임의 훅 → 의존이 몰려 영향 범위 폭증 |
| 중복 코드 허용 | 페이지마다 달라질 여지가 있으면 공통화하지 않음 |
| Props Drilling 지우기 | 1순위 composition(`children`), **Context는 최후 수단**. 역할을 담은 props는 유지 |

### 트레이드오프
- **가독성 ↔ 응집도**: 함께 안 바뀌면 오류 나는 경우 → 응집도 우선(공통화). 위험 낮으면 → 가독성 우선(중복 허용)
- **결합도 ↔ 응집도**: 중복 허용은 결합도↓ 응집도↓
- 4가지를 동시에 만족하기 어려움 → 상황에 맞는 우선순위 선택을 **설명할 수 있어야 함** (README 의사결정 섹션 소재)

### 디렉토리 구조 (권장)
```
src
├─ components     # 전역 공용
├─ hooks
├─ utils
├─ ...
└─ domains
   ├─ Domain1     # Domain1 전용
   │  ├─ components
   │  ├─ hooks
   │  └─ utils
   └─ Domain2
```
- 종류별(components/hooks/utils) 최상위 분류는 비권장
- `../../Domain2/hooks/...` 같은 import가 보이면 잘못된 참조임이 즉시 드러남
- 기능 삭제 = 디렉토리 하나 삭제

### 기타 섹션
- **A11y**: 버튼 안에 버튼/링크 금지, `<tr onClick>` 금지, div+onClick 대신 `<button>`/`<a>`, 입력은 `<form>`으로 감싸기, 인터랙티브 요소엔 이름, 장식 이미지 `alt=""`. `eslint-plugin-jsx-a11y`
- **Bundling**: ESM 라이브러리, `React.lazy` 코드 스플리팅, moment→dayjs, lodash→es-toolkit
- **Debug**: 진단 → 최소 재현 → 근본 원인 수정(비즈니스 로직은 순수 함수로) → 재발 방지(린트 규칙/체크리스트)
- 참고: 저장소에 **Claude Code용 `frontend-fundamentals-plugin`**(4기준 코드 리뷰 skill)이 있음

---

## 3. 토스 OSS 코드 컨벤션 (실제 코드/설정 기반)

### Prettier (거의 전 repo 동일)
```json
{
  "printWidth": 120,
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "arrowParens": "avoid"
}
```

### ESLint 공통 규칙
- `curly: ['error', 'all']`
- `eqeqeq: ['error', 'always', { null: 'ignore' }]` → `== null`만 허용
- `no-implicit-coercion`
- `@typescript-eslint/naming-convention` — 변수 camelCase/UPPER_CASE/PascalCase, 타입 PascalCase
- `@typescript-eslint/array-type: array-simple`
- `explicit-function-return-type: off` (추론 활용)
- react-simplikit: `strict-boolean-expressions` (`if (value)` 대신 `if (value != null)`), `consistent-type-definitions: type`
- overlay-kit: `consistent-type-imports` (inline), `import/order`, 파일명 kebab-case
- suspensive: `strictTypeChecked`, 제네릭 이름 `T`/`TXxx` 강제, `import/no-cycle`

### TypeScript
- 전 repo `strict: true`
- slash 추가: `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`

### 선언 스타일
- **`export function` + named export**가 압도적 (es-toolkit 1454:3, react-simplikit 63:1)
- default export 금지 (react-simplikit 명시)
- 화살표는 짧은 인라인 콜백에만
- `type` 위주 (react-simplikit interface 0개, overlay-kit 19:1)
- `useEffect(function handleResize() {...})` — effect 콜백에 이름 붙이기 (react-simplikit)
- early return, 중첩 if-else 지양
- 훅 반환: 값 1개 → 단일 값 / 2개 → 튜플 / 3개 이상·확장 가능 → 객체

### 파일 구조
- 1 함수(훅/컴포넌트) = 1 파일
- 테스트 colocate: `chunk.ts` + `chunk.spec.ts`
- 기능 폴더 + `index.ts` (suspensive는 `export *` 대신 명시적 named re-export)
- react-simplikit 레이어 단방향: `components → hooks → utils → _internal`

### 테스트
- Vitest + @testing-library/react + user-event + jest-dom
- `describe('fnName')` + `it('should ...')`
- 타입 테스트 `*.test-d.ts` (suspensive, use-funnel)
- `renderWithUser` 헬퍼 (render + `userEvent.setup()`)
- exhaustive 검사용 `exhaustiveCheck(value: never)`

### 커밋 / PR
- Conventional Commits: `feat(scope): ...`, `fix(scope): ...`
- PR 템플릿: Overview + 체크리스트(테스트, 문서)

### 주석
- 공개 라이브러리 API에만 JSDoc (문서 자동 생성용)
- 내부 구현 라인 주석은 드물고, 있어도 "왜"(eslint-disable 사유 등)
- → **앱 코드에서 주석 없음은 토스 스타일과 충돌하지 않음**

---

## 4. 선언적 패턴 레퍼런스

| 패턴 | 형태 | 출처 |
|---|---|---|
| 비동기 경계 | `<ErrorBoundary><Suspense>` / `AsyncBoundary` (pending·rejected fallback) | slash, suspensive |
| Suspense 원인 드러내기 | `<SuspenseQuery {...options}>{({ data }) => ...}</SuspenseQuery>` | suspensive |
| 짧은 로딩 깜빡임 방지 | `<Delay>` | suspensive |
| 오버레이 = Promise | `const ok = await overlay.openAsync(({ isOpen, close }) => <Dialog onConfirm={() => close(true)} />)` | overlay-kit |
| 퍼널 | `<funnel.Render StepA={...} StepB={funnel.Render.with({ events, render })} />`, 스텝별 상태를 DU로 누적 | use-funnel |
| 선언적 분기 | `<SwitchCase value={x} caseBy={{ a: () => <A /> }} />` | react-simplikit |
| 관심사 숨기기 | `<ImpressionArea>`, `<LoggingClick>` | 선언적 코드 글 |
| HOC 정적 멤버 | `ErrorBoundary.with(props, Component)` | suspensive |

---

## 5. 주요 출처

- Frontend Fundamentals: https://frontend-fundamentals.com/code-quality/code/ · https://github.com/toss/frontend-fundamentals
- 지원 가이드: https://toss.tech/article/frontend-apply-without-resume
- 선언적인 코드 작성하기: https://toss.tech/article/frontend-declarative-code
- @use-funnel 개발기: https://toss.tech/article/use-funnel-1 · https://toss.tech/article/use-funnel-2
- ts-pattern은 더 멋진 if문이 아니다: https://toss.tech/article/ts-pattern-usage
- TS 타입 호환성: https://toss.tech/article/typescript-type-compatibility
- App Router의 장점은 우리에게도 장점일까요?: https://toss.tech/article/52999
- SLASH21 비동기 처리: https://toss.im/slash-21/sessions/3-1 · Clean Code: https://toss.im/slash-21/sessions/3-3
- SLASH22 Effective Component: https://toss.im/slash-22/sessions/1-7
- OSS: github.com/toss/{slash, es-toolkit, overlay-kit, use-funnel, react-simplikit, suspensive, es-hangul}

### 확인 못 한 것
- 프론트엔드 **테스트 전략** 전용 글은 없음 (모닥불 EP.3 영상만 존재)
- SLASH21/22 슬라이드 원문은 미확보 (세션 소개 + 2차 정리 기반)
