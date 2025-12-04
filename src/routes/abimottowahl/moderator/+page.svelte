<script lang="ts">
import { auth, db } from '../../lib/firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { onMount } from 'svelte';

let password = '';
let loginError = '';
let currentUser: 'mod' | null = null;

let usernamesDone = false;
let mottosDone = false;
let loadingStatus = false;
let statusError = '';

// Status check nur, wenn angemeldet
async function checkStatus() {
  loadingStatus = true;
  statusError = '';
  try {
    const namesDoc = await getDoc(doc(db, 'votesystem', 'names'));
    usernamesDone = namesDoc.exists() && (namesDoc.data()?.usernames?.length || 0) > 0;

    const mottosDoc = await getDoc(doc(db, 'votesystem', 'mottos'));
    mottosDone = mottosDoc.exists() && (mottosDoc.data()?.mottos?.length || 0) > 0;
  } catch (err) {
    console.error('Fehler beim Statuscheck:', err);
    statusError = 'Fehler beim Laden des Status. Bitte Adblocker deaktivieren oder Seite neu laden.';
  } finally {
    loadingStatus = false;
  }
}

// Prüfen ob bereits angemeldet beim Laden der Seite
onMount(() => {
  onAuthStateChanged(auth, (user) => {
    if (user?.email?.toLowerCase() === 'mod@ewoxvotesystem.com') {
      currentUser = 'mod';
      checkStatus();
    } else {
      currentUser = null;
    }
  });
});

async function login() {
  loginError = '';
  try {
    const email = 'mod@ewoxvotesystem.com';
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userEmail = userCredential.user.email?.toLowerCase();
    if (userEmail === 'mod@ewoxvotesystem.com') {
      currentUser = 'mod';
      password = '';
      await checkStatus();
    } else {
      loginError = 'Nicht berechtigt';
      await signOut(auth);
      currentUser = null;
    }
  } catch (err) {
    console.error(err);
    loginError = 'Fehler beim Login';
  }
}

async function logout() {
  await signOut(auth);
  currentUser = null;
  password = '';
  loginError = '';
  usernamesDone = false;
  mottosDone = false;
  statusError = '';
}
</script>

{#if !currentUser}
<div class="login-container">
  <h2>Moderator Login</h2>

  <input type="password" placeholder="Moderator-Code" bind:value={password} id="password" name="password" />
  <button on:click={login} id="login-button" name="login-button">Login</button>
  {#if loginError}<p class="error">{loginError}</p>{/if}
</div>
{:else}
<div class="dashboard">
  {#if loadingStatus}
    <p>Lade Status… bitte warten</p>
  {:else if statusError}
    <p class="error">{statusError}</p>
  {:else}
    <div class="status">
      <p>
        Usernames erstellen: 
        <span class:done={usernamesDone}>{usernamesDone ? 'Erledigt' : 'Offen'}</span>
        {#if !usernamesDone}
          <button on:click={() => window.location.href='moderator/uploadusernames'} class="goto-btn">Gehe zu</button>
        {/if}
      </p>
      <p>
        Abimottos erstellen: 
        <span class:done={mottosDone}>{mottosDone ? 'Erledigt' : 'Offen'}</span>
        {#if !mottosDone}
          <button on:click={() => window.location.href='moderator/uploadmottos'} class="goto-btn">Gehe zu</button>
        {/if}
      </p>
    </div>
    <button on:click={logout} id="logout-button" name="logout-button">Logout</button>
  {/if}
</div>
{/if}

<style>
.login-container, .dashboard {
  max-width: 500px;
  margin: 50px auto;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(0,0,0,0.1);
  font-family: 'Segoe UI', sans-serif;
  background: #ffffff;
  color: #222;
  text-align: center;
}

.login-container input {
  width: 80%;
  padding: 12px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;
}

.login-container button {
  background: #1e88e5;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

.login-container button:hover {
  background: #1565c0;
}

.error {
  color: #d32f2f;
  margin-top: 10px;
  font-weight: bold;
}

.dashboard h2 {
  margin-bottom: 20px;
}

button#logout-button {
  display: block;
  margin: 20px auto 0 auto;
  background: #e53935;
  color: #fff;
  border-width: 0;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
}

.status {
  margin-bottom: 20px;
  font-weight: bold;
}

.status span {
  padding: 2px 8px;
  border-radius: 6px;
  color: #fff;
}

.status span.done {
  background: #4caf50;
}

.status span:not(.done) {
  background: #f44336;
}

.goto-btn {
  margin-left: 10px;
  background: #2196f3;
  color: #fff;
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85em;
  height: 25px;
}

.goto-btn:hover {
  background: #1976d2;
}
</style>
