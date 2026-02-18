import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, Chip, Input } from "../../components/ui";
import { Course } from "../../mocks/walkingData";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import { ScreenHeader } from "../common/ScreenHeader";

type CourseListScreenProps = {
  courses: Course[];
  favoritesOnly: boolean;
  onToggleFavoritesOnly: (value: boolean) => void;
  onToggleFavorite: (courseId: string) => void;
  onOpenCourse: (course: Course) => void;
};

export function CourseListScreen({
  courses,
  favoritesOnly,
  onToggleFavoritesOnly,
  onToggleFavorite,
  onOpenCourse,
}: CourseListScreenProps) {
  const [query, setQuery] = React.useState("");
  const filtered = courses.filter((course) => {
    const passFavorite = !favoritesOnly || course.isFavorite;
    const passQuery = !query.trim() || course.name.includes(query) || course.district.includes(query);
    return passFavorite && passQuery;
  });

  return (
    <View style={styles.screen}>
      <ScreenHeader title="코스 목록" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.segment}>
          <Pressable
            onPress={() => onToggleFavoritesOnly(false)}
            style={[styles.segmentBtn, !favoritesOnly && styles.segmentBtnActive]}
          >
            <Text style={styles.segmentText}>전체</Text>
          </Pressable>
          <Pressable
            onPress={() => onToggleFavoritesOnly(true)}
            style={[styles.segmentBtn, favoritesOnly && styles.segmentBtnActive]}
          >
            <Text style={styles.segmentText}>저장됨</Text>
          </Pressable>
        </View>

        <Input value={query} onChangeText={setQuery} placeholder="산책로, 코스, 지역 검색" />
        <View style={styles.chips}>
          <Chip label="필터" selected />
          <Chip label="난이도: 쉬움" />
          <Chip label="거리: 5km 미만" />
        </View>

        {favoritesOnly && filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>저장된 코스가 없어요</Text>
            <Text style={styles.emptyBody}>마음에 드는 코스를 하트로 저장해보세요.</Text>
            <Button label="코스 탐색하기" onPress={() => onToggleFavoritesOnly(false)} />
          </View>
        ) : (
          filtered.map((course) => (
            <Card key={course.id} style={styles.routeCard} padded={false}>
              <Pressable onPress={() => onOpenCourse(course)} style={styles.routePressable}>
                <View style={styles.routeThumb} />
                <View style={styles.routeMeta}>
                  <View style={styles.routeTopRow}>
                    <Text style={styles.routeTitle}>{course.name}</Text>
                    <Pressable onPress={() => onToggleFavorite(course.id)}>
                      <Ionicons
                        name={course.isFavorite ? "heart" : "heart-outline"}
                        size={22}
                        color={course.isFavorite ? "#E53935" : colors.base.textSubtle}
                      />
                    </Pressable>
                  </View>
                  <Text style={styles.routeSubtitle}>{course.subtitle}</Text>
                  <Text style={styles.routeInfo}>
                    {course.distanceKm}km · {course.durationMin}분 · {course.difficulty}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Text style={styles.routeInfo}>{course.district} · </Text>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.routeInfo}>
                      {" "}
                      {course.rating} ({course.reviewCount})
                    </Text>
                  </View>
                </View>
              </Pressable>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  segment: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.base.border,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  segmentBtn: { flex: 1, paddingVertical: spacing.md, alignItems: "center", backgroundColor: colors.base.surface },
  segmentBtnActive: { backgroundColor: colors.base.subtle },
  segmentText: { color: colors.base.text, fontWeight: typography.weight.semibold },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  routeCard: { borderRadius: radius.lg, overflow: "hidden" },
  routePressable: { flexDirection: "row", gap: spacing.md, padding: spacing.md },
  routeThumb: { width: 96, height: 96, borderRadius: radius.md, backgroundColor: colors.base.subtle },
  routeMeta: { flex: 1, gap: 4 },
  routeTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  routeTitle: {
    color: colors.base.text,
    fontSize: typography.size.labelLg,
    lineHeight: typography.lineHeight.labelLg,
    fontWeight: typography.weight.bold,
    flex: 1,
  },
  routeSubtitle: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  routeInfo: { color: colors.base.textSubtle, fontSize: typography.size.caption },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  emptyWrap: { paddingTop: 80, gap: spacing.md, alignItems: "center" },
  emptyTitle: { color: colors.base.text, fontSize: typography.size.titleSm, fontWeight: typography.weight.bold },
  emptyBody: { color: colors.base.textSubtle, fontSize: typography.size.bodyMd },
});
