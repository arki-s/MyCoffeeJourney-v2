import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { GrindSize, SettingStackParamList } from '../../../type';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../stores/useUserStore';
import { createGrindSize, deleteGrindSize, listGrindSizes, updateGrindSize } from '../../auth/services/grindSizeService';

export default function GrindSizeScreen() {
  const user = useUserStore((state) => state.user);

  const [loading, setLoading] = useState<boolean>(false);
  const [grindSizes, setGrindSizes] = useState<GrindSize[]>([]);
  const [grindSizeName, setGrindSizeName] = useState<string>('');
  const [editGrindSizeName, setEditGrindSizeName] = useState<string>('');

  type RecordsNav = NativeStackNavigationProp<SettingStackParamList, 'GrindSize'>;
  const navigation = useNavigation<RecordsNav>();

  const handleSettingPress = () => {
    navigation.navigate('SettingsHome');
  };

  useEffect(() => {
    fetchGrindSizes();
  }, []);

  const fetchGrindSizes = async () => {
    try {
      const data = await listGrindSizes();
      setGrindSizes(data);
    } catch (error) {
      console.error("Error fetching grind sizes:", error);
    }
  };

  const handleGrindSizeCreate = async (name: string) => {
    if (!user) return;
    try {
      setLoading(true);
      await createGrindSize(name, user.id);
      fetchGrindSizes();
    } catch (error) {
      console.error("Error creating grindsize:", error);
    } finally {
      setLoading(false);
      setGrindSizeName('');
    }
  };

  const handleGrindSizeEdit = async (id: string, name: string) => {
    if (!user || !id) return;
    try {
      setLoading(true);
      await updateGrindSize(id, name);
      await fetchGrindSizes();
    } catch (error) {
      console.error("Error updating grindsize:", error);
    } finally {
      setLoading(false);
      setEditGrindSizeName('');
    }
  };

  const handleGrindSizeDelete = async (id: string) => {
    if (!user || !id) return;
    setLoading(true);
    try {
      await deleteGrindSize(id);
      await fetchGrindSizes();
    } catch (error) {
      console.error("Error deleting grindsize:", error);
    } finally {
      setLoading(false);
    }
  };

  const grindsizesList = grindSizes ? grindSizes.map((grindSize) => (
    <View key={grindSize.id}>
      <Text >{grindSize.name}</Text>
      <TextInput
        placeholder='新しい挽き目を入力'
        value={editGrindSizeName}
        onChangeText={setEditGrindSizeName}
        keyboardType='default'
        autoCapitalize='none'
        autoCorrect={false}
      />
      <TouchableOpacity
        onPress={() => handleGrindSizeEdit(grindSize.id, editGrindSizeName)}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#ccc' : '#007AFF',
          padding: 12,
          marginTop: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          {loading ? '保存中……' : '挽き目を編集'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => { handleGrindSizeDelete(grindSize.id) }}
        style={{
          backgroundColor: '#FF3B30',
          padding: 8,
          marginTop: 4,
          borderRadius: 8,
          width: 80,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>削除</Text>
      </TouchableOpacity>
    </View>
  )) : <Text>挽き目の登録がありません</Text>;

  return (
    <View>
      <Text>GrindSizeScreen</Text>
      <Text onPress={() => handleSettingPress()}>Go to Settings</Text>

      <TextInput
        placeholder='コーヒーの挽き目を入力'
        value={grindSizeName}
        onChangeText={setGrindSizeName}
        keyboardType='default'
        autoCapitalize='none'
        autoCorrect={false}
      />
      <TouchableOpacity
        onPress={() => handleGrindSizeCreate(grindSizeName)}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#ccc' : '#007AFF',
          padding: 12,
          marginTop: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          {loading ? '保存中……' : '挽き目を登録'}
        </Text>
      </TouchableOpacity>
      {grindsizesList}
    </View>
  )
}

const styles = StyleSheet.create({})
