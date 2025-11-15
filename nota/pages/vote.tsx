import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'

export default function Vote(){
  const router = useRouter()
  const [link, setLink] = useState('')
  return (
    <Layout>
      <div className="mb-4">
        <button onClick={() => router.push('/')} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
          <span>←</span> <span>Back to Home</span>
        </button>
      </div>
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">Vote in an Election</h2>
      <input placeholder="Paste private election link" value={link} onChange={e=>setLink(e.target.value)} className="w-full border-2 border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
      <a href={link}><button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Open Election</button></a>
    </Layout>
  )
}
