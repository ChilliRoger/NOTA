import type { NextApiRequest, NextApiResponse } from 'next'
import pool from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'missing id' })
  const r = await pool.query(`SELECT title, data, closed FROM elections WHERE id=$1`, [id])
  if (r.rowCount === 0) return res.status(404).json({ error: 'no' })
  const election = r.rows[0]
  res.json({ election: { title: election.title, positions: election.data } })
}
