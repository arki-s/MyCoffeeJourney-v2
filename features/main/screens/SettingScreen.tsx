import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useLogout } from '../../auth/hooks/useLogout';
import { useUserStore } from '../../../stores/useUserStore';
import { SettingStackParamList } from '../../../type';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

export default function SettingScreen() {
  const { logout } = useLogout();
  const user = useUserStore((state) => state.user);

  type RecordsNav = NativeStackNavigationProp<SettingStackParamList, 'SettingsHome'>;
  const navigation = useNavigation<RecordsNav>();

  const handleBrandPress = () => {
    navigation.navigate('Brands');
  };

  const handleBeanPress = () => {
    navigation.navigate('Beans');
  };


  return (
    <View>
      <Text>ProfileScreen</Text>
      {user ?
        <View>
          <Text>Logged in as: {user.email}</Text>
          <Button onPress={logout} title="ログアウト" />

          <TouchableOpacity
            onPress={() => handleBrandPress()}
            style={{
              backgroundColor: '#34C759',
              padding: 12,
              marginTop: 16,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', textAlign: 'center' }}>
              コーヒーブランド管理画面へ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleBeanPress()}
            style={{
              backgroundColor: '#34C759',
              padding: 12,
              marginTop: 16,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', textAlign: 'center' }}>
              コーヒー豆産地管理画面へ
            </Text>
          </TouchableOpacity>
        </View>
        : <Text>Please log in.</Text>}
    </View>
  )
}

const styles = StyleSheet.create({})
