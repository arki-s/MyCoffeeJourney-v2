import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import { useLogin } from '../hooks/useLogin';

export default function LoginScreen() {
  const { loginWithEmail, loading, error } = useLogin();
  const [email, setEmail] = useState('');
  const [loginMessage, setLoginMessage] = useState<string>("");

  const handleLogin = async () => {
    const success = await loginWithEmail(email);
    if (success) {
      setLoginMessage("メールアドレスにログインの案内を送付したのでご確認ください。")
    } else {
      console.error(error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>LoginScreen</Text>
      <TextInput
        placeholder='メールアドレスを入力'
        value={email}
        onChangeText={setEmail}
        keyboardType='email-address'
        autoCapitalize='none'
        autoCorrect={false}
      />
      {error && <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>}
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#ccc' : '#007AFF',
          padding: 12,
          marginTop: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          {loading ? 'ログイン中……' : 'メールアドレスでログイン'}
        </Text>
        {loginMessage !== "" && (
          <Text style={{ color: 'green', marginTop: 8 }}>{loginMessage}</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}
