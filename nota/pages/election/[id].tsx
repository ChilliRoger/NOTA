import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import FormField from '../../components/FormField'
import { auth } from '../../lib/firebase'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

type Position = { name: string; candidates: string[] }

export default function ElectionPage(){
  const router = useRouter()
  const { id } = router.query
  const [election, setElection] = useState<{ title: string; positions: Position[]; closed: boolean } | null>(null)
  const [user, setUser] = useState<any>(null)
  const [otpPhone, setOtpPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [confirmationResult, setConfirmationResult] = useState<any>(null)
  const [selected, setSelected] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

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

    // Check if user is already logged in
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        setOtpPhone(currentUser.phoneNumber || '')
      }
    })
    
    return () => unsubscribe()
  },[id])

  function setupRecaptcha(){
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 
        size: 'invisible' 
      })
    }
  }

  async function sendOtp(){
    if (!otpPhone || otpPhone.length < 10) {
      setError('Please enter a valid phone number')
      return
    }

    setError('')
    setLoading(true)
    
    try {
      setupRecaptcha()
      const appVerifier = (window as any).recaptchaVerifier
      const confirmation = await signInWithPhoneNumber(auth, otpPhone, appVerifier)
      setConfirmationResult(confirmation)
      alert('OTP sent to your phone!')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to send OTP')
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
      const result = await confirmationResult.confirm(otp)
      setUser(result.user)
      setConfirmationResult(null)
      setOtp('')
    } catch (err: any) {
      console.error(err)
      setError('Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function submitVote(){
    if (!id || !user) return

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
      const response = await fetch('/api/submitVote', { 
        method: 'POST', 
        headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify({ 
          id, 
          votes: selected,
          phoneNumber: user.phoneNumber 
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
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-slate-800 text-white rounded">
            Back to Home
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div id="recaptcha-container"></div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">{election.title}</h2>
        <p className="text-sm text-gray-600">Cast your vote securely</p>
      </div>

      {!user ? (
        <>
          {!confirmationResult ? (
            <>
              <FormField label="Phone Number (with country code, e.g., +919876543210)">
                <input 
                  type="tel"
                  value={otpPhone} 
                  onChange={e=>setOtpPhone(e.target.value)} 
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
                  autoFocus
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
        </>
      ) : (
        <div>
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            <div className="text-sm text-green-800">
              ✓ Authenticated as: <span className="font-medium">{user.phoneNumber}</span>
            </div>
          </div>

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
            disabled={submitting || Object.keys(selected).length === 0}
            className="w-full px-4 py-3 bg-slate-800 text-white rounded hover:bg-slate-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {submitting ? 'Submitting...' : 'Submit Vote'}
          </button>

          <div className="mt-4 text-center text-xs text-gray-500">
            <p>Your vote is anonymous and cannot be changed once submitted</p>
          </div>
        </div>
      )}
    </Layout>
  )
}
