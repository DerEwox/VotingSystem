import { loginUser, db } from "$lib/firebase.js";
import { collection, getDocs } from "firebase/firestore";
import fs from "fs";

interface ExportEntry {
  name: string;
  ticketAmount: number;
  fifthTicket: boolean;
  vegitarian: number;
  vegitarianZusatz: number;
  neighbors: string[];
  forceNeighbors: boolean;
  foreceNeighborsReason: string;
}

async function exportAbifeierumfragen() {
  await loginUser("main@admin.com", "123456");

  const snapshot = await getDocs(collection(db, "abifeierumfragen"));
  const result: ExportEntry[] = [];

  snapshot.forEach(docSnap => {
    const data = docSnap.data();

    const email = docSnap.id; // name@ewoxvotesystem-abifeierumfragen
    const name = email.split("@")[0];

    const ticketAmount: number = data.ticketAmount_;
    const fifthTicket: boolean = data.fifthTicket_;
    const vegitarianList: boolean[] = data.vegitarian_ ?? [];

    const vegitarian = vegitarianList
      .slice(0, ticketAmount)
      .filter(v => v === true).length;

    let vegitarianZusatz = 0;
    if (fifthTicket && vegitarianList.length > ticketAmount) {
      vegitarianZusatz = vegitarianList[ticketAmount] ? 1 : 0;
    }

    result.push({
      name,
      ticketAmount,
      fifthTicket,
      vegitarian,
      vegitarianZusatz,
      neighbors: data.neighbors_ ?? [],
      forceNeighbors: data.forceNeighbors_ !== "",
      foreceNeighborsReason: data.forceNeighbors_
    });
  });


  fs.writeFileSync(
    "abifeierumfragen_export.json",
    JSON.stringify(result, null, 2),
    "utf-8"
  );

  console.log("📄 Export abgeschlossen: abifeierumfragen_export.json");
}

exportAbifeierumfragen().catch(console.error);
