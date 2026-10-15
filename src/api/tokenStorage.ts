export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

const TOKENS_STORAGE_KEY = 'us-alliance:tokens';

export function getTokens(): Tokens | null {
  const storedValue = localStorage.getItem(TOKENS_STORAGE_KEY);
  if (storedValue == null) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(storedValue);
    return isTokens(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function setTokens(tokens: Tokens): void {
  localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens));
}

export function clearTokens(): void {
  localStorage.removeItem(TOKENS_STORAGE_KEY);
}

function isTokens(value: unknown): value is Tokens {
  return (
    typeof value === 'object' &&
    value != null &&
    'accessToken' in value &&
    typeof value.accessToken === 'string' &&
    'refreshToken' in value &&
    typeof value.refreshToken === 'string'
  );
}
