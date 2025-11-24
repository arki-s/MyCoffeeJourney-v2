import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import { useLogin } from '../hooks/useLogin';
import { colors } from '../../../app/main/theme/colors';
import { fonts } from '../../../app/main/theme/fonts';

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

  const welcomeMessage2 = "ようこそ！\nまたは、おかえりなさい！";
  const welcomeMessage3 = "あなただけの特別なコーヒーの旅路を彩っていきましょう！\nメールアドレスを入力してログインしてください。";

  return (
    <View style={{ flex: 1, justifyContent: 'flex-start', padding: 24, backgroundColor: colors.background }}>
      <Text style={{ fontFamily: fonts.title_bold, fontSize: 22, marginBottom: 24, color: colors.primary }}>{welcomeMessage2}</Text>
      <Text style={{ fontFamily: fonts.title_bold, fontSize: 18, marginBottom: 24, color: colors.primary }}>{welcomeMessage3}</Text>
      <TextInput
        placeholder='メールアドレスを入力'
        value={email}
        onChangeText={setEmail}
        keyboardType='email-address'
        autoCapitalize='none'
        autoCorrect={false}
        style={{
          borderWidth: 1,
          borderColor: colors.primary,
          borderRadius: 8,
          padding: 12,
          fontFamily: fonts.body_regular,
        }}
      />
      {error && <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>}
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: colors.primary,
          padding: 12,
          marginTop: 16,
          borderRadius: 8,
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Text style={{ fontFamily: fonts.title_bold, color: colors.accent, textAlign: 'center', fontSize: 16 }}>
          {loading ? 'ログイン中……' : 'メールアドレスでログイン'}
        </Text>
      </TouchableOpacity>
      {loginMessage !== "" && (
        <Text style={{ color: 'green', marginTop: 8, fontFamily: fonts.body_regular, fontSize: 16 }}>{loginMessage}</Text>
      )}
    </View>
  )
}
