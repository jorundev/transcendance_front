<script lang="ts">
	import { api, APIStatus } from "../api";
	import { onMount } from "svelte";
	import MatchData from "./MatchData.svelte";
	import type { GameHistory } from "src/lobbies";

	export let user: string;
	let data: Array<GameHistory> = [];

	onMount(async () => {
		const res = await api.getMatchHistory(user);
		if (res !== null && res !== APIStatus.NoResponse) {
			data = [];
			let i = 0;
			while (res[i + ""]) {
				data.push(res[i + ""]);
				i += 1;
			}
		}
	});
</script>

{#if data.length === 0}
	<div class="nodata">No match history yet</div>
{:else}
	<div class="matches">
		{#each data as matchData}
			<MatchData data={matchData} {user} />
		{/each}
	</div>
{/if}

<style lang="scss">
	.matches {
		display: flex;
		flex-direction: column;
		gap: 8px;

		overflow-x: hidden;
		overflow-y: auto;
		max-height: 600px;
	}
</style>
