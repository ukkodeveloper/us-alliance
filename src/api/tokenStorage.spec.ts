import { beforeEach, describe, expect, it } from 'vitest';

import { clearTokens, getTokens, setTokens } from './tokenStorage';

const TOKENS = { accessToken: 'access', refreshToken: 'refresh' };

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('저장한 토큰을 다시 읽을 수 있다', () => {
    setTokens(TOKENS);

    expect(getTokens()).toEqual(TOKENS);
  });

  it('토큰을 지우면 로그인 정보가 없는 상태가 된다', () => {
    setTokens(TOKENS);

    clearTokens();

    expect(getTokens()).toBeNull();
  });

  it('저장된 값이 JSON이 아니면 토큰이 없는 것으로 본다', () => {
    localStorage.setItem('us-alliance:tokens', 'not-json');

    expect(getTokens()).toBeNull();
  });

  it('저장된 값에 토큰 필드가 빠져 있으면 토큰이 없는 것으로 본다', () => {
    localStorage.setItem('us-alliance:tokens', JSON.stringify({ accessToken: 'access' }));

    expect(getTokens()).toBeNull();
  });
});
