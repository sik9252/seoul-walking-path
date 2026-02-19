import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { colors } from "../../../theme/tokens";
import { gameStyles as styles } from "../../../styles/gameStyles";

type ExploreFloatingControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRefreshLocation: () => void;
  onOpenList: () => void;
  onCheckVisit: () => void;
};

export function ExploreFloatingControls({
  onZoomIn,
  onZoomOut,
  onRefreshLocation,
  onOpenList,
  onCheckVisit,
}: ExploreFloatingControlsProps) {
  return (
    <>
      <View style={styles.floatingBottomLeftControls}>
        <Pressable style={styles.floatingCircleButton} onPress={onZoomIn}>
          <Ionicons name="add" size={20} color={colors.base.text} />
        </Pressable>
        <Pressable style={styles.floatingCircleButton} onPress={onZoomOut}>
          <Ionicons name="remove" size={20} color={colors.base.text} />
        </Pressable>
      </View>

      <View style={styles.floatingBottomRightCluster}>
        <View style={styles.sparkRow}>
          <Pressable style={styles.floatingCircleButton} onPress={onCheckVisit}>
            <Ionicons name="sparkles" size={20} color={colors.base.text} />
          </Pressable>
        </View>
        <View style={styles.bottomRightRow}>
          <Pressable style={styles.floatingListButtonWide} onPress={onOpenList}>
            <Ionicons name="list" size={20} color={colors.base.text} />
            <Text style={styles.floatingListButtonLabel}>목록 보기</Text>
          </Pressable>
          <Pressable style={styles.floatingCircleButton} onPress={onRefreshLocation}>
            <Ionicons name="locate" size={20} color={colors.brand[700]} />
          </Pressable>
        </View>
      </View>
    </>
  );
}
