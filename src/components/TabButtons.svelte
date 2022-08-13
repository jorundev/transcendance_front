<div class="tab-buttons">
	{#each buttons as button}
		<div class="padder"></div>
		<TabButton selected={selected == button}>{button}</TabButton>
		<div class="padder"></div>
	{/each}
</div>

<style lang="scss">
	.tab-buttons {
		display: flex;
		flex-wrap: nowrap;
		overflow-x: auto;
		scrollbar-width: none;
		width: calc(100vw);
		transform: translateX(-16px);
	}
	.padder {
		min-width: 16px;
		min-height: 100%;
	}
</style>

<script lang="ts">
import { each } from "svelte/internal";
import TabButton from "./TabButton.svelte";
export let buttons: Array<string> = ["Profile", "History"];
export let selected: string = "Profile";
</script>
