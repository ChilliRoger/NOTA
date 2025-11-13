import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { auth } from '../../lib/firebase'
import { User } from 'firebase/auth'

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
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
    })
    
    return () => unsubscribe()
  }, [id])

  async function handleSubmit(){
    if (!user) {
      router.push('/login')
      return
    }

    if (!election) return
    
    // Check all positions have selections
    const missingSelections = election.positions.some((_, idx) => selected[idx] === undefined)
    if (missingSelections) {
      setError('Please make a selection for all positions')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const voteData = election.positions.map((pos, idx) => ({
        position: pos.name,
        candidate: pos.candidates[selected[idx]]
      }))

      const response = await fetch('/api/submitVote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          electionId: id, 
          email: user.email,
          votes: voteData 
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Vote submitted successfully!')
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

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-gray-600">Loading election...</div>
        </div>
      </Layout>
    )
  }

  if (error && !election) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-red-600">{error}</div>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700"
          >
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
          <div className="text-2xl font-bold text-slate-800 mb-4">{election.title}</div>
          <div className="text-red-600 text-lg">This election is closed</div>
          <button 
            onClick={() => router.push('/')}
            className="mt-6 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700"
          >
            Back to Home
          </button>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-2xl font-bold text-slate-800 mb-4">{election.title}</div>
          <div className="text-gray-600 mb-6">Please login to vote in this election</div>
          <button 
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-slate-800 text-white rounded hover:bg-slate-700"
          >
            Login
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{election.title}</h1>
        <div className="text-sm text-gray-600 mb-4">
          ✓ Authenticated as: <span className="font-medium">{user.email}</span>
        </div>
      </div>

      {election.positions.map((position, posIdx) => (
        <div key={posIdx} className="mb-6">
          <h3 className="font-semibold text-lg mb-3">{position.name}</h3>
          <div className="space-y-2">
            {position.candidates.map((candidate, candIdx) => (
              <label
                key={candIdx}
                className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name={`position-${posIdx}`}
                  checked={selected[posIdx] === candIdx}
                  onChange={() => setSelected({ ...selected, [posIdx]: candIdx })}
                  className="mr-3"
                />
                <span>{candidate}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full px-4 py-3 bg-slate-800 text-white rounded hover:bg-slate-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? 'Submitting...' : 'Submit Vote'}
      </button>
    </Layout>
  )
}
