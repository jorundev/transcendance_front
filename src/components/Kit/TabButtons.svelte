<script lang="ts">
	import { createEventDispatcher } from "svelte";

	import TabButton from "./TabButton.svelte";

	export let buttons: Array<string>;
	export let selected: string;

	const dispatch = createEventDispatcher<{ onselect: string }>();

	function buttonClick(data: { detail: string }) {
		selected = data.detail;
		dispatch("onselect", selected);
	}
</script>

<div class="tab-buttons">
	<div class="padder" />
	{#each buttons as button}
		<TabButton
			name={button}
			selected={selected == button}
			on:click={buttonClick}>{button}</TabButton
		>
	{/each}
	<div class="padder" />
</div>

<style lang="scss">
	.tab-buttons {
		display: flex;
		flex-wrap: nowrap;
		overflow-x: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
		width: calc(100vw - var(--scrollbar-width));
		transform: translateX(-16px);
		margin-bottom: 10px;

		&::-webkit-scrollbar {
			display: none;
		}
	}
	.padder {
		min-width: 16px;
		min-height: 100%;
	}
</style>
