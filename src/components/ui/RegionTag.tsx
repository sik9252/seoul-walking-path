import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { radius, typography } from "../../theme/tokens";

type RegionTagProps = {
  region: string;
};

const REGION_COLOR_BY_NAME: Record<string, { bg: string; text: string }> = {
  서울: { bg: "#E0ECFF", text: "#1E40AF" },
  인천: { bg: "#DFF5FF", text: "#0C4A6E" },
  대전: { bg: "#E8F3E2", text: "#245E22" },
  대구: { bg: "#FEE2E2", text: "#991B1B" },
  광주: { bg: "#FFE7D1", text: "#9A3412" },
  부산: { bg: "#E0F2FE", text: "#0C4A6E" },
  울산: { bg: "#DCFCE7", text: "#166534" },
  세종: { bg: "#F3E8FF", text: "#6B21A8" },
  경기: { bg: "#FEF3C7", text: "#92400E" },
  강원: { bg: "#DBEAFE", text: "#1E3A8A" },
  충북: { bg: "#E0F2F1", text: "#115E59" },
  충남: { bg: "#FCE7F3", text: "#9D174D" },
  경북: { bg: "#E2E8F0", text: "#334155" },
  경남: { bg: "#DCFCE7", text: "#14532D" },
  전북: { bg: "#FFE4E6", text: "#9F1239" },
  전남: { bg: "#FEE2E2", text: "#7F1D1D" },
  제주: { bg: "#FFEDD5", text: "#9A3412" },
};

export function RegionTag({ region }: RegionTagProps) {
  const palette = REGION_COLOR_BY_NAME[region] ?? { bg: "#E5E7EB", text: "#374151" };
  return (
    <View style={[styles.tag, { backgroundColor: palette.bg }]}>
      <Text style={[styles.label, { color: palette.text }]}>{region}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: typography.size.labelSm,
    fontWeight: typography.weight.bold,
  },
});
