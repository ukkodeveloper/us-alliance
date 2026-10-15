# Code Style

"어떻게 쓰는가". 구조 선택("언제 어떤 패턴을 쓰는가")은 `design-patterns.md`. 원본 조사 자료는 `toss-frontend-style.md`.

## 적용 우선순위

1. **주어진 레포의 lint / formatter / tsconfig / 테스트 위치·명명 / 커밋 컨벤션** — 도구와 관례가 강제하는 것만
2. **이 문서** — 그 밖의 모든 것 (선언, 네이밍, 타입 설계, 제어 흐름, 파일 단위)
3. 일반 관례

- 처음부터 세팅: `lint-setup`이 이 문서의 **[도구]** 규칙을 ESLint/Prettier로 설정한다.
- 주어진 레포: [도구] 규칙이 기존 설정과 충돌하면 기존 설정을 따르고, 나머지는 이 문서를 따른다. 이 원칙을 README에 한 줄로 명시한다.
- React + TypeScript가 아닌 과제: 원칙(design-patterns P0, FF 4기준)만 적용한다.

## 근거 태그

| 태그 | 의미 |
|---|---|
| `[FF]` | Frontend Fundamentals 원문에 있는 규칙 |
| `[OSS:repo]` | 해당 토스 오픈소스의 설정·코드·AGENTS.md에서 확인 |
| `[toss.tech]` | toss.tech 아티클 |
| `[간접]` | 같은 이름의 규칙은 없고, 토스 예시·코드에서 유추 |
| `[내 판단]` | 토스 근거 없음, 또는 토스와 다르게 정함 |
| `[도구]` | lint/formatter로 강제 |

토스 내부에서도 레포마다 다른 규칙은 "갈림"으로 표시하고 어느 쪽을 택했는지 적는다.

## 규칙 형식

```
규칙 / 근거 / 쓰지 않는 조건 / 예외(상황 → 방법 → 이유) / 예시 / 면접 한 줄
```

---

## 1. 선언

### S1. 컴포넌트·훅·유틸은 `function` 선언
- 근거: `[OSS:react-simplikit]` AGENTS.md "function keyword for declarations, arrow only for short inline callbacks", `[OSS:es-toolkit]` export function 1454 : 화살표 3. **갈림**: `[OSS:suspensive]`는 `export const X = (...) =>` 화살표 위주 → react-simplikit·es-toolkit 쪽을 택함
- 쓰지 않는 조건: 짧은 인라인 콜백 (`items.filter(item => item != null)`)
- 예외
  - 정적 멤버를 붙이는 컴포넌트 → `export const Tabs = Object.assign(function Tabs() {...}, { Item })` → 정적 멤버 부착은 표현식이 필요
  - HOC 적용 결과 → `export const OrderPage = withAuthGuard(OrderPageContent)` → 함수 호출의 결과값이라 선언문으로 쓸 수 없음
  - 팩토리 내부 지역 함수 → `const open = () => {}` → 클로저 안의 값 `[OSS:overlay-kit]`
- 면접 한 줄: "선언은 function, 전달은 화살표로 나눠 읽을 때 둘을 바로 구분되게 했습니다."

### S2. named export만 `[도구]`
- 근거: `[OSS:react-simplikit]` "Named exports only — No default exports"
- 예외
  - 프레임워크가 default를 요구 (Next.js `page`/`layout`/`template`/`loading`/`error`/`not-found`/`default`, Pages Router 페이지, 설정 파일, Storybook stories) → default export → 프레임워크 규약
  - `React.lazy` → `lazy(() => import('./X').then(m => ({ default: m.X })))` → 컴포넌트 쪽은 named 유지
- 면접 한 줄: "import 이름이 파일마다 달라지지 않게 해서 검색과 리팩터링을 안전하게 했습니다."

### S3. `useEffect` 콜백에 이름, cleanup 필수
- 근거: `[OSS:react-simplikit]` `useEffect(function handleResize() {...}, [])`, CLAUDE.md "Always return cleanup in useEffect to remove listeners"
- 예시: `useEffect(function subscribeResize() { window.addEventListener(...); return () => window.removeEventListener(...); }, [])`
- 면접 한 줄: "effect는 무엇을 동기화하는지가 가장 읽기 어려워서 이름으로 드러냈습니다."

## 2. 타입

### S4. 객체 타입도 `type` `[도구]`
- 근거: `[OSS:react-simplikit]` "type over interface"(`consistent-type-definitions`), `[OSS:overlay-kit]` type 19 : interface 1. **갈림**: slash·use-funnel은 interface 혼용
- 예외: 선언 병합이 필요 → `interface` → 라이브러리 타입 확장(Emotion `Theme`, `declare module`)은 병합으로만 가능. lint는 `*.d.ts`에서 이 규칙을 끈다
- 면접 한 줄: "union·교차 타입과 표기를 통일하려고 type을 썼고, 선언 병합이 필요한 Theme 확장만 interface입니다."

### S5. strict + 추가 옵션 `[도구]`
- 근거: `[OSS]` 확인한 토스 레포 전부 `strict: true`, `[OSS:slash]` `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- `noUncheckedIndexedAccess`: 확인한 토스 레포 중 쓰는 곳 없음 → 기본 off
- 예외: 주어진 레포의 tsconfig가 느슨해도 임의로 강화하지 않음 → 기존 코드 전체에서 에러가 나 변경 의도를 가림 → README 개선 제안에만 기록

### S6. `any` 금지, `as` 최소화 `[도구]`
- 근거: `[OSS:react-simplikit]` "No any types", `[toss.tech:apply-without-resume]` "정확하고 엄격한 TS"
- 예외
  - `as const` → 허용 → 단언이 아니라 리터럴 고정
  - 외부 데이터 경계(API 응답, `JSON.parse`, storage) → 스키마 검증 후 타입 획득, 또는 경계 한 곳에서만 단언 → 단언의 영향 범위를 경계에 가둠
  - TS가 추론하지 못하는 변환(템플릿 리터럴 타입 등) → 한 번만 단언 → 타입 체조로 우회하는 비용이 더 큼 (`[OSS:react-simplikit]` SwitchCase도 `as StringifiedValue<Case>`)
- 면접 한 줄: "단언은 타입 검사를 끄는 것이라 외부 데이터가 들어오는 경계에만 두었습니다."

### S7. 불가능한 상태는 Discriminated Union으로 막기
- 근거: `[FF]` 반환 타입 통일 — `{ ok: true } | { ok: false; reason }`, `[toss.tech:use-funnel-2]` 스텝별 상태를 DU로 정의해 누락 시 타입 오류
- 쓰지 않는 조건: 상태들이 서로 독립적이고 조합 제약이 없을 때
- 예시: `{ status: 'error'; error: Error } | { status: 'success'; data: T }` vs optional 필드 3개
- 면접 한 줄: "data와 error가 동시에 있는 상태를 타입으로 불가능하게 만들었습니다."

### S8. union 분기는 exhaustive `[도구]`
- 근거: `[toss.tech:ts-pattern-usage]` switch + `neverCheck(v: never)`, 처리 안 된 케이스는 런타임 에러 → ErrorBoundary/Sentry. `[OSS:use-funnel]` 테스트의 `exhaustiveCheck`. lint: `switch-exhaustiveness-check`
- 쓰지 않는 조건: 분기 2개이고 union이 늘어날 가능성이 낮을 때 → `if`/삼항
- 예외: ts-pattern → 복잡한 분기·타입 추론이 필요할 때만 → `[toss.tech:ts-pattern-usage]` "복잡한 분기에서는 큰 도움, 단순한 분기에서는 오버엔지니어링, 성능 비용"
- 면접 한 줄: "상태가 추가되면 처리 안 한 곳을 컴파일러가 알려주도록 never 체크를 뒀습니다."

### S9. 반환 타입은 추론
- 근거: `[OSS:slash, es-toolkit, overlay-kit]` `explicit-function-return-type: off`
- 예외
  - 튜플을 반환하는 훅 → `as const` 또는 명시적 `readonly [..]` → 추론하면 배열로 넓어짐 (`[OSS:slash]` useBooleanState)
  - 재귀 함수, API 레이어 함수 → 명시 → 구현 변경이 계약을 바꾸지 않도록 `[내 판단]`

### S10. 제네릭 이름은 `T` 또는 `TXxx` `[도구]`
- 근거: `[OSS:suspensive]` 정규식으로 강제, `[OSS:es-toolkit]` T(요소)·K(키)·E(에러)
- 예시: `TData`, `TError` / 하나뿐이면 `T`

### S11. 변경하지 않는 배열 파라미터는 `readonly`
- 근거: `[OSS:es-toolkit]` AGENTS.md "readonly T[]"
- 쓰지 않는 조건: 컴포넌트 props의 배열 → 모든 상위로 readonly가 전파되는 비용 대비 이득이 작음 `[내 판단]`

### S12. 타입 import는 `type` 키워드 `[도구]`
- 근거: `[OSS:overlay-kit]` `consistent-type-imports` + inline-type-imports. **갈림**: suspensive는 기본값(`import type`) → overlay-kit 쪽을 택함

## 3. 네이밍

### S13. 기본 컨벤션
- `[도구]` 변수 camelCase / UPPER_CASE / PascalCase 허용, 함수 camelCase / PascalCase, 타입 PascalCase — `[OSS:slash, es-toolkit]` naming-convention (허용 형식만 강제)
- `[간접]` 그중 모듈 수준 상수는 UPPER_SNAKE_CASE — FF 예시 `ANIMATION_DELAY_MS`
- 예외: API 응답을 구조분해한 snake_case 변수 → 허용 → 외부 계약의 이름 (lint `destructured` 예외)

### S14. 상수 이름에 목적과 단위
- 근거: `[FF]` 매직 넘버에 이름 붙이기(목적·맥락을 이름으로), 단위 접미사는 `[간접]` (`ANIMATION_DELAY_MS`)
- 예시: `MAX_RETRY_COUNT`, `SEARCH_DEBOUNCE_MS`, `MAX_UPLOAD_SIZE_BYTES`

### S15. 조건 이름은 `is/has/can/should`
- 근거: `[간접]` FF 예시 이름(`isSameCategory`, `isPriceInRange`, `canInvite`)

### S16. 라이브러리·표준과 겹치는 이름 금지
- 근거: `[FF]` http 래퍼를 `http`로 부르지 말고 `httpService.getWithAuth`
- 예시: `fetch` 래퍼 → `fetchWithAuth`

### S17. 이벤트: props는 `onXxx`, 내부 핸들러는 `handleXxx`
- 근거: `[간접]` FF 예시(`handleClick`, `onClose`)
- 예외: 한 줄이고 한 번만 쓰는 핸들러 → JSX에 인라인 → 이름을 붙여도 정보가 늘지 않음

## 4. 제어 흐름

### S18. 조건문 `[도구]`
- `curly: all`, `eqeqeq`(`== null`만 허용), `no-implicit-coercion` — `[OSS:slash, es-toolkit, overlay-kit]`
- `== null`로 nullish 검사 — `[OSS:react-simplikit]` AGENTS.md
- `strict-boolean-expressions` — `[OSS:react-simplikit]`에서 기본 옵션으로 사용. 이 문서는 문자열·숫자·nullable 객체의 암묵 변환까지 막는 더 엄격한 옵션을 씀 `[내 판단]`
- 예외: null과 undefined의 구분이 의미 있을 때 → `!== undefined` → `[OSS:react-simplikit]` controlled 판별 예시
- 예시: `if (user != null)`, `if (items.length > 0)` (`if (items.length)` 금지)

### S19. early return
- 근거: `[OSS:react-simplikit]` "Prefer early returns (guard clauses)", `[toss.tech:ts-pattern-usage]`

### S20. 중첩 삼항 금지
- 근거: `[FF]` 삼항 연산자 단순하게 하기
- 방법: 값 계산 → IIFE 안의 `if`(중괄호 포함, S18) / JSX → 분리 컴포넌트 또는 `SwitchCase` (design-patterns P7)
- 예외: 단일 삼항 → 허용 → 분기가 하나면 오히려 가장 짧고 읽기 쉬움

### S21. 복잡한 조건에 이름
- 근거: `[FF]` 복잡한 조건에 이름 붙이기
- 쓰지 않는 조건: `[FF]` 원문 — 로직이 단순하거나 한 번만 쓰이고 복잡하지 않을 때

### S22. 범위 비교는 왼쪽에서 오른쪽
- 근거: `[FF]` `80 <= score && score <= 100`

### S23. 매직 넘버는 상수로
- 근거: `[FF]` 가독성 + 응집도 (함께 바뀌어야 할 값이 따로 남지 않게)
- 쓰지 않는 조건: 의미가 자명한 값(`0`, `1`, `index + 1`, `length > 0`) `[내 판단]`

### S24. 배열 변환은 배열 메서드, 탈출·누적은 `for...of`
- 근거: `[내 판단]`. 토스는 `for...of`도 선언적 코드로 본다(`[toss.tech:frontend-declarative-code]`). `[OSS:es-toolkit]`의 "reduce 대신 for"는 라이브러리 성능 규칙이라 채택하지 않음
- 기준: 변환·필터 → `map`/`filter` / 중간 탈출이 필요하거나 여러 값을 한 번에 누적 → `for...of`

## 5. 함수·훅

### S25. 훅 반환 형태
- 근거: `[OSS:react-simplikit]` AGENTS.md "Hook Return Value Convention" — 값 1개 → 값 / 2개 → 튜플 / 3개 이상 → 객체
- 예외
  - 지금은 1~2개지만 늘어날 것이 예상됨 → 객체 → `[OSS:react-simplikit]` "Object also when the shape is expected to grow"
  - `useState`처럼 관례가 굳은 형태(값 + 여러 setter) → 튜플 허용 → `[OSS:react-simplikit, slash]` useBooleanState가 4-튜플을 반환

### S26. 같은 종류의 함수는 반환 형태 통일
- 근거: `[FF]` `useUser`·`useServerTime` 모두 Query 객체, 검증 함수 모두 `{ ok, reason }`
- 예시: 서버 상태 훅은 전부 Query 객체를 반환 (`data`만 꺼내지 않음)

### S27. 숨은 부수효과 금지
- 근거: `[FF]` `fetchBalance` 안의 로깅 → 호출부로
- 판단 기준: 이름·파라미터·반환 타입으로 예측할 수 없는 동작이 있으면 밖으로 꺼낸다

### S28. 훅 하나에 책임 하나
- 근거: `[FF]` `usePageState` → 파라미터별 훅
- 쓰지 않는 조건: 항상 함께 읽고 함께 바뀌는 값 묶음(page + size) `[내 판단]`

### S29. SSR이 있는 프레임워크에서 브라우저 값 초기화 (Next.js 등)
- 근거: `[OSS:react-simplikit]` AGENTS.md SSR-Safe Pattern — 브라우저 API로 상태를 초기화하지 않음 (hydration mismatch)
- 방법: `useIsClient` 같은 판별 또는 `ClientOnly` 경계. effect 안에서 setState로 동기화하는 패턴은 react-hooks v7이 에러로 잡으므로 피한다
- 쓰지 않는 조건: CSR 전용(Vite SPA)

## 6. 파일

### S30. 파일 하나에 주요 export 하나
- 근거: `[OSS:es-toolkit, react-simplikit, slash]` 1 함수 = 1 파일
- 예외: 그 파일에서만 쓰는 작은 하위 컴포넌트·타입 → 같은 파일, export하지 않음 → 파일을 나누면 시점 이동만 늘어남 (`[FF]` 시점 이동 줄이기) `[내 판단]`

### S31. 파일명
- 컴포넌트 `PascalCase.tsx`, 훅·유틸 `camelCase.ts`
- 근거: `[OSS:suspensive]` PascalCase 컴포넌트, `[OSS:use-funnel]` camelCase 훅. **갈림**: overlay-kit은 kebab-case
- 예외: 주어진 레포에 규칙이 있으면 그것 → 파일명 혼재가 더 큰 비용

### S32. 테스트 위치·명명
- 기본: 대상 옆에 `*.spec.ts(x)` — `[OSS:es-toolkit, slash, suspensive]`. **갈림**: react-simplikit 신규는 `.test.ts`, use-funnel은 `test/` 폴더
- 예외: 주어진 레포에 테스트가 있으면 그 위치·명명 → 레포 관례 우선. e2e는 레포 밖(`notes/e2e`) → 과정 산출물이라 제출물에 넣지 않음

### S33. index.ts는 공개 API만 명시적으로
- 근거: `[OSS:suspensive]` `export *` 대신 이름을 하나씩 나열
- 규칙: 도메인 `index.ts`는 페이지·앱 레이어가 쓰는 것만 내보낸다. 같은 도메인 안에서는 index를 거치지 않고 직접 import (순환 참조 방지, `[OSS:suspensive]` `import/no-cycle`). 도메인 간 import는 design-patterns P1

### S34. import 정렬 `[도구]`
- 근거: `[OSS:use-funnel]` simple-import-sort, `[OSS:suspensive]` sort-imports, `[OSS:es-toolkit]` prettier sort-imports 플러그인 → simple-import-sort를 택함
- 순서: 외부 → 내부 절대경로 → 상대경로

## 7. 주석

### S35. 주석 금지 `[내 판단]` `[도구: hook]`
- 근거: 사용자 규칙. **토스와 다름**: 토스 OSS는 공개 API에 JSDoc을 쓰고, 내부 코드에도 "왜"를 설명하는 주석이 적지 않다(es-toolkit src `//` 245줄, suspensive ErrorBoundary 등)
- 대신: "무엇" → 이름 / "왜" → `notes/decisions.md` → README, 테스트 이름, 커밋 본문
- 예외: 도구 지시 주석(`@ts-expect-error 이유`, `eslint-disable-next-line 규칙`) → 도구가 요구
- TODO/FIXME도 쓰지 않음 → 할 일은 README "하지 않은 것" (`[OSS:slash, overlay-kit]` `no-warning-comments` 경고)
- 면접 대비: "왜 주석이 없나요?" → "이름으로 의도를 드러내고, 결정의 이유는 README와 커밋에 모았습니다. 코드와 함께 낡는 주석보다 추적이 쉽다고 판단했습니다."

## 8. 접근성

### S36. 시맨틱 요소와 이름 `[FF]` `[도구]`
- 근거: `[FF]` A11y — fake-button, button-inside-button, table-row-link, required-label, `eslint-plugin-jsx-a11y`
- 규칙
  - 클릭 가능한 것은 `<button>` 또는 `<a>` (div + onClick 금지)
  - 버튼 안에 버튼·링크 금지, `<tr onClick>` 금지 → 행 안에 실제 링크
  - 입력 요소는 `<form>`으로 감싸고 레이블을 연결
  - 인터랙티브 요소에는 이름(텍스트 또는 `aria-label`), 의미 없는 이미지는 `alt=""`
- 효과: e2e를 `getByRole`, `getByLabel`로 쓸 수 있다 (fe-qa)

## 9. 포맷 `[도구]` — `lint-setup` 기본값

```json
{ "printWidth": 120, "singleQuote": true, "semi": true, "tabWidth": 2, "trailingComma": "es5", "arrowParens": "avoid" }
```
- 근거: `[OSS:slash, es-toolkit, es-hangul]` 동일 값. **갈림**: suspensive는 세미콜론 없음

---

## 채택하지 않은 토스 규칙

| 규칙 | 출처 | 이유 |
|---|---|---|
| reduce 대신 for 루프, `Object.entries` 금지 | es-toolkit | 라이브러리 성능 규칙. 앱 코드에선 가독성 우선 |
| 공개 API JSDoc 필수, 내부 "왜" 주석 | react-simplikit, suspensive, es-toolkit | 주석 금지 규칙(S35). 이유는 결정 기록·README로 |
| 커버리지 100% | react-simplikit | 라이브러리 기준. 과제는 1단계 테스트 전략을 따름 |
| 상대경로 import에 `.js`/`.ts` 확장자 | use-funnel, react-simplikit | 빌드 도구(tsdown) 요구 사항 |
| 세미콜론 없음, 화살표 함수 선언 | suspensive | 토스 다수(slash, es-toolkit, react-simplikit)를 따름 |
