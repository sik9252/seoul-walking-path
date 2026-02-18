import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, radius, spacing, typography } from "../../theme/tokens";

type TopBannerProps = {
  message: string;
  type?: "info" | "warning" | "error";
  style?: StyleProp<ViewStyle>;
};

export function TopBanner({ message, type = "info", style }: TopBannerProps) {
  const bg = type === "warning" ? "#FFF4DB" : type === "error" ? colors.semantic.errorBackground : colors.brand[50];
  const fg = type === "warning" ? colors.semantic.warning : type === "error" ? colors.semantic.error : colors.semantic.info;

  return (
    <View style={[styles.root, { backgroundColor: bg, borderColor: fg }, style]}>
      <Ionicons
        name={type === "warning" ? "warning-outline" : type === "error" ? "alert-circle-outline" : "information-circle-outline"}
        size={16}
        color={fg}
      />
      <Text style={[styles.text, { color: fg }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: typography.size.bodySm,
    lineHeight: typography.lineHeight.bodySm,
    fontWeight: typography.weight.medium,
  },
});
