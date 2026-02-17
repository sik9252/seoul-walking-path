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
  const isLeftIcon = leftLabel === "←" || leftLabel === "✕";
  const isRightIcon = rightLabel === "⋮" || rightLabel === "공유";

  return (
    <View style={styles.header}>
      <Pressable onPress={onPressLeft} style={styles.side} hitSlop={8}>
        <Text style={[styles.sideText, isLeftIcon && styles.iconText]}>{leftLabel ?? ""}</Text>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Pressable onPress={onPressRight} style={styles.side} hitSlop={8}>
        <Text style={[styles.sideText, isRightIcon && styles.rightIconText]}>{rightLabel ?? ""}</Text>
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
    fontSize: typography.size.labelMd,
    lineHeight: typography.lineHeight.labelMd,
    fontWeight: typography.weight.semibold,
  },
  iconText: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: typography.weight.bold,
  },
  rightIconText: {
    fontSize: typography.size.labelLg,
    lineHeight: typography.lineHeight.labelLg,
  },
  title: {
    color: colors.base.text,
    fontSize: typography.size.titleMd,
    lineHeight: typography.lineHeight.titleMd,
    fontWeight: typography.weight.bold,
  },
});
