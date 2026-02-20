export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
};

export type AuthResponse = {
  ok: true;
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

type SessionResponse = {
  user: AuthUser;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `request_failed_${response.status}`);
  }
  return (await response.json()) as T;
}

export async function signupWithPassword(apiBaseUrl: string, payload: { email: string; password: string; displayName?: string }) {
  return fetchJson<AuthResponse>(`${apiBaseUrl}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function loginWithPassword(apiBaseUrl: string, payload: { email: string; password: string }) {
  return fetchJson<AuthResponse>(`${apiBaseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function loginWithKakaoCode(apiBaseUrl: string, payload: { code: string; redirectUri?: string; mockKakaoUserId?: string }) {
  return fetchJson<AuthResponse>(`${apiBaseUrl}/auth/kakao`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function refreshSession(apiBaseUrl: string, refreshToken: string) {
  return fetchJson<AuthResponse>(`${apiBaseUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
}

export async function logoutSession(apiBaseUrl: string, refreshToken: string) {
  return fetchJson<{ ok: true }>(`${apiBaseUrl}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
}

export async function getSessionUser(apiBaseUrl: string, accessToken: string) {
  return fetchJson<SessionResponse>(`${apiBaseUrl}/auth/session`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
