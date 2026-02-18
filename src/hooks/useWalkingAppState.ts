import React from "react";
import { BackHandler } from "react-native";
import { Course, IntroFlow, MainTab, RecordFlow, RouteFlow, WalkRecord } from "../domain/types";
import { calculateMetrics, filterDistanceIncrementMeters, TrackingMetrics } from "../domain/tracking";
import { walkingRepository } from "../repositories/mock/walkingRepository";

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

  React.useEffect(() => {
    const bootstrap = async () => {
      const [courses, records] = await Promise.all([
        walkingRepository.getCourses(),
        walkingRepository.getRecords(),
      ]);
      setCourseItems(courses);
      setRecordItems(records);
      setSelectedCourse(courses[0] ?? null);
      setSelectedRecord(records[0] ?? null);
    };
    void bootstrap();
  }, []);

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
      setTracking((prev) => {
        const rawMeters = 1.2 + Math.random() * 0.8;
        const deltaMeters = filterDistanceIncrementMeters(rawMeters);
        const nextElapsed = prev.elapsedSec + 1;
        const nextDistance = prev.distanceMeters + deltaMeters;
        const calculated = calculateMetrics(nextDistance, nextElapsed);
        return {
          ...prev,
          elapsedSec: nextElapsed,
          distanceMeters: nextDistance,
          steps: calculated.steps,
          kcal: calculated.kcal,
        };
      });
    }, 1000);
    return () => clearInterval(timer);
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
    setTracking({
      elapsedSec: 0,
      distanceMeters: 0,
      steps: 0,
      kcal: 0,
      status: "running",
    });
  }, []);

  const toggleTrackingPause = React.useCallback(() => {
    setTracking((prev) => ({
      ...prev,
      status: prev.status === "running" ? "paused" : "running",
    }));
  }, []);

  const finishTracking = React.useCallback(() => {
    setTracking((prev) => ({ ...prev, status: "finished" }));
  }, []);

  const toggleFavorite = React.useCallback((courseId: string) => {
    setCourseItems((prev) =>
      prev.map((course) =>
        course.id === courseId ? { ...course, isFavorite: !course.isFavorite } : course,
      ),
    );
    setSelectedCourse((prev) => {
      if (!prev || prev.id !== courseId) return prev;
      return { ...prev, isFavorite: !prev.isFavorite };
    });
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
    distanceText,
    elapsedText,
    startTracking,
    toggleTrackingPause,
    finishTracking,
    toggleFavorite,
  };
}
