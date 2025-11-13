import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import FormField from '../components/FormField'
import { auth } from '../lib/firebase'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

export default function Login(){
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [confirmationResult, setConfirmationResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/')
      }
    })
    return () => unsubscribe()
  }, [router])

  function setupRecaptcha(){
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        }
      })
    }
  }

  async function sendOtp(){
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      setupRecaptcha()
      const appVerifier = (window as any).recaptchaVerifier
      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier)
      setConfirmationResult(confirmation)
      setError('')
      alert('OTP sent to your phone!')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to send OTP. Please try again.')
      // Reset reCAPTCHA on error
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear()
        ;(window as any).recaptchaVerifier = null
      }
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(){
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    setError('')

    try {
      await confirmationResult.confirm(otp)
      // User is now signed in, redirect to home
      router.push('/')
    } catch (err: any) {
      console.error(err)
      setError('Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div id="recaptcha-container"></div>
      
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">NOTA</h1>
        <p className="text-sm text-gray-600">Login to host or vote in elections</p>
      </div>

      {!confirmationResult ? (
        <>
          <FormField label="Phone Number (with country code, e.g., +919876543210)">
            <input 
              type="tel"
              value={phone} 
              onChange={e=>setPhone(e.target.value)} 
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-slate-800"
              placeholder="+919876543210"
              disabled={loading}
            />
          </FormField>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <button 
            onClick={sendOtp} 
            disabled={loading}
            className="w-full px-4 py-3 bg-slate-800 text-white rounded hover:bg-slate-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </>
      ) : (
        <>
          <FormField label="Enter 6-digit OTP">
            <input 
              type="text"
              maxLength={6}
              value={otp} 
              onChange={e=>setOtp(e.target.value.replace(/\D/g, ''))} 
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-slate-800 text-center text-2xl tracking-widest"
              placeholder="000000"
              disabled={loading}
            />
          </FormField>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <button 
            onClick={verifyOtp} 
            disabled={loading}
            className="w-full px-4 py-3 bg-slate-800 text-white rounded hover:bg-slate-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mb-3"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button 
            onClick={() => {
              setConfirmationResult(null)
              setOtp('')
              setError('')
            }} 
            className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
          >
            Change Phone Number
          </button>
        </>
      )}

      <div className="mt-6 text-center text-xs text-gray-500">
        <p>By logging in, you agree to our Terms of Service</p>
      </div>
    </Layout>
  )
}
