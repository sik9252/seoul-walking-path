import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_COMPLETED_KEY = "startup.onboarding.completed";

export async function getOnboardingCompleted(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return raw === "true";
  } catch {
    return false;
  }
}

export async function setOnboardingCompleted(value: boolean): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, value ? "true" : "false");
}
