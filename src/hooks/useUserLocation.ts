import * as Location from "expo-location";
import React from "react";

export type UserLocationState = {
  latitude: number;
  longitude: number;
  heading?: number | null;
};

export type RefreshLocationResult =
  | { ok: true }
  | { ok: false; reason: string };

const DEFAULT_SEOUL_LOCATION: UserLocationState = {
  latitude: 37.5665,
  longitude: 126.978,
  heading: null,
};

export function useUserLocation() {
  const [location, setLocation] = React.useState<UserLocationState | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = React.useState(false);
  const [locationError, setLocationError] = React.useState<string | null>(null);
  const watcherRef = React.useRef<Location.LocationSubscription | null>(null);

  const startWatching = React.useCallback(async () => {
    if (watcherRef.current) return;
    watcherRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 15,
        timeInterval: 5000,
      },
      (next) => {
        setLocation({
          latitude: next.coords.latitude,
          longitude: next.coords.longitude,
          heading: typeof next.coords.heading === "number" && next.coords.heading >= 0 ? next.coords.heading : null,
        });
      },
    );
  }, []);

  const refreshLocation = React.useCallback(async (): Promise<RefreshLocationResult> => {
    setIsLoadingLocation(true);
    setLocationError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        const reason = "위치 권한이 거부되었습니다.";
        setLocationError(reason);
        setLocation((prev) => prev ?? DEFAULT_SEOUL_LOCATION);
        return { ok: false, reason };
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        heading: typeof current.coords.heading === "number" && current.coords.heading >= 0 ? current.coords.heading : null,
      });
      await startWatching();
      return { ok: true };
    } catch (error) {
      console.warn("[location] failed to get location", error);
      const reason = "현재 위치를 가져오지 못했습니다.";
      setLocationError(reason);
      setLocation((prev) => prev ?? DEFAULT_SEOUL_LOCATION);
      return { ok: false, reason };
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  const clearLocationError = React.useCallback(() => {
    setLocationError(null);
  }, []);

  React.useEffect(
    () => () => {
      watcherRef.current?.remove();
      watcherRef.current = null;
    },
    [],
  );

  return {
    location,
    isLoadingLocation,
    locationError,
    refreshLocation,
    clearLocationError,
  };
}
