import type { NextApiRequest, NextApiResponse } from 'next'
import pool from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Election ID required' })
  }

  try {
    const result = await pool.query(
      `SELECT title, data, closed, created_by FROM elections WHERE id = $1`,
      [id]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Election not found' })
    }

    const election = result.rows[0]

    res.json({
      election: {
        title: election.title,
        positions: election.data,
        closed: election.closed,
        host_email: election.created_by
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
}
