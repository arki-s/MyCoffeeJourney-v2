import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { supabase } from './supabase';

export default function App() {

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
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
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
