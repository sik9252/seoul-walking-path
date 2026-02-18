import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card } from "../../components/ui";
import { Course } from "../../mocks/walkingData";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import { ScreenHeader } from "../common/ScreenHeader";

type CourseDetailScreenProps = {
  course: Course;
  onBack: () => void;
  onStart: () => void;
  onReport: () => void;
  onToggleFavorite: () => void;
};

export function CourseDetailScreen({ course, onBack, onStart, onReport, onToggleFavorite }: CourseDetailScreenProps) {
  return (
    <View style={styles.screen}>
      <ScreenHeader title="코스 상세" leftLabel="←" rightLabel="공유" onPressLeft={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mapBox}>
          <Text style={styles.mapPlaceholder}>Map Preview</Text>
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.detailTitle}>{course.name}</Text>
          <Pressable onPress={onToggleFavorite}>
            <Text style={styles.favoriteIcon}>{course.isFavorite ? "♥" : "♡"}</Text>
          </Pressable>
        </View>
        <Text style={styles.detailSub}>{course.district}</Text>
        <Text style={styles.detailSub}>★ {course.rating} ({course.reviewCount})</Text>

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
          <View key={point.title} style={styles.pointRow}>
            <Text style={styles.pointTitle}>{point.title}</Text>
            <Text style={styles.pointDetail}>{point.detail}</Text>
          </View>
        ))}

        <Button label="문제 제보" variant="ghost" onPress={onReport} style={styles.reportBtn} />
      </ScrollView>

      <View style={styles.bottomCta}>
        <Button label="산책 시작하기" onPress={onStart} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  mapBox: {
    height: 220,
    borderRadius: radius.xl,
    backgroundColor: colors.base.subtle,
    alignItems: "center",
    justifyContent: "center",
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
  favoriteIcon: { color: colors.brand[600], fontSize: 22 },
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
  bottomCta: { position: "absolute", left: spacing.lg, right: spacing.lg, bottom: spacing.lg },
});
