import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Button } from "../../../components/ui";
import { gameStyles as styles } from "../../../styles/gameStyles";

type ExploreLocationErrorModalProps = {
  visible: boolean;
  message: string;
  onClose: () => void;
};

export function ExploreLocationErrorModal({
  visible,
  message,
  onClose,
}: ExploreLocationErrorModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.centerModalWrap} pointerEvents="box-none">
        <View style={styles.locationErrorModal}>
          <Text style={styles.cardTitle}>위치 확인 실패</Text>
          <Text style={styles.cardBody}>{message}</Text>
          <Button label="확인" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
