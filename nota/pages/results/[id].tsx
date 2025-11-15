import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { auth } from '../../lib/firebase'
import type { User } from 'firebase/auth'

type Position = { name: string; candidates: string[] }
type VoteCount = Record<number, Record<number, number>>

export default function ResultsPage() {
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState<User | null>(null)
  const [election, setElection] = useState<{ title: string; positions: Position[]; closed: boolean; host_email: string } | null>(null)
  const [voteCounts, setVoteCounts] = useState<VoteCount>({})
  const [totalVotes, setTotalVotes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!id) return
    
    async function loadElectionResults() {
      try {
        // Get election details
        const electionRes = await fetch(`/api/getElectionWithHost?id=${id}`)
        const electionData = await electionRes.json()

        if (!electionRes.ok) {
          setError(electionData.error || 'Election not found')
          setLoading(false)
          return
        }

        setElection(electionData.election)

        // Get vote counts
        const votesRes = await fetch(`/api/getVoteCounts?id=${id}`)
        const votesData = await votesRes.json()

        if (votesRes.ok) {
          setVoteCounts(votesData.voteCounts || {})
          setTotalVotes(votesData.totalVotes || 0)
        }

        setLoading(false)
      } catch (err) {
        console.error(err)
        setError('Failed to load results')
        setLoading(false)
      }
    }

    loadElectionResults()
  }, [id])

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading results...</div>
      </Layout>
    )
  }

  if (error || !election) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error || 'Election not found'}</div>
          <button onClick={() => router.push('/my-elections')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Back to My Elections
          </button>
        </div>
      </Layout>
    )
  }

  // Check if user is the host
  const isHost = user?.email === election.host_email

  return (
    <Layout>
      <div className="mb-6">
        <button onClick={() => router.push('/my-elections')} className="text-sm text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1">
          <span>←</span> <span>Back to My Elections</span>
        </button>
        <h1 className="text-2xl font-bold mb-2 text-blue-900">{election.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            📊 <strong>{totalVotes}</strong> {totalVotes === 1 ? 'vote' : 'votes'} cast
          </span>
          {election.closed ? (
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs">Closed</span>
          ) : (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
          )}
        </div>
      </div>

      {!isHost && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <div className="text-sm text-yellow-800">
            ⚠️ You are not the host of this election. Results may be restricted.
          </div>
        </div>
      )}

      {totalVotes === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-600 mb-2">No votes have been cast yet</p>
          <p className="text-sm text-gray-500">Results will appear here once voting begins</p>
        </div>
      ) : (
        <div className="space-y-8">
          {election.positions.map((position, posIdx) => {
            const positionVotes = voteCounts[posIdx] || {}
            const positionTotal = Object.values(positionVotes).reduce((sum, count) => sum + count, 0)

            return (
              <div key={posIdx} className="border border-gray-300 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-slate-800">{position.name}</h3>
                
                <div className="mb-4 text-sm text-gray-600">
                  Total votes for this position: <strong>{positionTotal}</strong>
                </div>

                <div className="space-y-3">
                  {position.candidates.map((candidate, candIdx) => {
                    const votes = positionVotes[candIdx] || 0
                    const percentage = positionTotal > 0 ? (votes / positionTotal) * 100 : 0
                    const maxVotes = Math.max(...Object.values(positionVotes), 1)
                    const barWidth = maxVotes > 0 ? (votes / maxVotes) * 100 : 0

                    return (
                      <div key={candIdx} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium text-slate-700">{candidate}</span>
                          <span className="text-gray-600">
                            {votes} {votes === 1 ? 'vote' : 'votes'} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        
                        {/* Bar Graph */}
                        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                            style={{ width: `${barWidth}%` }}
                          >
                            {votes > 0 && (
                              <span className="text-xs text-white font-semibold">
                                {votes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Winner Badge */}
                {positionTotal > 0 && (() => {
                  const maxVotes = Math.max(...Object.values(positionVotes))
                  const winners = position.candidates.filter((_, idx) => positionVotes[idx] === maxVotes)
                  
                  if (winners.length === 1) {
                    const winnerIdx = position.candidates.findIndex((_, idx) => positionVotes[idx] === maxVotes)
                    return (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded flex items-center gap-2">
                        <span className="text-2xl">🏆</span>
                        <div className="text-sm">
                          <span className="font-semibold text-green-800">{position.candidates[winnerIdx]}</span>
                          <span className="text-green-700"> is leading with {maxVotes} {maxVotes === 1 ? 'vote' : 'votes'}</span>
                        </div>
                      </div>
                    )
                  } else if (winners.length > 1) {
                    return (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-center gap-2">
                        <span className="text-2xl">🤝</span>
                        <div className="text-sm text-yellow-800">
                          <span className="font-semibold">Tie: </span>
                          {winners.join(', ')} ({maxVotes} {maxVotes === 1 ? 'vote' : 'votes'} each)
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}
              </div>
            )
          })}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => router.push(`/election/${id}`)}
          className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          View Voting Page
        </button>
        
        {isHost && election.closed && totalVotes > 0 && (
          <button
            onClick={async () => {
              try {
                const response = await fetch(`/api/getElectionResults?id=${id}`)
                const data = await response.json()
                if (response.ok && data.results) {
                  const { downloadResultsAsXLSX } = await import('../../utils/excel')
                  downloadResultsAsXLSX(`${election.title.replace(/[^a-z0-9]/gi, '_')}_results.xlsx`, data.results)
                  alert('Results downloaded successfully!')
                } else {
                  alert('Failed to download results')
                }
              } catch (err) {
                console.error(err)
                alert('Failed to download results')
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            📥 Download Excel Report
          </button>
        )}
      </div>
    </Layout>
  )
}
