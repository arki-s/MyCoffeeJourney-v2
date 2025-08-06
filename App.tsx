import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { supabase } from './lib/supabase';
import * as React from 'react';
import LoginScreen from './features/auth/screens/LoginScreen';
import { useUserStore } from './stores/userStore';

export default function App() {
  const setUser = useUserStore(state => state.setUser)
  const resetUser = useUserStore(state => state.resetUser)
  const user = useUserStore((state) => state.user)

  useEffect(() => {
    // 初回にセッション確認
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      } else {
        resetUser()
      }
    }

    initSession()

    // サブスクライブして、ログイン／ログアウト時の状態も反映
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user)
        } else {
          resetUser()
        }
      }
    )

    // クリーンアップ（サブスク解除）
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('coffee').select('*');
      if (error) console.error(error);
      else console.log('Beans:', data);
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text>Welcome to My Coffee Journey!</Text>
      <Text>Explore your coffee journey with us.</Text>
      <Text>Enjoy your coffee adventures!</Text>
      <Text>Stay tuned for more features.</Text>
      <Text>Happy brewing!</Text>
      {user ? <Text>Logged in as: {user.email}</Text> : <Text>Please log in.</Text>}
      <LoginScreen />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
