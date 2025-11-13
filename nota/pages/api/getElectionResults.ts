import type { NextApiRequest, NextApiResponse } from 'next'
import pool from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { id } = req.query
  
  if (!id) {
    return res.status(400).json({ error: 'Election ID required' })
  }

  try {
    // Get election details
    const electionResult = await pool.query(
      `SELECT title, data, closed FROM elections WHERE id = $1`,
      [id]
    )

    if (electionResult.rowCount === 0) {
      return res.status(404).json({ error: 'Election not found' })
    }

    const election = electionResult.rows[0]
    const positions = election.data as Array<{name: string; candidates: string[]}>

    // Get all votes
    const votesResult = await pool.query(
      `SELECT vote_json FROM votes WHERE election_id = $1`,
      [id]
    )

    // Aggregate results
    const results: Array<{
      Position: string
      Candidate: string
      Votes: number
    }> = []

    // Initialize vote counts
    const voteCounts: Record<number, Record<number, number>> = {}
    positions.forEach((_, posIdx) => {
      voteCounts[posIdx] = {}
    })

    // Count votes
    votesResult.rows.forEach(row => {
      const votes = row.vote_json as Record<number, number>
      Object.entries(votes).forEach(([posIdx, candidateIdx]) => {
        const pi = parseInt(posIdx)
        const ci = parseInt(candidateIdx)
        if (!voteCounts[pi][ci]) {
          voteCounts[pi][ci] = 0
        }
        voteCounts[pi][ci]++
      })
    })

    // Format results for Excel
    positions.forEach((position, posIdx) => {
      position.candidates.forEach((candidate, candidateIdx) => {
        results.push({
          Position: position.name,
          Candidate: candidate,
          Votes: voteCounts[posIdx][candidateIdx] || 0
        })
      })
    })

    // Add total votes row
    results.push({
      Position: 'TOTAL',
      Candidate: 'Total Votes Cast',
      Votes: votesResult.rowCount || 0
    })

    res.json({ results })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
}
