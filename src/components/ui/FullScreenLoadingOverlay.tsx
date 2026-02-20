import React from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../../theme/tokens";

type Props = {
  visible: boolean;
  title?: string;
  description?: string;
};

export function FullScreenLoadingOverlay({
  visible,
  title = "탐색중이에요...",
  description = "주변 스팟을 확인하고 있어요.",
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <ActivityIndicator size="large" color={colors.brand[700]} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(12, 16, 14, 0.42)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  panel: {
    width: "100%",
    borderRadius: 18,
    backgroundColor: colors.base.surface,
    borderWidth: 1,
    borderColor: colors.base.border,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.size.labelMd,
    lineHeight: typography.lineHeight.labelMd,
    fontWeight: typography.weight.bold,
    color: colors.base.text,
  },
  description: {
    fontSize: typography.size.caption,
    color: colors.base.textSubtle,
  },
});

