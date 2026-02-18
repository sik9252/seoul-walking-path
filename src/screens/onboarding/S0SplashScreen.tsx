import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../../theme/tokens";

type S0SplashScreenProps = {
  onDone: () => void;
};

export function S0SplashScreen({ onDone }: S0SplashScreenProps) {
  React.useEffect(() => {
    const timer = setTimeout(onDone, 1200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <View style={styles.screen}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>서울</Text>
      </View>
      <Text style={styles.title}>서울걷길</Text>
      <Text style={styles.sub}>Seoul Walking Path</Text>
      <ActivityIndicator size="small" color={colors.brand[600]} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.base.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 28,
    backgroundColor: colors.accent.lime100,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: colors.brand[900],
    fontSize: typography.size.titleLg,
    lineHeight: typography.lineHeight.titleLg,
    fontWeight: typography.weight.bold,
  },
  title: {
    marginTop: spacing.lg,
    color: colors.brand[700],
    fontSize: 34,
    lineHeight: 40,
    fontWeight: typography.weight.bold,
  },
  sub: {
    marginTop: spacing.xs,
    color: colors.base.textSubtle,
    fontSize: typography.size.bodyMd,
  },
  loader: {
    marginTop: 88,
  },
});
