import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, BackHandler } from "react-native";
import { trackEvent } from "../analytics/tracker";
import {
  AttemptProgress,
  Course,
  CourseCheckpoint,
  IntroFlow,
  MainTab,
  RecordFlow,
  RouteFlow,
  WalkRecord,
} from "../domain/types";
import { calculateMetrics, filterDistanceIncrementMeters, TrackingMetrics } from "../domain/tracking";
import { walkingRepository } from "../repositories/mock/walkingRepository";

const DEFAULT_DISTANCE_PER_SEC_METERS = 1.4;
const STORAGE_KEYS = {
  records: "@seoul-walking-path/records",
  favoriteCourseIds: "@seoul-walking-path/favorite-course-ids",
  trackingMode: "@seoul-walking-path/tracking-mode",
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

async function persistJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // MVP에서는 저장 실패 시 앱 동작 유지 우선. 추후 에러 로깅(Sentry) 연동 예정.
  }
}

function advanceTracking(
  prev: TrackingMetrics,
  elapsedIncrementSec: number,
  withNoise: boolean,
  trackingMode: "balanced" | "accurate",
): TrackingMetrics {
  const safeElapsedIncrement = Math.max(0, elapsedIncrementSec);
  if (safeElapsedIncrement === 0) return prev;

  let distanceIncrementMeters = 0;
  const basePerSec = trackingMode === "accurate" ? 1.2 : DEFAULT_DISTANCE_PER_SEC_METERS;
  const maxDelta = trackingMode === "accurate" ? 5 : 8;
  if (withNoise) {
    for (let index = 0; index < safeElapsedIncrement; index += 1) {
      const rawMeters =
        trackingMode === "accurate" ? 0.95 + Math.random() * 0.5 : 1.2 + Math.random() * 0.8;
      distanceIncrementMeters += filterDistanceIncrementMeters(rawMeters, maxDelta);
    }
  } else {
    distanceIncrementMeters = filterDistanceIncrementMeters(basePerSec, maxDelta) * safeElapsedIncrement;
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
  const [activeCheckpoints, setActiveCheckpoints] = React.useState<CourseCheckpoint[]>([]);
  const [attemptProgress, setAttemptProgress] = React.useState<AttemptProgress | null>(null);
  const [trackingMode, setTrackingMode] = React.useState<"balanced" | "accurate">("balanced");
  const [hydrated, setHydrated] = React.useState(false);
  const backgroundAtMsRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const bootstrap = async () => {
      const [courses, records] = await Promise.all([
        walkingRepository.getCourses(),
        walkingRepository.getRecords(),
      ]);

      const [savedRecords, favoriteCourseIds, savedTrackingMode] = await Promise.all([
        loadJson<WalkRecord[]>(STORAGE_KEYS.records),
        loadJson<string[]>(STORAGE_KEYS.favoriteCourseIds),
        loadJson<"balanced" | "accurate">(STORAGE_KEYS.trackingMode),
      ]);

      const nextTrackingMode =
        savedTrackingMode && (savedTrackingMode === "balanced" || savedTrackingMode === "accurate")
          ? savedTrackingMode
          : "balanced";
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
      setTrackingMode(nextTrackingMode);
      setHydrated(true);
    };
    void bootstrap();
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    void persistJson(STORAGE_KEYS.records, recordItems);
  }, [hydrated, recordItems]);

  React.useEffect(() => {
    if (!hydrated) return;
    const favoriteIds = courseItems.filter((course) => course.isFavorite).map((course) => course.id);
    void persistJson(STORAGE_KEYS.favoriteCourseIds, favoriteIds);
  }, [courseItems, hydrated]);

  React.useEffect(() => {
    if (!hydrated) return;
    void persistJson(STORAGE_KEYS.trackingMode, trackingMode);
  }, [hydrated, trackingMode]);

  const handleBackInIntro = React.useCallback(() => {
    if (introFlow === "privacyNotice") {
      setIntroFlow("permission");
      return true;
    }
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
      setTracking((prev) => advanceTracking(prev, 1, true, trackingMode));
    }, 1000);
    return () => clearInterval(timer);
  }, [routeFlow, tracking.status, trackingMode]);

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
            setTracking((prev) => advanceTracking(prev, elapsedSecWhileBackground, false, trackingMode));
          }
        }
        backgroundAtMsRef.current = null;
      }
    });

    return () => subscription.remove();
  }, [routeFlow, tracking.status, trackingMode]);

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
    if (routeFlow !== "tracking" || tracking.status !== "running") return;
    if (activeCheckpoints.length === 0) return;
    const interval = setInterval(() => {
      setAttemptProgress((prev) => {
        if (!prev || prev.status !== "in_progress") return prev;
        const nextCheckpoint = activeCheckpoints.find(
          (checkpoint) => !prev.visitedCheckpointIds.includes(checkpoint.id),
        );
        if (!nextCheckpoint) {
          return { ...prev, status: "completed" };
        }
        const shouldMarkVisited = Math.random() < 0.45;
        if (!shouldMarkVisited) return prev;

        const visitedCheckpointIds = [...prev.visitedCheckpointIds, nextCheckpoint.id];
        const status = visitedCheckpointIds.length >= prev.totalCount ? "completed" : "in_progress";
        return { ...prev, visitedCheckpointIds, status };
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [activeCheckpoints, routeFlow, tracking.status]);

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
    if (selectedCourse) {
      const baseLat = 37.5665;
      const baseLng = 126.978;
      const checkpoints: CourseCheckpoint[] = selectedCourse.points.map((point, index) => ({
        id: `${selectedCourse.id}-cp-${index + 1}`,
        routeId: selectedCourse.id,
        order: index + 1,
        name: point.title,
        lat: baseLat + index * 0.0024,
        lng: baseLng + index * 0.0021,
      }));
      setActiveCheckpoints(checkpoints);
      setAttemptProgress({
        attemptId: `attempt-${Date.now()}`,
        routeId: selectedCourse.id,
        status: "in_progress",
        visitedCheckpointIds: [],
        totalCount: checkpoints.length,
      });
    } else {
      setActiveCheckpoints([]);
      setAttemptProgress(null);
    }
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
    setAttemptProgress((prev) => {
      if (!prev) return prev;
      const isCompleted = prev.totalCount > 0 && prev.visitedCheckpointIds.length >= prev.totalCount;
      return {
        ...prev,
        status: isCompleted ? "completed" : "abandoned",
      };
    });
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

  const deleteRecord = React.useCallback((recordId: string) => {
    setRecordItems((prev) => prev.filter((record) => record.id !== recordId));
    setSelectedRecord((prev) => (prev?.id === recordId ? null : prev));
  }, []);

  const clearRecords = React.useCallback(() => {
    setRecordItems([]);
    setSelectedRecord(null);
  }, []);

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
    activeCheckpoints,
    attemptProgress,
    trackingMode,
    setTrackingMode,
    distanceText,
    elapsedText,
    startTracking,
    toggleTrackingPause,
    finishTracking,
    saveCurrentSessionAsRecord,
    toggleFavorite,
    deleteRecord,
    clearRecords,
  };
}
