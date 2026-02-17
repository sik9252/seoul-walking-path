import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors, radius, shadow, spacing } from "../../theme/tokens";

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  radiusSize?: "md" | "lg" | "xl";
};

export function Card({ children, style, padded = true, radiusSize = "lg" }: CardProps) {
  return <View style={[styles.base, styles[radiusSize], padded && styles.padded, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.base.surface,
    borderWidth: 1,
    borderColor: colors.base.border,
    ...shadow.level1,
  },
  padded: {
    padding: spacing.lg,
  },
  md: {
    borderRadius: radius.md,
  },
  lg: {
    borderRadius: radius.lg,
  },
  xl: {
    borderRadius: radius.xl,
  },
});
