<script lang="ts">
	import { createEventDispatcher } from "svelte";

	import SingleDigitInput from "./SingleDigitInput.svelte";

	const dispatch = createEventDispatcher();
	let remainder = "";

	let focused = 1;
	let digits: Array<string | null> = [null, null, null, null, null, null];
</script>

<SingleDigitInput
	focus={focused == 1}
	on:input={(event) => {
		focused = 2;
		remainder = event.detail.remainder;
		digits[0] = event.detail.value;
	}}
	on:deletion={() => {
		digits[0] = null;
	}}
	previousRemainder={remainder}
/>
<SingleDigitInput
	focus={focused == 2}
	on:input={(event) => {
		focused = 3;
		remainder = event.detail.remainder;
		digits[1] = event.detail.value;
	}}
	on:deletion={() => {
		focused = 1;
		digits[1] = null;
	}}
	previousRemainder={remainder}
/>
<SingleDigitInput
	focus={focused == 3}
	on:input={(event) => {
		focused = 4;
		remainder = event.detail.remainder;
		digits[2] = event.detail.value;
	}}
	on:deletion={() => {
		focused = 2;
		digits[2] = null;
	}}
	previousRemainder={remainder}
/>
<SingleDigitInput
	focus={focused == 4}
	on:input={(event) => {
		focused = 5;
		remainder = event.detail.remainder;
		digits[3] = event.detail.value;
	}}
	on:deletion={() => {
		focused = 3;
		digits[3] = null;
	}}
	previousRemainder={remainder}
/>
<SingleDigitInput
	focus={focused == 5}
	on:input={(event) => {
		focused = 6;
		remainder = event.detail.remainder;
		digits[4] = event.detail.value;
	}}
	on:deletion={() => {
		focused = 4;
		digits[4] = null;
	}}
	previousRemainder={remainder}
/>
<SingleDigitInput
	focus={focused == 6}
	on:input={(event) => {
		digits[5] = event.detail.value;

		let full_query = "";
		let isOk = true;
		for (const val of digits) {
			if (!val) {
				isOk = false;
				break;
			}
			full_query += val;
		}
		if (!isOk) {
			full_query = "";
		} else {
			dispatch("finish", { code: full_query });
		}
	}}
	on:deletion={() => {
		focused = 5;
		digits[5] = null;
	}}
	previousRemainder={remainder}
/>
