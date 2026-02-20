import React from "react";
import { AppDialogModal } from "../../../components/ui";

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
    <AppDialogModal visible={visible} title="위치 확인 실패" message={message} onClose={onClose} />
  );
}
