
<script lang="ts">
	import { onMount } from 'svelte';
	import { getAuth, onAuthStateChanged, signOut, type User } from 'firebase/auth';
	import { app } from '$lib/firebase.js';
	import Loading from '../loader.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let loading = $state(true);
	let user = $state<User | null>(null);

	onMount(() => {
		(window as any).logout = logout;
		const auth = getAuth(app);

		// Firebase prüft Auth-Status
		const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
			user = firebaseUser;
			loading = false;
			if (!user) {
				redirect();
			}
		});

		return () => unsubscribe();
	});

	async function logout() {
		const auth = getAuth(app);

		try {
			await signOut(auth);
		} catch (error) {
			console.error('Logout fehlgeschlagen:', error);
			alert('Beim Logout ist ein Fehler aufgetreten.');
		}
	}

	function redirect() {
		const currentPath = $page.url.pathname;
		const pathParts = currentPath.split('/');
		pathParts.pop();

		goto(`${pathParts.join('/')}/login`);
	}

</script>

{#if loading}
	<div class="loader-container">
		<!-- Ladeanimation einbinden -->
		<Loading />

		<div class="loader-text">Die Infos werden weitergegeben…</div>
	</div>
{:else if user}
	<div>
		<h1>Willkommen, {user.displayName || user.email}!</h1>
		<p>Hier stehen deine Firebase-Daten:</p>
		<pre>{JSON.stringify(user, null, 2)}</pre>
	</div>
{:else}
	<div>
		<p>Kein eingeloggter Nutzer gefunden. Bitte einloggen.</p>
	</div>
{/if}

<style>
	.loader-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 80vh; /* fast volle Höhe */
		text-align: center;
	}

	.loader-text {
		margin-top: 1rem;
		font-size: 1.2rem;
		color: #555;
	}
</style>
