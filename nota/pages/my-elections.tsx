import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { auth } from '../lib/firebase'
import { downloadResultsAsXLSX } from '../utils/excel'
import type { User } from 'firebase/auth'

type Election = {
  id: string
  title: string
  closed: boolean
  created_at: string
  voteCount: number
}

export default function MyElections(){
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)
  const [closingId, setClosingId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push('/login')
      } else {
        setUser(currentUser)
        if (currentUser.email) {
          loadElections(currentUser.email)
        }
      }
    })
    return () => unsubscribe()
  }, [router])

  async function loadElections(email: string) {
    try {
      const response = await fetch(`/api/getMyElections?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      if (response.ok) {
        setElections(data.elections || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function closeElection(electionId: string) {
    const confirm = window.confirm(
      'Are you sure you want to close this election? This action cannot be undone and voting will be disabled.'
    )
    
    if (!confirm) return

    setClosingId(electionId)

    try {
      const response = await fetch('/api/closeElection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: electionId })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Election closed successfully!')
        // Refresh elections list
        if (user?.email) {
          loadElections(user.email)
        }
      } else {
        alert('Failed to close election: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      console.error(err)
      alert('Failed to close election. Please try again.')
    } finally {
      setClosingId(null)
    }
  }

  async function downloadResults(electionId: string, title: string) {
    try {
      const response = await fetch(`/api/getElectionResults?id=${electionId}`)
      const data = await response.json()

      if (response.ok && data.results) {
        downloadResultsAsXLSX(`${title.replace(/[^a-z0-9]/gi, '_')}_results.xlsx`, data.results)
        alert('Results downloaded successfully!')
      } else {
        alert('Failed to download results: ' + (data.error || 'No results available'))
      }
    } catch (err) {
      console.error(err)
      alert('Failed to download results. Please try again.')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading your elections...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-6">
        <button onClick={() => router.push('/')} className="text-sm text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1">
          <span>←</span> <span>Back to Home</span>
        </button>
        <h1 className="text-2xl font-bold text-blue-900">My Elections</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your hosted elections</p>
      </div>

      {elections.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-600 mb-4">You haven&apos;t created any elections yet</p>
          <button
            onClick={() => router.push('/host')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Your First Election
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {elections.map((election) => (
            <div key={election.id} className="border-2 border-gray-300 rounded-lg p-5 hover:border-blue-400 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{election.title}</h3>
                  <p className="text-sm text-gray-600">
                    Created: {new Date(election.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Votes: {election.voteCount}
                  </p>
                </div>
                <div>
                  {election.closed ? (
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                      Closed
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      Active
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <input 
                    type="text" 
                    value={`${(process.env.NEXT_PUBLIC_APP_BASE_URL || '').trim()}/election/${election.id}`}
                    readOnly 
                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg bg-white font-mono"
                    onClick={(e) => e.currentTarget.select()}
                  />
                </div>
                <button
                  onClick={() => {
                    const baseUrl = (process.env.NEXT_PUBLIC_APP_BASE_URL || '').trim()
                    const link = `${baseUrl}/election/${election.id}`
                    navigator.clipboard.writeText(link).then(() => {
                      const copied = document.createElement('div')
                      copied.textContent = '✓ Copied!'
                      copied.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'
                      document.body.appendChild(copied)
                      setTimeout(() => copied.remove(), 2000)
                    })
                  }}
                  className="px-3 py-2 text-sm border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex-shrink-0"
                >
                  📋 Copy
                </button>

                <button
                  onClick={() => router.push(`/results/${election.id}`)}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  📊 View Results
                </button>

                {!election.closed && (
                  <button
                    onClick={() => closeElection(election.id)}
                    disabled={closingId === election.id}
                    className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {closingId === election.id ? 'Closing...' : 'Close Election'}
                  </button>
                )}

                {election.closed && (
                  <button
                    onClick={() => downloadResults(election.id, election.title)}
                    className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    📥 Download Excel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
