import React from "react";
import { useEffect, useState } from "react";
import { FlatList, Modal, TouchableOpacity, View, Text } from "react-native";

export default function MultiSelectModal({
  visible,
  title = '選択',
  options,
  selectedIds,
  onChange,
  onClose,
  isMulti = true,
}: {
  visible: boolean;
  title?: string;
  options: { id: string; label: string }[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onClose: () => void;
  isMulti?: boolean;
}) {
  const [local, setLocal] = useState<string[]>(selectedIds);
  useEffect(() => setLocal(selectedIds), [selectedIds, visible]);

  // 単一の場合は配列長を1に保つ
  const toggle = (id: string) => {
    if (isMulti) {
      setLocal(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    } else {
      setLocal([id]);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={{ flex: 1, backgroundColor: '#0006', justifyContent: 'flex-end' }}>
        <View style={{ maxHeight: '70%', backgroundColor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>{title}</Text>
          <FlatList
            data={options}
            extraData={local}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const checked = local.includes(item.id);
              return (
                <TouchableOpacity
                  onPress={() => toggle(item.id)}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
                  accessibilityRole={isMulti ? "checkbox" : "radio"}
                >
                  {isMulti ? (
                    <View style={{
                      width: 20, height: 20, marginRight: 8, borderRadius: 4, borderWidth: 1,
                      borderColor: checked ? '#007AFF' : '#aaa', backgroundColor: checked ? '#007AFF' : 'transparent'
                    }} />
                  ) : (
                    <View style={{
                      width: 20, height: 20, marginRight: 8, borderRadius: 50, borderWidth: 1,
                      borderColor: checked ? '#007AFF' : '#aaa', backgroundColor: checked ? '#007AFF' : 'transparent'
                    }} />
                  )}
                  <Text>{item.label}</Text>
                </TouchableOpacity>
              );
            }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
            <TouchableOpacity onPress={onClose}><Text>キャンセル</Text></TouchableOpacity>
            <TouchableOpacity
              disabled={local.length === 0}
              onPress={() => { onChange(local); onClose(); }}>
              <Text style={{ color: '#007AFF' }}>完了</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
