import * as XLSX from 'xlsx'

type ResultRow = {
  Position: string
  Candidate: string
  Votes: number
}

type FormattedRow = {
  Position: string
  Candidate: string
  Votes: number | string
  'Vote %': string
}

export function downloadResultsAsXLSX(filename: string, results: ResultRow[]) {
  // Separate total votes from candidate results
  const totalRow = results.find(r => r.Position === 'TOTAL')
  const candidateResults = results.filter(r => r.Position !== 'TOTAL')

  // Group by position for better formatting
  const positions = [...new Set(candidateResults.map(r => r.Position))]
  
  // Create formatted data with spacing and summaries
  const formattedData: FormattedRow[] = [
    // Title row
    { Position: 'ELECTION RESULTS', Candidate: '', Votes: '', 'Vote %': '' },
    { Position: '', Candidate: '', Votes: '', 'Vote %': '' },
  ]

  positions.forEach((position, index) => {
    const positionResults = candidateResults.filter(r => r.Position === position)
    const totalPositionVotes = positionResults.reduce((sum, r) => sum + r.Votes, 0)

    // Position header
    formattedData.push({
      Position: position,
      Candidate: '',
      Votes: '',
      'Vote %': ''
    })

    // Candidates with vote percentages
    positionResults
      .sort((a, b) => b.Votes - a.Votes) // Sort by votes descending
      .forEach(result => {
        const percentage = totalPositionVotes > 0 
          ? ((result.Votes / totalPositionVotes) * 100).toFixed(2) + '%'
          : '0%'
        
        formattedData.push({
          Position: '',
          Candidate: result.Candidate,
          Votes: result.Votes,
          'Vote %': percentage
        })
      })

    // Position subtotal
    formattedData.push({
      Position: '',
      Candidate: `${position} - Total Votes`,
      Votes: totalPositionVotes,
      'Vote %': '100%'
    })

    // Add spacing between positions
    if (index < positions.length - 1) {
      formattedData.push({ Position: '', Candidate: '', Votes: '', 'Vote %': '' })
    }
  })

  // Add overall summary
  formattedData.push(
    { Position: '', Candidate: '', Votes: '', 'Vote %': '' },
    { Position: 'SUMMARY', Candidate: '', Votes: '', 'Vote %': '' },
    { Position: '', Candidate: 'Total Positions', Votes: positions.length, 'Vote %': '' },
    { Position: '', Candidate: 'Total Votes Cast', Votes: totalRow?.Votes || 0, 'Vote %': '' },
    { Position: '', Candidate: 'Total Candidates', Votes: candidateResults.length, 'Vote %': '' }
  )

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(formattedData)

  // Set column widths
  ws['!cols'] = [
    { wch: 25 },  // Position
    { wch: 30 },  // Candidate
    { wch: 12 },  // Votes
    { wch: 12 }   // Vote %
  ]

  // Style the header row (row 1)
  const headerCells = ['A1', 'B1', 'C1', 'D1']
  headerCells.forEach(cell => {
    if (ws[cell]) {
      ws[cell].s = {
        font: { bold: true, sz: 16, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1E293B' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
  })

  // Style position headers (bold)
  formattedData.forEach((row, idx) => {
    if (row.Position && row.Position !== '' && row.Position !== 'SUMMARY') {
      const cellRef = XLSX.utils.encode_cell({ r: idx, c: 0 })
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true, sz: 12 },
          fill: { fgColor: { rgb: 'E2E8F0' } },
          alignment: { horizontal: 'left' }
        }
      }
    }
    
    // Style SUMMARY header
    if (row.Position === 'SUMMARY') {
      const cellRef = XLSX.utils.encode_cell({ r: idx, c: 0 })
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true, sz: 14 },
          fill: { fgColor: { rgb: 'DBEAFE' } },
          alignment: { horizontal: 'left' }
        }
      }
    }

    // Style subtotal rows (bold)
    if (row.Candidate && typeof row.Candidate === 'string' && row.Candidate.includes('Total')) {
      const votesCell = XLSX.utils.encode_cell({ r: idx, c: 2 })
      const candidateCell = XLSX.utils.encode_cell({ r: idx, c: 1 })
      
      if (ws[votesCell]) {
        ws[votesCell].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'F1F5F9' } },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } }
          }
        }
      }
      if (ws[candidateCell]) {
        ws[candidateCell].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'F1F5F9' } },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } }
          }
        }
      }
    }
  })

  // Create workbook and add worksheet
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Election Results')

  // Add metadata
  wb.Props = {
    Title: 'Election Results',
    Subject: 'NOTA Voting System Results',
    Author: 'NOTA Voting System',
    CreatedDate: new Date()
  }

  // Download file
  XLSX.writeFile(wb, filename, { cellStyles: true })
}
