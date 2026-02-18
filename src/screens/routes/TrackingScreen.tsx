import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button, TopBanner } from "../../components/ui";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import { ScreenHeader } from "../common/ScreenHeader";

type TrackingScreenProps = {
  courseName: string;
  elapsedText: string;
  distanceText: string;
  steps: number;
  kcal: number;
  isPaused: boolean;
  showGpsWarning: boolean;
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
  showGpsWarning,
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
        <View style={styles.walkedTrackMock} />
        <View style={styles.currentLocationDot} />
        <View style={styles.currentLocationHalo} />
        <View style={styles.locationPill}>
          <Ionicons name="locate" size={12} color={colors.brand[700]} />
          <Text style={styles.locationPillText}>내 위치</Text>
        </View>
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
        {showGpsWarning ? (
          <TopBanner
            type="warning"
            message="GPS 정확도가 낮아요. 건물 밀집 구간에서는 오차가 생길 수 있어요."
          />
        ) : null}
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
    left: "18%",
    top: "20%",
    width: "62%",
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.map.routeGreen1,
    transform: [{ rotate: "-52deg" }],
  },
  walkedTrackMock: {
    position: "absolute",
    left: "26%",
    top: "42%",
    width: "34%",
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.brand[700],
    transform: [{ rotate: "-52deg" }],
  },
  currentLocationDot: {
    position: "absolute",
    left: "58%",
    top: "33%",
    width: 16,
    height: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.brand[500],
    borderWidth: 2,
    borderColor: colors.base.surface,
  },
  currentLocationHalo: {
    position: "absolute",
    left: "55%",
    top: "30%",
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.brand[200],
    opacity: 0.6,
  },
  locationPill: {
    position: "absolute",
    left: spacing.lg,
    bottom: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.base.surface,
    borderWidth: 1,
    borderColor: colors.base.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  locationPillText: {
    color: colors.base.textSubtle,
    fontSize: typography.size.labelSm,
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
