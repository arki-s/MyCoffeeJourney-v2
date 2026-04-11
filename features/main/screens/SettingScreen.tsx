import { ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useLogout } from '../../auth/hooks/useLogout';
import { useUserStore } from '../../../stores/useUserStore';
import { SettingStackParamList } from '../../../type';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { fonts } from '../../../app/main/theme/fonts';
import textureImage from '../../../assets/texture.jpg';

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
    <ImageBackground
      source={textureImage}
      style={{ flex: 1 }}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
        <View className="px-5 py-6">
          {user ?
            <View>
              <View className="self-center rounded-full border-2 border-DARK_BROWN bg-OCHER px-3 py-2 ios:shadow-md android:elevation-md">
                <Text
                  className="text-center text-DARK_BROWN text-md"
                  style={{ fontFamily: fonts.body }}>{user.email}
                  {'\n'}にてログイン中</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleBrandPress()}
                className="mt-3 rounded-2xl border-2 border-OCHER bg-DARK_BROWN px-4 py-4 ios:shadow-md android:elevation-md"
              >
                <Text className='text-center text-2xl text-OCHER' style={{ fontFamily: fonts.body }}>
                  コーヒーブランド管理画面へ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleBeanPress()}
                className="mt-3 rounded-2xl border-2 border-OCHER bg-DARK_BROWN px-4 py-4 ios:shadow-md android:elevation-md"
              >
                <Text className='text-center text-2xl text-OCHER' style={{ fontFamily: fonts.body }}>
                  コーヒー豆産地管理画面へ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleGrindSizePress()}
                className="mt-3 rounded-2xl border-2 border-OCHER bg-DARK_BROWN px-4 py-4 ios:shadow-md android:elevation-md"
              >
                <Text className='text-center text-2xl text-OCHER' style={{ fontFamily: fonts.body }}>
                  挽き目管理画面へ
                </Text>
              </TouchableOpacity>
              {/* <TouchableOpacity
                onPress={() => { }}
                className="mt-3 rounded-2xl border-2 border-OCHER bg-DARK_BROWN px-4 py-4 ios:shadow-md android:elevation-md"
              >
                <Text className='text-center text-2xl text-OCHER' style={{ fontFamily: fonts.body }}>
                  データ全削除（未実装）
                </Text>
              </TouchableOpacity> */}
              <TouchableOpacity
                onPress={logout}
                className="mt-3 rounded-2xl border-2 border-OCHER bg-BROWN px-4 py-4 ios:shadow-md android:elevation-md"
              >
                <Text className='text-center text-2xl text-OCHER' style={{ fontFamily: fonts.body }}>
                  ログアウト
                </Text>
              </TouchableOpacity>
            </View>
            : <Text>Please log in.</Text>}
        </View>
      </ScrollView>
    </ImageBackground>
  )
}
