import * as React from 'react';
import { useUserStore } from './stores/useUserStore';
import { useSessionWatcher } from './features/auth/hooks/useSessionWatcher';
import { NavigationContainer } from '@react-navigation/native';
import AppStack from './features/main/navigation/AppStack';
import AuthStack from './features/main/navigation/AuthStack';

export default function App() {
  useSessionWatcher();

  const user = useUserStore((state) => state.user);
  const initializing = useUserStore((state) => state.initializing);

  // console.log('App user:', user);

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
