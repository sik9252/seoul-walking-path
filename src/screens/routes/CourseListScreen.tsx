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
            <View style={styles.segmentLabelWithIcon}>
              <Ionicons name="heart" size={14} color={colors.base.text} />
              <Text style={styles.segmentText}>저장됨</Text>
            </View>
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
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart" size={28} color={colors.brand[600]} />
            </View>
            <Text style={styles.emptyTitle}>저장된 코스가 없어요</Text>
            <Text style={styles.emptyBody}>마음에 드는 코스를 하트로 저장해보세요.</Text>
            <Button label="코스 탐색하기" onPress={() => onToggleFavoritesOnly(false)} />
          </View>
        ) : (
          filtered.map((course, index) => (
            <Card key={course.id} style={styles.routeCard} padded={false}>
              <Pressable onPress={() => onOpenCourse(course)}>
                <View style={[styles.routeHero, { backgroundColor: heroBackgrounds[index % heroBackgrounds.length] }]}>
                  <View style={styles.heroOverlayRow}>
                    <Text style={styles.heroMetaText}>
                      {course.distanceKm}km · {Math.max(30, course.durationMin - 5)}분
                    </Text>
                    <Pressable onPress={() => onToggleFavorite(course.id)} hitSlop={8}>
                      <Ionicons
                        name={course.isFavorite ? "heart" : "heart-outline"}
                        size={22}
                        color={course.isFavorite ? "#E53935" : colors.base.surface}
                      />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.routeBody}>
                  <View style={styles.routeTopRow}>
                    <Text style={styles.routeTitle}>{course.name}</Text>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelText}>{course.difficulty}</Text>
                    </View>
                  </View>

                  <Text numberOfLines={2} style={styles.routeSubtitle}>
                    {course.subtitle}
                  </Text>

                  <View style={styles.ratingRow}>
                    <Ionicons name="location-outline" size={13} color={colors.base.textSubtle} />
                    <Text style={styles.routeInfo}>{course.district}</Text>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.routeInfo}>
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
  segmentLabelWithIcon: { flexDirection: "row", alignItems: "center", gap: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  routeCard: { borderRadius: radius.xl, overflow: "hidden" },
  routeHero: { height: 160, justifyContent: "space-between", padding: spacing.md },
  heroOverlayRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: "auto" },
  heroMetaText: {
    color: colors.base.surface,
    fontSize: typography.size.bodySm,
    lineHeight: typography.lineHeight.bodySm,
    fontWeight: typography.weight.semibold,
  },
  routeBody: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: 8 },
  routeTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  routeTitle: {
    color: colors.base.text,
    fontSize: typography.size.labelLg,
    lineHeight: typography.lineHeight.labelLg,
    fontWeight: typography.weight.bold,
    flex: 1,
  },
  levelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.base.subtle,
  },
  levelText: {
    color: colors.base.text,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
  routeSubtitle: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  routeInfo: { color: colors.base.textSubtle, fontSize: typography.size.caption, marginRight: spacing.sm },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  emptyWrap: { paddingTop: 80, gap: spacing.md, alignItems: "center" },
  emptyIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.brand[100],
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { color: colors.base.text, fontSize: typography.size.titleSm, fontWeight: typography.weight.bold },
  emptyBody: { color: colors.base.textSubtle, fontSize: typography.size.bodyMd },
});

const heroBackgrounds = ["#7CA06E", "#6A8F58", "#7C8C60"];
