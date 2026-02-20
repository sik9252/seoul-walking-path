import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTO_LOGIN_ENABLED_KEY = "prefs.auto_login_enabled.v1";

export async function getAutoLoginEnabled() {
  const raw = await AsyncStorage.getItem(AUTO_LOGIN_ENABLED_KEY);
  if (raw == null) {
    return true;
  }
  return raw === "true";
}

export async function setAutoLoginEnabled(enabled: boolean) {
  await AsyncStorage.setItem(AUTO_LOGIN_ENABLED_KEY, enabled ? "true" : "false");
}
