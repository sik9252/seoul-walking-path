import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Button } from "../../../components/ui";
import { gameStyles as styles } from "../../../styles/gameStyles";

type ExploreVisitResultModalProps = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
};

export function ExploreVisitResultModal({
  visible,
  title,
  message,
  onClose,
}: ExploreVisitResultModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.centerModalWrap} pointerEvents="box-none">
        <View style={styles.locationErrorModal}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardBody}>{message}</Text>
          <Button label="확인" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
