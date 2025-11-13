import type { NextApiRequest, NextApiResponse } from 'next'
import pool from '../../lib/db'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).end()
  const { id, votes, email } = req.body
  
  if (!email) {
    return res.status(400).json({ error: 'Email required' })
  }

  // Hash the email for privacy
  const emailHash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex')

  try{
    // Check if this email has already voted in this election
    const existingVote = await pool.query(
      `SELECT id FROM votes WHERE election_id = $1 AND email_hash = $2`,
      [id, emailHash]
    )

    if (existingVote.rowCount && existingVote.rowCount > 0) {
      return res.status(409).json({ error: 'You have already voted in this election' })
    }

    // Check if election is still open
    const election = await pool.query(
      `SELECT closed FROM elections WHERE id = $1`,
      [id]
    )

    if (election.rowCount === 0) {
      return res.status(404).json({ error: 'Election not found' })
    }

    if (election.rows[0].closed) {
      return res.status(400).json({ error: 'This election has been closed' })
    }

    // Store the vote
    await pool.query(
      `INSERT INTO votes(election_id, email_hash, vote_json) VALUES($1,$2,$3)`,
      [id, emailHash, JSON.stringify(votes)]
    )
    
    res.json({ ok: true })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
}
