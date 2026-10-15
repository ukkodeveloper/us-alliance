---
name: lint-setup
description: lint/formatter 설정이 없는 과제 레포에 code-style.md의 [도구] 규칙(토스 OSS 기준)을 ESLint flat config + Prettier로 설정한다. 처음부터 모드이거나, 주어진 레포에 설정이 없고 사용자가 원할 때만 사용.
---

# lint-setup

## 사용 조건

- 처음부터 모드: 스캐폴딩 직후 기본으로 사용 (사용자에게 확인).

- 레포에 ESLint / Prettier / Biome 설정이 **이미 있으면 사용하지 않는다.** 기존 설정을 따른다.
- 주어진 레포에 설정이 없어 새로 추가할 때는 **기존 파일을 일괄 포맷하지 않는다.** 거대한 포맷 diff는 변경 의도를 가린다. 내가 만들거나 수정한 파일에만 적용한다. 이 선택은 `decide`로 기록한다.

## 설치

패키지 매니저는 레포의 lockfile을 따른다.
```
prettier eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-plugin-simple-import-sort globals
```
React 버전에 맞는 `eslint-plugin-react-hooks`를 쓰고, Next.js면 `@next/eslint-plugin-next`를 추가한다.

템플릿은 ESLint 9 + typescript-eslint 8 + react-hooks 7 + jsx-a11y 6에서 실행 검증했다. 조정할 곳:
- Next.js Pages Router면 `DEFAULT_EXPORT_ALLOWED`에 `'**/pages/**/*.tsx'` 추가 (Vite의 `src/pages`는 named export 유지)
- Next.js면 `extends`에 Next 플러그인 설정 추가
- 타입 기반 규칙은 `src/**`에만 적용된다. 소스 폴더가 다르면 `files`를 바꾼다

## 설정 파일

이 폴더의 템플릿을 레포 루트로 복사하고 경로·환경에 맞게 조정한다:
- `.claude/skills/lint-setup/prettierrc.json` → `.prettierrc`
- `.claude/skills/lint-setup/eslint.config.js` → `eslint.config.js` (Node 20.11+ 필요: `import.meta.dirname`. 타입 기반 규칙은 `src/**`에만 적용됨)

tsconfig는 `strict: true`를 확인하고, 처음부터 모드에서만 `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`를 켠다 (code-style S5).

`package.json` scripts: `lint`, `lint:fix`, `format`, `typecheck`(`tsc --noEmit`).

## 확인과 커밋

- `lint`, `typecheck`가 통과하는지 확인한다 (처음부터 모드). 주어진 레포는 기존 위반 개수를 기준선으로 기록한다.
- 승인 후 `chore: lint·format 설정 추가` 커밋.
