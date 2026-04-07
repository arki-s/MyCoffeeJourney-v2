import React, { useState } from 'react'
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useLogin } from '../hooks/useLogin'
import { colors } from '../../../app/main/theme/colors'
import { fonts } from '../../../app/main/theme/fonts'
import textureImage from '../../../assets/texture.jpg'

export default function LoginScreen() {
  const { loginWithEmail, loading, error } = useLogin()
  const [email, setEmail] = useState('')
  const [loginMessage, setLoginMessage] = useState('')
  const [loginError, setLoginError] = useState('')

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (loginMessage) {
      setLoginMessage('')
    }
    if (loginError) {
      setLoginError('')
    }
  }

  const handleLogin = async () => {
    const normalizedEmail = email.trim()
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)

    setLoginMessage('')
    setLoginError('')

    if (!normalizedEmail) {
      setLoginError('メールアドレスを入力してください。')
      return
    }

    if (!isValidEmail) {
      setLoginError('メールアドレスの形式を確認してください。')
      return
    }

    const success = await loginWithEmail(normalizedEmail)
    if (success) {
      setEmail(normalizedEmail)
      setLoginMessage('ログインリンクを送付しました。メールを確認してログインしてください。')
      return
    }

    console.error(error)
    setLoginError('ログインに失敗しました。メールアドレスを確認して再度お試しください。')
  }

  return (
    <ImageBackground
      source={textureImage}
      style={{ flex: 1 }}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-5 py-6">

            <View className="mt-4 rounded-[28px] border-2 border-OCHER bg-DARK_BROWN px-5 py-6 ios:shadow-md android:elevation-md">
              <Text
                className="mt-3 text-center text-OCHER"
                style={{ fontFamily: fonts.body, fontSize: 30 }}
              >
                旅の続きを始めましょう
              </Text>

              <View className="mt-6 rounded-2xl border border-OCHER bg-BROWN px-4 py-4">
                <Text
                  className="text-OCHER"
                  style={{ fontFamily: fonts.body, fontSize: 16 }}
                >
                  メールアドレス
                </Text>
                <TextInput
                  placeholder="you@example.com"
                  placeholderTextColor={colors.LIGHT_BROWN}
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  className="mt-3 rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-4 text-OCHER"
                  style={{ fontFamily: fonts.body_regular, fontSize: 16 }}
                />
                <Text
                  className="mt-3 text-OCHER"
                  style={{ fontFamily: fonts.body_regular, fontSize: 13, lineHeight: 20 }}
                >
                  初回ログインでもそのまま始められます。
                </Text>
              </View>

              {loginError ? (
                <View className="mt-4 rounded-2xl border border-[#E9B4AF] bg-[#5A201D] px-4 py-3">
                  <Text
                    style={{ color: '#F7D7D2', fontFamily: fonts.body_regular, fontSize: 14, lineHeight: 22 }}
                  >
                    {loginError}
                  </Text>
                </View>
              ) : null}

              {loginMessage ? (
                <View className="mt-4 rounded-2xl border border-OCHER bg-BROWN px-4 py-3">
                  <Text
                    className="text-OCHER"
                    style={{ fontFamily: fonts.body, fontSize: 14, lineHeight: 22 }}
                  >
                    {loginMessage}
                  </Text>
                </View>
              ) : null}

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                className="mt-6 rounded-2xl border-2 border-OCHER bg-OCHER px-4 py-4"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                <Text
                  className="text-center text-DARK_BROWN"
                  style={{ fontFamily: fonts.body, fontSize: 18 }}
                >
                  {loading ? '送信中…' : 'ログインリンクを送る'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  )
}
