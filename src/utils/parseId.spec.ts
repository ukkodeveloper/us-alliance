import { describe, expect, it } from 'vitest';

import { parseId } from './parseId';

describe('parseId', () => {
  it('양의 정수 문자열은 숫자 id로 바꾼다', () => {
    expect(parseId('42')).toBe(42);
  });

  it('숫자가 아니거나 0 이하이거나 값이 없으면 null을 돌려준다', () => {
    expect(parseId('abc')).toBeNull();
    expect(parseId('0')).toBeNull();
    expect(parseId('1.5')).toBeNull();
    expect(parseId(null)).toBeNull();
    expect(parseId(undefined)).toBeNull();
  });
});
