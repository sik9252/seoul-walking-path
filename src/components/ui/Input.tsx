import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { colors, radius, spacing, typography } from "../../theme/tokens";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputWrapStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

export function Input({
  label,
  error,
  containerStyle,
  inputWrapStyle,
  inputStyle,
  leftSlot,
  rightSlot,
  ...props
}: InputProps) {
  const hasError = Boolean(error);

  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={[styles.wrap, hasError && styles.wrapError, inputWrapStyle]}>
        {leftSlot}
        <TextInput
          placeholderTextColor={colors.base.textSubtle}
          style={[styles.input, inputStyle]}
          {...props}
        />
        {rightSlot}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.sm,
    color: colors.base.text,
    fontSize: typography.size.labelMd,
    lineHeight: typography.lineHeight.labelMd,
    fontWeight: typography.weight.semibold,
  },
  wrap: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.base.border,
    backgroundColor: colors.base.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  wrapError: {
    borderColor: colors.semantic.error,
  },
  input: {
    flex: 1,
    color: colors.base.text,
    fontSize: typography.size.bodyMd,
    lineHeight: typography.lineHeight.bodyMd,
    fontWeight: typography.weight.regular,
    paddingVertical: spacing.sm,
  },
  error: {
    marginTop: spacing.xs,
    color: colors.semantic.error,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
});
