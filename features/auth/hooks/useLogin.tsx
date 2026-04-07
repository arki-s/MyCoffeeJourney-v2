import { useCallback, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export const OTP_RESEND_COOLDOWN_SECONDS = 30

export const useLogin = () => {
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestEmailOtp = useCallback(async (email: string) => {
    setSending(true)
    setError(null)

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    })

    setSending(false)

    if (otpError) {
      setError(otpError.message)
      return false
    }

    return true
  }, [])

  const verifyEmailOtp = useCallback(async (email: string, token: string) => {
    setVerifying(true)
    setError(null)

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })

    setVerifying(false)

    if (verifyError) {
      setError(verifyError.message)
      return false
    }

    return true
  }, [])

  return {
    requestEmailOtp,
    verifyEmailOtp,
    sending,
    verifying,
    loading: sending || verifying,
    error,
    resendCooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
  }
}
