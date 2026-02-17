import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, Chip, Input } from "../../components/ui";
import { Course } from "../../mocks/walkingData";
import { colors, spacing, typography } from "../../theme/tokens";
import { ScreenHeader } from "../common/ScreenHeader";

type S3HomeScreenProps = {
  courses: Course[];
  onOpenRoutes: () => void;
  onOpenCourse: (course: Course) => void;
};

export function S3HomeScreen({ courses, onOpenRoutes, onOpenCourse }: S3HomeScreenProps) {
  const featured = courses.slice(0, 2);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="서울발자국" rightLabel="설정" />
      <ScrollView contentContainerStyle={styles.content}>
        <Input placeholder="산책로, 코스, 지역 검색" />
        <View style={styles.chips}>
          <Chip label="숲길" selected />
          <Chip label="수변" />
          <Chip label="야경" />
        </View>

        <Text style={styles.sectionTitle}>오늘의 추천 코스</Text>
        {featured.map((course) => (
          <Card key={course.id}>
            <Text style={styles.title}>{course.name}</Text>
            <Text style={styles.sub}>{course.subtitle}</Text>
            <Text style={styles.sub}>
              {course.distanceKm}km · {course.durationMin}분 · {course.difficulty}
            </Text>
            <View style={styles.cardActions}>
              <Button label="상세 보기" variant="secondary" onPress={() => onOpenCourse(course)} style={{ flex: 1 }} />
              <Button label="코스 전체" onPress={onOpenRoutes} style={{ flex: 1 }} />
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  sectionTitle: {
    color: colors.base.text,
    fontSize: typography.size.labelLg,
    lineHeight: typography.lineHeight.labelLg,
    fontWeight: typography.weight.bold,
  },
  title: {
    color: colors.base.text,
    fontSize: typography.size.labelLg,
    lineHeight: typography.lineHeight.labelLg,
    fontWeight: typography.weight.bold,
  },
  sub: { color: colors.base.textSubtle, fontSize: typography.size.bodyMd, marginTop: 2 },
  cardActions: { marginTop: spacing.md, flexDirection: "row", gap: spacing.sm },
});
