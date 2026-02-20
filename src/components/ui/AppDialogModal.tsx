import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, shadow, spacing, typography } from "../../theme/tokens";
import { Button } from "./Button";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  confirmLabel?: string;
  onConfirm?: () => void;
  cancelLabel?: string;
  onCancel?: () => void;
};

export function AppDialogModal({
  visible,
  title,
  message,
  onClose,
  confirmLabel = "확인",
  onConfirm,
  cancelLabel,
  onCancel,
}: Props) {
  const handleConfirm = React.useCallback(() => {
    if (onConfirm) {
      onConfirm();
      return;
    }
    onClose();
  }, [onClose, onConfirm]);

  const handleCancel = React.useCallback(() => {
    if (onCancel) {
      onCancel();
      return;
    }
    onClose();
  }, [onCancel, onClose]);

  const hasTwoActions = Boolean(cancelLabel);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.wrap} pointerEvents="box-none">
        <View style={styles.panel}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={[styles.actions, hasTwoActions ? styles.actionsRow : styles.actionsColumn]}>
            {cancelLabel ? (
              <Button
                label={cancelLabel}
                variant="secondary"
                onPress={handleCancel}
                style={hasTwoActions ? styles.actionButton : undefined}
              />
            ) : null}
            <Button label={confirmLabel} onPress={handleConfirm} style={hasTwoActions ? styles.actionButton : undefined} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 12, 10, 0.35)",
  },
  wrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    zIndex: 20,
  },
  panel: {
    width: "100%",
    borderRadius: radius.lg,
    backgroundColor: colors.base.surface,
    borderWidth: 1,
    borderColor: colors.base.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.level2,
  },
  title: {
    fontSize: typography.size.labelMd,
    lineHeight: typography.lineHeight.labelMd,
    fontWeight: typography.weight.bold,
    color: colors.base.text,
  },
  message: {
    fontSize: typography.size.caption,
    color: colors.base.textSubtle,
  },
  actions: {
    gap: spacing.sm,
  },
  actionsColumn: {
    flexDirection: "column",
  },
  actionsRow: {
    flexDirection: "row",
  },
  actionButton: {
    flex: 1,
  },
});
