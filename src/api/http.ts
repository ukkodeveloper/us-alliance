import { clearTokens, getTokens, setTokens } from './tokenStorage';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  auth?: boolean;
  json?: unknown;
};

type ApiResponse<TData> = {
  success: boolean;
  data?: TData;
  error?: string;
};

type RefreshTokenResponse = {
  access_token: string;
  access_expires_at: string;
};

const API_BASE_URL = 'https://fe-assignment-api.us-insight.com';
const REFRESH_PATH = '/api/v1/auth/refresh';

const NETWORK_ERROR_STATUS = 0;
const UNAUTHORIZED_STATUS = 401;

const NETWORK_ERROR_MESSAGE = '네트워크 연결을 확인해주세요.';
const SESSION_EXPIRED_MESSAGE = '로그인이 만료되었습니다. 다시 로그인해주세요.';
const FALLBACK_ERROR_MESSAGE = '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.';
const ERROR_MESSAGE_BY_STATUS: ErrorMessageByStatus = {
  400: '요청 내용을 확인해주세요.',
  401: '로그인이 필요합니다.',
  403: '권한이 없습니다.',
  404: '요청한 정보를 찾을 수 없습니다.',
  409: '이미 존재하거나 현재 상태와 충돌하는 요청입니다.',
};

let unauthorizedHandler: (() => void) | null = null;
let refreshInFlight: Promise<boolean> | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

export async function request<TData>(path: string, options: RequestOptions = {}): Promise<TData> {
  const { auth = true } = options;
  const response = await send(path, options);

  if (!auth || response.status !== UNAUTHORIZED_STATUS) {
    return parseResponse<TData>(response);
  }

  const isRefreshed = await refreshAccessToken();
  if (!isRefreshed) {
    return expireSession();
  }

  const retriedResponse = await send(path, options);
  if (retriedResponse.status === UNAUTHORIZED_STATUS) {
    return expireSession();
  }

  return parseResponse<TData>(retriedResponse);
}

async function send(path: string, options: RequestOptions): Promise<Response> {
  const { auth = true, json, headers, ...init } = options;
  const requestHeaders = new Headers(headers);

  if (json !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const accessToken = auth ? getTokens()?.accessToken : undefined;
  if (accessToken != null) {
    requestHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: requestHeaders,
      body: json === undefined ? undefined : JSON.stringify(json),
    });
  } catch {
    throw new ApiError(NETWORK_ERROR_STATUS, NETWORK_ERROR_MESSAGE);
  }
}

async function parseResponse<TData>(response: Response): Promise<TData> {
  const body = await readBody<TData>(response);

  if (response.ok && body?.success === true) {
    return body.data as TData;
  }

  throw new ApiError(response.status, getDefaultErrorMessage(response.status));
}

async function readBody<TData>(response: Response): Promise<ApiResponse<TData> | null> {
  try {
    return (await response.json()) as ApiResponse<TData>;
  } catch {
    return null;
  }
}

function getDefaultErrorMessage(status: number): string {
  return ERROR_MESSAGE_BY_STATUS[status] ?? FALLBACK_ERROR_MESSAGE;
}

export type ErrorMessageByStatus = Partial<Record<number, string>>;

export function getErrorMessage(error: Error, messageByStatus: ErrorMessageByStatus = {}) {
  if (error instanceof ApiError) {
    return messageByStatus[error.status] ?? error.message;
  }
  return FALLBACK_ERROR_MESSAGE;
}

function refreshAccessToken(): Promise<boolean> {
  refreshInFlight ??= requestNewAccessToken().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

async function requestNewAccessToken(): Promise<boolean> {
  const tokens = getTokens();
  if (tokens == null) {
    return false;
  }

  try {
    const { access_token } = await request<RefreshTokenResponse>(REFRESH_PATH, {
      method: 'POST',
      auth: false,
      json: { refresh_token: tokens.refreshToken },
    });
    setTokens({ ...tokens, accessToken: access_token });
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.status === NETWORK_ERROR_STATUS) {
      throw error;
    }
    return false;
  }
}

function expireSession(): never {
  clearTokens();
  unauthorizedHandler?.();
  throw new ApiError(UNAUTHORIZED_STATUS, SESSION_EXPIRED_MESSAGE);
}
