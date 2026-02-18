import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Button, TopBanner } from "../../components/ui";
import { AttemptStatus, CourseCheckpoint } from "../../domain/types";
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
  checkpoints: CourseCheckpoint[];
  visitedCheckpointIds: string[];
  attemptStatus: AttemptStatus;
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
  checkpoints,
  visitedCheckpointIds,
  attemptStatus,
  onTogglePause,
  onFinish,
  onBack,
}: TrackingScreenProps) {
  const progressText = `${visitedCheckpointIds.length}/${checkpoints.length}`;
  const routeCoordinates = checkpoints.map((checkpoint) => ({ latitude: checkpoint.lat, longitude: checkpoint.lng }));
  const visitedCoordinates = checkpoints
    .filter((checkpoint) => visitedCheckpointIds.includes(checkpoint.id))
    .map((checkpoint) => ({ latitude: checkpoint.lat, longitude: checkpoint.lng }));
  const currentCoordinate =
    visitedCoordinates[visitedCoordinates.length - 1] ??
    routeCoordinates[0] ?? {
      latitude: 37.5665,
      longitude: 126.978,
    };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={courseName}
        leftIcon={<Ionicons name="arrow-back" size={22} color={colors.base.text} />}
        rightIcon={<Ionicons name="ellipsis-vertical" size={20} color={colors.base.text} />}
        onPressLeft={onBack}
      />
      <View style={styles.trackingMap}>
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: currentCoordinate.latitude,
            longitude: currentCoordinate.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          region={{
            latitude: currentCoordinate.latitude,
            longitude: currentCoordinate.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          {routeCoordinates.length > 1 ? (
            <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor={colors.map.routeGreen1} />
          ) : null}
          {visitedCoordinates.length > 1 ? (
            <Polyline coordinates={visitedCoordinates} strokeWidth={5} strokeColor={colors.brand[700]} />
          ) : null}
          {checkpoints.map((checkpoint) => {
            const visited = visitedCheckpointIds.includes(checkpoint.id);
            return (
              <Marker
                key={checkpoint.id}
                coordinate={{ latitude: checkpoint.lat, longitude: checkpoint.lng }}
                title={checkpoint.name}
                pinColor={visited ? colors.brand[600] : colors.base.textSubtle}
              />
            );
          })}
          <Marker coordinate={currentCoordinate} title="내 위치">
            <View style={styles.currentLocationMarker}>
              <View style={styles.currentLocationInner} />
            </View>
          </Marker>
        </MapView>
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
        <View style={styles.checkpointHeader}>
          <Text style={styles.checkpointTitle}>체크포인트</Text>
          <Text style={styles.checkpointMeta}>
            {progressText} · {attemptStatus === "completed" ? "완주" : attemptStatus === "abandoned" ? "중단" : "진행중"}
          </Text>
        </View>
        <View style={styles.checkpointList}>
          {checkpoints.map((checkpoint) => {
            const visited = visitedCheckpointIds.includes(checkpoint.id);
            return (
              <View key={checkpoint.id} style={styles.checkpointRow}>
                <Ionicons
                  name={visited ? "checkmark-circle" : "ellipse-outline"}
                  size={18}
                  color={visited ? colors.brand[600] : colors.base.textSubtle}
                />
                <Text style={[styles.checkpointName, visited && styles.checkpointVisited]}>
                  {checkpoint.order}. {checkpoint.name}
                </Text>
              </View>
            );
          })}
        </View>
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
  currentLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.brand[200],
    alignItems: "center",
    justifyContent: "center",
  },
  currentLocationInner: {
    width: 12,
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.brand[600],
    borderWidth: 2,
    borderColor: colors.base.surface,
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
  checkpointHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  checkpointTitle: { color: colors.base.text, fontSize: typography.size.bodyMd, fontWeight: typography.weight.bold },
  checkpointMeta: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  checkpointList: { gap: spacing.xs },
  checkpointRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  checkpointName: { color: colors.base.textSubtle, fontSize: typography.size.bodySm },
  checkpointVisited: { color: colors.base.text, fontWeight: typography.weight.medium },
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
