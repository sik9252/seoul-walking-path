import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { TabBar, TabItem } from "./src/components/ui";
import { Course, WalkRecord, initialCourses, records } from "./src/mocks/walkingData";
import {
  S10RecordDetailScreen,
  S11SettingsScreen,
  S13ReportScreen,
  S4CourseListScreen,
  S5CourseDetailScreen,
  S6PreStartCheckScreen,
  S7TrackingScreen,
  S8SummaryScreen,
  S9RecordListScreen,
} from "./src/screens";
import { colors } from "./src/theme/tokens";

type MainTab = "routes" | "records" | "my";
type RouteFlow = "s4" | "s5" | "s6" | "s7" | "s8" | "s13";
type RecordFlow = "s9" | "s10";

export default function App() {
  const [tab, setTab] = React.useState<MainTab>("routes");
  const [routeFlow, setRouteFlow] = React.useState<RouteFlow>("s4");
  const [recordFlow, setRecordFlow] = React.useState<RecordFlow>("s9");
  const [selectedCourse, setSelectedCourse] = React.useState<Course>(initialCourses[0]);
  const [selectedRecord, setSelectedRecord] = React.useState<WalkRecord>(records[0]);
  const [courseItems, setCourseItems] = React.useState<Course[]>(initialCourses);
  const [favoritesOnly, setFavoritesOnly] = React.useState(false);
  const [elapsedSec, setElapsedSec] = React.useState(2535);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (routeFlow !== "s7" || paused) return;
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
    { key: "routes", label: "코스" },
    { key: "records", label: "기록" },
    { key: "my", label: "마이" },
  ];

  const renderRouteFlow = () => {
    switch (routeFlow) {
      case "s4":
        return (
          <S4CourseListScreen
            courses={courseItems}
            favoritesOnly={favoritesOnly}
            onToggleFavoritesOnly={setFavoritesOnly}
            onToggleFavorite={toggleFavorite}
            onOpenCourse={(course) => {
              setSelectedCourse(course);
              setRouteFlow("s5");
            }}
          />
        );
      case "s5":
        return (
          <S5CourseDetailScreen
            course={selectedCourse}
            onBack={() => setRouteFlow("s4")}
            onStart={() => setRouteFlow("s6")}
            onReport={() => setRouteFlow("s13")}
            onToggleFavorite={() => toggleFavorite(selectedCourse.id)}
          />
        );
      case "s6":
        return <S6PreStartCheckScreen onBack={() => setRouteFlow("s5")} onStart={() => setRouteFlow("s7")} />;
      case "s7":
        return (
          <S7TrackingScreen
            courseName={selectedCourse.name}
            elapsedText={elapsedText}
            distanceText="3.2km"
            steps={4521}
            kcal={185}
            isPaused={paused}
            onTogglePause={() => setPaused((v) => !v)}
            onFinish={() => setRouteFlow("s8")}
            onBack={() => setRouteFlow("s5")}
          />
        );
      case "s8":
        return (
          <S8SummaryScreen
            onBack={() => setRouteFlow("s7")}
            onConfirm={() => {
              setTab("records");
              setRecordFlow("s9");
              setRouteFlow("s4");
            }}
          />
        );
      case "s13":
        return <S13ReportScreen onBack={() => setRouteFlow("s5")} />;
      default:
        return null;
    }
  };

  const renderRecordFlow = () => {
    if (recordFlow === "s10") {
      return <S10RecordDetailScreen record={selectedRecord} onBack={() => setRecordFlow("s9")} />;
    }
    return (
      <S9RecordListScreen
        records={records}
        onOpenRecord={(record) => {
          setSelectedRecord(record);
          setRecordFlow("s10");
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {tab === "routes" ? renderRouteFlow() : null}
      {tab === "records" ? renderRecordFlow() : null}
      {tab === "my" ? <S11SettingsScreen /> : null}
      {routeFlow !== "s7" ? (
        <TabBar
          tabs={tabs}
          activeKey={tab}
          onPressTab={(key) => {
            setTab(key as MainTab);
            if (key === "routes") setRouteFlow("s4");
            if (key === "records") setRecordFlow("s9");
          }}
        />
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
