# Design Patterns

"언제 어떤 구조를 고르는가". 모든 패턴은 **쓰는 신호 / 쓰지 않는 신호 / 예외(상황 → 방법 → 이유)** 를 갖는다. 신호가 없으면 패턴을 쓰지 않는 것이 기본값이다.

근거 태그는 `code-style.md`와 같다. 숫자 임계값(“2곳 이상”, “3단계” 등)은 토스 근거가 없는 내 기준이라 `[내 판단]`으로 표시한다.

토스 OSS 라이브러리(suspensive, overlay-kit, use-funnel, react-simplikit)는 **패턴의 근거**일 뿐이다. 도입 여부는 P0-5로 따로 판단한다.

---

## P0. 추상화 판단 원칙 (모든 패턴에 우선)

| # | 원칙 | 근거 |
|---|---|---|
| 1 | 추상화 수준은 **앞으로 어디가 바뀔지 예측한 만큼만** 올린다 | `[toss.tech:frontend-declarative-code]` "앞으로 코드의 어떤 부분이 수정될지 예측하고, 이에 따라 적절한 선언 레벨을 따르는 코드" |
| 2 | 사용처마다 **달라질 여지가 있으면 중복을 허용**한다 | `[FF]` 중복 코드 허용하기, `[toss.tech]` SignUpForm 사례 |
| 3 | **함께 안 바뀌면 오류가 나는 것**은 공통화한다 (응집도 우선) | `[FF]` 가독성 vs 응집도 트레이드오프 |
| 4 | 단순한 로직에 간접 참조를 만들지 않는다 | `[FF]` 시점 이동 줄이기 |
| 5 | 새 라이브러리는 **이 과제에서의 이득**을 설명할 수 있을 때만. 내장 API로 되면 내장 API | `[toss.tech:52999]` App Router 실측 후 미도입, `[toss.tech:ts-pattern-usage]`, `[OSS:es-toolkit]` AGENTS.md 내장 API 우선 |

**쓰기 전 질문** (답을 `decide`로 남긴다):
1. 지금 사용처가 몇 곳이고, 실제로 서로 다른가?
2. 이 추상화가 없으면 무엇이 깨지는가?
3. 요구사항이 바뀌면 이 추상화가 도움이 되는가, 방해가 되는가?

---

## P1. 디렉토리: 도메인 단위 colocation

- 근거: `[FF]` 함께 수정되는 파일을 같은 디렉토리에 — 도메인 간 참조가 import 경로로 드러나고, 기능 삭제가 폴더 삭제가 됨. `[toss.tech:apply-without-resume]` "명확한 디렉토리 구조"
- 구조
  ```
  src/
  ├─ app | pages               # 라우트. 여러 도메인을 조합하는 유일한 곳
  ├─ components, hooks, utils  # 2개 이상 도메인이 쓰는 것
  └─ domains/<domain>/
     ├─ components, hooks, utils, api, types
     └─ index.ts               # app/pages가 쓰는 공개 API
  ```
- 의존 방향
  - **도메인 → 다른 도메인 import 금지** — `[FF]` code-directory는 도메인 간 참조 자체를 잘못된 참조의 신호로 본다. 두 도메인이 같은 것을 필요로 하면 공용 폴더로 올리거나, 라우트에서 조합한다
  - 레이어는 단방향 `components → hooks → utils` — `[간접]` `[OSS:react-simplikit]` AGENTS.md
- 쓰지 않는 신호: 화면 1~2개짜리 소규모 → `src/` 아래 평면 구조 `[내 판단]`
- 예외
  - 주어진 레포가 종류별 구조 → 최상위는 유지하고 새 기능 폴더 안에서 colocation → 구조를 갈아엎는 diff가 과제 변경을 가림. README에 점진적 이관 제안
- 공용 폴더로 옮기는 시점: 두 번째 도메인이 실제로 쓸 때 `[내 판단]` (P0-2)
- 면접 한 줄: "기능을 지울 때 폴더 하나만 지우면 되게, 함께 바뀌는 파일을 모으고 도메인끼리는 서로 모르게 했습니다."

## P2. 같이 실행되지 않는 코드 분리

- 근거: `[FF]` SubmitButton → ViewerSubmitButton / AdminSubmitButton
- 쓰는 신호: 같은 플래그(`isAdmin`, `mode`)로 effect·핸들러·JSX 곳곳에서 분기
- 쓰지 않는 신호: 분기가 JSX 한 곳뿐 `[내 판단]`
- 면접 한 줄: "역할마다 다른 코드가 섞여 있어 분기를 한 곳으로 모으고, 각 컴포넌트는 한 경우만 다루게 했습니다."

## P3. 구현 상세 숨기기: Wrapper·HOC, 트리거와 동작 묶기

- 근거: `[FF]` 구현 상세 추상화하기 — `<AuthGuard>` / `withAuthGuard`, 그리고 `InviteButton`(버튼과 그 클릭이 여는 다이얼로그·처리를 한 컴포넌트로). `[OSS:suspensive]` `X.with(props, Component)`
- 쓰는 신호
  - 화면의 주 관심사와 무관한 로직(권한, 로깅, 노출 측정)이 컴포넌트 상단을 차지 → Wrapper/HOC
  - 버튼의 핸들러가 다이얼로그·API·후처리를 길게 품어 부모가 읽기 어려움 → 트리거 컴포넌트(`InviteButton`)
- 쓰지 않는 신호: 그 로직이 컴포넌트의 주 관심사
- 선택: 렌더 트리 안에서 감싸면 Wrapper, 페이지 단위로 붙이면 HOC (`export const Page = withAuthGuard(PageContent)`, code-style S1 예외)
- 면접 한 줄: "페이지는 무엇을 보여주는지만 남기고, 로그인 확인은 Guard로, 초대 흐름은 초대 버튼 안으로 옮겼습니다."

## P4. Props Drilling: composition → Context

- 근거: `[FF]` Props Drilling 지우기 — 먼저 `children`으로 깊이를 줄이고, 그래도 안 될 때 Context. 역할과 의도를 담은 props는 그대로 둔다
- 쓰는 신호: 중간 컴포넌트가 쓰지 않는 props를 전달만 함
- 단계: ① 중간 컴포넌트가 `children`을 받게 해 부모에서 조립 ② 그래도 깊고 여러 곳에서 읽으면 Context
- 쓰지 않는 신호(Context): 깊이 2 이하, 읽는 곳 1곳 `[내 판단]`
- Context를 만들면: Provider 밖에서 쓰면 throw하는 전용 훅을 함께 만든다 → `[OSS:react-simplikit]` buildContext
- 예외: 앱 전역 값(테마, 로그인 사용자) → 처음부터 Context 또는 기존 전역 상태 → 사용처가 화면 전체라 drilling 단계가 의미 없음
- 면접 한 줄: "Context 전에 조합으로 깊이를 줄였고, 그걸로 충분해서 Context는 쓰지 않았습니다."

## P5. Compound Component

- 근거: `[간접]` — 토스 자료에 'compound'라는 이름의 규칙은 없다. 유사 사례: `[OSS:slash]` `<Funnel><Funnel.Step name>`, `[OSS:suspensive]` `Object.assign`으로 `ErrorBoundary.Consumer` 등 정적 멤버 부착. 원리는 `[FF]` composition
- 쓰는 신호: 사용처 2곳 이상 `[내 판단]`에서 하위 요소의 **배치·구성·생략 여부가 실제로 다름** (탭 헤더 위치, 선택적 Footer)
- 쓰지 않는 신호: 사용처 1곳, 또는 구성이 고정 → 일반 컴포넌트 + props
- 예외: 과제 자체가 범용 UI 컴포넌트 제작 → 사용처가 1곳이어도 사용 → 조합 자유도가 요구사항
- 구현: `Object.assign(function Root() {...}, { Header, Item })` + 내부 Context (Provider 밖 사용 시 throw, P4)
- 면접 한 줄: "Footer 유무와 헤더 위치가 화면마다 달라, boolean props를 늘리는 대신 조합을 사용처에 맡겼습니다."

## P6. Render Props

- 근거: `[OSS:suspensive]` `<SuspenseQuery {...options}>{({ data }) => ...}</SuspenseQuery>`(쿼리와 그 데이터를 쓰는 UI를 같은 JSX 깊이에 둠), `ErrorBoundary.Consumer` / `[OSS:use-funnel]` `<funnel.Render StepA={...} />` / `[OSS:overlay-kit]` `overlay.open(({ isOpen, close }) => ...)`
- 쓰는 신호
  - Suspense·ErrorBoundary 경계와 그 데이터를 쓰는 UI를 한곳에서 보여주고 싶을 때
  - 컴포넌트가 상태를 갖고, 무엇을 그릴지는 사용처가 정해야 할 때
- 쓰지 않는 신호: 로직만 재사용 → 커스텀 훅 / 중첩이 2단 이상 → 훅 또는 컴포넌트 분리 `[내 판단]`
- 면접 한 줄: "어떤 쿼리 때문에 Suspense가 걸리는지 JSX에서 바로 보이도록 render props로 데이터 경계를 드러냈습니다."

## P7. 선언적 분기: switch + never / SwitchCase

- 근거: `[toss.tech:ts-pattern-usage]` IIFE + switch, `SwitchCase`, `neverCheck` / `[OSS:react-simplikit, slash]` `SwitchCase`
- 선택

  | 상황 | 방법 |
  |---|---|
  | 분기 2개 | 삼항 / early return |
  | union 3개 이상, 누락 검사 필요 | `switch` + `neverCheck` (값) / 분리 컴포넌트 안의 `switch` (JSX) |
  | union 3개 이상, JSX에서 값 → 화면 매핑 | `SwitchCase` (레포에 없으면 작은 컴포넌트로 작성) |
  | 복잡한 조건 조합·타입 추론 | ts-pattern 검토 (`decide`) |

- 쓰지 않는 신호: 단순 분기에 패턴 매칭 라이브러리 → `[toss.tech]` 오버엔지니어링 + 성능 비용
- 면접 한 줄: "상태가 추가되면 처리 안 한 화면을 컴파일러가 잡도록 switch와 never 체크를 썼습니다."

## P8. 비동기: Suspense + ErrorBoundary 경계

- 근거: `[toss.tech:faster-initial-rendering]` 토스 대부분의 앱이 Suspense + ErrorBoundary로 비동기를 다룸, `[OSS:slash]` `AsyncBoundary`, `[OSS:suspensive]` `Suspense`·`ErrorBoundary`·`Delay`
- 쓰는 신호: 조회 데이터의 로딩·에러를 화면 영역 단위로 처리
- 경계 위치: **사용자가 독립적으로 기다릴 수 있는 영역** 단위 — 한 영역의 실패가 다른 영역을 막지 않게 `[내 판단]`
- 쓰지 않는 신호: mutation, 낙관적 업데이트, 버튼 단위 로딩 → `isPending` 상태 `[내 판단]`
- 예외
  - 주어진 레포가 Suspense를 쓰지 않음 → 기존 방식 유지 → 한 레포에 두 방식이 섞이면 예측 가능성이 떨어짐. README 개선 제안
  - 짧은 로딩 깜빡임 → 지연 표시(`Delay`) 또는 최소 표시 시간 → 깜빡임이 오히려 느리게 느껴짐 `[OSS:suspensive]`
- 면접 한 줄: "목록이 실패해도 요약 카드는 보이도록 영역마다 경계를 나눴습니다."

## P9. 서버 상태 / 클라이언트 상태

- 근거: `[toss.tech:toss-frontend-chapter]` React Query/SWR로 비동기 자원을 선언적으로 관리·캐싱
- 기본값: 서버 상태 → React Query(레포에 있거나 도입 근거가 있을 때) / 클라이언트 상태 → 지역 상태 → 필요해질 때 위로
- 쓰지 않는 신호(전역 상태 라이브러리): 상태가 한 페이지 안에서 끝남
- 예외: 주어진 레포에 상태 라이브러리(Recoil, Zustand 등) → 그 역할 범위 안에서 사용 → 같은 종류의 상태를 두 방식으로 관리하지 않음
- 쿼리 키·쿼리 함수는 도메인 `api/`에 `queryOptions`로 모음 `[내 판단]`

## P10. 결과가 필요한 오버레이는 Promise로

- 근거: `[FF]` 구현 상세 추상화하기 — FriendInvitation의 `await overlay.openAsync(...)`, `[OSS:overlay-kit]` `openAsync`. 참고: `[toss.tech:frontend-declarative-code]`의 useOverlay는 열림 상태(useState)를 숨기는 사례
- 쓰는 신호: 확인·선택 결과를 받아 다음 로직이 이어짐 (`if (await confirm()) submit()`)
- 쓰지 않는 신호: 항상 페이지에 있는 인라인 UI, 결과가 필요 없는 단순 토글
- 예외
  - 레포에 모달 시스템이 있음 → 그것을 사용 → 두 방식 공존 방지
  - 오버레이가 1~2개뿐 → 라이브러리 대신 작은 `useConfirm` 훅 → P0-5 (`decide`)

## P11. 다단계 흐름(퍼널)

- 근거: `[toss.tech:use-funnel-1, use-funnel-2]`
  - 흐름을 코드 한 곳에서 한눈에 보이게
  - 스텝별 상태를 DU로 정의해 누락 시 타입 오류
  - **스텝 컴포넌트는 `onNext` 같은 이벤트만 받고, 다음 스텝 결정은 퍼널이** 한다 (이동 규칙과 렌더링 분리)
  - 뒤로 가면 그 스텝에 들어왔을 때의 상태로 돌아간다
- 쓰는 신호: 3단계 이상 `[내 판단]`, 단계마다 데이터가 누적, 뒤로가기 필요
- 쓰지 않는 신호: 2단계 이하 → 일반 상태
- 예외: @use-funnel 도입 → 라우팅 연동·브라우저 뒤로가기가 요구사항일 때만 → 아니면 DU 상태 + switch로 직접 (P0-5)

## P12. 폼: 변경 단위에 맞춰 응집

- 근거: `[FF]` 폼의 응집도 생각하기
- 필드 단위 검증: 필드가 독립적, 비동기 검증(중복 확인), 필드 재사용
- 폼 단위 스키마(zod 등): 필드 간 의존(비밀번호 확인), 하나의 기능 단위(결제·배송), **여러 단계로 나뉜 입력(Wizard)**
- 검증 결과는 `{ ok: true } | { ok: false; reason }`로 통일 (code-style S26)

## P13. 부가 관심사를 숨기는 선언적 컴포넌트

- 근거: `[toss.tech:frontend-declarative-code]` `ImpressionArea`, `LoggingClick`, `[OSS:react-simplikit]` `ImpressionArea`, `Separated`
- 쓰는 신호: 같은 부가 관심사(노출 측정, 클릭 로깅, 구분선)가 2곳 이상에서 반복 `[내 판단]`
- 쓰지 않는 신호: 1곳 → 그 자리에 직접

## P14. 에러 처리

- 근거: `[toss.tech:ts-pattern-usage]` 처리되지 않은 케이스는 에러를 던져 ErrorBoundary로, `[FF]` 검증 결과는 값으로 반환

  | 종류 | 처리 |
  |---|---|
  | 예상 가능한 실패 (검증, 비즈니스 규칙) | 값으로 반환 `{ ok: false, reason }` → UI 메시지 |
  | 조회 실패 | throw → 가장 가까운 ErrorBoundary (재시도 UI) |
  | 도달할 수 없는 상태 | `neverCheck`로 throw |

- 쓰지 않는 신호: 모든 함수에 try/catch → 경계에서 한 번 `[내 판단]` (`ai-smell.md` 과잉 방어)

---

## 패턴을 썼다면

`decide`로 남긴다: 어떤 신호를 보고 썼는지 / 쓰지 않은 대안 / 예외를 적용했다면 어느 예외인지. 작은 적용은 N 한 줄이면 충분하다.
