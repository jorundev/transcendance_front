<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let text: string;
	export let active: boolean = true;

	const dispatch = createEventDispatcher();

	function onClick() {
		dispatch("click", {});
	}
</script>

<button class={active ? "active" : ""} on:click={onClick}>{text}</button>

<style lang="scss">
	button {
		font-size: 16px;
		width: 100%;
		color: #868686;
		background: #4b4b4b;
		border: none;
		border-radius: 12px;
		padding: 12px;
		margin-left: auto;
		margin-right: auto;

		transition: background-color 0.1s, color 0.1s;

		&.active {
			cursor: pointer;
			color: white;
			background: #0b82fa;

			&:hover {
				background: #0a73dd;
			}

			&:active {
				background: #0969c9;
			}
		}
	}
</style>
