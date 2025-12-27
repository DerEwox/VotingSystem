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

type Column = {
    settingKey: string
    header: string
    width: number
    getValue: (e: Entry) => string
}

const columns: Column[] = [
    {
        settingKey: 'Name',
        header: 'Name',
        width: 20,
        getValue: e => e.name
    },
    {
        settingKey: 'Tickets',
        header: 'Tickets',
        width: 10,
        getValue: e => e.ticketAmount.toString()
    },
    {
        settingKey: 'Zusatzticket',
        header: 'Zusatzt.',
        width: 10,
        getValue: e => e.fifthTicket ? 'Ja' : 'Nein'
    },
    {
        settingKey: 'Vegetarisch',
        header: 'Veg',
        width: 10,
        getValue: e => e.vegitarian.toString()
    },
    {
        settingKey: 'VegetarischZusatz',
        header: 'VegZ',
        width: 10,
        getValue: e => e.vegitarianZusatz.toString()
    },
    {
        settingKey: 'Sitznachbarn',
        header: 'Sitzn. 1',
        width: 20,
        getValue: e => e.neighbors[0] ?? ''
    },
    {
        settingKey: 'Sitznachbarn',
        header: 'Sitzn. 2',
        width: 20,
        getValue: e => e.neighbors[1] ?? ''
    },
    {
        settingKey: 'ZwingendSitznachbar',
        header: 'Zwingend',
        width: 10,
        getValue: e => e.forceNeighbors ? 'Ja' : 'Nein'
    },
    {
        settingKey: 'GrundZwingendSitznachbar',
        header: 'Grund',
        width: 30,
        getValue: e => e.foreceNeighborsReason ?? ''
    }
]

function main() {
    const raw = fs.readFileSync(filePath, 'utf8')
    const data: Entry[] = JSON.parse(raw)

    const activeColumns = columns.filter(c => settings[c.settingKey])

    // Header
    console.log(
        activeColumns
            .map(c => c.header.padEnd(c.width))
            .join('')
    )

    console.log(
        '-'.repeat(
            activeColumns.reduce((sum, c) => sum + c.width, 0)
        )
    )

    // Rows
    for (const entry of data) {
        console.log(
            activeColumns
                .map(c => c.getValue(entry).padEnd(c.width))
                .join('')
        )
    }
}

main()
