import type { NextApiRequest, NextApiResponse } from 'next'
import pool from '../../lib/db'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST') return res.status(405).end()
  const { id, votes, email, deviceFingerprint } = req.body
  
  if (!email) {
    return res.status(400).json({ error: 'Email required' })
  }

  if (!deviceFingerprint) {
    return res.status(400).json({ error: 'Device verification required' })
  }

  // Extract IP address (supports proxies and load balancers)
  const ipAddress = (
    req.headers['x-forwarded-for'] as string ||
    req.headers['x-real-ip'] as string ||
    req.socket.remoteAddress ||
    'unknown'
  ).split(',')[0].trim()

  // Hash the email for privacy
  const emailHash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex')
  
  // Hash the device fingerprint for privacy
  const deviceHash = crypto.createHash('sha256').update(deviceFingerprint).digest('hex')

  try{
    // Check if this email has already voted in this election
    const existingEmailVote = await pool.query(
      `SELECT id FROM votes WHERE election_id = $1 AND email_hash = $2`,
      [id, emailHash]
    )

    if (existingEmailVote.rowCount && existingEmailVote.rowCount > 0) {
      return res.status(409).json({ error: 'You have already voted in this election with this email' })
    }

    // Check if this device has already voted in this election
    const existingDeviceVote = await pool.query(
      `SELECT id FROM votes WHERE election_id = $1 AND device_hash = $2`,
      [id, deviceHash]
    )

    if (existingDeviceVote.rowCount && existingDeviceVote.rowCount > 0) {
      return res.status(409).json({ error: 'This device has already been used to vote in this election' })
    }

    // Check IP address (soft limit - allow up to 3 votes per IP with warning)
    const ipVoteCount = await pool.query(
      `SELECT COUNT(*) as count FROM votes WHERE election_id = $1 AND ip_address = $2`,
      [id, ipAddress]
    )

    const ipCount = parseInt(ipVoteCount.rows[0]?.count || '0')
    if (ipCount >= 3) {
      return res.status(429).json({ 
        error: 'Too many votes from this network. If you believe this is an error, please contact the election host.' 
      })
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

    // Store the vote with email hash, device hash, and IP address
    await pool.query(
      `INSERT INTO votes(election_id, email_hash, device_hash, ip_address, vote_json) VALUES($1,$2,$3,$4,$5)`,
      [id, emailHash, deviceHash, ipAddress, JSON.stringify(votes)]
    )
    
    res.json({ ok: true })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
}
