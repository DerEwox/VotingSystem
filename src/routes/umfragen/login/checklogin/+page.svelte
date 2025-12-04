<script lang="ts">
    import { onAuthStateChanged } from "firebase/auth";
    import { auth } from "$lib/firebase.js";

    let user: any = null;

    onAuthStateChanged(auth, (u) => {
        user = u;
    });
</script>

{#if user}
    <p>Angemeldet als {user.email}</p>
{:else}
    <p>Nicht angemeldet.</p>
{/if}
