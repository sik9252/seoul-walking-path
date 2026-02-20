import React from "react";
import { AppDialogModal } from "../../../components/ui";

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
  return <AppDialogModal visible={visible} title={title} message={message} onClose={onClose} />;
}
