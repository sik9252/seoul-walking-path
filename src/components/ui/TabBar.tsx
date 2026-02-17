import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "../../theme/tokens";

export type TabItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
};

type TabBarProps = {
  tabs: TabItem[];
  activeKey: string;
  onPressTab: (key: string) => void;
  style?: StyleProp<ViewStyle>;
};

export function TabBar({ tabs, activeKey, onPressTab, style }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, spacing.sm) }, style]}>
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onPressTab(tab.key)}
            style={styles.tabButton}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <View style={[styles.iconWrap, active && styles.iconWrapActive]}>{tab.icon}</View>
            <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 65,
    borderTopWidth: 1,
    borderTopColor: colors.base.border,
    backgroundColor: colors.base.background,
    flexDirection: "row",
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  iconWrap: {
    minWidth: 32,
    minHeight: 32,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  iconWrapActive: {
    backgroundColor: colors.accent.lime100,
  },
  label: {
    fontSize: typography.size.labelSm,
    lineHeight: typography.lineHeight.labelSm,
    fontWeight: typography.weight.medium,
  },
  labelActive: {
    color: colors.brand[600],
    fontWeight: typography.weight.bold,
  },
  labelInactive: {
    color: colors.base.textSubtle,
  },
});
