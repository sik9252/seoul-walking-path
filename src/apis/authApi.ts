export type AuthUser = {
  id: string;
  username: string;
  nickname?: string;
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

type UpdateNicknameResponse = {
  ok: true;
  user: AuthUser;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  const response = await fetch(url, {
    ...init,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));
  if (!response.ok) {
    const text = await response.text();
    if (text) {
      let parsedMessage: string | null = null;
      try {
        const parsed = JSON.parse(text) as { message?: string | string[] };
        const message = Array.isArray(parsed.message) ? parsed.message.join(", ") : parsed.message;
        if (message) {
          parsedMessage = message;
        }
      } catch {
        // keep fallback as raw text
      }
      throw new Error(parsedMessage ?? text);
    }
    throw new Error(`request_failed_${response.status}`);
  }
  return (await response.json()) as T;
}

export async function signupWithPassword(apiBaseUrl: string, payload: { username: string; password: string }) {
  return fetchJson<AuthResponse>(`${apiBaseUrl}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function loginWithPassword(apiBaseUrl: string, payload: { username: string; password: string }) {
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

export async function updateNickname(apiBaseUrl: string, accessToken: string, nickname: string) {
  return fetchJson<UpdateNicknameResponse>(`${apiBaseUrl}/auth/profile/nickname`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ nickname }),
  });
}
