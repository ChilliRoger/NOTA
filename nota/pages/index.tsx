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
  const [showHelp, setShowHelp] = useState(false)

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
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1"></div>
          <h1 className="text-3xl font-bold text-blue-900">NOTA</h1>
          <div className="flex-1 flex justify-end">
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
              title="Help & Information"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-gray-600 mb-8">Host or vote in secure private elections.</p>          <div className="mb-8">
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
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block font-medium"
          >
            Login with Email
          </Link>
        </div>

        {/* Help Popup */}
        {showHelp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowHelp(false)}>
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-blue-900">How NOTA Works</h2>
                  <button onClick={() => setShowHelp(false)} className="text-gray-500 hover:text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4 text-left">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">🔐 4-Layer Security System</h3>
                    <p className="text-sm text-gray-600 mb-2">Every vote is protected by four independent verification layers:</p>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>✅ <strong>Email Verification</strong> - Verify your email address</li>
                      <li>✅ <strong>Device Fingerprinting</strong> - One vote per device</li>
                      <li>✅ <strong>IP Tracking</strong> - Maximum 3 votes per network</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">📱 For Voters</h3>
                    <ol className="text-sm space-y-1 text-gray-600 list-decimal list-inside">
                      <li>Create account with email & password</li>
                      <li>Verify your email (check inbox)</li>
                      <li>Vote in elections (one vote per person)</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">🗳️ For Hosts</h3>
                    <ol className="text-sm space-y-1 text-gray-600 list-decimal list-inside">
                      <li>Create your account</li>
                      <li>Click &quot;Host an Election&quot;</li>
                      <li>Add positions and candidates</li>
                      <li>Share election link with voters</li>
                      <li>Close election and view results</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">🔒 Privacy & Security</h3>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Votes are completely anonymous</li>
                      <li>• Email & phone numbers are hashed (SHA-256)</li>
                      <li>• No one can see who you voted for</li>
                      <li>• ~99% spam prevention effectiveness</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded p-4">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Pro Tip:</strong> Complete email and phone verification early to ensure you can vote when elections open.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => setShowHelp(false)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="text-center mb-6">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1"></div>
          <h1 className="text-3xl font-bold text-blue-900">NOTA</h1>
          <div className="flex-1 flex justify-end">
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
              title="Help & Information"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">Welcome, {user.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link href="/host" className="block p-6 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
          <div className="text-4xl mb-3 text-center">🗳️</div>
          <h3 className="font-semibold text-center mb-2">Host an Election</h3>
          <p className="text-sm text-gray-600 text-center">Create and manage your elections</p>
        </Link>

        <Link href="/vote" className="block p-6 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
          <div className="text-4xl mb-3 text-center">✅</div>
          <h3 className="font-semibold text-center mb-2">Vote in Election</h3>
          <p className="text-sm text-gray-600 text-center">Participate in ongoing elections</p>
        </Link>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <Link href="/my-elections" className="text-sm text-blue-600 hover:text-blue-800 underline">
          My Elections
        </Link>
        <button 
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-800 underline"
        >
          Logout
        </button>
      </div>

      {/* Help Popup */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowHelp(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-slate-800">How NOTA Works</h2>
                <button onClick={() => setShowHelp(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 text-left">
                <div>
                  <h3 className="font-semibold text-lg mb-2">🔐 3-Layer Security System</h3>
                  <p className="text-sm text-gray-600 mb-2">Every vote is protected by three independent verification layers:</p>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>✅ <strong>Email Verification</strong> - Verify your email address</li>
                    <li>✅ <strong>Device Fingerprinting</strong> - One vote per device</li>
                    <li>✅ <strong>IP Tracking</strong> - Maximum 3 votes per network</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">📱 For Voters</h3>
                  <ol className="text-sm space-y-1 text-gray-600 list-decimal list-inside">
                    <li>Create account with email & password</li>
                    <li>Verify your email (check inbox)</li>
                    <li>Vote in elections (one vote per person)</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">🗳️ For Hosts</h3>
                  <ol className="text-sm space-y-1 text-gray-600 list-decimal list-inside">
                    <li>Create your account</li>
                    <li>Click &quot;Host an Election&quot;</li>
                    <li>Add positions and candidates</li>
                    <li>Share election link with voters</li>
                    <li>Close election and view results</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">🔒 Privacy & Security</h3>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Votes are completely anonymous</li>
                    <li>• Email addresses are hashed (SHA-256)</li>
                    <li>• No one can see who you voted for</li>
                    <li>• ~95% spam prevention effectiveness</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Pro Tip:</strong> Verify your email early to ensure you can vote when elections open.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setShowHelp(false)}
                  className="px-6 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
