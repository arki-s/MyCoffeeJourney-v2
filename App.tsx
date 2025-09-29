import * as React from 'react';
import { useUserStore } from './stores/useUserStore';
import { useSessionWatcher } from './features/auth/hooks/useSessionWatcher';
import { NavigationContainer } from '@react-navigation/native';
import AppStack from './features/main/navigation/AppStack';
import AuthStack from './features/main/navigation/AuthStack';
import { useFonts } from 'expo-font';
import { View, Text } from 'react-native';
import title_bold from './assets/fonts/KaiseiDecol-Bold.ttf';
import title_medium from './assets/fonts/KaiseiDecol-Medium.ttf';
import title_regular from './assets/fonts/KaiseiDecol-Regular.ttf';
import body_bold from './assets/fonts/KleeOne-SemiBold.ttf';
import body_regular from './assets/fonts/KleeOne-Regular.ttf';

export default function App() {
  useSessionWatcher();

  const user = useUserStore((state) => state.user);
  const initializing = useUserStore((state) => state.initializing);

  const [fontsLoaded] = useFonts({
    title_bold: title_bold,
    title_medium: title_medium,
    title_regular: title_regular,
    body_bold: body_bold,
    body_regular: body_regular,
  });

  if (fontsLoaded == false) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18 }}>Now Loading...</Text>
      </View>
    )
  }

  // デバッグ用：Supabaseからデータを取得してログに出力
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const { data, error } = await supabase.from('coffee').select('*');
  //     if (error) console.error(error);
  //     else console.log('Beans:', data);
  //   };

  //   fetchData();
  // }, []);

  return (
    <NavigationContainer>
      {initializing ? null : user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
