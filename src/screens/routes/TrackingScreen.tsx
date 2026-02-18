import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
      <ScreenHeader
        title={courseName}
        leftIcon={<Ionicons name="arrow-back" size={22} color={colors.base.text} />}
        rightIcon={<Ionicons name="ellipsis-vertical" size={20} color={colors.base.text} />}
        onPressLeft={onBack}
      />
      <View style={styles.trackingMap}>
        <View style={styles.routeLineMock} />
        <View style={styles.mapControls}>
          <Pressable style={styles.mapBtn}>
            <Ionicons name="layers-outline" size={18} color={colors.base.text} />
          </Pressable>
          <Pressable style={styles.mapBtn}>
            <Ionicons name="locate-outline" size={18} color={colors.base.text} />
          </Pressable>
        </View>
      </View>
      <View style={styles.hud}>
        <View style={styles.hudTop}>
          <View style={styles.hudMetaRow}>
            <Text style={styles.recordingTag}>RECORDING</Text>
            <Text style={styles.courseLabel}>{courseName}</Text>
          </View>
          <Text style={styles.hudTime}>{elapsedText}</Text>
        </View>
        <Text style={styles.hudTitle}>오후 산책 중</Text>
        <View style={styles.separator} />
        <View style={styles.metricRow}>
          <View style={styles.metric}>
            <Ionicons name="walk-outline" size={18} color={colors.base.textSubtle} />
            <Text style={styles.metricValue}>{distanceText}</Text>
            <Text style={styles.metricLabel}>거리</Text>
          </View>
          <View style={styles.metric}>
            <Ionicons name="footsteps-outline" size={18} color={colors.base.textSubtle} />
            <Text style={styles.metricValue}>{steps.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>걸음</Text>
          </View>
          <View style={styles.metric}>
            <Ionicons name="flame-outline" size={18} color={colors.base.textSubtle} />
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
  trackingMap: { flex: 1, backgroundColor: colors.map.slate100, overflow: "hidden" },
  routeLineMock: {
    position: "absolute",
    left: "22%",
    top: "18%",
    width: "56%",
    height: "58%",
    borderRadius: radius.xl,
    borderWidth: 4,
    borderColor: colors.brand[700],
  },
  mapControls: { position: "absolute", right: spacing.lg, bottom: spacing.xl, gap: spacing.sm },
  mapBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.base.surface,
    borderWidth: 1,
    borderColor: colors.base.border,
    alignItems: "center",
    justifyContent: "center",
  },
  hud: {
    backgroundColor: colors.base.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  hudTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  hudMetaRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  courseLabel: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
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
  separator: { height: 1, backgroundColor: colors.base.border },
  metricRow: { flexDirection: "row", justifyContent: "space-between" },
  metric: { alignItems: "center", flex: 1, gap: 2 },
  metricValue: {
    color: colors.base.text,
    fontSize: typography.size.titleSm,
    lineHeight: typography.lineHeight.titleSm,
    fontWeight: typography.weight.bold,
  },
  metricLabel: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  bottomDual: { flexDirection: "row", gap: spacing.sm, paddingBottom: 16 },
});
