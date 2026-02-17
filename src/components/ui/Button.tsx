import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { colors, radius, spacing, typography } from "../../theme/tokens";

type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  labelStyle,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {leftIcon}
        <Text style={[styles.label, labelStyles[variant], disabled && styles.labelDisabled, labelStyle]}>
          {label}
        </Text>
        {rightIcon}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.size.labelLg,
    lineHeight: typography.lineHeight.labelLg,
    fontWeight: typography.weight.bold,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    backgroundColor: colors.base.subtle,
    borderColor: colors.base.subtle,
  },
  labelDisabled: {
    color: colors.base.textSubtle,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.brand[600],
  },
  secondary: {
    backgroundColor: colors.base.surface,
    borderWidth: 1,
    borderColor: colors.brand[600],
  },
  destructive: {
    backgroundColor: colors.semantic.error,
  },
  ghost: {
    backgroundColor: "transparent",
  },
});

const labelStyles = StyleSheet.create({
  primary: { color: colors.base.surface },
  secondary: { color: colors.brand[700] },
  destructive: { color: colors.base.surface },
  ghost: { color: colors.brand[700] },
});
