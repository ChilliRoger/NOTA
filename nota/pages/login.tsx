import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import FormField from '../components/FormField'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'

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
        await createUserWithEmailAndPassword(auth, email, password)
        alert('Account created successfully!')
      } else {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, email, password)
      }
      
      router.push('/')
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
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">NOTA</h1>
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
        className="w-full px-4 py-3 bg-slate-800 text-white rounded hover:bg-slate-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mb-3"
      >
        {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Login')}
      </button>

      <button 
        onClick={() => setIsSignUp(!isSignUp)} 
        className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
      >
        {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
      </button>

      <div className="mt-6 text-center text-xs text-gray-500">
        <p>By continuing, you agree to our Terms of Service</p>
        <p className="mt-2 text-yellow-600">
          📧 Using email/password auth (no billing required)
        </p>
      </div>
    </Layout>
  )
}
