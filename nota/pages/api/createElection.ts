import type { NextApiRequest, NextApiResponse } from 'next'
import pool from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).end()
  const { id, title, positions, createdBy } = req.body
  
  try{
    await pool.query(
      `INSERT INTO elections(id, title, data, closed, created_by) VALUES($1,$2,$3,false,$4)`,
      [id, title, JSON.stringify(positions), createdBy || null]
    )
    res.json({ ok: true })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'db' })
  }
}
