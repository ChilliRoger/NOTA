import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import FormField from '../components/FormField'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'

export default function Login(){
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    import('../lib/firebase').then(({ auth }) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          router.push('/')
        }
      })
      return () => unsubscribe()
    })
  }, [router, mounted])

  async function handleAuth(){
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const { auth } = await import('../lib/firebase')
      
      if (isSignUp) {
        // Sign up new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        
        try {
          // Send verification email
          await sendEmailVerification(userCredential.user)
          alert('✓ Account created!\n\nVerification email sent to: ' + email + '\n\nPlease check:\n• Your inbox\n• Spam/Junk folder\n• Promotions tab (Gmail)\n\nIf you don\'t see it, you can resend from the voting page.')
        } catch (emailError) {
          console.error('Email verification error:', emailError)
          alert('⚠️ Account created, but verification email failed to send.\n\nYou can try resending from the voting page.\n\nError: ' + (emailError instanceof Error ? emailError.message : 'Unknown error'))
        }
        
        setIsSignUp(false) // Switch to login mode
        setEmail('')
        setPassword('')
      } else {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, email, password)
        router.push('/')
      }
    } catch (err) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      
      // User-friendly error messages
      if (errorMessage.includes('email-already-in-use')) {
        setError('Email already in use. Try logging in instead.')
      } else if (errorMessage.includes('user-not-found')) {
        setError('No account found. Try signing up instead.')
      } else if (errorMessage.includes('wrong-password')) {
        setError('Incorrect password. Please try again.')
      } else if (errorMessage.includes('invalid-email')) {
        setError('Invalid email address.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="mb-4">
        <button onClick={() => router.push('/')} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
          <span>←</span> <span>Back to Home</span>
        </button>
      </div>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">NOTA</h1>
        <p className="text-sm text-gray-600">
          {isSignUp ? 'Create an account' : 'Login to host or vote in elections'}
        </p>
      </div>

      <FormField label="Email">
        <input 
          type="email"
          value={email} 
          onChange={e=>setEmail(e.target.value)} 
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-slate-800"
          placeholder="your@email.com"
          disabled={loading}
        />
      </FormField>

      <FormField label="Password">
        <input 
          type="password"
          value={password} 
          onChange={e=>setPassword(e.target.value)} 
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-slate-800"
          placeholder="••••••••"
          disabled={loading}
        />
      </FormField>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <button 
        onClick={handleAuth} 
        disabled={loading}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mb-3 font-medium"
      >
        {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Login')}
      </button>

      <button 
        onClick={() => setIsSignUp(!isSignUp)} 
        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
      >
        {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
      </button>

      <div className="mt-6 text-center text-xs text-gray-500">
        <p>By continuing, you agree to our Terms of Service</p>
        <p className="mt-2 text-yellow-600">
          📧 Using email/password auth.
        </p>
      </div>
    </Layout>
  )
}
