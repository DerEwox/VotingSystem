const names: string[] = [
		'Eyad.D',
		'Daniel.A',
		'Lieselotte.B',
		'Sarah.B',
		'Elias.B',
		'Liane.B',
		'Selma.B',
		'Fabian.B',
		'Ann-Sophie.B',
		'Paul.B',
		'Yehor.B',
		'Felix.D',
		'Leni.D',
		'Tim.E',
		'Silja.E',
		'Emilia.F',
		'Liv.F',
		'Arturs.F',
		'Louisa.F',
		'Paulina.F',
		'Anna-Lena.G',
		'Lucie.G',
		'Paula.G',
		'Lars.G',
		'Tiana.G',
		'Lucian.G',
		'Nikita.G',
		'Olivia.G',
		'Emna.H',
		'Lotta.H',
		'Paul.H',
		'Marie-Sofie.H',
		'Lotta.H',
		'Hanna.H',
		'Jonathan.H',
		'Noah.H',
		'Justin.J',
		'Julia.K',
		'Isabel.K',
		'Mehmet.K',
		'Maidinai.K',
		'Lena.K',
		'Paulina.K',
		'Leonie.K',
		'Laura.K',
		'Zeynepnur.K',
		'Elias.K',
		'Alexander.K',
		'Todor.D',
		'Nina.K',
		'Paula.K',
		'Nicolas.K',
		'Tim.K',
		'Luisa.K',
		'Deniz.L',
		'Malin.L',
		'Mara.L',
		'Lotta.L',
		'Franz.M',
		'Linda.M',
		'Hannah.M',
		'Sofie.M',
		'Annika.M',
		'Nik.M',
		'Felix.M',
		'Gabriel.M',
		'Leonie.N',
		'Dominik.N',
		'Lukas.O',
		'Valentin.P',
		'Jaqueline.P',
		'Jonathan.P',
		'Tialda.P',
		'Nina.P',
		'Lara.R',
		'Lisbeth.R',
		'Josefine.R',
		'Jonathan.R',
		'Marie.R',
		'Janina.R',
		'Florian.R',
		'Melina.S',
		'Tamina.S',
		'Isabel.S',
		'Yvette.S',
		'Johanna.S',
		'Emil.S',
		'Karl.S',
		'Hannah.S',
		'Francesco.S',
		'Nick.S',
		'Helena.S',
		'Melanie.S',
		'Julius.S',
		'Laura.S',
		'Leander.S',
		'Dominik.S',
		'Lara.S',
		'Lilly.S',
		'Sardar.T',
		'Ivana.V',
		'Timo.vC',
		'Leonie.W',
		'Helena.W',
		'Lara.W',
		'Mariél.W',
		'Samuel.W',
		'Cian.Z'
]

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

const missingNames: string[] = []

function main() {
    const raw = fs.readFileSync(filePath, 'utf8')
    const data: Entry[] = JSON.parse(raw)

    for(let n = 0; n < names.length; n++) {
        const name = names[n].toLowerCase()
        if(findName(name, data) === false) {
            missingNames.push(name)
        }
    }
}


function findName(name: string, data: Entry[]): boolean {
    for(let n = 0; n < data.length; n++) {
        const entry = data[n]
        if(entry.name === name) {
            return true
        }
    }
    return false
}

main()
console.log('Fehlende Personen:', missingNames)