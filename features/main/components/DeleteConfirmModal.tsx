import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../../app/main/theme/colors";
import { fonts } from "../../../app/main/theme/fonts";

type DeleteConfirmModalProps = {
  visible: boolean;
  selectedItemName: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
};

export default function DeleteConfirmModal({
  visible,
  selectedItemName,
  onConfirm,
  onClose,
  confirmLabel = "削除",
  cancelLabel = "キャンセル",
}: DeleteConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#0006",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <View
          className="bg-DARK_BROWN border-2 border-OCHER"
          style={{
            width: "100%",
            maxWidth: 360,
            borderRadius: 16,
            padding: 20,
          }}
        >
          <View style={{ gap: 12 }}>
            <Text
              className="text-OCHER"
              style={{ fontSize: 18, fontFamily: fonts.body, textAlign: "center" }}
            >
              選択中：{selectedItemName}
            </Text>
            <Text
              className="text-OCHER"
              style={{
                fontSize: 20,
                lineHeight: 30,
                fontFamily: fonts.body,
                textAlign: "center",
              }}
            >
              本当に削除してよろしいですか？
            </Text>
            <Text
              className="text-LIGHT_BROWN"
              style={{
                fontSize: 15,
                lineHeight: 24,
                fontFamily: fonts.body,
                textAlign: "center",
              }}
            >
              この操作は取り消すことができません。
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 12, marginTop: 24 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: colors.LIGHT_BROWN,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text
                className="text-LIGHT_BROWN"
                style={{ fontFamily: fonts.body }}
              >
                {cancelLabel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              style={{
                flex: 1,
                backgroundColor: colors.secondary,
                borderWidth: 1,
                borderColor: colors.OCHER,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text className="text-OCHER" style={{ fontFamily: fonts.body }}>
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
