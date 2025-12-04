<script lang="ts">
	import Papa from 'papaparse';
	import { db, auth } from '../../../lib/firebase.js';
	import { doc, setDoc } from 'firebase/firestore';
	import { onMount } from 'svelte';
	import { onAuthStateChanged } from 'firebase/auth';

	interface Person {
		original: string;
		username: string;
		isDefault?: boolean;
	}

	let currentUser: 'mod' | 'admin' | null = null;

	// Login prüfen
onMount(() => {
  onAuthStateChanged(auth, (user) => {
    if (user?.email?.toLowerCase() === 'mod@ewoxvotesystem.com') {
      currentUser = 'mod';
    } else {
      currentUser = null;
    }
  });
  console.log("Email:", auth.currentUser?.email)
});

	let people: Person[] = [];
	let duplicateUsernames: string[] = [];

	let newFirstName = '';
	let newLastName = '';
	let uploadStatus = '';

	const defaultAccounts: Person[] = [
		{ original: 'SP Account 1', username: 'sp-acc1', isDefault: true },
		{ original: 'SP Account 2', username: 'sp-acc2', isDefault: true },
		{ original: 'SP Account 3', username: 'sp-acc3', isDefault: true }
	];

	function handleFileUpload(event: Event) {
		const file = (event.target as HTMLInputElement)?.files?.[0];
		if (!file) return;

		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			complete: (results) => {
				const data = results.data as { Vorname: string; Nachname: string }[];
				const newPeople = data
					.filter((r) => r.Vorname && r.Nachname)
					.map((row) => {
						const username = generateUsername(row.Vorname, row.Nachname);
						const original = `${row.Vorname} ${row.Nachname}`;
						return { original, username };
					});
				people = [...newPeople, ...defaultAccounts];
				checkDuplicates();
			}
		});
	}

	function generateUsername(vorname: string, nachname: string): string {
		const firstName = vorname.split(' ')[0];
		const lastInitial = nachname.trim()[0] || '';
		return `${firstName}.${lastInitial}`.trim();
	}

	function addUser() {
		if (!newFirstName.trim() || !newLastName.trim()) return;

		const username = generateUsername(newFirstName, newLastName);
		const original = `${newFirstName} ${newLastName}`;

		// Vor den SP-Accounts einfügen
		const defaultStartIndex = people.findIndex((p) => p.isDefault);
		if (defaultStartIndex >= 0) {
			people.splice(defaultStartIndex, 0, { original, username, isDefault: false });
		} else {
			people.push({ original, username, isDefault: false });
		}

		people = [...people];
		newFirstName = '';
		newLastName = '';
		checkDuplicates();
	}

	function deletePerson(index: number) {
		people.splice(index, 1);
		people = [...people];
		checkDuplicates();
	}

	function checkDuplicates() {
		const all = people.map((p) => p.username.toLowerCase());
		duplicateUsernames = all.filter((item, index) => all.indexOf(item) !== index);
	}

	function handleUsernameChange(index: number, value: string) {
		people[index].username = value.trim();
		people = [...people];
		checkDuplicates();
	}

	function canUpload() {
		return (
			people.length > 0 &&
			duplicateUsernames.length === 0 &&
			people.every((p) => p.username.trim() !== '')
		);
	}

	async function uploadToFirebase() {
		if (!canUpload()) return;

		try {
			const docRef = doc(db, 'votesystem', 'names');
			const usernames = people.map((p) => p.username);
			console.log('Uploading usernames:', usernames);
			await setDoc(docRef, { usernames, timestamp: new Date() });
			uploadStatus = 'Erfolgreich hochgeladen ✅';
			setTimeout(() => (uploadStatus = ''), 3000);
		} catch (err) {
			console.error(err);
			uploadStatus = 'Fehler beim Hochladen ❌';
		}
	}
</script>

{#if !currentUser}
	Melde dich zunächst an!
{:else}
	<div class="container">
		<h1>Username-Generator</h1>

		<div class="upload">
			<input type="file" accept=".csv" id="csvInput" on:change={handleFileUpload} />
			<label for="csvInput">CSV-Datei hochladen</label>
		</div>

		{#if people.length > 0}
			<div class="messages">
				<p class="info">
					Bitte überprüfe die Usernames: Duplikate korrigieren, Lehrer entfernen. Danach können die
					Namen nicht mehr im Nachhinein geändert werden.
				</p>
			</div>

			<div class="table-wrapper">
				<table>
					<thead>
						<tr>
							<th>Username</th>
							<th>Originalname</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each people.filter((p) => !p.isDefault) as person, i}
							<tr class:duplicate={duplicateUsernames.includes(person.username.toLowerCase())}>
								<td>
									<input
										type="text"
										bind:value={person.username}
										on:input={(e) => handleUsernameChange(i, (e.target as HTMLInputElement).value)}
									/>
									{#if duplicateUsernames.includes(person.username.toLowerCase())}
										<span class="warning">Duplikat</span>
									{/if}
									{#if person.username.trim() === ''}
										<span class="warning">Leer</span>
									{/if}
								</td>
								<td>{person.original}</td>
								<td>
									<button class="delete" on:click={() => deletePerson(i)}>Löschen</button>
								</td>
							</tr>
						{/each}

						<!-- SP-Accounts -->
						<tr
							><td colspan="3" class="sp-message"
								>SP-Accounts (für Fälle, bei denen Accounts fehlen)</td
							></tr
						>
						{#each people.filter((p) => p.isDefault) as person, i}
							<tr class="default">
								<td>{person.username}</td>
								<td>{person.original}</td>
								<td>
									<button class="delete" on:click={() => deletePerson(people.indexOf(person))}
										>Löschen</button
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Manuelles Hinzufügen unten -->
			<div class="add-user">
				<input type="text" placeholder="Vorname" bind:value={newFirstName} />
				<input type="text" placeholder="Nachname" bind:value={newLastName} />
				<button on:click={addUser}>Username hinzufügen</button>
			</div>

			<!-- Hochladen statt Kopieren -->
			<div class="copy-wrapper">
				<button class:disabled={!canUpload()} on:click={uploadToFirebase}>
					{uploadStatus || 'Alle Usernames hochladen'}
				</button>
			</div>
		{/if}
	</div>
	{JSON.stringify(people.map((p) => p.username))}
{/if}

<style>
	/* Style wie vorher, nur Button Text geändert */
	/* body {
		font-family: 'Segoe UI', sans-serif;
		background: #f9fafb;
		color: #111;
		margin: 0;
	} */

	.container {
		max-width: 900px;
		margin: 20px auto;
		padding: 15px 25px;
	}

	h1 {
		text-align: center;
		font-size: 2rem;
		color: #2a2a72;
	}

	.upload {
		text-align: center;
		margin-bottom: 20px;
	}

	.upload input[type='file'] {
		display: none;
	}

	.upload label {
		background-color: #4a90e2;
		padding: 10px 20px;
		border-radius: 8px;
		cursor: pointer;
		font-weight: bold;
		color: white;
		transition: 0.2s all;
	}

	.upload label:hover {
		background-color: #357ab8;
	}

	.messages {
		margin-bottom: 10px;
		text-align: center;
	}

	.info {
		background: #e0f7ff;
		padding: 8px 12px;
		border-radius: 6px;
		color: #111;
	}

	.table-wrapper {
		overflow-x: auto;
		margin-top: 10px;
		border-radius: 10px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		background: #fff;
		border-radius: 10px;
	}

	th,
	td {
		padding: 12px;
		text-align: left;
		border-bottom: 1px solid #ddd;
	}

	thead {
		background: #e4eaf0;
		font-weight: bold;
	}

	tbody tr:nth-child(even) {
		background: #f4f6f9;
	}

	tbody tr:hover {
		background: #e0e4eb;
	}

	input[type='text'] {
		width: 100%;
		padding: 6px 10px;
		border-radius: 6px;
		border: 1px solid #ccc;
		background: #f9fafb;
		color: #111;
	}

	.warning {
		color: #d9534f;
		font-size: 0.8rem;
		display: block;
		margin-top: 2px;
	}

	.delete {
		background-color: #d9534f;
		border: none;
		border-radius: 6px;
		padding: 4px 10px;
		cursor: pointer;
		font-weight: bold;
		color: white;
		transition: 0.2s all;
	}

	.delete:hover {
		background-color: #c9302c;
	}

	.duplicate {
		background: #fdecea !important;
	}

	.default {
		background: #e6f4ea !important;
	}

	.sp-message {
		text-align: center;
		font-style: italic;
		color: #555;
		padding: 6px 0;
	}

	.add-user {
		display: flex;
		justify-content: center;
		gap: 10px;
		margin: 15px 0;
	}

	.add-user input {
		padding: 6px 10px;
		border-radius: 6px;
		border: 1px solid #ccc;
	}

	.add-user button {
		padding: 6px 12px;
		border-radius: 6px;
		border: none;
		background-color: #4a90e2;
		color: white;
		font-weight: bold;
		cursor: pointer;
	}

	.add-user button:hover {
		background-color: #357ab8;
	}

	.copy-wrapper {
		text-align: center;
		margin-top: 15px;
	}

	.copy-wrapper button {
		padding: 10px 20px;
		border-radius: 8px;
		font-weight: bold;
		cursor: pointer;
		border: none;
		color: white;
		background-color: #4a90e2;
		transition: 0.2s all;
	}

	.copy-wrapper button:hover:not(.disabled) {
		background-color: #357ab8;
	}

	.copy-wrapper button.disabled {
		background-color: #aaa;
		cursor: not-allowed;
	}

	@media (max-width: 600px) {
		th,
		td {
			font-size: 0.85rem;
			padding: 6px 8px;
		}

		.upload label,
		.add-user button {
			font-size: 0.9rem;
		}

		.copy-wrapper button {
			font-size: 0.9rem;
			padding: 8px 16px;
		}

		.add-user {
			flex-direction: column;
			gap: 8px;
		}
	}
</style>
