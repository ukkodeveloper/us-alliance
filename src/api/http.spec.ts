import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError, request, setUnauthorizedHandler } from './http';
import { getTokens, setTokens } from './tokenStorage';

const OLD_TOKENS = { accessToken: 'old-access', refreshToken: 'refresh' };
const NEW_ACCESS_TOKEN = 'new-access';
const REFRESH_URL = 'https://fe-assignment-api.us-insight.com/api/v1/auth/refresh';
const CONTENTS_URL = 'https://fe-assignment-api.us-insight.com/api/v1/contents';

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function authorizationOf(init: RequestInit | undefined) {
  return new Headers(init?.headers).get('Authorization');
}

function mockFetch(handler: (url: string, init: RequestInit | undefined) => Response | Promise<Response>) {
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) =>
    Promise.resolve(handler(String(input), init))
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function callsTo(fetchMock: ReturnType<typeof mockFetch>, url: string) {
  return fetchMock.mock.calls.filter(([input]) => String(input) === url);
}

function waitNextTask() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

function mockExpiredAccessToken(refreshResponse: () => Response) {
  return mockFetch(async (url, init) => {
    if (url === REFRESH_URL) {
      await waitNextTask();
      return refreshResponse();
    }
    if (authorizationOf(init) === `Bearer ${NEW_ACCESS_TOKEN}`) {
      return jsonResponse(200, { success: true, data: { id: 1 } });
    }
    return jsonResponse(401, { success: false, error: 'token expired' });
  });
}

const refreshSucceeded = () =>
  jsonResponse(200, {
    success: true,
    data: { access_token: NEW_ACCESS_TOKEN, access_expires_at: '2026-10-15T00:15:00Z' },
  });

describe('request', () => {
  const onUnauthorized = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    onUnauthorized.mockReset();
    setUnauthorizedHandler(onUnauthorized);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('로그인 상태면 Access Token을 Bearer 헤더로 보내고 응답의 data를 돌려준다', async () => {
    setTokens(OLD_TOKENS);
    const fetchMock = mockFetch(() => jsonResponse(200, { success: true, data: { id: 1 } }));

    const result = await request<{ id: number }>('/api/v1/contents');

    expect(result).toEqual({ id: 1 });
    expect(authorizationOf(fetchMock.mock.calls[0]?.[1])).toBe('Bearer old-access');
  });

  it('json 옵션으로 넘긴 값은 JSON 본문과 Content-Type으로 보낸다', async () => {
    const fetchMock = mockFetch(() => jsonResponse(201, { success: true, data: null }));

    await request('/api/v1/auth/register', { method: 'POST', auth: false, json: { email: 'a@b.com' } });

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.body).toBe('{"email":"a@b.com"}');
    expect(new Headers(init?.headers).get('Content-Type')).toBe('application/json');
  });

  it('서버가 실패를 응답하면 서버의 error 문구와 상태 코드로 ApiError를 던진다', async () => {
    mockFetch(() => jsonResponse(409, { success: false, error: '이미 등록된 이메일입니다.' }));

    await expect(request('/api/v1/auth/register', { auth: false })).rejects.toMatchObject({
      status: 409,
      message: '이미 등록된 이메일입니다.',
    });
  });

  it('서버 error 문구가 없으면 상태 코드에 맞는 기본 문구로 ApiError를 던진다', async () => {
    mockFetch(() => new Response('Bad Gateway', { status: 502 }));

    await expect(request('/api/v1/contents')).rejects.toMatchObject({
      status: 502,
      message: '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.',
    });
  });

  it('네트워크 연결에 실패하면 상태 코드 0의 ApiError로 구분해 던진다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch')))
    );

    const error: unknown = await request('/api/v1/contents').catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 0, message: '네트워크 연결을 확인해주세요.' });
  });

  it('Access Token이 만료되면 Refresh Token으로 재발급받아 원래 요청을 다시 보낸다', async () => {
    setTokens(OLD_TOKENS);
    const fetchMock = mockExpiredAccessToken(refreshSucceeded);

    const result = await request<{ id: number }>('/api/v1/contents');

    expect(result).toEqual({ id: 1 });
    expect(getTokens()).toEqual({ accessToken: NEW_ACCESS_TOKEN, refreshToken: 'refresh' });
    const [refreshCall] = callsTo(fetchMock, REFRESH_URL);
    expect(refreshCall?.[1]?.body).toBe('{"refresh_token":"refresh"}');
    expect(authorizationOf(refreshCall?.[1])).toBeNull();
    expect(callsTo(fetchMock, CONTENTS_URL)).toHaveLength(2);
  });

  it('여러 요청이 동시에 만료되면 재발급은 한 번만 하고 모든 요청을 다시 보낸다', async () => {
    setTokens(OLD_TOKENS);
    const fetchMock = mockExpiredAccessToken(refreshSucceeded);

    const results = await Promise.all([
      request('/api/v1/contents'),
      request('/api/v1/contents'),
      request('/api/v1/contents'),
    ]);

    expect(results).toEqual([{ id: 1 }, { id: 1 }, { id: 1 }]);
    expect(callsTo(fetchMock, REFRESH_URL)).toHaveLength(1);
    expect(callsTo(fetchMock, CONTENTS_URL)).toHaveLength(6);
  });

  it('재발급에 실패하면 토큰을 지우고 로그인 만료를 알린 뒤 401 ApiError를 던진다', async () => {
    setTokens(OLD_TOKENS);
    mockExpiredAccessToken(() => jsonResponse(401, { success: false, error: 'invalid refresh token' }));

    await expect(request('/api/v1/contents')).rejects.toMatchObject({ status: 401 });

    expect(getTokens()).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('재발급 요청이 네트워크 오류로 실패하면 토큰을 유지하고 네트워크 오류를 던진다', async () => {
    setTokens(OLD_TOKENS);
    mockFetch(url => {
      if (url === REFRESH_URL) {
        throw new TypeError('Failed to fetch');
      }
      return jsonResponse(401, { success: false, error: 'token expired' });
    });

    await expect(request('/api/v1/contents')).rejects.toMatchObject({ status: 0 });

    expect(getTokens()).toEqual(OLD_TOKENS);
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('재발급 후 다시 보낸 요청도 401이면 토큰을 지우고 로그인 만료를 알린다', async () => {
    setTokens(OLD_TOKENS);
    mockFetch(async url => {
      if (url === REFRESH_URL) {
        return refreshSucceeded();
      }
      return jsonResponse(401, { success: false, error: 'token expired' });
    });

    await expect(request('/api/v1/contents')).rejects.toMatchObject({ status: 401 });

    expect(getTokens()).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('인증이 필요 없는 요청은 401이어도 재발급하지 않고 서버 문구로 실패한다', async () => {
    setTokens(OLD_TOKENS);
    const fetchMock = mockFetch(() => jsonResponse(401, { success: false, error: '비밀번호가 올바르지 않습니다.' }));

    await expect(request('/api/v1/auth/login', { method: 'POST', auth: false })).rejects.toMatchObject({
      status: 401,
      message: '비밀번호가 올바르지 않습니다.',
    });

    expect(callsTo(fetchMock, REFRESH_URL)).toHaveLength(0);
    expect(authorizationOf(fetchMock.mock.calls[0]?.[1])).toBeNull();
    expect(onUnauthorized).not.toHaveBeenCalled();
    expect(getTokens()).toEqual(OLD_TOKENS);
  });

  it('토큰이 없는 상태에서 401을 받으면 재발급 없이 로그인 만료를 알린다', async () => {
    const fetchMock = mockFetch(() => jsonResponse(401, { success: false, error: 'unauthorized' }));

    await expect(request('/api/v1/contents')).rejects.toMatchObject({ status: 401 });

    expect(callsTo(fetchMock, REFRESH_URL)).toHaveLength(0);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
});
