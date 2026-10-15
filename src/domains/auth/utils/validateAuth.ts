import { type Credentials } from '../../../api/auth';

export type AuthField = keyof Credentials;

export type AuthValidationResult = { ok: true } | { ok: false; errors: Partial<Record<AuthField, string>> };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export function validateAuth({ email, password }: Credentials): AuthValidationResult {
  const errors: Partial<Record<AuthField, string>> = {};

  if (email.length === 0) {
    errors.email = '이메일을 입력해주세요.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = '올바른 이메일 형식이 아닙니다.';
  }

  if (password.length === 0) {
    errors.password = '비밀번호를 입력해주세요.';
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상 입력해주세요.`;
  }

  if (errors.email == null && errors.password == null) {
    return { ok: true };
  }
  return { ok: false, errors };
}
