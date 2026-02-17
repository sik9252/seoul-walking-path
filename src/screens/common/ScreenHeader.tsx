import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../../theme/tokens";

type ScreenHeaderProps = {
  title: string;
  leftLabel?: string;
  rightLabel?: string;
  onPressLeft?: () => void;
  onPressRight?: () => void;
};

export function ScreenHeader({
  title,
  leftLabel,
  rightLabel,
  onPressLeft,
  onPressRight,
}: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onPressLeft} style={styles.side} hitSlop={8}>
        <Text style={styles.sideText}>{leftLabel ?? ""}</Text>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Pressable onPress={onPressRight} style={styles.side} hitSlop={8}>
        <Text style={styles.sideText}>{rightLabel ?? ""}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  side: {
    width: 48,
  },
  sideText: {
    color: colors.base.text,
    fontSize: typography.size.labelLg,
  },
  title: {
    color: colors.base.text,
    fontSize: typography.size.titleMd,
    lineHeight: typography.lineHeight.titleMd,
    fontWeight: typography.weight.bold,
  },
});
