import React from "react";
import { Alert, Vibration } from "react-native";
import { PlaceItem } from "../types/gameTypes";
import { UserLocationState } from "./useUserLocation";

type Props = {
  places: PlaceItem[];
  location: UserLocationState | null;
  radiusM?: number;
  enabled?: boolean;
};

let isNotificationConfigured = false;
let didTryNotificationPermission = false;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) {
  const earthRadiusM = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusM * c;
}

async function tryPushLocalNotification(title: string, body: string) {
  try {
    const Notifications = require("expo-notifications");
    if (!isNotificationConfigured) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      isNotificationConfigured = true;
    }
    if (!didTryNotificationPermission) {
      didTryNotificationPermission = true;
      await Notifications.requestPermissionsAsync();
    }
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  } catch {
    // expo-notifications 미설치/미설정 환경에서는 Alert로 대체
  }
}

export function useNearbyCollectionAlert({
  places,
  location,
  radiusM = 120,
  enabled = true,
}: Props) {
  const notifiedPlaceIdsRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    if (!enabled || !location || places.length === 0) return;

    let nearest: { place: PlaceItem; distance: number } | null = null;
    for (const place of places) {
      const distance = getDistanceMeters(
        location.latitude,
        location.longitude,
        place.lat,
        place.lng,
      );
      if (distance > radiusM) continue;
      if (!nearest || distance < nearest.distance) {
        nearest = { place, distance };
      }
    }

    if (!nearest) return;
    if (notifiedPlaceIdsRef.current.has(nearest.place.id)) return;

    notifiedPlaceIdsRef.current.add(nearest.place.id);
    const message = `${nearest.place.name} 카드를 수집할 수 있어요`;
    Vibration.vibrate(250);
    Alert.alert("근처 스팟 발견", message);
    void tryPushLocalNotification("근처 스팟 발견", message);
  }, [enabled, location, places, radiusM]);
}
