<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let text: string = null;
	export let active: boolean = true;
	export let red = false;
	export let highlight = true;

	const dispatch = createEventDispatcher();

	function onClick() {
		dispatch("click", {});
	}
</script>

<button
	class:active
	class:red
	class:highlight
	on:click|stopPropagation={onClick}
>
	{#if text}
		{text}
	{:else}
		<slot />
	{/if}
</button>

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

			background: rgb(41, 41, 41);

			&.highlight {
				background: #0b82fa;
				&.red {
					background: #e70000;
				}
			}

			&:hover {
				background: rgb(33, 33, 33);
				&.highlight {
					background: #0a73dd;
				}
				&.red {
					background: #c50000;
				}
			}

			&:active {
				&.highlight {
					background: #0969c9;
				}
				&.red {
					background: #ab0000;
				}
			}
		}
	}
</style>
