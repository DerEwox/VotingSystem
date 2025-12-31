import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const settings: Record<string, boolean> = {
    Name: true,
    Tickets: true,
    Zusatzticket: false,
    Vegetarisch: false,
    VegetarischZusatz: false,
    Sitznachbarn: true,
    ZwingendSitznachbar: true,
    GrundZwingendSitznachbar: true,
}

type Entry = {
    name: string
    neighbors: string[]
    ticketAmount: number
    fifthTicket: boolean
    vegitarian: number
    vegitarianZusatz: number
    forceNeighbors: boolean
    foreceNeighborsReason?: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const filePath = path.join(__dirname, '..', '..', 'abifeierumfragen_export.json')

const missingNeighbors: string[] = []
const sameNeighbors: string[] = []

function main() {
    const raw = fs.readFileSync(filePath, 'utf8')
    const data: Entry[] = JSON.parse(raw)
    
    for(let i = 0; i < data.length; i++) {
        const entry = data[i]
        checkEmptyNeighbors(entry);
        checkDoubleNeighbors(entry);
    }
}

function checkEmptyNeighbors(entry: Entry) {
    if(entry.neighbors.length === 0 || entry.neighbors[0] === "" || entry.neighbors[1] === "") {
        missingNeighbors.push(entry.name)
    }
}

function checkDoubleNeighbors(entry: Entry) {
    if(entry.neighbors[0] === entry.neighbors[1] && (entry.neighbors[0] !== "" || entry.neighbors[1] !== "") && entry.neighbors.length > 1) {
        sameNeighbors.push(entry.name)
    }
}
main()
console.log('Fehlende Sitznachbaren:', missingNeighbors)
console.log('Gleiche Sitznachbaren:', sameNeighbors)