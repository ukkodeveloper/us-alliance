const ALLOWED_LINK_PROTOCOLS = ['http:', 'https:'];

export function isValidLinkUrl(value: string) {
  try {
    return ALLOWED_LINK_PROTOCOLS.includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
