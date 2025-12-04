<script lang="ts">
	import { onMount } from 'svelte';
	import { auth, db, saveVote } from '$lib/firebase.js';
	import {
		getAuth,
		createUserWithEmailAndPassword,
		signInWithEmailAndPassword,
		sendEmailVerification,
		signOut,
		onAuthStateChanged
	} from 'firebase/auth';
	import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
	import justin from '$lib/Justin.png';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

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
		'Cian.Z',
		't-Acc1',
		't-Acc2',
		't-Acc3',
		'sp-Acc1',
		'sp-Acc2',
		'sp-Acc3,'
	];
	let dropdownRef: HTMLElement;

	let showMessage = false;

	let email = '';
	let benutzer = '';
	let password = '';
	let errorMessage = '';
	let successMessage = '';
	let isLoggedIn = false;

	let inputValue = '';
	let isOpen = false;
	let filteredNames: string[] = [];

	function showError(msg: string) {
		showMessage = true;
		errorMessage = msg;
	}

	function showSuccess(msg: string) {
		showMessage = true;
		successMessage = msg;
	}

	onMount(async () => {
		filteredNames = [...names];
		document.addEventListener('click', handleClickOutside);
		onAuthStateChanged(auth, async (firebaseUser) => {
			if (firebaseUser) {
				isLoggedIn = true;
			} else {
				isLoggedIn = false;
			}
		});
	});

	async function register() {
		console.log(benutzer);
		email = benutzer + '@ewoxvotesystem-abifeierumfragen.com';
		console.log(email);
		try {
			if (names.includes(benutzer)) {
				const userCredential = await createUserWithEmailAndPassword(auth, email, password);
				showSuccess('Registrierung erfolgreich!');
				login();
			} else {
				showError('Fehler: Benutzer nicht in Schülerliste');
			}
		} catch (error) {
			if (error.message === 'Firebase: Error (auth/email-already-in-use).') {
				showError(
					'Ein Accout under dem Namen wurde bereits erstellt. Entweder du versuchst dich erneut anzumelden und musst auf "Login" drücken. ODER jemand anders hat sich in deinem Namen registriert, dann melde dich bitte bei einer zuständigern Person.'
				);
			} else {
				showError('Fehler bei der Registrierung: ' + error.message);
			}
		}
	}

	async function login() {
		email = benutzer + '@ewoxvotesystem-abifeierumfragen.com';
		try {
			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			console.log('Angemeldet als:', userCredential.user.email);
			isLoggedIn = true;
			redirect();
			showSuccess('Login erfolgreich!');
		} catch (error) {
			showError('Login fehlgeschlagen: ' + error.message);
		}
	}

	function searchNames() {
		if (inputValue.trim() === '') {
			filteredNames = [...names];
		} else {
			filteredNames = names.filter((name) => name.toLowerCase().includes(inputValue.toLowerCase()));
		}
	}

	function selectName(name: string) {
		inputValue = name;
		isOpen = false;
	}

	function handleClickOutside(event: MouseEvent) {
		showMessage = false;
		errorMessage = '';
		successMessage = '';
		if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
			isOpen = false;
		}
		benutzer = inputValue;
	}

	function redirect() {
		const currentPath = $page.url.pathname;
		const pathParts = currentPath.split('/');
		pathParts.pop();

		goto(`${pathParts.join('/')}/main`);
	}
</script>

<div class="login-container">
	<div style="display: flex; justify-content: center; flex-wrap: wrap; ">
		<h1 style="font-size: 50px;">Abi am AMG</h1>
		<p style="flex-basis: 100%; text-align: center; margin-top: 1px">Registriere dich erneut</p>
	</div>
	<div class="login-box">
		<h2 class="login-title">Login / Registrierung</h2>

		<div
			class="auswahl"
			bind:this={dropdownRef}
			style="justify-content:center; display: flex; width: 100%"
		>
			<input
				type="text"
				bind:value={inputValue}
				on:input={searchNames}
				on:focus={() => ((isOpen = true), console.log(isOpen))}
				placeholder="Benutzername"
				class="login-input"
				style="margin-bottom: 10px;"
			/>
			{#if isOpen}
				<div class="menu">
					{#each filteredNames as name}
						<button class="item" on:click={() => selectName(name)}>
							{name}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<input type="password" bind:value={password} placeholder="Passwort" class="login-input" />

		<button on:click={register} class="login-button">Registrieren</button>
		<button on:click={login} class="login-button">Login</button>
		{#if errorMessage}
			<p style="color: red;">{errorMessage}</p>
		{/if}

		{#if successMessage}
			<p style="color: green;">{successMessage}</p>
		{/if}
	</div>
</div>

<style>
	.login-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 95vh;
		background-color: #121212;
		padding: 0px;
	}

	/* Login-Box */
	.login-box {
		background: #1e1e1e;
		padding: 30px;
		border-radius: 12px;
		box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.6);
		max-width: 350px;
		width: 100%;
		text-align: center;
	}

	/* Titel */
	.login-title {
		font-size: 24px;
		color: #e5e5e5;
		margin-bottom: 20px;
		font-weight: bold;
	}

	/* Eingabefelder */
	.login-input {
		width: 100%;
		padding: 12px;
		border: 1px solid #444;
		border-radius: 8px;
		font-size: 16px;
		background-color: #2a2a2a;
		color: #e5e5e5;
		transition: border-color 0.3s ease;
		box-sizing: border-box;
	}

	.login-input:focus {
		border-color: #3399ff;
		outline: none;
	}

	/* Buttons */
	.login-button {
		width: 100%;
		padding: 12px;
		font-size: 16px;
		color: white;
		background: #007bff;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition:
			background 0.3s ease,
			transform 0.2s ease;
		margin-top: 10px;
		box-sizing: border-box;
	}

	.login-button:hover {
		background: #0056b3;
		transform: scale(1.05);
	}

	/* Auswahl-Menü */
	.auswahl {
		position: relative;
		width: 250px;
	}

	.menu {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		max-height: 200px;
		overflow-y: auto;
		background: #1e1e1e;
		border: 1px solid #444;
		border-radius: 5px;
		z-index: 10;
		color: #e5e5e5;
	}

	.item {
		padding: 8px;
		cursor: pointer;
		width: 100%;
		color: #e5e5e5;
		background-color: #424242;
	}

	.item:hover {
		background-color: #2b2b2b;
	}
</style>
