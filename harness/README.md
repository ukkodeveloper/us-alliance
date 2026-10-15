# AI 하네스

이 과제에서 실제로 사용한 Claude Code 작업 환경입니다. 원래는 여러 과제를 진행하는 상위 작업 공간(레포 밖)에 있던 파일을 그대로 옮겼습니다. 바꾼 것은 아래 "정리한 내용"뿐입니다.

## 구성

| 경로 | 내용 |
|---|---|
| `CLAUDE.md` | 작업 공간 규칙: 단계별 파이프라인, 역할 분담(AI는 대안·구현·검증, 사람은 결정), 절대 규칙(주석 금지, 승인 후 커밋 등) |
| `.claude/skills/` | 단계별 절차. `fe`(진행 관리) → `fe-start` → `fe-understand` → `fe-strategy` → `fe-plan` → `fe-implement`·`fe-qa` → `fe-review` → `fe-readme` → `fe-evaluate`, 그 밖에 `decide`(결정 기록), `fe-tune`(파이프라인 자체 수정), `lint-setup` |
| `.claude/agents/` | 서브에이전트 정의. `fe-implementer`(커밋 단위 하나 구현), `fe-reviewer`(새 맥락에서 품질·영향 범위 리뷰), `fe-evaluator`(면접관 관점 채점) |
| `.claude/hooks/` | `inject-criteria.sh`: 매 메시지에 과제 평가 기준과 현재 단계를 넣음. `check-comments.mjs`: 새로 추가한 주석 줄을 막음. `commit-msg`: Conventional Commits 형식 검사, AI attribution 줄 차단 |
| `.claude/settings.json` | 위 hook 등록, attribution 끄기, 읽기 전용 명령 허용 목록 |
| `references/` | 코드 스타일·설계 패턴 기준(공개된 토스 프론트엔드 자료 조사 기반), 평가 기준표, AI 티 나는 코드·문장 점검표, 문서 템플릿 |
| `tools/e2e/` | 과제 공용 Playwright 설정. e2e 스펙은 과정 산출물이라 레포에 넣지 않았습니다 |

## 이번 과제에서의 흐름

1. 요구사항을 R-1~R-27로 나누고, 모호한 점은 가정(A1~A19)으로 만들어 제가 확정했습니다.
2. 커밋 단위 계획을 세운 뒤, 서로 독립인 단위는 `fe-implementer` 서브에이전트에 병렬로 맡겼습니다. 공통 모듈과 통합 커밋은 메인 세션이 직접 했습니다.
3. 그룹마다 typecheck·lint·단위 테스트·모킹 e2e를 돌리고, 제가 승인한 뒤 커밋했습니다.
4. 리뷰는 결정 기록을 보지 않은 새 맥락의 `fe-reviewer` 두 개(품질 / 영향 범위)가 했고, 지적마다 제가 수정·수용을 정했습니다.
5. 모든 결정은 출처(AI 제안 → 수용, AI 판단 등)와 함께 [`docs/adr/`](../docs/adr/)에 남겼습니다.

## 정리한 내용 (민감정보 제거)

- 다른 회사 이름이 들어간 예시 2곳을 일반 표현으로 바꿨습니다(`references/templates/company.md`, `references/evaluation-rubric.md`).
- 다른 과제 이름이 들어간 예시 1곳을 바꿨습니다(`fe-tune`, `pipeline-guide.html`).
- 제외한 파일: 개인 설정(`settings.local.json`), 다른 과제 폴더, 파이프라인 튜닝 기록, `package-lock.json`.
- 개인 경로·이메일·API 키·토큰은 원본에도 없음을 확인했습니다.

이 폴더는 레포 루트가 아니어서 이 레포를 Claude Code로 열어도 자동으로 로드되지 않습니다.
