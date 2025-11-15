import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import type { User } from 'firebase/auth'
import { getStoredDeviceFingerprint } from '../../utils/deviceFingerprint'

type Position = { name: string; candidates: string[] }

export default function ElectionPage(){
  const router = useRouter()
  const { id } = router.query
  const [election, setElection] = useState<{ title: string; positions: Position[]; closed: boolean } | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [selected, setSelected] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [resendingEmail, setResendingEmail] = useState(false)
  const [showDevBypass, setShowDevBypass] = useState(false)

  useEffect(()=>{
    if (!id) return
    
    // Fetch election data
    fetch(`/api/getResults?id=${id}`)
      .then(r=>r.json())
      .then(data=>{
        if (data.election) {
          setElection(data.election)
        } else {
          setError('Election not found')
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('Failed to load election')
        setLoading(false)
      })

    // Check if user is logged in
    import('../../lib/firebase').then(({ auth }) => {
      const unsubscribe = auth.onAuthStateChanged((currentUser) => {
        setUser(currentUser)
      })
      return () => unsubscribe()
    })
  },[id])

  async function resendVerificationEmail() {
    if (!user) return
    
    setResendingEmail(true)
    setError('')
    
    try {
      const { sendEmailVerification } = await import('firebase/auth')
      await sendEmailVerification(user)
      alert('✓ Verification email sent!\n\nPlease check:\n• Your inbox: ' + user.email + '\n• Spam/Junk folder\n• Promotions tab (Gmail)\n\nStill not receiving emails? Check Firebase Console:\n1. Authentication → Settings → Templates\n2. Verify email template is enabled')
    } catch (err) {
      console.error('Resend error:', err)
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      alert('❌ Failed to send verification email.\n\nError: ' + errorMsg + '\n\n💡 Troubleshooting:\n1. Check Firebase Console → Authentication\n2. Verify Email/Password provider is enabled\n3. Check Firebase project settings')
      setError('Failed to send verification email. Error: ' + errorMsg)
      setShowDevBypass(true)
    } finally {
      setResendingEmail(false)
    }
  }

  async function submitVote(){
    if (!id || !user || !user.email) {
      setError('Please login to submit your vote')
      return
    }

    // Check if email is verified
    if (!user.emailVerified) {
      setError('Please verify your email before voting. Check your inbox for the verification link.')
      return
    }

    // Check if all positions have been voted for
    const unvotedPositions = election?.positions.filter((_, i) => selected[i] === undefined)
    if (unvotedPositions && unvotedPositions.length > 0) {
      const confirm = window.confirm(
        `You haven't voted for ${unvotedPositions.length} position(s). Submit anyway?`
      )
      if (!confirm) return
    }

    setSubmitting(true)
    setError('')

    try {
      // Get device fingerprint
      const deviceFingerprint = getStoredDeviceFingerprint()

      const response = await fetch('/api/submitVote', { 
        method: 'POST', 
        headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify({ 
          id, 
          votes: selected,
          email: user.email,
          deviceFingerprint
        }) 
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert('✓ Your vote has been submitted successfully!')
        router.push('/')
      } else {
        setError(data.error || 'Failed to submit vote')
      }
    } catch (err) {
      console.error(err)
      setError('Failed to submit vote. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !election) {
    return (
      <Layout>
        <div className="text-center py-12">Loading election...</div>
      </Layout>
    )
  }

  if (error && !election) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-slate-800 text-white rounded">
            Back to Home
          </button>
        </div>
      </Layout>
    )
  }

  if (!election) return null

  if (election.closed) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-semibold mb-2">Election Closed</h2>
          <p className="text-gray-600 mb-6">This election is no longer accepting votes.</p>
          <button onClick={() => router.push('/')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Back to Home
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-4">
        <button onClick={() => router.push('/')} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
          <span>←</span> <span>Back to Home</span>
        </button>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-blue-900">{election.title}</h2>
        <p className="text-sm text-gray-600">Cast your vote securely</p>
      </div>

      {!user ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold mb-2">Login Required</h3>
          <p className="text-gray-600 mb-6">You need to be logged in to vote in this election.</p>
          <button 
            onClick={() => router.push('/login')} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Login
          </button>
        </div>
      ) : (
        <div>
          {!user.emailVerified ? (
            <div className="mb-6 p-6 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 mb-2">Email Verification Required</h3>
                  <p className="text-sm text-yellow-800 mb-3">
                    You must verify your email address before you can vote.
                  </p>
                  <p className="text-sm text-yellow-800 mb-3">
                    <strong>Logged in as:</strong> {user.email}
                  </p>
                  <div className="text-xs text-yellow-700 mb-3 p-2 bg-yellow-100 rounded">
                    <strong>📧 Not receiving emails?</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Check spam/junk folder</li>
                      <li>Check promotions tab (Gmail)</li>
                      <li>Add noreply@nota-voting.firebaseapp.com to contacts</li>
                      <li>Wait 2-3 minutes for delivery</li>
                    </ul>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={resendVerificationEmail}
                      disabled={resendingEmail}
                      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-yellow-400 transition-colors text-sm font-medium"
                    >
                      {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 border border-yellow-600 text-yellow-700 rounded hover:bg-yellow-100 transition-colors text-sm font-medium"
                    >
                      I&apos;ve Verified - Refresh
                    </button>
                    {(showDevBypass || process.env.NODE_ENV === 'development') && (
                      <button
                        onClick={() => {
                          if (window.confirm('⚠️ DEVELOPMENT ONLY\n\nThis will allow you to vote WITHOUT email verification.\n\nOnly use this for testing!\n\nProceed?')) {
                            // Temporarily override email verification check
                            Object.defineProperty(user, 'emailVerified', { value: true, writable: false })
                            window.location.reload()
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        🔧 DEV: Skip Verification
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
              <div className="text-sm text-green-800">
                ✓ Authenticated as: <span className="font-medium">{user.email}</span>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Select Your Candidates</h3>
            
            {election.positions.map((pos, pi) => (
              <div key={pi} className="mb-6 p-4 border border-gray-300 rounded-lg">
                <div className="font-semibold mb-3 text-slate-800">{pos.name}</div>
                <div className="space-y-2">
                  {pos.candidates.map((c, ci) => (
                    <label 
                      key={ci} 
                      className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${
                        selected[pi]===ci 
                          ? 'border-slate-800 bg-slate-50' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name={`pos-${pi}`} 
                        checked={selected[pi]===ci} 
                        onChange={()=>setSelected({...selected, [pi]: ci})}
                        className="w-4 h-4"
                      />
                      <span className="flex-1">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <button 
            onClick={submitVote} 
            disabled={submitting || !user.emailVerified || Object.keys(selected).length === 0}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
          >
            {!user.emailVerified ? 'Verify Email to Vote' : submitting ? 'Submitting...' : 'Submit Vote'}
          </button>

          <div className="mt-4 text-center text-xs text-gray-500">
            <p>Your vote is anonymous and cannot be changed once submitted</p>
          </div>
        </div>
      )}
    </Layout>
  )
}
