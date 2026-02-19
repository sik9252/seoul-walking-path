import { StyleSheet } from "react-native";
import { colors, spacing, typography } from "../theme/tokens";

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
  segmentWrap: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.base.border,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: colors.base.surface,
  },
  segmentButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  segmentButtonActive: {
    backgroundColor: colors.accent.lime100,
  },
  segmentLabel: {
    fontSize: typography.size.labelMd,
    fontWeight: typography.weight.semibold,
    color: colors.base.textSubtle,
  },
  segmentLabelActive: {
    color: colors.brand[700],
    fontWeight: typography.weight.bold,
  },
  mapScreen: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.x2,
    paddingBottom: 110,
    gap: spacing.md,
  },
  mapCard: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E1E6DE",
    backgroundColor: colors.base.surface,
  },
  mapFull: {
    flex: 1,
    width: "100%",
  },
  mapPanel: {
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.base.border,
    backgroundColor: colors.base.surface,
  },
  mapPanelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  mapWrap: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E1E6DE",
    backgroundColor: colors.base.surface,
  },
  map: {
    width: "100%",
    height: 260,
  },
  mapMetaRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
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
