import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/ui";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import { ScreenHeader } from "../common/ScreenHeader";

type S8Props = { onConfirm: () => void; onBack: () => void };

export function S8SummaryScreen({ onConfirm, onBack }: S8Props) {
  const [mood, setMood] = React.useState(2);
  return (
    <View style={styles.screen}>
      <ScreenHeader title="산책 완료" leftLabel="✕" rightLabel="공유" onPressLeft={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sub}>2023년 10월 24일 (화) 오전 10:30</Text>
        <Text style={styles.title}>남산 둘레길 아침 산책</Text>
        <View style={styles.mapBox} />
        <View style={styles.grid}>
          <View><Text style={styles.metricLabel}>총 거리</Text><Text style={styles.metricValue}>4.2km</Text></View>
          <View><Text style={styles.metricLabel}>시간</Text><Text style={styles.metricValue}>58분</Text></View>
          <View><Text style={styles.metricLabel}>칼로리</Text><Text style={styles.metricValue}>245kcal</Text></View>
          <View><Text style={styles.metricLabel}>평균 페이스</Text><Text style={styles.metricValue}>13'20"</Text></View>
        </View>
        <Text style={styles.section}>오늘 산책은 어땠나요?</Text>
        <View style={styles.moodRow}>
          {["😫", "😐", "😊", "🥰"].map((icon, index) => (
            <Pressable
              key={icon}
              onPress={() => setMood(index)}
              style={[styles.moodBtn, mood === index && styles.moodBtnActive]}
            >
              <Text style={styles.moodText}>{icon}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <View style={styles.bottomCta}>
        <Button label="확인" onPress={onConfirm} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  sub: { color: colors.base.textSubtle, fontSize: typography.size.bodyMd },
  title: {
    color: colors.base.text,
    fontSize: typography.size.titleLg,
    lineHeight: typography.lineHeight.titleLg,
    fontWeight: typography.weight.bold,
  },
  mapBox: { height: 220, borderRadius: radius.xl, backgroundColor: colors.base.subtle },
  grid: { flexDirection: "row", flexWrap: "wrap", rowGap: spacing.lg, columnGap: spacing.x4 },
  metricLabel: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  metricValue: { color: colors.base.text, fontSize: 40, lineHeight: 44, fontWeight: typography.weight.bold },
  section: {
    color: colors.base.text,
    fontSize: typography.size.labelLg,
    lineHeight: typography.lineHeight.labelLg,
    fontWeight: typography.weight.bold,
    marginTop: spacing.sm,
  },
  moodRow: { flexDirection: "row", gap: spacing.sm },
  moodBtn: {
    flex: 1,
    height: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.base.border,
    alignItems: "center",
    justifyContent: "center",
  },
  moodBtnActive: { backgroundColor: colors.brand[200], borderColor: colors.brand[600] },
  moodText: { fontSize: 22 },
  bottomCta: { position: "absolute", left: spacing.lg, right: spacing.lg, bottom: spacing.lg },
});
