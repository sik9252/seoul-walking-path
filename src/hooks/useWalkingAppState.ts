import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, BackHandler } from "react-native";
import { trackEvent } from "../analytics/tracker";
import { Course, IntroFlow, MainTab, RecordFlow, RouteFlow, WalkRecord } from "../domain/types";
import { calculateMetrics, filterDistanceIncrementMeters, TrackingMetrics } from "../domain/tracking";
import { walkingRepository } from "../repositories/mock/walkingRepository";

const DEFAULT_DISTANCE_PER_SEC_METERS = 1.4;
const STORAGE_KEYS = {
  records: "@seoul-walking-path/records",
  favoriteCourseIds: "@seoul-walking-path/favorite-course-ids",
} as const;

async function loadJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function advanceTracking(
  prev: TrackingMetrics,
  elapsedIncrementSec: number,
  withNoise: boolean,
): TrackingMetrics {
  const safeElapsedIncrement = Math.max(0, elapsedIncrementSec);
  if (safeElapsedIncrement === 0) return prev;

  let distanceIncrementMeters = 0;
  if (withNoise) {
    for (let index = 0; index < safeElapsedIncrement; index += 1) {
      const rawMeters = 1.2 + Math.random() * 0.8;
      distanceIncrementMeters += filterDistanceIncrementMeters(rawMeters);
    }
  } else {
    distanceIncrementMeters = filterDistanceIncrementMeters(DEFAULT_DISTANCE_PER_SEC_METERS) * safeElapsedIncrement;
  }

  const nextElapsed = prev.elapsedSec + safeElapsedIncrement;
  const nextDistance = prev.distanceMeters + distanceIncrementMeters;
  const calculated = calculateMetrics(nextDistance, nextElapsed);
  return {
    ...prev,
    elapsedSec: nextElapsed,
    distanceMeters: nextDistance,
    steps: calculated.steps,
    kcal: calculated.kcal,
  };
}

export function useWalkingAppState() {
  const [introFlow, setIntroFlow] = React.useState<IntroFlow>("splash");
  const [tab, setTab] = React.useState<MainTab>("home");
  const [routeFlow, setRouteFlow] = React.useState<RouteFlow>("courseList");
  const [recordFlow, setRecordFlow] = React.useState<RecordFlow>("recordList");

  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);
  const [selectedRecord, setSelectedRecord] = React.useState<WalkRecord | null>(null);
  const [courseItems, setCourseItems] = React.useState<Course[]>([]);
  const [recordItems, setRecordItems] = React.useState<WalkRecord[]>([]);

  const [favoritesOnly, setFavoritesOnly] = React.useState(false);
  const [tracking, setTracking] = React.useState<TrackingMetrics>({
    elapsedSec: 0,
    distanceMeters: 0,
    steps: 0,
    kcal: 0,
    status: "idle",
  });
  const [gpsQualityLow, setGpsQualityLow] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);
  const backgroundAtMsRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const bootstrap = async () => {
      const [courses, records] = await Promise.all([
        walkingRepository.getCourses(),
        walkingRepository.getRecords(),
      ]);

      const [savedRecords, favoriteCourseIds] = await Promise.all([
        loadJson<WalkRecord[]>(STORAGE_KEYS.records),
        loadJson<string[]>(STORAGE_KEYS.favoriteCourseIds),
      ]);

      const nextCourses = favoriteCourseIds
        ? courses.map((course) => ({
            ...course,
            isFavorite: favoriteCourseIds.includes(course.id),
          }))
        : courses;
      const nextRecords = savedRecords ?? records;

      setCourseItems(nextCourses);
      setRecordItems(nextRecords);
      setSelectedCourse(nextCourses[0] ?? null);
      setSelectedRecord(nextRecords[0] ?? null);
      setHydrated(true);
    };
    void bootstrap();
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(STORAGE_KEYS.records, JSON.stringify(recordItems));
  }, [hydrated, recordItems]);

  React.useEffect(() => {
    if (!hydrated) return;
    const favoriteIds = courseItems.filter((course) => course.isFavorite).map((course) => course.id);
    void AsyncStorage.setItem(STORAGE_KEYS.favoriteCourseIds, JSON.stringify(favoriteIds));
  }, [courseItems, hydrated]);

  const handleBackInIntro = React.useCallback(() => {
    if (introFlow === "permission") {
      setIntroFlow("onboarding");
      return true;
    }
    if (introFlow === "onboarding") {
      setIntroFlow("splash");
      return true;
    }
    return false;
  }, [introFlow]);

  const handleBackInMain = React.useCallback(() => {
    if (tab === "routes") {
      if (routeFlow === "reportIssue") {
        setRouteFlow("courseDetail");
        return true;
      }
      if (routeFlow === "walkSummary") {
        setRouteFlow("tracking");
        return true;
      }
      if (routeFlow === "tracking") {
        setRouteFlow("courseDetail");
        return true;
      }
      if (routeFlow === "preStartCheck") {
        setRouteFlow("courseDetail");
        return true;
      }
      if (routeFlow === "courseDetail") {
        setRouteFlow("courseList");
        return true;
      }
      if (routeFlow === "courseList") {
        setTab("home");
        return true;
      }
    }

    if (tab === "records") {
      if (recordFlow === "recordDetail") {
        setRecordFlow("recordList");
        return true;
      }
      setTab("home");
      return true;
    }

    if (tab === "my") {
      setTab("home");
      return true;
    }

    return false;
  }, [recordFlow, routeFlow, tab]);

  React.useEffect(() => {
    if (routeFlow !== "tracking" || tracking.status !== "running") return;
    const timer = setInterval(() => {
      setTracking((prev) => advanceTracking(prev, 1, true));
    }, 1000);
    return () => clearInterval(timer);
  }, [routeFlow, tracking.status]);

  React.useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const isBackground = nextState === "background" || nextState === "inactive";
      if (isBackground) {
        if (routeFlow === "tracking" && tracking.status === "running") {
          backgroundAtMsRef.current = Date.now();
        }
        return;
      }

      if (nextState === "active" && backgroundAtMsRef.current) {
        if (routeFlow === "tracking" && tracking.status === "running") {
          const elapsedSecWhileBackground = Math.floor((Date.now() - backgroundAtMsRef.current) / 1000);
          if (elapsedSecWhileBackground > 0) {
            setTracking((prev) => advanceTracking(prev, elapsedSecWhileBackground, false));
          }
        }
        backgroundAtMsRef.current = null;
      }
    });

    return () => subscription.remove();
  }, [routeFlow, tracking.status]);

  React.useEffect(() => {
    if (routeFlow !== "tracking" || tracking.status !== "running") return;
    const interval = setInterval(() => {
      const shouldWarn = Math.random() < 0.2;
      setGpsQualityLow(shouldWarn);
      if (shouldWarn) {
        setTimeout(() => setGpsQualityLow(false), 5000);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [routeFlow, tracking.status]);

  React.useEffect(() => {
    const onHardwareBack = () => {
      if (introFlow !== "main") return handleBackInIntro();
      return handleBackInMain();
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onHardwareBack);
    return () => subscription.remove();
  }, [handleBackInIntro, handleBackInMain, introFlow]);

  const elapsedText = React.useMemo(() => {
    const hh = String(Math.floor(tracking.elapsedSec / 3600)).padStart(2, "0");
    const mm = String(Math.floor((tracking.elapsedSec % 3600) / 60)).padStart(2, "0");
    const ss = String(tracking.elapsedSec % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }, [tracking.elapsedSec]);

  const distanceText = React.useMemo(() => `${(tracking.distanceMeters / 1000).toFixed(2)}km`, [tracking.distanceMeters]);

  const startTracking = React.useCallback(() => {
    if (selectedCourse) {
      trackEvent("click_start_walk", { route_id: selectedCourse.id });
    } else {
      trackEvent("click_start_walk");
    }
    setTracking({
      elapsedSec: 0,
      distanceMeters: 0,
      steps: 0,
      kcal: 0,
      status: "running",
    });
  }, [selectedCourse]);

  const toggleTrackingPause = React.useCallback(() => {
    setTracking((prev) => {
      const next = prev.status === "running" ? "paused" : "running";
      trackEvent(next === "paused" ? "walk_pause" : "walk_resume");
      return {
        ...prev,
        status: next,
      };
    });
  }, []);

  const finishTracking = React.useCallback(() => {
    trackEvent("walk_finish", {
      duration_sec: tracking.elapsedSec,
      distance_m: Math.round(tracking.distanceMeters),
    });
    setTracking((prev) => ({ ...prev, status: "finished" }));
  }, [tracking.distanceMeters, tracking.elapsedSec]);

  const saveCurrentSessionAsRecord = React.useCallback(async (): Promise<boolean> => {
    const shouldFail = Math.random() < 0.25;
    if (shouldFail) return false;

    setRecordItems((prev) => {
      const newRecord: WalkRecord = {
        id: `r${Date.now()}`,
        courseId: selectedCourse?.id ?? "custom",
        title: selectedCourse ? `${selectedCourse.name} 산책` : "자유 산책",
        startedAt: new Date().toLocaleString("ko-KR"),
        distanceKm: Number((tracking.distanceMeters / 1000).toFixed(2)),
        durationText: elapsedText,
        paceText:
          tracking.distanceMeters > 0
            ? `${Math.max(1, Math.round(tracking.elapsedSec / (tracking.distanceMeters / 1000)))}초/km`
            : "0초/km",
      };
      return [newRecord, ...prev];
    });

    return true;
  }, [elapsedText, selectedCourse, tracking.distanceMeters, tracking.elapsedSec]);

  const toggleFavorite = React.useCallback((courseId: string) => {
    const currentCourse = courseItems.find((course) => course.id === courseId);
    if (currentCourse) {
      trackEvent(currentCourse.isFavorite ? "route_favorite_remove" : "route_favorite_add", {
        route_id: courseId,
      });
    }
    setCourseItems((prev) =>
      prev.map((course) =>
        course.id === courseId ? { ...course, isFavorite: !course.isFavorite } : course,
      ),
    );
    setSelectedCourse((prev) => {
      if (!prev || prev.id !== courseId) return prev;
      return { ...prev, isFavorite: !prev.isFavorite };
    });
  }, [courseItems]);

  return {
    introFlow,
    setIntroFlow,
    tab,
    setTab,
    routeFlow,
    setRouteFlow,
    recordFlow,
    setRecordFlow,
    selectedCourse,
    setSelectedCourse,
    selectedRecord,
    setSelectedRecord,
    courseItems,
    recordItems,
    favoritesOnly,
    setFavoritesOnly,
    tracking,
    gpsQualityLow,
    distanceText,
    elapsedText,
    startTracking,
    toggleTrackingPause,
    finishTracking,
    saveCurrentSessionAsRecord,
    toggleFavorite,
  };
}
