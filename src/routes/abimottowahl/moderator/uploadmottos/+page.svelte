<script lang="ts">
import { auth, db } from '../../../lib/firebase.js';
import { setDoc, doc } from 'firebase/firestore';
import { onMount } from 'svelte';
import { onAuthStateChanged } from 'firebase/auth';
	import { json } from '@sveltejs/kit';

interface Motto {
  title: string;
  slogan: string;
}

let currentUser: 'mod' | null = null;

// Prüfen ob angemeldet
onMount(() => {
  onAuthStateChanged(auth, (user) => {
    if (user?.email?.toLowerCase() === 'mod@ewoxvotesystem.com') {
      currentUser = 'mod';
    } else {
      currentUser = null;
    }
  });
});

// Mottos
let mottos: Motto[] = [];
let newTitle = '';
let newSlogan = '';
let uploadMessage = '';

function addMotto() {
  if (!newTitle.trim() || !newSlogan.trim()) return;
  mottos = [...mottos, { title: newTitle, slogan: newSlogan }]; // Reaktivität sichern
  newTitle = '';
  newSlogan = '';
}

function deleteMotto(index: number) {
  mottos = mottos.filter((_, i) => i !== index); // Reaktivität sichern
}

// Upload zu Firebase
async function uploadMottos() {
  if (!currentUser) {
    uploadMessage = 'Nicht angemeldet oder keine Berechtigung';
    return;
  }
  if (mottos.length === 0) {
    uploadMessage = 'Keine Mottos zum Hochladen';
    return;
  }

  const titles = mottos.map(m => m.title);
  const slogans = mottos.map(m => m.slogan);

  try {
    await setDoc(doc(db, 'votesystem', 'mottos'), { titles, slogans, timestamp: new Date() });
    uploadMessage = 'Mottos erfolgreich hochgeladen!';
  } catch (err) {
    console.error(err);
    uploadMessage = 'Fehler beim Hochladen';
  }
}
</script>

{#if !currentUser}
  <p>Bitte zuerst als Moderator einloggen, um Mottos hochzuladen.</p>
{:else}
  <div class="mottos-upload">
    <h2>Mottos Upload</h2>
    <div class="inputs">
      <input type="text" placeholder="Motto" bind:value={newTitle} />
      <input type="text" placeholder="Spruch" bind:value={newSlogan} />
      <button on:click={addMotto}>Hinzufügen</button>
    </div>

    {#if mottos.length > 0}
    <table>
      <thead>
        <tr><th>Motto</th><th>Spruch</th><th></th></tr>
      </thead>
      <tbody>
        {#each mottos as m, i}
          <tr>
            <td>{m.title}</td>
            <td>{m.slogan}</td>
            <td><button on:click={() => deleteMotto(i)}>Löschen</button></td>
          </tr>
        {/each}
      </tbody>
    </table>
    {/if}

    <button class="upload-btn" on:click={uploadMottos}>Hochladen</button>
    {#if uploadMessage}<p class="message">{uploadMessage}</p>{/if}
  </div>

  {JSON.stringify(mottos)}
{/if}

<style>
.mottos-upload {
  padding: 25px;
  max-width: 700px;
  margin: 40px auto;
  background: #f5f5f5;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  font-family: 'Segoe UI', sans-serif;
}

.inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.inputs input {
  flex: 1 1 200px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 0.95em;
}

.inputs button {
  background: #1e88e5;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  font-weight: bold;
}

.inputs button:hover {
  background: #1565c0;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

th, td {
  padding: 10px;
  border-bottom: 1px solid #ccc;
  text-align: left;
}

th {
  background: #e0e0e0;
}

button {
  cursor: pointer;
}

button:hover {
  opacity: 0.85;
}

.upload-btn {
  background: #43a047;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: bold;
}

.upload-btn:hover {
  background: #388e3c;
}

.message {
  margin-top: 10px;
  font-weight: bold;
}
</style>
