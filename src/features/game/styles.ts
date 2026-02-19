import { StyleSheet } from "react-native";
import { colors, spacing, typography } from "../../theme/tokens";

export const gameStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.base.background,
  },
  screen: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.x2,
    paddingBottom: 110,
    gap: spacing.md,
  },
  title: {
    fontSize: typography.size.titleLg,
    fontWeight: typography.weight.bold,
    color: colors.base.text,
  },
  description: {
    fontSize: typography.size.bodyLg,
    lineHeight: typography.lineHeight.bodyLg,
    color: colors.base.textSubtle,
  },
  cardTitle: {
    fontSize: typography.size.labelLg,
    fontWeight: typography.weight.bold,
    color: colors.base.text,
  },
  cardBody: {
    fontSize: typography.size.bodySm,
    color: colors.base.textSubtle,
  },
  moreBtn: {
    alignSelf: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  moreText: {
    color: colors.brand[700],
    fontWeight: typography.weight.semibold,
  },
  listHeader: {
    gap: spacing.md,
  },
  listFooter: {
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  endText: {
    textAlign: "center",
    color: colors.base.textSubtle,
    fontSize: typography.size.bodySm,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
  },
  backText: {
    color: colors.base.text,
    fontSize: typography.size.bodySm,
    fontWeight: typography.weight.medium,
  },
  placeImage: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    backgroundColor: colors.base.surface,
  },
  imageFallback: {
    height: 160,
    borderRadius: 14,
    backgroundColor: colors.base.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  detailLabel: {
    color: colors.base.text,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.xs,
    fontSize: typography.size.bodySm,
  },
  errorText: {
    color: "#B42318",
    fontSize: typography.size.bodySm,
  },
});
