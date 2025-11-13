import type { NextApiRequest, NextApiResponse } from 'next'
import pool from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).end()
  const { id } = req.body
  await pool.query(`UPDATE elections SET closed = true WHERE id=$1`, [id])
  // fetch results (simple aggregation)
  const votes = await pool.query(`SELECT vote_json FROM votes WHERE election_id=$1`, [id])
  res.json({ ok: true, votes: votes.rows.map(r=>r.vote_json) })
}
