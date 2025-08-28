import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Bean, SettingStackParamList } from '../../../type';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../stores/useUserStore';
import { createBean, deleteBean, listBeans, updateBean } from '../../auth/services/beanService';

export default function CoffeeBeanScreen() {
  const user = useUserStore((state) => state.user);

  const [loading, setLoading] = useState<boolean>(false);
  const [beans, setBeans] = useState<Bean[]>([]);
  const [beanName, setBeanName] = useState<string>('');
  const [editBeanName, setEditBeanName] = useState<string>('');

  type RecordsNav = NativeStackNavigationProp<SettingStackParamList, 'Beans'>;
  const navigation = useNavigation<RecordsNav>();

  const handleSettingPress = () => {
    navigation.navigate('SettingsHome');
  };

  useEffect(() => {
    fetchBeans();
  }, []);

  const fetchBeans = async () => {
    try {
      const data = await listBeans();
      setBeans(data);
    } catch (error) {
      console.error("Error fetching beans:", error);
    }
  };

  const handleBeanCreate = async (name: string) => {
    if (!user) return;
    try {
      setLoading(true);
      await createBean(name, user.id);
      fetchBeans();
    } catch (error) {
      console.error("Error creating bean:", error);
    } finally {
      setLoading(false);
      setBeanName('');
    }
  };

  const handleBeanEdit = async (id: string, name: string) => {
    if (!user || !id) return;
    try {
      setLoading(true);
      await updateBean(id, name);
      await fetchBeans();
    } catch (error) {
      console.error("Error updating bean:", error);
    } finally {
      setLoading(false);
      setEditBeanName('');
    }
  };

  const handleBeanDelete = async (id: string) => {
    if (!user || !id) return;
    setLoading(true);
    try {
      await deleteBean(id);
      await fetchBeans();
    } catch (error) {
      console.error("Error deleting bean:", error);
    } finally {
      setLoading(false);
    }
  };

  const beansList = beans ? beans.map((bean) => (
    <View key={bean.id}>
      <Text >{bean.name}</Text>
      <TextInput
        placeholder='新しい豆の産地を入力'
        value={editBeanName}
        onChangeText={setEditBeanName}
        keyboardType='default'
        autoCapitalize='none'
        autoCorrect={false}
      />
      <TouchableOpacity
        onPress={() => handleBeanEdit(bean.id, editBeanName)}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#ccc' : '#007AFF',
          padding: 12,
          marginTop: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          {loading ? '保存中……' : '豆産地を編集'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => { handleBeanDelete(bean.id) }}
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
  )) : <Text>豆産地の登録がありません</Text>;

  return (
    <View>
      <Text>CoffeeBeanScreen</Text>
      <Text onPress={() => handleSettingPress()}>Go to Settings</Text>

      <TextInput
        placeholder='コーヒー豆の産地を入力'
        value={beanName}
        onChangeText={setBeanName}
        keyboardType='default'
        autoCapitalize='none'
        autoCorrect={false}
      />
      <TouchableOpacity
        onPress={() => handleBeanCreate(beanName)}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#ccc' : '#007AFF',
          padding: 12,
          marginTop: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          {loading ? '保存中……' : '豆産地を登録'}
        </Text>
      </TouchableOpacity>
      {beansList}
    </View>
  )
}

const styles = StyleSheet.create({})
