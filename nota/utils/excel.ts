import * as XLSX from 'xlsx'

export function downloadResultsAsXLSX(filename: string, json: unknown[]){
  const ws = XLSX.utils.json_to_sheet(json)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Results')
  XLSX.writeFile(wb, filename)
}
