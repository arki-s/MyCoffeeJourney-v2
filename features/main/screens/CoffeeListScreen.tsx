import { ImageBackground, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { BottomStackParamList, CoffeeStackParamList, CoffeeWithBrand } from '../../../type';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { listCoffees } from '../../auth/services/coffeeService';
import { listBeans } from '../../auth/services/beanService';
import { listBrands } from '../../auth/services/brandService';
import { listGrindSizes } from '../../auth/services/grindSizeService';
import { fonts } from '../../../app/main/theme/fonts';
import { colors } from '../../../app/main/theme/colors';
import textureImage from '../../../assets/texture.jpg';
import Octicons from '@expo/vector-icons/Octicons';
import { ScreenSkeletonCard, ScreenSkeletonLine, ScreenStatusOverlay } from '../components/ScreenLoading';

export default function CoffeeListScreen() {
  const [coffees, setCoffees] = useState<CoffeeWithBrand[]>([]);
  const [needsInitialSetup, setNeedsInitialSetup] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasLoadedOnceRef = useRef(false);
  const normalizedSearchText = searchText.trim().toLowerCase();

  const filteredCoffees = coffees.filter((coffee) => {
    if (normalizedSearchText === '') return true;

    return (
      coffee.name.toLowerCase().includes(normalizedSearchText) ||
      coffee.brandName.toLowerCase().includes(normalizedSearchText)
    );
  });

  const fetchScreenData = useCallback(async () => {
    // 初回読込と再取得を分けて、空状態のちらつきを防ぐ。
    if (hasLoadedOnceRef.current) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
    }

    const [coffeeResult, beanResult, brandResult, grindSizeResult] = await Promise.allSettled([
      listCoffees(),
      listBeans(),
      listBrands(),
      listGrindSizes(),
    ]);

    if (coffeeResult.status === 'fulfilled') {
      setCoffees(coffeeResult.value);
    } else {
      console.error("Error fetching coffees:", coffeeResult.reason);
    }

    if (beanResult.status === 'rejected') {
      console.error("Error fetching beans:", beanResult.reason);
    }

    if (brandResult.status === 'rejected') {
      console.error("Error fetching brands:", brandResult.reason);
    }

    if (grindSizeResult.status === 'rejected') {
      console.error("Error fetching grind sizes:", grindSizeResult.reason);
    }

    const beanCount = beanResult.status === 'fulfilled' ? beanResult.value.length : null;
    const brandCount = brandResult.status === 'fulfilled' ? brandResult.value.length : null;
    const grindSizeCount = grindSizeResult.status === 'fulfilled' ? grindSizeResult.value.length : null;

    setNeedsInitialSetup(
      beanCount === 0 || brandCount === 0 || grindSizeCount === 0
    );

    hasLoadedOnceRef.current = true;
    setIsInitialLoading(false);
    setIsRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchScreenData();
    }, [fetchScreenData])
  );

  type RecordsNav = CompositeNavigationProp<
    NativeStackNavigationProp<CoffeeStackParamList, 'CoffeeHome'>,
    BottomTabNavigationProp<BottomStackParamList>
  >;
  const navigation = useNavigation<RecordsNav>();

  const handleCreatePress = () => {
    navigation.navigate('CoffeeCreate');
  };

  const handleDetailPress = (id: string) => {
    navigation.navigate('CoffeeDetails', { id });
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings', { screen: 'SettingsHome' });
  };

  const searchCoffees = (
    <TextInput
      placeholder="コーヒー・ブランド名で検索"
      placeholderTextColor={colors.BROWN}
      value={searchText}
      onChangeText={setSearchText}
      autoCapitalize="none"
      autoCorrect={false}
      style={{ fontFamily: fonts.body, color: colors.BROWN }}
      className="mb-3 rounded-xl border-2 border-DARK_BROWN bg-OCHER px-4 py-2"
    />
  );

  const coffeeItems = filteredCoffees.map((coffee) => (
    <TouchableOpacity
      key={coffee.id}
      onPress={() => handleDetailPress(coffee.id)}
    >
      <View
        className="mb-3 rounded-2xl border-2 border-OCHER bg-DARK_BROWN px-4 py-4 ios:shadow-md android:elevation-md"
      >
        <View className="self-center">
          <Text className="text-center text-lg text-OCHER" style={{ fontFamily: fonts.body }}>
            {coffee.brandName}
          </Text>
          <Text className="text-center text-2xl text-OCHER" style={{ fontFamily: fonts.title_bold }}>
            {coffee.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  ));

  const initialSetupNotice = (
    <View className="mb-3 rounded-2xl border-2 border-OCHER bg-DARK_BROWN px-4 py-4 ios:shadow-md android:elevation-md">
      <Text className="text-lg text-OCHER text-center" style={{ fontFamily: fonts.body }}>
        まずは初期設定として、
        {'\n'}コーヒー豆産地、コーヒーブランド、挽き目の登録を行いましょう！
      </Text>
      <TouchableOpacity
        className="mt-4 mb-1 self-center rounded-full border-2 border-OCHER bg-BROWN px-4 py-2"
        onPress={() => handleSettingsPress()}
      >
        <Text className="text-md text-OCHER" style={{ fontFamily: fonts.body }}>
          設定画面へ
        </Text>
      </TouchableOpacity>
    </View>
  );

  const coffeeListSkeleton = (
    <View>
      <ScreenSkeletonCard
        style={{ borderWidth: 2, borderColor: colors.DARK_BROWN, backgroundColor: colors.OCHER }}
      >
        <ScreenSkeletonLine height={18} width="48%" />
      </ScreenSkeletonCard>

      {[0, 1, 2].map((index) => (
        <ScreenSkeletonCard key={index}>
          <ScreenSkeletonLine
            width="40%"
            height={16}
            style={{ alignSelf: 'center', marginBottom: 12 }}
          />
          <ScreenSkeletonLine
            width="62%"
            height={24}
            style={{ alignSelf: 'center' }}
          />
        </ScreenSkeletonCard>
      ))}
    </View>
  );

  return (
    <ImageBackground
      source={textureImage}
      style={{ flex: 1 }}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
        <View className="px-5 py-6">
          {isInitialLoading ? (
            coffeeListSkeleton
          ) : (
            <>
              <ScreenStatusOverlay visible={isRefreshing} label="コーヒーを更新中…" />
              {needsInitialSetup && initialSetupNotice}

              {coffees.length === 0 && !needsInitialSetup ? (
                <View className="mb-3 rounded-2xl border-2 border-OCHER bg-DARK_BROWN px-4 py-4">
                  <Text className="text-lg text-OCHER" style={{ fontFamily: fonts.body }}>
                    登録されているコーヒーはありません。
                    {'\n'}追加しましょう！
                  </Text>
                </View>
              ) : coffees.length > 0 ? (
                <View>
                  {searchCoffees}
                  {filteredCoffees.length === 0 ? (
                    <View className="mb-3 rounded-2xl border-2 border-OCHER bg-DARK_BROWN px-4 py-4">
                      <Text className="text-lg text-OCHER" style={{ fontFamily: fonts.body }}>
                        検索条件に一致するコーヒーはありません。
                      </Text>
                    </View>
                  ) : (
                    coffeeItems
                  )}
                </View>
              ) : null}
            </>
          )}

        </View>
      </ScrollView>
      {!isInitialLoading && !needsInitialSetup && (
        <TouchableOpacity
          className="absolute bottom-6 right-5 h-16 w-16 items-center justify-center rounded-full border-2 border-OCHER bg-DARK_BROWN ios:shadow-md android:elevation-md"
          onPress={() => handleCreatePress()}
        >
          <Octicons name="plus" size={34} color={colors.OCHER} />
        </TouchableOpacity>
      )}
    </ImageBackground>
  )
}
