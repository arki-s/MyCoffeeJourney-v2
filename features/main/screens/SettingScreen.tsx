import { Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useLogout } from '../../auth/hooks/useLogout';
import { useUserStore } from '../../../stores/useUserStore';
import { SettingStackParamList } from '../../../type';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { fonts } from '../../../app/main/theme/fonts';
import { colors } from '../../../app/main/theme/colors';

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

  const handleGrindSizePress = () => {
    navigation.navigate('GrindSize');
  };


  return (
    <View>
      <Text style={{ fontFamily: fonts.title_bold, fontSize: 28, textAlign: "center" }}>各種設定</Text>
      {user ?
        <View>
          <Text style={{ fontFamily: fonts.body_regular, fontSize: 14, textAlign: "center" }}>{user.email} にてログイン中</Text>

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
          <TouchableOpacity
            onPress={() => handleGrindSizePress()}
            style={{
              backgroundColor: '#34C759',
              padding: 12,
              marginTop: 16,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', textAlign: 'center' }}>
              挽き目管理画面へ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={logout}
            style={{
              backgroundColor: colors.primary,
              padding: 12,
              marginTop: 16,
              borderRadius: 8,
              marginHorizontal: 50,
            }}>
            <Text style={{ fontFamily: fonts.title_bold, color: colors.primary_light, textAlign: 'center' }}>
              ログアウト
            </Text>
          </TouchableOpacity>
        </View>
        : <Text>Please log in.</Text>}
    </View>
  )
}

// const styles = StyleSheet.create({})
