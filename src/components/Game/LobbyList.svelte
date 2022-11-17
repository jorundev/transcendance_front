<script lang="ts">
	import { stLobbies } from "../../stores";
	import LobbyDescription from "./LobbyDescription.svelte";
</script>

{#if Object.entries($stLobbies).length > 0}
	{#each Object.entries($stLobbies) as [uuid, lobby]}
		<LobbyDescription {lobby} />
	{/each}
{:else}
	<div class="nogames">There are no games to display</div>
{/if}

<style lang="scss">
	.nogames {
		padding: 10px;
		border-radius: 10px;
		background-color: rgb(44, 44, 44);
	}
</style>
