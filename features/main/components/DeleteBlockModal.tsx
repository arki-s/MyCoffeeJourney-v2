import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../../app/main/theme/colors";
import { fonts } from "../../../app/main/theme/fonts";

type DeleteBlockModalProps = {
  visible: boolean;
  selectedItemName: ItemName;
  onClose: () => void;
  confirmLabel?: string;
};

type ItemName = "coffee" | "brand" | "beans" | "grindSize" | "error";

export default function DeleteBlockModal({
  visible,
  selectedItemName,
  onClose,
  confirmLabel = "閉じる",
}: DeleteBlockModalProps) {

  const itemDisplayMap: Record<ItemName, string> = {
    coffee: "このコーヒーには関連する飲用記録が存在するため削除できません。",
    brand: "このブランドを使用しているコーヒーが存在するため削除できません。",
    beans: "この豆を使用しているコーヒーが存在するため削除できません。",
    grindSize: "この挽き目を使用している飲用記録が存在するため削除できません。",
    error: "削除できませんでした。時間をおいて再度お試しください。",
  };

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
              style={{
                fontSize: 20,
                lineHeight: 30,
                fontFamily: fonts.body,
                textAlign: "center",
              }}
            >
              {itemDisplayMap[selectedItemName]}
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
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
