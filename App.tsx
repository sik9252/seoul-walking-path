import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { TabBar, TabItem } from "./src/components/ui";
import { Course, WalkRecord, initialCourses, records } from "./src/mocks/walkingData";
import {
  CourseDetailScreen,
  CourseListScreen,
  HomeScreen,
  OnboardingScreen,
  PermissionScreen,
  PreStartCheckScreen,
  RecordDetailScreen,
  RecordListScreen,
  ReportIssueScreen,
  SettingsScreen,
  SplashScreen,
  TrackingScreen,
  WalkSummaryScreen,
} from "./src/screens";
import { colors } from "./src/theme/tokens";

type MainTab = "home" | "routes" | "records" | "my";
type RouteFlow = "courseList" | "courseDetail" | "preStartCheck" | "tracking" | "walkSummary" | "reportIssue";
type RecordFlow = "recordList" | "recordDetail";
type IntroFlow = "splash" | "onboarding" | "permission" | "main";

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [introFlow, setIntroFlow] = React.useState<IntroFlow>("splash");
  const [tab, setTab] = React.useState<MainTab>("home");
  const [routeFlow, setRouteFlow] = React.useState<RouteFlow>("courseList");
  const [recordFlow, setRecordFlow] = React.useState<RecordFlow>("recordList");
  const [selectedCourse, setSelectedCourse] = React.useState<Course>(initialCourses[0]);
  const [selectedRecord, setSelectedRecord] = React.useState<WalkRecord>(records[0]);
  const [courseItems, setCourseItems] = React.useState<Course[]>(initialCourses);
  const [favoritesOnly, setFavoritesOnly] = React.useState(false);
  const [elapsedSec, setElapsedSec] = React.useState(2535);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (routeFlow !== "tracking" || paused) return;
    const timer = setInterval(() => setElapsedSec((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [paused, routeFlow]);

  const elapsedText = React.useMemo(() => {
    const hh = String(Math.floor(elapsedSec / 3600)).padStart(2, "0");
    const mm = String(Math.floor((elapsedSec % 3600) / 60)).padStart(2, "0");
    const ss = String(elapsedSec % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }, [elapsedSec]);

  const toggleFavorite = (courseId: string) => {
    setCourseItems((prev) =>
      prev.map((course) =>
        course.id === courseId ? { ...course, isFavorite: !course.isFavorite } : course,
      ),
    );
    if (selectedCourse.id === courseId) {
      setSelectedCourse((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
    }
  };

  const tabs: TabItem[] = [
    { key: "home", label: "홈", icon: <Ionicons name="home-outline" size={18} color={colors.base.text} /> },
    { key: "routes", label: "코스", icon: <Ionicons name="map-outline" size={18} color={colors.base.text} /> },
    { key: "records", label: "기록", icon: <Ionicons name="time-outline" size={18} color={colors.base.text} /> },
    { key: "my", label: "마이", icon: <Ionicons name="person-outline" size={18} color={colors.base.text} /> },
  ];

  const renderRouteFlow = () => {
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
          />
        );
      case "preStartCheck":
        return (
          <PreStartCheckScreen
            onBack={() => setRouteFlow("courseDetail")}
            onStart={() => setRouteFlow("tracking")}
          />
        );
      case "tracking":
        return (
          <TrackingScreen
            courseName={selectedCourse.name}
            elapsedText={elapsedText}
            distanceText="3.2km"
            steps={4521}
            kcal={185}
            isPaused={paused}
            onTogglePause={() => setPaused((v) => !v)}
            onFinish={() => setRouteFlow("walkSummary")}
            onBack={() => setRouteFlow("courseDetail")}
          />
        );
      case "walkSummary":
        return (
          <WalkSummaryScreen
            onBack={() => setRouteFlow("tracking")}
            onConfirm={() => {
              setTab("records");
              setRecordFlow("recordList");
              setRouteFlow("courseList");
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
    if (recordFlow === "recordDetail") {
      return <RecordDetailScreen record={selectedRecord} onBack={() => setRecordFlow("recordList")} />;
    }
    return (
      <RecordListScreen
        records={records}
        onOpenRecord={(record) => {
          setSelectedRecord(record);
          setRecordFlow("recordDetail");
        }}
      />
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <StatusBar style="dark" />
      {introFlow === "splash" ? <SplashScreen onDone={() => setIntroFlow("onboarding")} /> : null}
      {introFlow === "onboarding" ? <OnboardingScreen onStart={() => setIntroFlow("permission")} /> : null}
      {introFlow === "permission" ? (
        <PermissionScreen onAllow={() => setIntroFlow("main")} onLater={() => setIntroFlow("main")} />
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
