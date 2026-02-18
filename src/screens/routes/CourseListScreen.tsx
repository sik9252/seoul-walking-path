import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Card, Chip, Input } from "../../components/ui";
import { Course } from "../../domain/types";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import { ScreenHeader } from "../common/ScreenHeader";

type CourseListScreenProps = {
  courses: Course[];
  hasMore: boolean;
  loadingMore: boolean;
  favoritesOnly: boolean;
  onToggleFavoritesOnly: (value: boolean) => void;
  onToggleFavorite: (courseId: string) => void;
  onOpenCourse: (course: Course) => void;
  onLoadMore: () => void;
};

export function CourseListScreen({
  courses,
  hasMore,
  loadingMore,
  favoritesOnly,
  onToggleFavoritesOnly,
  onToggleFavorite,
  onOpenCourse,
  onLoadMore,
}: CourseListScreenProps) {
  const [query, setQuery] = React.useState("");
  const [difficultyFilter, setDifficultyFilter] = React.useState<"all" | "쉬움" | "보통">("all");
  const [distanceUnderFive, setDistanceUnderFive] = React.useState(false);
  const [sortKey, setSortKey] = React.useState<"recommend" | "distance" | "duration">("recommend");

  const filtered = courses.filter((course) => {
    const passFavorite = !favoritesOnly || course.isFavorite;
    const passQuery = !query.trim() || course.name.includes(query) || course.district.includes(query);
    const passDifficulty = difficultyFilter === "all" || course.difficulty === difficultyFilter;
    const passDistance = !distanceUnderFive || course.distanceKm < 5;
    return passFavorite && passQuery && passDifficulty && passDistance;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === "distance") return a.distanceKm - b.distanceKm;
    if (sortKey === "duration") return a.durationMin - b.durationMin;
    return b.rating - a.rating;
  });

  const showFavoritesEmpty = favoritesOnly && sorted.length === 0;

  return (
    <View style={styles.screen}>
      <ScreenHeader title="코스 목록" />
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (!favoritesOnly && hasMore && !loadingMore) {
            onLoadMore();
          }
        }}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
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
              <Chip
                label={`정렬: ${sortKey === "recommend" ? "추천" : sortKey === "distance" ? "거리" : "시간"}`}
                selected
                onPress={() =>
                  setSortKey((prev) =>
                    prev === "recommend" ? "distance" : prev === "distance" ? "duration" : "recommend",
                  )
                }
              />
              <Chip
                label="난이도: 쉬움"
                selected={difficultyFilter === "쉬움"}
                onPress={() => setDifficultyFilter((prev) => (prev === "쉬움" ? "all" : "쉬움"))}
              />
              <Chip
                label="거리: 5km 미만"
                selected={distanceUnderFive}
                onPress={() => setDistanceUnderFive((prev) => !prev)}
              />
              {(difficultyFilter !== "all" || distanceUnderFive || sortKey !== "recommend") && (
                <Chip
                  label="초기화"
                  onPress={() => {
                    setDifficultyFilter("all");
                    setDistanceUnderFive(false);
                    setSortKey("recommend");
                  }}
                />
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          showFavoritesEmpty ? (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="heart" size={28} color={colors.brand[600]} />
              </View>
              <Text style={styles.emptyTitle}>저장된 코스가 없어요</Text>
              <Text style={styles.emptyBody}>마음에 드는 코스를 하트로 저장해보세요.</Text>
              <Button label="코스 탐색하기" onPress={() => onToggleFavoritesOnly(false)} />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>조건에 맞는 코스가 없어요</Text>
            </View>
          )
        }
        ListFooterComponent={
          !favoritesOnly && loadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={colors.brand[600]} />
              <Text style={styles.footerText}>코스를 불러오는 중...</Text>
            </View>
          ) : hasMore && !favoritesOnly ? (
            <View style={styles.footerLoading}>
              <Text style={styles.footerText}>아래로 스크롤하면 더 불러와요</Text>
            </View>
          ) : (
            <View style={styles.footerSpacer} />
          )
        }
        renderItem={({ item, index }) => (
          <Card style={styles.routeCard} padded={false}>
            <Pressable onPress={() => onOpenCourse(item)}>
              <View style={[styles.routeHero, { backgroundColor: heroBackgrounds[index % heroBackgrounds.length] }]}>
                <View style={styles.heroOverlayRow}>
                  <Text style={styles.heroMetaText}>
                    {item.distanceKm}km · {Math.max(30, item.durationMin - 5)}분
                  </Text>
                  <Pressable onPress={() => onToggleFavorite(item.id)} hitSlop={8}>
                    <Ionicons
                      name={item.isFavorite ? "heart" : "heart-outline"}
                      size={22}
                      color={item.isFavorite ? colors.accent.favoriteActive : colors.base.surface}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.routeBody}>
                <View style={styles.routeTopRow}>
                  <Text style={styles.routeTitle}>{item.name}</Text>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>{item.difficulty}</Text>
                  </View>
                </View>

                <Text numberOfLines={2} style={styles.routeSubtitle}>
                  {item.subtitle}
                </Text>

                <View style={styles.ratingRow}>
                  <Ionicons name="location-outline" size={13} color={colors.base.textSubtle} />
                  <Text style={styles.routeInfo}>{item.district}</Text>
                  <Ionicons name="star" size={12} color={colors.accent.ratingStar} />
                  <Text style={styles.routeInfo}>
                    {item.rating} ({item.reviewCount})
                  </Text>
                </View>
              </View>
            </Pressable>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  headerBlock: { gap: spacing.md, marginBottom: spacing.md },
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
  routeCard: { borderRadius: radius.xl, overflow: "hidden", marginBottom: spacing.md },
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
  footerLoading: { paddingVertical: spacing.lg, alignItems: "center", gap: spacing.sm },
  footerText: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  footerSpacer: { height: spacing.x4 },
});

const heroBackgrounds = [colors.map.routeGreen1, colors.map.routeGreen2, colors.map.routeGreen3];
