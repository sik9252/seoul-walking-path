import * as Location from "expo-location";
import React from "react";

export type UserLocationState = {
  latitude: number;
  longitude: number;
  heading?: number | null;
};

const DEFAULT_SEOUL_LOCATION: UserLocationState = {
  latitude: 37.5665,
  longitude: 126.978,
  heading: null,
};

export function useUserLocation() {
  const [location, setLocation] = React.useState<UserLocationState | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = React.useState(false);
  const [locationError, setLocationError] = React.useState<string | null>(null);

  const refreshLocation = React.useCallback(async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setLocationError("위치 권한이 거부되었습니다.");
        setLocation((prev) => prev ?? DEFAULT_SEOUL_LOCATION);
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        heading: typeof current.coords.heading === "number" && current.coords.heading >= 0 ? current.coords.heading : null,
      });
    } catch (error) {
      console.warn("[location] failed to get location", error);
      setLocationError("현재 위치를 가져오지 못했습니다.");
      setLocation((prev) => prev ?? DEFAULT_SEOUL_LOCATION);
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  React.useEffect(() => {
    void refreshLocation();
  }, [refreshLocation]);

  return {
    location,
    isLoadingLocation,
    locationError,
    refreshLocation,
  };
}
