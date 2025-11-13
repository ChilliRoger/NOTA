import type { NextApiRequest, NextApiResponse } from 'next'
import pool from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { email } = req.query
  
  if (!email) {
    return res.status(400).json({ error: 'Email required' })
  }

  try {
    const result = await pool.query(
      `SELECT 
        e.id, 
        e.title, 
        e.closed, 
        e.created_at,
        COUNT(v.id) as vote_count
      FROM elections e
      LEFT JOIN votes v ON e.id = v.election_id
      WHERE e.created_by = $1
      GROUP BY e.id, e.title, e.closed, e.created_at
      ORDER BY e.created_at DESC`,
      [email]
    )

    const elections = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      closed: row.closed,
      created_at: row.created_at,
      voteCount: parseInt(row.vote_count) || 0
    }))

    res.json({ elections })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
}
