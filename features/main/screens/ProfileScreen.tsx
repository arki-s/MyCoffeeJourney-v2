import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useLogout } from '../../auth/hooks/useLogout';
import { useUserStore } from '../../../stores/userStore';

export default function ProfileScreen() {
  const { logout } = useLogout();
  const user = useUserStore((state) => state.user);

  return (
    <View>
      <Text>ProfileScreen</Text>
      {user ?
        <View>
          <Text>Logged in as: {user.email}</Text>
          <Button onPress={logout} title="ログアウト" />
        </View>
        : <Text>Please log in.</Text>}
    </View>
  )
}

const styles = StyleSheet.create({})
