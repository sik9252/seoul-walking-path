import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card } from "../../components/ui";
import { Course } from "../../domain/types";
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
          <Text style={styles.mapPlaceholder}>Map Preview</Text>
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
        {course.points.map((point) => (
          <Pressable key={point.title} style={styles.pointRow} onPress={() => onPressPoint?.(point.title)}>
            <Text style={styles.pointTitle}>{point.title}</Text>
            <Text style={styles.pointDetail}>{point.detail}</Text>
          </Pressable>
        ))}

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
    backgroundColor: colors.map.slate400,
    alignItems: "center",
    justifyContent: "center",
  },
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
  mapPlaceholder: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
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
  pointRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.base.border },
  pointTitle: { color: colors.base.text, fontWeight: typography.weight.bold },
  pointDetail: { color: colors.base.textSubtle, marginTop: 2 },
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
