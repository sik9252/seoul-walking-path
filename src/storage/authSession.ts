import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthUser } from "../apis/authApi";

const AUTH_SESSION_KEY = "auth.session.v1";

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export async function getAuthSession() {
  const raw = await AsyncStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export async function setAuthSession(session: AuthSession) {
  await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export async function clearAuthSession() {
  await AsyncStorage.removeItem(AUTH_SESSION_KEY);
}
