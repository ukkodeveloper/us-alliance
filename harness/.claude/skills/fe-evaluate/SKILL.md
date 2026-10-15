---
name: fe-evaluate
description: FE 과제 7단계. 제출물만 보는 fe-evaluator가 회사 프로필과 평가 기준표로 채점하고, 결정 기록과 대조해 드러나지 않은 판단을 찾고, 사용자가 직접 답하는 면접 리허설과 최종 제출 점검을 한다. Gate 단계.
---

# 7단계: 면접관 관점 평가

입력: progress.md(base, 모드, 제출 방식), `notes/company.md`, `references/evaluation-rubric.md`. `<R>` = `assignments/<과제명>/repo`.

## 1. 채점 (격리)

- 메인이 임시 폴더에 clean clone을 만든다: `D=$(mktemp -d) && git clone -q <R> "$D/repo"`.
- `fe-evaluator`에게 넘기는 것: `$D/repo` 경로, base, 모드, 제출 방식, **company.md 본문(G 표 포함, 프롬프트에 붙여넣기)**. notes/ 경로는 알려주지 않는다 — 면접관은 제출물만 본다.

## 2. 드러남 점검 (메인)

평가 결과를 `notes/decisions.md`와 대조한다:
- 중요한 D·X 중 **제출물(README·코드·테스트·커밋)에서 읽히지 않는 것** → README 보강, 이름·구조 개선, 테스트 이름 보강 후보
- 평가자가 "근거가 약하다"고 본 곳 중 결정이 있었던 곳 → 같은 처리
- 결정이 없었던 곳 → 지금 판단하거나 개선

## 3. 사용자 판단 (Gate)

보드 "리뷰" 섹션 아래에 평가 결과(총평, 레드 플래그, 항목별 등급, 가성비 Top 5, 드러남 점검)를 추가한다. 남은 시간 안에서 사용자가 고른 것만 수정 → fe-qa → 커밋 → README 보정.

## 4. 면접 리허설 (10분)

평가자의 "면접 질문 5개"를 하나씩 묻는다. **사용자가 먼저 직접 답하고**, AI는 코드·커밋 근거로 맞는지, 빠진 근거가 무엇인지 짚는다. 답하지 못한 질문은 해당 코드를 함께 읽는다.

## 5. 최종 제출 점검

- [ ] clean clone에서 README 명령 그대로 설치·실행·테스트·빌드 성공
- [ ] `git -C <R> log --format=%B base..HEAD | grep -iE 'claude|anthropic'` 결과 없음
- [ ] 주석 없음(지시 주석 제외), `console.log` 없음, 미사용 파일·의존성 없음
- [ ] notes/, e2e 스크립트 등 과정 산출물이 레포에 없음
- [ ] `.env.example`(필요 시), Node 버전 명시
- [ ] zip 제출이면 `node_modules` 제외 + `.git` 포함, 압축 해제 후 실행 재확인
- [ ] dev 서버 정지

완료 후 progress.md를 `상태: 제출 완료`로 바꾼다.
