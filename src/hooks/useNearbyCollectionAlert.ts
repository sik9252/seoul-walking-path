import React from "react";
import { Alert, Vibration } from "react-native";
import { PlaceItem } from "../types/gameTypes";
import { UserLocationState } from "./useUserLocation";

type Props = {
  places: PlaceItem[];
  location: UserLocationState | null;
  radiusM?: number;
  enabled?: boolean;
  onCollectNearby?: (place: PlaceItem) => void;
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
  radiusM = 30,
  enabled = true,
  onCollectNearby,
}: Props) {
  const notifiedPlaceIdsRef = React.useRef<Set<string>>(new Set());
  const isAlertOpenRef = React.useRef(false);
  const lastAlertAtRef = React.useRef(0);

  React.useEffect(() => {
    if (!enabled || !location || places.length === 0) return;

    let nearest: { place: PlaceItem; distance: number } | null = null;
    let nearbyCount = 0;
    for (const place of places) {
      const distance = getDistanceMeters(
        location.latitude,
        location.longitude,
        place.lat,
        place.lng,
      );
      if (distance > radiusM) continue;
      nearbyCount += 1;
      if (!nearest || distance < nearest.distance) {
        nearest = { place, distance };
      }
    }

    if (!nearest) return;
    if (notifiedPlaceIdsRef.current.has(nearest.place.id)) return;
    if (isAlertOpenRef.current) return;
    const now = Date.now();
    if (now - lastAlertAtRef.current < 4000) return;

    notifiedPlaceIdsRef.current.add(nearest.place.id);
    lastAlertAtRef.current = now;
    const message =
      nearbyCount > 1
        ? `주변에 ${nearbyCount}곳의 스팟이 있어요. 우선 ${nearest.place.name} 카드를 수집할 수 있어요.`
        : `${nearest.place.name} 카드를 수집할 수 있어요.`;
    Vibration.vibrate(250);
    isAlertOpenRef.current = true;
    Alert.alert(
      "근처 스팟 발견",
      message,
      [
        {
          text: "닫기",
          style: "cancel",
          onPress: () => {
            isAlertOpenRef.current = false;
          },
        },
        {
          text: "수집하기",
          onPress: () => {
            isAlertOpenRef.current = false;
            onCollectNearby?.(nearest.place);
          },
        },
      ],
      {
        cancelable: true,
        onDismiss: () => {
          isAlertOpenRef.current = false;
        },
      },
    );
    void tryPushLocalNotification("근처 스팟 발견", message);
  }, [enabled, location, onCollectNearby, places, radiusM]);
}
