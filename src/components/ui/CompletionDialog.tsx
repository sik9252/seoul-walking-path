import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import { Button } from "./Button";

type CompletionDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
};

export function CompletionDialog({
  visible,
  title,
  message,
  confirmLabel = "확인",
  onConfirm,
}: CompletionDialogProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onConfirm}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onConfirm} />
        <View style={styles.dialog}>
          <View style={styles.badge}>
            <Ionicons name="checkmark" size={20} color={colors.base.surface} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <Button label={confirmLabel} onPress={onConfirm} style={styles.confirmButton} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.x2,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.32)",
  },
  dialog: {
    width: "100%",
    maxWidth: 360,
    borderRadius: radius.xl,
    backgroundColor: colors.base.surface,
    borderWidth: 1,
    borderColor: colors.base.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.x2,
    alignItems: "center",
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.brand[600],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.size.titleSm,
    fontWeight: typography.weight.bold,
    color: colors.base.text,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  message: {
    fontSize: typography.size.bodyMd,
    lineHeight: typography.lineHeight.bodyMd,
    color: colors.base.textSubtle,
    textAlign: "center",
  },
  confirmButton: {
    marginTop: spacing.xl,
    width: "100%",
  },
});
