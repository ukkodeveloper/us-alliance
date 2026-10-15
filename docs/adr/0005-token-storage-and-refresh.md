# 0005. 토큰은 localStorage, 401이면 refresh 한 번 후 재시도

- 상태: 채택
- 출처: AI 제안 → 수정 (보안 검토를 요구해 방어 조치를 추가)

## 맥락

Access Token은 15분 뒤 만료됩니다. API는 토큰을 응답 본문으로 주고 `Authorization: Bearer` 헤더를 요구합니다. 요구사항은 "만료 후 Refresh Token으로 재발급받아 요청을 재시도"입니다.

## 대안

- A. 두 토큰을 localStorage에 둔다. 401이면 refresh를 한 번 하고(동시 요청은 같은 refresh를 기다림) 원요청을 재시도한다
- B. Access Token은 메모리, Refresh Token만 저장한다
- C. 만료 전에 미리 갱신하고 401에도 대비한다

## 결정

A.

> "1번이긴한데 보안상 문제가 없는지 검토" → 검토 후 "ㅇㅇ 그렇게 가자"

보안 검토 내용은 다음과 같습니다.

- httpOnly 쿠키는 서버 계약상 쓸 수 없습니다.
- B를 택해도 탈취 가치가 더 큰 Refresh Token이 여전히 storage에 남아서 얻는 이득이 작습니다.
- 그래서 실제 방어선은 XSS를 막는 것입니다.

그 결과 다음 조치를 넣었습니다.

1. 링크는 입력과 렌더 양쪽에서 http/https만 허용합니다. `javascript:`를 차단합니다.
2. `dangerouslySetInnerHTML`을 쓰지 않습니다.
3. 로그아웃하거나 refresh가 서버에서 거절되면 storage를 바로 비웁니다.

## 결과

- refresh 단일 진행 로직은 `src/api/http.ts`에 모으고, 동시 401과 refresh 실패를 테스트했습니다(`src/api/http.spec.ts`).
- 재발급 요청이 네트워크 오류로 실패하면 토큰을 유지합니다. 잠깐 끊긴 것만으로 작성 중인 사용자를 로그인 화면으로 보내지 않기 위해서입니다.
- 한계: XSS가 뚫리면 토큰이 노출됩니다. 서버가 httpOnly 쿠키를 지원하면 그쪽으로 옮기는 것이 맞습니다.
- 관련 커밋: `5a1b909`
