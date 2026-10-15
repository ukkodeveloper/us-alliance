---
name: fe-start
description: FE 과제 0단계. 작업 공간 생성, 코드 확보, 모드 판별(처음부터/주어진 레포/스타터 템플릿), git 기준선, 실행 기준선, dev 서버, 과제 조건(AI 정책·제출·배포·시안), 회사 프로필.
argument-hint: "<과제명> <소스: zip | git URL | 디렉토리 | none> [JD URL]"
---

# 0단계: 시작

인자: `$ARGUMENTS` — `<과제명> <소스> [JD URL]`. 아래 경로의 `<A>`는 `assignments/<과제명>`.

## 1. 작업 공간

- `<A>/repo/`, `<A>/notes/{qa,e2e}/` 생성
- `references/templates/progress.md`, `decisions.md`를 `<A>/notes/`로 복사, `date "+%Y-%m-%d %H:%M"`으로 시작 시각 기록

## 2. 코드 확보

| 소스 | 처리 |
|---|---|
| zip | `<A>/repo/`에 풀기. 최상위 폴더가 하나면 한 단계 올림 |
| git URL | `<A>/repo/`로 clone |
| 디렉토리 | `node_modules`, `dist`, `.next` 제외 복사 |
| none | 빈 폴더 |

정리: `__MACOSX/`, `.DS_Store` 삭제. `.env*`가 있으면 내용을 보여주고 커밋에서 뺄지 묻는다.

## 3. 모드 판별 → 사용자 확인

| 모드 | 판단 근거 | 이후 차이 |
|---|---|---|
| 처음부터 | 코드 없음 | 스택·구조·도구 모두 결정 |
| 스타터 템플릿 | 설정·빈 화면만 있고 기능 코드 없음 | 구조는 처음부터처럼, 도구는 레포 기준 |
| 주어진 레포 | 기능 코드가 있음 (모노레포면 대상 패키지 확인) | 기존 lint/formatter·테스트 명명·커밋 컨벤션 준수, 공통 모듈 보호 |

판별 결과와 근거를 보여주고 사용자가 확정한다.

## 4. git 기준선

- `.git`이 없으면 `git init`. `.gitignore`에 `node_modules`, `dist`, `.env`가 없으면 추가한 뒤, 주어진 코드를 **원본 그대로** `chore: 과제 초기 코드 추가`로 커밋 → 이 커밋이 base.
- `.git`이 있으면 현재 HEAD가 base. `git log --oneline -20`으로 기존 커밋 컨벤션을 확인한다.
- 처음부터 모드: base = empty tree `4b825dc642cb6eb9a060e54bf8d69288fbee4904`.
- 커밋 hook: `git -C <A>/repo config core.hooksPath`가 비어 있으면 `cp .claude/hooks/commit-msg <A>/repo/.git/hooks/ && chmod +x <A>/repo/.git/hooks/commit-msg`. husky 등으로 설정돼 있으면 그 폴더의 `commit-msg`에 attribution 검사만 덧붙일지 묻는다.
- 기존 커밋 컨벤션이 Conventional Commits가 아니면 `touch <A>/repo/.git/fe-skip-format` (형식 검사 끔, attribution 검사는 유지).
- `git -C <A>/repo config user.name`, `user.email`을 보여주고 사용자 계정인지 확인받는다.

## 5. 실행 기준선 (코드가 있을 때)

- Node 버전(`.nvmrc`, `engines`), 패키지 매니저(lockfile) 확인 → 설치.
- scripts의 build / test / lint / typecheck(없으면 `tsc --noEmit`)를 실행해 결과를 progress.md 기준선 표에 기록. **원래 실패하는 것은 "기존 실패"로 분리**한다.
- 실행 자체가 안 되면(Node 버전, 의존성 충돌) 원인을 보여주고, 복구를 base 다음 첫 커밋 `fix: 실행 환경 복구`로 할지 사용자와 정한다 → `decide` (D, `[기존코드]`).
- 기존 lint / formatter / tsconfig 설정의 핵심만 요약 (이것만 따르고 나머지는 code-style).
- React + TypeScript가 아니면 경고: code-style·design-patterns는 원칙(P0, FF 4기준)만 적용.

## 6. dev 서버

dev 스크립트를 `run_in_background`로 띄우고 URL을 progress.md에 기록한다. 처음부터 모드는 스캐폴딩 커밋 직후에 띄운다. 의존성을 설치하거나 설정을 바꾼 뒤에는 재시작, 7단계 종료 시 정지.

## 7. 과제 조건

요구사항 문서(레포 README, PDF, 붙여넣은 텍스트)를 찾아 `<A>/notes/assignment.md`에 원문 그대로 저장한다. 없으면 요청한다. 문서에서 찾고, 없으면 묻는다:

| 항목 | 영향 |
|---|---|
| **AI 사용 정책** (허용 / 금지 / 언급 없음) | **금지면 즉시 멈추고** 이 파이프라인을 계속 쓸지 사용자가 결정한다. 언급 없음 → README AI 섹션 여부를 6단계에서 결정 |
| 제한 시간 | progress.md 예산 조정 |
| 제출 방식 (GitHub / zip) | zip이면 `.git` 포함 권장 (커밋 이력도 평가 대상) |
| 배포 (필수 / 선택 / 안 함) | 선택이면 6단계 후 10분 |
| 디자인 시안 (Figma / 이미지 / 없음) | 1단계에서 화면·상태 목록으로 정리, QA에서 대조 |
| 기존 README가 과제 설명인지 | 6단계에서 보존 방식 결정 |

## 8. 명시된 평가 기준 (G)

과제 문서나 회사 안내에 **"이런 점을 중점적으로 봅니다"** 류의 기준이 있으면 반드시 뽑는다. 사용자에게도 "과제 안내 외에 따로 받은 평가 기준이 있나요?"라고 묻는다.

- `<A>/notes/company.md` 최상단 "명시된 평가 기준" 표에 **원문 그대로 인용**하고 `G-1`, `G-2` …로 번호를 붙인다.
- 기준마다 이 파이프라인에서 어떻게 지킬지 한 줄로 해석한다 (예: "테스트 코드 작성 여부" → 핵심 로직·흐름 테스트를 Must로, README에 테스트 전략 섹션).
- **내 규칙과 충돌하는지 확인한다** (예: "주석으로 의도를 설명해 주세요" ↔ 주석 금지, "클래스 컴포넌트" ↔ code-style). 충돌하면 G가 이긴다 → `decide` D로 기록하고, 주석 관련이면 `touch <A>/notes/allow-comments`로 주석 hook을 끈다.
- 해석을 사용자가 확인한다.
- G 목록(번호 + 짧은 요약)을 **progress.md 상단 "중점 평가 기준"에도 복사**한다 — 압축·새 세션 후에도 항상 다시 읽히는 곳.

없으면 "명시된 기준 없음"으로 적는다.

## 9. 회사 프로필

`references/templates/company.md` 형식으로 `<A>/notes/company.md` 작성.
- JD URL이 있으면 가져와 핵심 역량·우대사항·스택 인용 + **평가에서 가중할 신호** 3~5개.
- 없으면 회사/직무를 묻고, 모르면 기본 프로필.
- 회사와 무관하게 코드 스타일은 code-style.md를 따른다.

## 10. 도구

`tools/e2e/node_modules`가 없으면 `npm --prefix tools/e2e install`, 브라우저가 없으면 `tools/e2e/node_modules/.bin/playwright install chromium` (최초 1회, 사용자 확인).

## 11. 마무리

progress.md에 모드, base, 기준선, dev 서버, 조건, **중점 평가 기준(G)** 을 기록하고 종료 시각을 적는다. 출력: 5줄 이내 요약 + "다음: `/fe`".
