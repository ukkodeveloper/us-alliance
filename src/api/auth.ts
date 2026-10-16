import { type ErrorMessageByStatus, request } from './http';

export type User = {
  id: number;
  email: string;
  created_at: string;
};

export type Credentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  access_expires_at: string;
  refresh_token: string;
  refresh_expires_at: string;
  user: User;
};

export const LOGIN_ERROR_MESSAGES: ErrorMessageByStatus = {
  401: '이메일 또는 비밀번호가 올바르지 않습니다.',
};

export const REGISTER_ERROR_MESSAGES: ErrorMessageByStatus = {
  409: '이미 가입된 이메일입니다.',
};

export function login(credentials: Credentials): Promise<LoginResponse> {
  return request<LoginResponse>('/api/v1/auth/login', { method: 'POST', auth: false, json: credentials });
}

export function register(credentials: Credentials): Promise<LoginResponse> {
  return request<LoginResponse>('/api/v1/auth/register', { method: 'POST', auth: false, json: credentials });
}

export function logout(): Promise<void> {
  return request<void>('/api/v1/auth/logout', { method: 'POST' });
}
