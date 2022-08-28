<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";

	export let focus: boolean = false;
	export let previousRemainder = "";
	let old_length = 0;

	const dispatch = createEventDispatcher();

	let input: HTMLInputElement;

	$: {
		if (focus && input) {
			focus = false;
			input.focus();
			input.select();

			if (previousRemainder.length != 0) {
				input.value = previousRemainder;
				input.dispatchEvent(new Event("input", {}));
				previousRemainder = "";
			}
		}
	}
</script>

<svelte:window
	on:keydown={(event) => {
		if (
			document.activeElement == input &&
			input.value.length == 0 &&
			event.key == "Backspace"
		) {
			dispatch("deletion", {});
		}
	}}
/>
<div class="wrap">
	<input
		bind:this={input}
		type="text"
		on:input={() => {
			input.value = input.value.substring(0, 6).replace(/[^0-9]/g, "");
			if (input.value.length != 0) {
				let remainder = input.value.substring(1);
				dispatch("input", {
					remainder,
					value: input.value.substring(0, 1),
				});
				old_length = 1;
			}
			if (input.value.length == 0 && old_length != 0) {
				old_length = 0;
				dispatch("deletion", {});
			}

			if (input.value.length > 1) {
				input.value = input.value.substring(0, 1);
			}
		}}
	/>
</div>

<style lang="scss">
	.wrap {
		max-width: 50px;
		min-width: 0;
		height: 100%;
	}

	input {
		all: unset;
		width: 100%;
		height: 100%;
		display: block;
		background: rgb(53, 53, 53);
		font-size: 30px;
		text-align: center;
		border-radius: 10px;
	}
</style>
