import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../../theme/tokens";

type ScreenHeaderProps = {
  title: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPressLeft?: () => void;
  onPressRight?: () => void;
};

export function ScreenHeader({
  title,
  leftIcon,
  rightIcon,
  onPressLeft,
  onPressRight,
}: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onPressLeft} style={styles.side} hitSlop={8}>
        {leftIcon}
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Pressable onPress={onPressRight} style={styles.side} hitSlop={8}>
        {rightIcon}
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
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.base.text,
    fontSize: typography.size.titleMd,
    lineHeight: typography.lineHeight.titleMd,
    fontWeight: typography.weight.bold,
  },
});
