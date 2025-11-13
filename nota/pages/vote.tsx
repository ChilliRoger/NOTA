import { useState } from 'react'
import Layout from '../components/Layout'

export default function Vote(){
  const [link, setLink] = useState('')
  return (
    <Layout>
      <h2 className="text-xl font-medium mb-4">Vote in an election</h2>
      <input placeholder="Paste private election link" value={link} onChange={e=>setLink(e.target.value)} className="w-full border p-2 rounded mb-3" />
      <a href={link}><button className="px-4 py-2 bg-slate-800 text-white rounded">Open election</button></a>
    </Layout>
  )
}
