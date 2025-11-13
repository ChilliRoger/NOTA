import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import FormField from '../components/FormField'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '../lib/firebase'

export default function Host(){
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [positions, setPositions] = useState([{ name: '', candidates: [''] }])
  const [link, setLink] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push('/login')
      } else {
        setUser(currentUser)
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [router])
  
  function addPosition(){
    setPositions([...positions, { name: '', candidates: [''] }])
  }
  
  function addCandidate(posIdx: number){
    const copy = [...positions]
    copy[posIdx].candidates.push('')
    setPositions(copy)
  }
  
  async function handleCreate(){
    if (!title.trim()) {
      alert('Please enter an election title')
      return
    }

    // Validate positions
    for (let i = 0; i < positions.length; i++) {
      if (!positions[i].name.trim()) {
        alert(`Please enter a name for Position ${i + 1}`)
        return
      }
      const validCandidates = positions[i].candidates.filter(c => c.trim())
      if (validCandidates.length < 1) {
        alert(`Please add at least one candidate for ${positions[i].name}`)
        return
      }
    }

    setCreating(true)
    const id = uuidv4()
    
    try {
      const response = await fetch('/api/createElection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          title, 
          positions: positions.map(p => ({
            ...p,
            candidates: p.candidates.filter(c => c.trim()) // Remove empty candidates
          })),
          createdBy: user?.phoneNumber 
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setLink(`${process.env.NEXT_PUBLIC_APP_BASE_URL}/election/${id}`)
      } else {
        alert('Failed to create election: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      console.error(err)
      alert('Failed to create election. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-4">
        <button onClick={() => router.push('/')} className="text-sm text-slate-600 hover:text-slate-800">
          ← Back to Home
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-6 text-center">Host an Election</h2>
      
      <FormField label="Election Title">
        <input 
          value={title} 
          onChange={e=>setTitle(e.target.value)} 
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-slate-800"
          placeholder="e.g., Student Council Election 2025"
        />
      </FormField>

      <div className="mb-4">
        <h3 className="text-lg font-medium mb-3">Positions & Candidates</h3>
        
        {positions.map((pos, pi) => (
          <div key={pi} className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
            <FormField label={`Position ${pi+1} Name`}>
              <input 
                value={pos.name} 
                onChange={e=>{
                  const copy = [...positions]
                  copy[pi].name = e.target.value
                  setPositions(copy)
                }} 
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-slate-800" 
                placeholder="e.g., President"
              />
            </FormField>

            <div>
              <div className="text-sm font-medium mb-2">Candidates</div>
              {pos.candidates.map((c, ci) => (
                <div key={ci} className="flex gap-2 mb-2">
                  <input 
                    value={c} 
                    onChange={e=>{
                      const copy = [...positions]
                      copy[pi].candidates[ci] = e.target.value
                      setPositions(copy)
                    }} 
                    placeholder={`Candidate ${ci+1}`} 
                    className="flex-1 border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-slate-800" 
                  />
                  {pos.candidates.length > 1 && (
                    <button
                      onClick={() => {
                        const copy = [...positions]
                        copy[pi].candidates.splice(ci, 1)
                        setPositions(copy)
                      }}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button 
                onClick={()=>addCandidate(pi)} 
                className="text-sm text-slate-600 hover:text-slate-800 underline"
              >
                + Add candidate
              </button>
            </div>

            {positions.length > 1 && (
              <button
                onClick={() => {
                  const copy = positions.filter((_, i) => i !== pi)
                  setPositions(copy)
                }}
                className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
              >
                Remove this position
              </button>
            )}
          </div>
        ))}

        <button 
          onClick={addPosition} 
          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded hover:border-slate-800 hover:bg-slate-50 transition-colors"
        >
          + Add Position
        </button>
      </div>

      <button 
        onClick={handleCreate} 
        disabled={creating}
        className="w-full px-4 py-3 bg-slate-800 text-white rounded hover:bg-slate-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {creating ? 'Creating...' : 'Create Election'}
      </button>

      {link && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="font-medium text-green-800 mb-2">✓ Election Created Successfully!</div>
          <div className="text-sm text-gray-700 mb-2">Share this link with voters:</div>
          <div className="p-3 bg-white border rounded break-all text-sm font-mono">
            {link}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(link)
                alert('Link copied to clipboard!')
              }}
              className="flex-1 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700"
            >
              Copy Link
            </button>
            <button
              onClick={() => router.push('/my-elections')}
              className="flex-1 px-4 py-2 border border-slate-800 rounded hover:bg-slate-50"
            >
              View My Elections
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}
