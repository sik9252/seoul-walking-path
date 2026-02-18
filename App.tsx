import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { TabBar, TabItem } from "./src/components/ui";
import { trackEvent } from "./src/analytics/tracker";
import { MainTab } from "./src/domain/types";
import {
  CourseDetailScreen,
  CourseListScreen,
  HomeScreen,
  OnboardingScreen,
  PermissionScreen,
  PrivacyNoticeScreen,
  PreStartCheckScreen,
  RecordDetailScreen,
  RecordListScreen,
  ReportIssueScreen,
  SettingsScreen,
  SplashScreen,
  TrackingScreen,
  WalkSummaryScreen,
} from "./src/screens";
import { useWalkingAppState } from "./src/hooks/useWalkingAppState";
import { colors } from "./src/theme/tokens";

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const {
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
    deleteRecord,
    clearRecords,
  } = useWalkingAppState();

  const tabs: TabItem[] = [
    {
      key: "home",
      label: "홈",
      renderIcon: (active) => (
        <Ionicons name={active ? "home" : "home-outline"} size={18} color={active ? colors.brand[700] : colors.base.text} />
      ),
    },
    {
      key: "routes",
      label: "코스",
      renderIcon: (active) => (
        <Ionicons name={active ? "map" : "map-outline"} size={18} color={active ? colors.brand[700] : colors.base.text} />
      ),
    },
    {
      key: "records",
      label: "기록",
      renderIcon: (active) => (
        <Ionicons name={active ? "time" : "time-outline"} size={18} color={active ? colors.brand[700] : colors.base.text} />
      ),
    },
    {
      key: "my",
      label: "마이",
      renderIcon: (active) => (
        <Ionicons
          name={active ? "person" : "person-outline"}
          size={18}
          color={active ? colors.brand[700] : colors.base.text}
        />
      ),
    },
  ];

  const renderRouteFlow = () => {
    if (!selectedCourse) return null;
    switch (routeFlow) {
      case "courseList":
        return (
          <CourseListScreen
            courses={courseItems}
            favoritesOnly={favoritesOnly}
            onToggleFavoritesOnly={setFavoritesOnly}
            onToggleFavorite={toggleFavorite}
            onOpenCourse={(course) => {
              setSelectedCourse(course);
              setRouteFlow("courseDetail");
            }}
          />
        );
      case "courseDetail":
        return (
          <CourseDetailScreen
            course={selectedCourse}
            onBack={() => setRouteFlow("courseList")}
            onStart={() => setRouteFlow("preStartCheck")}
            onReport={() => setRouteFlow("reportIssue")}
            onToggleFavorite={() => toggleFavorite(selectedCourse.id)}
            onPressPoint={(pointTitle) => {
              trackEvent("poi_click", { route_id: selectedCourse.id, poi_title: pointTitle });
            }}
          />
        );
      case "preStartCheck":
        return (
          <PreStartCheckScreen
            onBack={() => setRouteFlow("courseDetail")}
            onStart={() => {
              startTracking();
              setRouteFlow("tracking");
            }}
          />
        );
      case "tracking":
        return (
          <TrackingScreen
            courseName={selectedCourse.name}
            elapsedText={elapsedText}
            distanceText={distanceText}
            steps={tracking.steps}
            kcal={tracking.kcal}
            isPaused={tracking.status === "paused"}
            showGpsWarning={gpsQualityLow}
            onTogglePause={toggleTrackingPause}
            onFinish={() => {
              finishTracking();
              setRouteFlow("walkSummary");
            }}
            onBack={() => setRouteFlow("courseDetail")}
          />
        );
      case "walkSummary":
        return (
          <WalkSummaryScreen
            onBack={() => setRouteFlow("tracking")}
            distanceText={distanceText}
            elapsedText={elapsedText}
            kcal={tracking.kcal}
            onConfirm={async () => {
              const saved = await saveCurrentSessionAsRecord();
              if (!saved) return false;
              setTab("records");
              setRecordFlow("recordList");
              setRouteFlow("courseList");
              return true;
            }}
          />
        );
      case "reportIssue":
        return <ReportIssueScreen onBack={() => setRouteFlow("courseDetail")} />;
      default:
        return null;
    }
  };

  const renderRecordFlow = () => {
    if (!selectedRecord && recordFlow === "recordDetail") return null;
    if (recordFlow === "recordDetail") {
      return (
        <RecordDetailScreen
          record={selectedRecord!}
          onBack={() => setRecordFlow("recordList")}
          onDelete={() => {
            deleteRecord(selectedRecord!.id);
            setRecordFlow("recordList");
          }}
        />
      );
    }
    return (
      <RecordListScreen
        records={recordItems}
        onClearAll={clearRecords}
        onOpenRecord={(record) => {
          setSelectedRecord(record);
          setRecordFlow("recordDetail");
        }}
      />
    );
  };

  React.useEffect(() => {
    if (introFlow !== "main") return;
    if (tab === "home") trackEvent("view_home");
    if (tab === "routes" && routeFlow === "courseList") trackEvent("view_route_list");
    if (tab === "routes" && routeFlow === "courseDetail" && selectedCourse) {
      trackEvent("view_route_detail", { route_id: selectedCourse.id });
    }
  }, [introFlow, routeFlow, selectedCourse, tab]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <StatusBar style="dark" />
      {introFlow === "splash" ? <SplashScreen onDone={() => setIntroFlow("onboarding")} /> : null}
      {introFlow === "onboarding" ? <OnboardingScreen onStart={() => setIntroFlow("permission")} /> : null}
      {introFlow === "permission" ? (
        <PermissionScreen
          onAllow={() => {
            trackEvent("permission_location_granted");
            setIntroFlow("main");
          }}
          onOpenPrivacyNotice={() => setIntroFlow("privacyNotice")}
          onLater={() => {
            trackEvent("permission_location_denied");
            setIntroFlow("main");
          }}
        />
      ) : null}
      {introFlow === "privacyNotice" ? (
        <PrivacyNoticeScreen onBack={() => setIntroFlow("permission")} />
      ) : null}
      {introFlow === "main" ? (
        <>
      {tab === "home" ? (
        <HomeScreen
          courses={courseItems}
          onOpenRoutes={() => {
            setTab("routes");
            setRouteFlow("courseList");
          }}
          onOpenCourse={(course) => {
            setSelectedCourse(course);
            setTab("routes");
            setRouteFlow("courseDetail");
          }}
        />
      ) : null}
      {tab === "routes" ? renderRouteFlow() : null}
      {tab === "records" ? renderRecordFlow() : null}
      {tab === "my" ? <SettingsScreen /> : null}
      {!(tab === "routes" && routeFlow === "tracking") ? (
        <TabBar
          tabs={tabs}
          activeKey={tab}
          onPressTab={(key) => {
            setTab(key as MainTab);
            if (key === "home") return;
            if (key === "routes") setRouteFlow("courseList");
            if (key === "records") setRecordFlow("recordList");
          }}
        />
      ) : null}
        </>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.base.background,
  },
});
