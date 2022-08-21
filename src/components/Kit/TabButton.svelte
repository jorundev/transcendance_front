<script lang="ts">
	import { createEventDispatcher } from "svelte";
	export let selected: boolean = false;
	export let name: string;

	const dispatch = createEventDispatcher<{ click: string }>();

	function onClick() {
		dispatch("click", name);
	}
</script>

<div class={selected ? "selected" : ""} on:click={onClick}>
	<slot />
</div>

<style lang="scss">
	div {
		user-select: none;
		-webkit-user-select: none;
		cursor: pointer;
		padding: 12px;
		border-radius: 12px;
		display: inline-block;
		color: #8d8d8f;
		flex: 0 0 auto;
		&.selected {
			background: #161618;
			color: white;
		}

		&:hover {
			&:not(.selected) {
				color: #b4b4b4;
			}
		}

		transition: color 200ms;
	}
</style>
