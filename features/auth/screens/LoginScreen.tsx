import React, { useEffect, useMemo, useState } from 'react'
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
import { OTP_RESEND_COOLDOWN_SECONDS, useLogin } from '../hooks/useLogin'
import { colors } from '../../../app/main/theme/colors'
import { fonts } from '../../../app/main/theme/fonts'
import textureImage from '../../../assets/texture.jpg'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const OTP_LENGTH = 6

type AuthStep = 'email' | 'otp'

function getOtpErrorMessage(error: string | null) {
  const normalizedError = error?.toLowerCase() ?? ''

  if (!normalizedError) {
    return '認証に失敗しました。もう一度お試しください。'
  }

  if (normalizedError.includes('expired')) {
    return '認証コードの有効期限が切れています。コードを再送してください。'
  }

  if (
    normalizedError.includes('invalid') ||
    normalizedError.includes('token') ||
    normalizedError.includes('otp')
  ) {
    return '認証コードが無効です。入力内容を確認して再度お試しください。'
  }

  if (normalizedError.includes('rate limit') || normalizedError.includes('security purposes')) {
    return '短時間に送信が集中しています。少し待ってから再度お試しください。'
  }

  return '認証に失敗しました。もう一度お試しください。'
}

function getRequestErrorMessage(error: string | null) {
  const normalizedError = error?.toLowerCase() ?? ''

  if (!normalizedError) {
    return 'コードの送信に失敗しました。時間をおいて再度お試しください。'
  }

  if (normalizedError.includes('rate limit') || normalizedError.includes('security purposes')) {
    return '短時間に送信が集中しています。少し待ってから再度お試しください。'
  }

  return 'コードの送信に失敗しました。時間をおいて再度お試しください。'
}

export default function LoginScreen() {
  const {
    requestEmailOtp,
    verifyEmailOtp,
    sending,
    verifying,
    loading,
    error,
    resendCooldownSeconds,
  } = useLogin()
  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [authError, setAuthError] = useState('')
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0)

  useEffect(() => {
    if (resendSecondsLeft <= 0) {
      return
    }

    const timerId = setInterval(() => {
      setResendSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timerId)
  }, [resendSecondsLeft])

  const maskedEmail = useMemo(() => {
    if (!email.includes('@')) {
      return email
    }

    const [localPart, domain] = email.split('@')
    if (localPart.length <= 2) {
      return `${localPart[0] ?? ''}***@${domain}`
    }

    return `${localPart.slice(0, 2)}***@${domain}`
  }, [email])

  const resetMessages = () => {
    if (feedbackMessage) {
      setFeedbackMessage('')
    }
    if (authError) {
      setAuthError('')
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    resetMessages()
  }

  const handleOtpChange = (value: string) => {
    setOtp(value.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH))
    resetMessages()
  }

  const startOtpStep = () => {
    setStep('otp')
    setOtp('')
    setResendSecondsLeft(OTP_RESEND_COOLDOWN_SECONDS)
  }

  const handleRequestOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase()

    resetMessages()

    if (!normalizedEmail) {
      setAuthError('メールアドレスを入力してください。')
      return
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setAuthError('メールアドレスの形式を確認してください。')
      return
    }

    const success = await requestEmailOtp(normalizedEmail)
    if (success) {
      setEmail(normalizedEmail)
      startOtpStep()
      setFeedbackMessage('認証コードを送付しました。メールに記載された6桁コードを入力してください。')
      return
    }

    console.error(error)
    setAuthError(getRequestErrorMessage(error))
  }

  const handleVerifyOtp = async () => {
    resetMessages()

    if (!otp) {
      setAuthError('認証コードを入力してください。')
      return
    }

    if (otp.length < OTP_LENGTH) {
      setAuthError('認証コードは6桁で入力してください。')
      return
    }

    const success = await verifyEmailOtp(email, otp)
    if (success) {
      setFeedbackMessage('認証に成功しました。ログインしています。')
      return
    }

    console.error(error)
    setAuthError(getOtpErrorMessage(error))
  }

  const handleResendOtp = async () => {
    if (resendSecondsLeft > 0 || sending) {
      return
    }

    resetMessages()

    const success = await requestEmailOtp(email)
    if (success) {
      setOtp('')
      setResendSecondsLeft(resendCooldownSeconds)
      setFeedbackMessage('認証コードを再送しました。最新のメールをご確認ください。')
      return
    }

    console.error(error)
    setAuthError(getRequestErrorMessage(error))
  }

  const handleEditEmail = () => {
    setStep('email')
    setOtp('')
    setResendSecondsLeft(0)
    resetMessages()
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
            <View
              className="mt-4 border-2 border-OCHER bg-DARK_BROWN px-5 py-6 ios:shadow-md android:elevation-md"
              style={{ borderRadius: 28 }}
            >
              <Text
                className="text-center text-OCHER"
                style={{ fontFamily: fonts.body, fontSize: 30 }}
              >
                旅の続きを始めましょう
              </Text>
              <Text
                className="mt-3 text-center text-OCHER"
                style={{ fontFamily: fonts.body_regular, fontSize: 14, lineHeight: 22 }}
              >
                {step === 'email'
                  ? 'メールアドレス宛に認証コードを送信します。'
                  : 'メールに届いた6桁コードを入力してログインします。'}
              </Text>

              <View className="mt-6 rounded-2xl border border-OCHER bg-BROWN px-4 py-4">
                <Text
                  className="text-OCHER"
                  style={{ fontFamily: fonts.body, fontSize: 16 }}
                >
                  {step === 'email' ? 'メールアドレス' : '認証コード'}
                </Text>

                {step === 'email' ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <Text
                      className="mt-3 text-OCHER"
                      style={{ fontFamily: fonts.body_regular, fontSize: 13, lineHeight: 20 }}
                    >
                      送信先: {maskedEmail}
                    </Text>
                    <TextInput
                      placeholder="123456"
                      placeholderTextColor={colors.LIGHT_BROWN}
                      value={otp}
                      onChangeText={handleOtpChange}
                      keyboardType="number-pad"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                      maxLength={OTP_LENGTH}
                      className="mt-3 rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-4 text-center text-OCHER"
                      style={{ fontFamily: fonts.body, fontSize: 24, letterSpacing: 6 }}
                    />
                    <Text
                      className="mt-3 text-OCHER"
                      style={{ fontFamily: fonts.body_regular, fontSize: 13, lineHeight: 20 }}
                    >
                      最新のコードのみ有効です。再送した場合は以前のコードを使わないでください。
                    </Text>
                  </>
                )}
              </View>

              {authError ? (
                <View className="mt-4 rounded-2xl border border-[#E9B4AF] bg-[#5A201D] px-4 py-3">
                  <Text
                    style={{ color: '#F7D7D2', fontFamily: fonts.body_regular, fontSize: 14, lineHeight: 22 }}
                  >
                    {authError}
                  </Text>
                </View>
              ) : null}

              {feedbackMessage ? (
                <View className="mt-4 rounded-2xl border border-OCHER bg-BROWN px-4 py-3">
                  <Text
                    className="text-OCHER"
                    style={{ fontFamily: fonts.body, fontSize: 14, lineHeight: 22 }}
                  >
                    {feedbackMessage}
                  </Text>
                </View>
              ) : null}

              {step === 'email' ? (
                <TouchableOpacity
                  onPress={handleRequestOtp}
                  disabled={loading}
                  className="mt-6 rounded-2xl border-2 border-OCHER bg-OCHER px-4 py-4"
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  <Text
                    className="text-center text-DARK_BROWN"
                    style={{ fontFamily: fonts.body, fontSize: 18 }}
                  >
                    {sending ? '送信中…' : '認証コードを送る'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={handleVerifyOtp}
                    disabled={loading}
                    className="mt-6 rounded-2xl border-2 border-OCHER bg-OCHER px-4 py-4"
                    style={{ opacity: loading ? 0.7 : 1 }}
                  >
                    <Text
                      className="text-center text-DARK_BROWN"
                      style={{ fontFamily: fonts.body, fontSize: 18 }}
                    >
                      {verifying ? '確認中…' : 'コードを確認してログイン'}
                    </Text>
                  </TouchableOpacity>

                  <View className="mt-4 flex-row items-center justify-between">
                    <TouchableOpacity onPress={handleEditEmail} disabled={loading}>
                      <Text
                        className="text-OCHER"
                        style={{ fontFamily: fonts.body_regular, fontSize: 14 }}
                      >
                        メールアドレスを修正
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleResendOtp}
                      disabled={loading || resendSecondsLeft > 0}
                      style={{ opacity: loading || resendSecondsLeft > 0 ? 0.5 : 1 }}
                    >
                      <Text
                        className="text-OCHER"
                        style={{ fontFamily: fonts.body_regular, fontSize: 14 }}
                      >
                        {resendSecondsLeft > 0
                          ? `${resendSecondsLeft}秒後に再送`
                          : 'コードを再送'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  )
}
