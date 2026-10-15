import { describe, expect, it } from 'vitest';

import { validateAuth } from './validateAuth';

const VALID_EMAIL = 'user@example.com';
const VALID_PASSWORD = 'secret';

describe('validateAuth', () => {
  it('이메일과 비밀번호를 비워 두면 두 필드 모두 입력을 요청한다', () => {
    expect(validateAuth({ email: '', password: '' })).toEqual({
      ok: false,
      errors: { email: '이메일을 입력해주세요.', password: '비밀번호를 입력해주세요.' },
    });
  });

  it('@가 없는 이메일을 입력하면 형식 오류를 알려준다', () => {
    expect(validateAuth({ email: 'user.example.com', password: VALID_PASSWORD })).toEqual({
      ok: false,
      errors: { email: '올바른 이메일 형식이 아닙니다.' },
    });
  });

  it('도메인이 없는 이메일을 입력하면 형식 오류를 알려준다', () => {
    expect(validateAuth({ email: 'user@example', password: VALID_PASSWORD })).toEqual({
      ok: false,
      errors: { email: '올바른 이메일 형식이 아닙니다.' },
    });
  });

  it('비밀번호를 5자 입력하면 6자 이상을 요청한다', () => {
    expect(validateAuth({ email: VALID_EMAIL, password: '12345' })).toEqual({
      ok: false,
      errors: { password: '비밀번호는 6자 이상 입력해주세요.' },
    });
  });

  it('올바른 이메일과 6자 비밀번호를 입력하면 통과한다', () => {
    expect(validateAuth({ email: VALID_EMAIL, password: '123456' })).toEqual({ ok: true });
  });
});
