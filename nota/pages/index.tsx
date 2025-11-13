import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../components/Layout'
import type { User } from 'firebase/auth'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Dynamic import to avoid SSR issues
    let unsubscribe: (() => void) | undefined

    import('../lib/firebase')
      .then(({ auth }) => {
        unsubscribe = auth.onAuthStateChanged((currentUser) => {
          setUser(currentUser)
          setLoading(false)
        })
      })
      .catch(err => {
        console.error('Firebase init error:', err)
        setLoading(false)
      })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [mounted])

  async function handleLogout() {
    try {
      const { auth } = await import('../lib/firebase')
      await auth.signOut()
      router.push('/login')
    } catch (err) {
      console.error(err)
      router.push('/login')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return (
      <Layout>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-3">NOTA</h1>
          <p className="text-gray-600 mb-8">Host or vote in private elections using mobile OTP.</p>
          
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-6 border rounded-lg">
                <div className="text-4xl mb-3">🗳️</div>
                <h3 className="font-semibold mb-2">Host Elections</h3>
                <p className="text-sm text-gray-600">Create private elections and share with voters</p>
              </div>
              <div className="p-6 border rounded-lg">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="font-semibold mb-2">Vote Securely</h3>
                <p className="text-sm text-gray-600">Cast your vote using phone verification</p>
              </div>
            </div>
          </div>

          <Link 
            href="/login" 
            className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors inline-block"
          >
            Login with Email
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">NOTA</h1>
        <p className="text-sm text-gray-600 mb-4">Welcome, {user.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link href="/host" className="block p-6 border-2 border-slate-800 rounded-lg hover:bg-slate-50 transition-colors">
          <div className="text-4xl mb-3 text-center">🗳️</div>
          <h3 className="font-semibold text-center mb-2">Host an Election</h3>
          <p className="text-sm text-gray-600 text-center">Create and manage your elections</p>
        </Link>

        <Link href="/vote" className="block p-6 border-2 border-slate-800 rounded-lg hover:bg-slate-50 transition-colors">
          <div className="text-4xl mb-3 text-center">✅</div>
          <h3 className="font-semibold text-center mb-2">Vote in Election</h3>
          <p className="text-sm text-gray-600 text-center">Participate in ongoing elections</p>
        </Link>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <Link href="/my-elections" className="text-sm text-slate-600 hover:text-slate-800 underline">
          My Elections
        </Link>
        <button 
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-800 underline"
        >
          Logout
        </button>
      </div>
    </Layout>
  )
}
