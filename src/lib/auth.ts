let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    sessionStorage.setItem('nrg_auth_token', token);
  } else {
    sessionStorage.removeItem('nrg_auth_token');
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken;
  const stored = sessionStorage.getItem('nrg_auth_token');
  if (stored) {
    authToken = stored;
    return stored;
  }
  return null;
}

export function clearAuthToken() {
  authToken = null;
  sessionStorage.removeItem('nrg_auth_token');
}
