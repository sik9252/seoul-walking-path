import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, radius, spacing, typography } from "../../theme/tokens";

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Chip({ label, selected = false, onPress, style }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.unselected,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, selected ? styles.selectedLabel : styles.unselectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 32,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: {
    backgroundColor: colors.base.text,
    borderColor: colors.base.text,
  },
  unselected: {
    backgroundColor: colors.base.surface,
    borderColor: colors.base.border,
  },
  pressed: {
    opacity: 0.9,
  },
  label: {
    fontSize: typography.size.labelMd,
    lineHeight: typography.lineHeight.labelMd,
    fontWeight: typography.weight.medium,
  },
  selectedLabel: {
    color: colors.base.background,
  },
  unselectedLabel: {
    color: colors.base.textSubtle,
  },
});
