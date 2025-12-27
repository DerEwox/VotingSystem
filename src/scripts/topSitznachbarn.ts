import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

type Entry = {
  name: string
  neighbors?: string[]
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const filePath = path.join(__dirname, '..', '..', 'abifeierumfragen_export.json')

function main() {
  const raw = fs.readFileSync(filePath, 'utf8')
  const data: Entry[] = JSON.parse(raw)
  const info = new Map<string, { count: number; voters: Set<string> }>()

  for (const e of data) {
    const votersName = e.name ?? ''
    const neighbors = e.neighbors ?? []
    for (let n of neighbors) {
      if (!n) continue
      n = n.trim()
      if (!n) continue
      const cur = info.get(n)
      if (cur) {
        cur.count++
        cur.voters.add(votersName)
      } else {
        info.set(n, { count: 1, voters: new Set([votersName]) })
      }
    }
  }

  const results = Array.from(info.entries())
    .map(([name, v]) => ({ name, count: v.count, voters: Array.from(v.voters) }))
    .filter(r => r.count >= 3)
    .sort((a, b) => b.count - a.count)

  if (results.length === 0) {
    console.log('Keine Personen mit mindestens 3 Stimmen gefunden.')
    return
  }

  console.log('Personen mit mindestens 3 Stimmen und wer sie gewählt hat:')
  results.forEach((r, idx) => {
    console.log(`\n${idx + 1}. ${r.name} — ${r.count} Stimmen`)
    console.log(`   Gewählt von: ${r.voters.join(', ')}`)
  })
}

main()
