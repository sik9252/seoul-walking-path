import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/ui";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import { ScreenHeader } from "../common/ScreenHeader";

type TrackingScreenProps = {
  courseName: string;
  elapsedText: string;
  distanceText: string;
  steps: number;
  kcal: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onFinish: () => void;
  onBack: () => void;
};

export function TrackingScreen({
  courseName,
  elapsedText,
  distanceText,
  steps,
  kcal,
  isPaused,
  onTogglePause,
  onFinish,
  onBack,
}: TrackingScreenProps) {
  return (
    <View style={styles.screen}>
      <ScreenHeader title={courseName} leftLabel="←" rightLabel="⋯" onPressLeft={onBack} />
      <View style={styles.trackingMap}>
        <Text style={styles.mapPlaceholder}>Live Map</Text>
      </View>
      <View style={styles.hud}>
        <View style={styles.hudTop}>
          <Text style={styles.recordingTag}>RECORDING</Text>
          <Text style={styles.hudTime}>{elapsedText}</Text>
        </View>
        <Text style={styles.hudTitle}>오후 산책 중</Text>
        <View style={styles.metricRow}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{distanceText}</Text>
            <Text style={styles.metricLabel}>거리</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{steps.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>걸음</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{kcal}kcal</Text>
            <Text style={styles.metricLabel}>소모량</Text>
          </View>
        </View>
        <View style={styles.bottomDual}>
          <Button
            label={isPaused ? "재개" : "일시정지"}
            variant="secondary"
            onPress={onTogglePause}
            style={{ flex: 1 }}
          />
          <Button label="종료하기" onPress={onFinish} style={{ flex: 1 }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base.background },
  trackingMap: { flex: 1, backgroundColor: colors.base.subtle, alignItems: "center", justifyContent: "center" },
  mapPlaceholder: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  hud: {
    backgroundColor: colors.base.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  hudTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  recordingTag: {
    backgroundColor: colors.accent.lime100,
    color: colors.base.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },
  hudTime: {
    color: colors.brand[600],
    fontSize: 38,
    fontWeight: typography.weight.medium,
    lineHeight: 44,
  },
  hudTitle: {
    color: colors.base.text,
    fontSize: typography.size.titleMd,
    fontWeight: typography.weight.bold,
  },
  metricRow: { flexDirection: "row", justifyContent: "space-between" },
  metric: { alignItems: "center", flex: 1 },
  metricValue: {
    color: colors.base.text,
    fontSize: typography.size.titleSm,
    lineHeight: typography.lineHeight.titleSm,
    fontWeight: typography.weight.bold,
  },
  metricLabel: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  bottomDual: { flexDirection: "row", gap: spacing.sm },
});
