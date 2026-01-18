import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
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
    <ScrollView className="flex-1 bg-[#F6EFE7]">
      <View className="px-5 py-6">
        <Text style={{ fontFamily: fonts.title_bold, fontSize: 28, textAlign: "center", color: colors.primary }}>各種設定</Text>
        {user ?
          <View>
            <Text
              className="text-center"
              style={{ fontFamily: fonts.body_regular, fontSize: 14, color: colors.primary }}>{user.email} にてログイン中</Text>

            <TouchableOpacity
              onPress={() => handleBrandPress()}
              style={{
                backgroundColor: colors.primary,
                padding: 12,
                marginTop: 16,
                borderRadius: 8,
                marginHorizontal: 50,
              }}
            >
              <Text style={{ color: colors.accent, textAlign: 'center', fontFamily: fonts.title_bold }}>
                コーヒーブランド管理画面へ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleBeanPress()}
              style={{
                backgroundColor: colors.primary,
                padding: 12,
                marginTop: 16,
                borderRadius: 8,
                marginHorizontal: 50,
              }}
            >
              <Text style={{ color: colors.accent, textAlign: 'center', fontFamily: fonts.title_bold }}>
                コーヒー豆産地管理画面へ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleGrindSizePress()}
              style={{
                backgroundColor: colors.primary,
                padding: 12,
                marginTop: 16,
                borderRadius: 8,
                marginHorizontal: 50,
              }}
            >
              <Text style={{ color: colors.accent, textAlign: 'center', fontFamily: fonts.title_bold }}>
                挽き目管理画面へ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { }}
              style={{
                backgroundColor: '#FF9500',
                padding: 12,
                marginTop: 16,
                borderRadius: 8,
                marginHorizontal: 50,
              }}>
              <Text style={{ fontFamily: fonts.title_bold, color: colors.primary_light, textAlign: 'center' }}>
                データ全削除（未実装）
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
              <Text style={{ fontFamily: fonts.title_bold, color: colors.accent, textAlign: 'center' }}>
                ログアウト
              </Text>
            </TouchableOpacity>
          </View>
          : <Text>Please log in.</Text>}
      </View>
    </ScrollView>
  )
}

// const styles = StyleSheet.create({})
