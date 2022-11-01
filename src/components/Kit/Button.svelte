<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let text: string = null;
	export let active: boolean = true;
	export let red = false;
	export let highlight = true;
	export let padding = "12px";

	export let timeout = 0;
	export let timeoutVisible = true;

	let canClick = true;

	const dispatch = createEventDispatcher();

	function onClick() {
		if (active && canClick) {
			dispatch("click", {});
			if (timeout !== 0) {
				canClick = false;
				setTimeout(() => (canClick = true), timeout);
			}
		}
	}
</script>

<button
	style="padding: {padding};"
	class:active
	class:red
	class:timeout={!canClick && timeoutVisible}
	class:highlight={highlight && (canClick || !timeoutVisible)}
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
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
		width: 100%;
		color: #868686;
		background: #4b4b4b;
		border: none;
		border-radius: 12px;

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
				&.red:not(.timeout) {
					background: #c50000;
				}
			}

			&:active {
				&.highlight {
					background: #0969c9;
				}
				&.red:not(.timeout) {
					background: #ab0000;
				}
			}
		}

		&.timeout {
			cursor: not-allowed;
			background: rgb(87, 87, 87);
			color: rgba(255, 255, 255, 0.419);

			&:hover {
				background: rgb(87, 87, 87);
			}
		}
	}
</style>
