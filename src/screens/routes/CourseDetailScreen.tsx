import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, Chip } from "../../components/ui";
import { Course, POICategory } from "../../domain/types";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import { ScreenHeader } from "../common/ScreenHeader";

type CourseDetailScreenProps = {
  course: Course;
  onBack: () => void;
  onStart: () => void;
  onReport: () => void;
  onToggleFavorite: () => void;
  onPressPoint?: (pointTitle: string) => void;
};

export function CourseDetailScreen({
  course,
  onBack,
  onStart,
  onReport,
  onToggleFavorite,
  onPressPoint,
}: CourseDetailScreenProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<"all" | POICategory>("all");

  const points = React.useMemo(() => {
    if (selectedCategory === "all") return course.points;
    return course.points.filter((point) => point.category === selectedCategory);
  }, [course.points, selectedCategory]);

  const openDirections = React.useCallback(
    async (mapQuery: string, pointTitle: string) => {
      onPressPoint?.(pointTitle);
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    },
    [onPressPoint],
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="코스 상세"
        leftIcon={<Ionicons name="arrow-back" size={22} color={colors.base.text} />}
        rightIcon={<Ionicons name="share-social-outline" size={21} color={colors.base.text} />}
        onPressLeft={onBack}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mapBox}>
          <View style={styles.routeOutline} />
          <View style={styles.routeProgress} />
          {course.points.map((point, index) => (
            <View
              key={point.id}
              style={[
                styles.poiMarker,
                point.category === "photo"
                  ? styles.poiMarkerphoto
                  : point.category === "rest"
                    ? styles.poiMarkerrest
                    : styles.poiMarkerlandmark,
                {
                  left: `${18 + index * 26}%`,
                  top: `${66 - index * 16}%`,
                },
              ]}
            />
          ))}
          <Text style={styles.mapPlaceholder}>코스 라인 · POI 미리보기</Text>
        </View>
        <View style={styles.pillMeta}>
          <Text style={styles.pillMetaText}>추천 코스</Text>
          <Text style={styles.detailSub}>{course.district}</Text>
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.detailTitle}>{course.name}</Text>
          <Pressable onPress={onToggleFavorite}>
            <Ionicons
              name={course.isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={course.isFavorite ? colors.accent.favoriteActive : colors.base.textSubtle}
            />
          </Pressable>
        </View>
        <Text style={styles.detailSub}>{course.district}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color={colors.accent.ratingStar} />
          <Text style={styles.detailSub}>
            {" "}
            {course.rating} ({course.reviewCount})
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>소요시간</Text>
            <Text style={styles.metricValue}>{course.durationMin}분</Text>
          </Card>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>거리</Text>
            <Text style={styles.metricValue}>{course.distanceKm}km</Text>
          </Card>
          <Card style={styles.metricCard}>
            <Text style={styles.metricLabel}>난이도</Text>
            <Text style={styles.metricValue}>{course.difficulty}</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>코스 소개</Text>
        <Text style={styles.bodyText}>{course.description}</Text>

        <Text style={styles.sectionTitle}>주요 포인트</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <Chip label="전체" selected={selectedCategory === "all"} onPress={() => setSelectedCategory("all")} />
          <Chip
            label="랜드마크"
            selected={selectedCategory === "landmark"}
            onPress={() => setSelectedCategory("landmark")}
          />
          <Chip label="포토" selected={selectedCategory === "photo"} onPress={() => setSelectedCategory("photo")} />
          <Chip label="휴식" selected={selectedCategory === "rest"} onPress={() => setSelectedCategory("rest")} />
        </ScrollView>
        {points.map((point) => (
          <Card key={point.id} style={styles.pointCard}>
            <Pressable onPress={() => onPressPoint?.(point.title)}>
              <View style={styles.pointTop}>
                <Text style={styles.pointTitle}>{point.title}</Text>
                <Text style={styles.pointCategory}>{point.category === "photo" ? "포토" : point.category === "rest" ? "휴식" : "랜드마크"}</Text>
              </View>
              <Text style={styles.pointDetail}>{point.detail}</Text>
            </Pressable>
            <View style={styles.pointActions}>
              <Button
                label="길찾기"
                variant="secondary"
                style={styles.directionBtn}
                leftIcon={<Ionicons name="navigate-outline" size={16} color={colors.brand[700]} />}
                onPress={() => void openDirections(point.mapQuery, point.title)}
              />
            </View>
          </Card>
        ))}
        {points.length === 0 ? <Text style={styles.emptyPoints}>선택한 카테고리의 포인트가 없어요.</Text> : null}

        <Button label="문제 제보" variant="ghost" onPress={onReport} style={styles.reportBtn} />
      </ScrollView>

      <View style={styles.bottomCta}>
        <Button label="산책 시작하기" onPress={onStart} style={{ flex: 1 }} />
        <Pressable onPress={onToggleFavorite} style={styles.bookmarkBtn}>
          <Ionicons
            name={course.isFavorite ? "bookmark" : "bookmark-outline"}
            size={22}
            color={course.isFavorite ? colors.brand[600] : colors.base.text}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  mapBox: {
    height: 260,
    borderRadius: radius.xl,
    backgroundColor: colors.map.slate300,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  routeOutline: {
    position: "absolute",
    left: "14%",
    top: "16%",
    width: "68%",
    height: "54%",
    borderRadius: radius.xl,
    borderWidth: 4,
    borderColor: colors.map.routeGreen2,
  },
  routeProgress: {
    position: "absolute",
    left: "14%",
    top: "50%",
    width: "36%",
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.brand[600],
    transform: [{ rotate: "-23deg" }],
  },
  poiMarker: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.base.surface,
  },
  poiMarkerlandmark: { backgroundColor: colors.brand[700] },
  poiMarkerphoto: { backgroundColor: colors.accent.ratingStar },
  poiMarkerrest: { backgroundColor: colors.semantic.info },
  pillMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  pillMetaText: {
    backgroundColor: colors.brand[100],
    color: colors.brand[700],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.semibold,
  },
  mapPlaceholder: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.md,
    color: colors.base.textSubtle,
    fontSize: typography.size.bodySm,
  },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  detailTitle: {
    color: colors.base.text,
    fontSize: typography.size.titleLg,
    lineHeight: typography.lineHeight.titleLg,
    fontWeight: typography.weight.bold,
    flex: 1,
  },
  detailSub: { color: colors.base.textSubtle, fontSize: typography.size.bodyMd },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  metricRow: { flexDirection: "row", gap: spacing.sm },
  metricCard: { flex: 1, alignItems: "center" },
  metricLabel: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  metricValue: {
    color: colors.base.text,
    fontSize: typography.size.titleSm,
    lineHeight: typography.lineHeight.titleSm,
    fontWeight: typography.weight.bold,
  },
  sectionTitle: {
    color: colors.base.text,
    fontSize: typography.size.labelLg,
    lineHeight: typography.lineHeight.labelLg,
    fontWeight: typography.weight.bold,
    marginTop: spacing.sm,
  },
  bodyText: {
    color: colors.base.textSubtle,
    fontSize: typography.size.bodyMd,
    lineHeight: typography.lineHeight.bodyMd,
  },
  filterRow: { gap: spacing.sm, paddingBottom: spacing.sm },
  pointCard: { gap: spacing.sm },
  pointTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pointTitle: { color: colors.base.text, fontWeight: typography.weight.bold },
  pointCategory: {
    backgroundColor: colors.base.subtle,
    color: colors.base.textSubtle,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    fontSize: typography.size.labelSm,
  },
  pointDetail: { color: colors.base.textSubtle, marginTop: 2 },
  pointActions: { flexDirection: "row", justifyContent: "flex-end" },
  directionBtn: { minHeight: 40, paddingHorizontal: spacing.lg },
  emptyPoints: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  reportBtn: { alignSelf: "flex-start", paddingHorizontal: 0, minHeight: 40 },
  bottomCta: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  bookmarkBtn: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.base.subtle,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.base.border,
  },
});
