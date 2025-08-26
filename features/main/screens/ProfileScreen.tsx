import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLogout } from '../../auth/hooks/useLogout';
import { useUserStore } from '../../../stores/useUserStore';
import { createBrand, listBrands } from '../../auth/services/brandService';

export default function ProfileScreen() {
  const { logout } = useLogout();
  const user = useUserStore((state) => state.user);

  const [brands, setBrands] = useState<string[]>([]);
  const [brandName, setBrandName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);


  useEffect(() => {
    fetchBrands
  }, []);

  const fetchBrands = async () => {
    try {
      const data = await listBrands();
      setBrands(data.map(brand => brand.name));
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

  const brandsList = brands ? brands.map((brand, index) => (
    <Text key={index}>{brand}</Text>
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
