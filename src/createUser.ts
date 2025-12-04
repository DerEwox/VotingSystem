import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./lib/firebase.ts";

async function registerUser(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Fehler beim Erstellen:", error.message);
  }
}

function getRandomPassword(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
    for (let i = 0; i < length; i++) {  
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    return password;
}

function createUsers(names: string[]) {
  for (const name of names) {
    const email = `${name.toLowerCase()}@ewoxvotesystem.com`;
    const password = getRandomPassword(8);
    registerUser(email, password);
    acc.push({name: name, pw: password});
    console.log(name, "-", password);
  }
  
}

console.log(getRandomPassword(5));

const names: string[] = ["Maelle.A","Philipp.A","Igor.A","Charlotte.A","Cihan.A","Alexander.B","Noemi.B","Laurina.B","Joscha.B","Nils.B","Mykhailo.C","Alessia.C","Kassandra.C","Kimi.D","Meike.D","Julia.D","Kaihan.E","Philipp.E","Alina.E","Bennet.F","Matti.F","Felicitas.F","Leo.F","Lisa.G","Mariella.G","Marie.G","Maya.H","Nadhir.H","Joshua.H","Jakob.H","Lena.H","Finja.H","Moritz.H","Nils.H","Max.H","Luis.I","Raja.I","Gideon.J","Amelie.K","Hanna.K","Malte.K","Arne.K","Stefanie.L","Sarah.L","Thomas.L","Tristan.M","Katharina.M","Elisa.M","Jan.M","Hannah.M","Johannes.M","Tabea.M","Ksenia.M","Ana-Maria.N","Jonas.O","Laura.P","Julia.P","Maria.R","Nico.R","Jessica.S","Alina.S","Leni.S","Lina.S","Marin.S","Helene.S","Lotta.S","Timo.S","Jan.T","Luca.U","Andreea.V","Vanessa.V","Julius.W","Luca.W","Tom.W","Ben.W","Paula.W","Elisabeth.W","Franka.W","Rocco.Z","Amelie.Z","sp-acc1","sp-acc2","sp-acc3"];
const acc: {name: string, pw: string}[] = [];

createUsers(names);
