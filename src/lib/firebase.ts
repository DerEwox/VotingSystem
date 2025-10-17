import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB3kI4PeaDP8KoSdW4IkaNuREaak60qvF4",
  authDomain: "abiamamg.firebaseapp.com",
  projectId: "abiamamg",
  storageBucket: "abiamamg.firebasestorage.app",
  messagingSenderId: "1004836011721",
  appId: "1:1004836011721:web:54849e0b4e94fb65f49718",
  measurementId: "G-F15F9MTZ64"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Funktionen für Auth & Votes
export async function registerUser(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(userCredential.user);
  return userCredential.user;
}

export async function loginUser(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function logoutUser() {
  return signOut(auth);
}

export async function saveVote(userId: string, votes: { name: string; value: number }[]) {
  const voteRef = doc(db, "votes", userId);
  await setDoc(voteRef, { votes, timestamp: new Date() });
}

export async function getVotes(userId: string) {
  const voteRef = doc(db, "votes", userId);
  const docSnap = await getDoc(voteRef);
  return docSnap.exists() ? docSnap.data() : null;
}
