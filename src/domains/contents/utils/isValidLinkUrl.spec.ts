import { describe, expect, it } from 'vitest';

import { isValidLinkUrl } from './isValidLinkUrl';

describe('isValidLinkUrl', () => {
  it('https 링크를 입력하면 통과한다', () => {
    expect(isValidLinkUrl('https://example.com/posts?id=1')).toBe(true);
  });

  it('http 링크를 입력하면 통과한다', () => {
    expect(isValidLinkUrl('http://example.com')).toBe(true);
  });

  it('javascript: 링크를 입력하면 거부한다', () => {
    expect(isValidLinkUrl('javascript:alert(1)')).toBe(false);
  });

  it('ftp 링크를 입력하면 거부한다', () => {
    expect(isValidLinkUrl('ftp://example.com/file')).toBe(false);
  });

  it('공백만 입력하면 거부한다', () => {
    expect(isValidLinkUrl('   ')).toBe(false);
  });

  it('프로토콜 없는 상대 경로를 입력하면 거부한다', () => {
    expect(isValidLinkUrl('/posts/1')).toBe(false);
    expect(isValidLinkUrl('example.com')).toBe(false);
  });
});
