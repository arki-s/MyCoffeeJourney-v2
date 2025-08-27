import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLogout } from '../../auth/hooks/useLogout';
import { useUserStore } from '../../../stores/useUserStore';
import { createBrand, deleteBrand, listBrands, updateBrand } from '../../auth/services/brandService';
import { Brand } from '../../../type';

export default function ProfileScreen() {
  const { logout } = useLogout();
  const user = useUserStore((state) => state.user);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandName, setBrandName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [editBrandName, setEditBrandName] = useState<string>('');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const data = await listBrands();
      setBrands(data);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const handleBrandCreate = async (name: string) => {
    if (!user) return;
    try {
      setLoading(true);
      await createBrand(name, user.id);
      fetchBrands();
    } catch (error) {
      console.error("Error creating brand:", error);
    } finally {
      setLoading(false);
      setBrandName('');
    }
  };

  const handleBrandEdit = async (id: string, name: string) => {
    if (!user || !id) return;
    try {
      setLoading(true);
      await updateBrand(id, name);
      await fetchBrands();
    } catch (error) {
      console.error("Error updating brand:", error);
    } finally {
      setLoading(false);
      setEditBrandName('');
    }
  };

  const handleBrandDelete = async (id: string) => {
    if (!user || !id) return;
    setLoading(true);
    try {
      await deleteBrand(id);
      await fetchBrands();
    } catch (error) {
      console.error("Error deleting brand:", error);
    } finally {
      setLoading(false);
    }
  }

  const brandsList = brands ? brands.map((brand) => (
    <View key={brand.id}>
      <Text >{brand.name}</Text>
      <TextInput
        placeholder='新しい名前を入力'
        value={editBrandName}
        onChangeText={setEditBrandName}
        keyboardType='default'
        autoCapitalize='none'
        autoCorrect={false}
      />
      <TouchableOpacity
        onPress={() => handleBrandEdit(brand.id, editBrandName)}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#ccc' : '#007AFF',
          padding: 12,
          marginTop: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          {loading ? '保存中……' : 'ブランドを編集'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => { handleBrandDelete(brand.id) }}
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
  )) : <Text>ブランド登録がありません</Text>;

  return (
    <View>
      <Text>ProfileScreen</Text>
      {user ?
        <View>
          <Text>Logged in as: {user.email}</Text>
          <Button onPress={logout} title="ログアウト" />
          <TextInput
            placeholder='コーヒーブランドを入力'
            value={brandName}
            onChangeText={setBrandName}
            keyboardType='default'
            autoCapitalize='none'
            autoCorrect={false}
          />
          <TouchableOpacity
            onPress={() => handleBrandCreate(brandName)}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#ccc' : '#007AFF',
              padding: 12,
              marginTop: 16,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', textAlign: 'center' }}>
              {loading ? '保存中……' : 'ブランドを登録'}
            </Text>
          </TouchableOpacity>
          {brandsList}
        </View>
        : <Text>Please log in.</Text>}
    </View>
  )
}

const styles = StyleSheet.create({})
