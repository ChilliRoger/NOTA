import type { NextApiRequest, NextApiResponse } from 'next'
import pool from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Election ID required' })
  }

  try {
    // Get election details
    const electionResult = await pool.query(
      `SELECT data FROM elections WHERE id = $1`,
      [id]
    )

    if (electionResult.rowCount === 0) {
      return res.status(404).json({ error: 'Election not found' })
    }

    const positions = electionResult.rows[0].data as Array<{ name: string; candidates: string[] }>

    // Get all votes
    const votesResult = await pool.query(
      `SELECT vote_json FROM votes WHERE election_id = $1`,
      [id]
    )

    // Count votes per position and candidate
    const voteCounts: Record<number, Record<number, number>> = {}
    
    // Initialize vote counts
    positions.forEach((_, posIdx) => {
      voteCounts[posIdx] = {}
    })

    // Count votes
    votesResult.rows.forEach(row => {
      const votes = row.vote_json as Record<string, number>
      Object.entries(votes).forEach(([posIdx, candidateIdx]) => {
        const pi = parseInt(posIdx)
        const ci = candidateIdx
        if (!voteCounts[pi]) voteCounts[pi] = {}
        if (!voteCounts[pi][ci]) voteCounts[pi][ci] = 0
        voteCounts[pi][ci]++
      })
    })

    res.json({
      voteCounts,
      totalVotes: votesResult.rowCount || 0
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
}
