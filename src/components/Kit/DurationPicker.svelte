<script lang="ts">
	import { createEventDispatcher } from "svelte";

	let num: number = 1;
	let selected: string;

	let dispatch = createEventDispatcher();

	$: num = ((num as any) + "") as any as number;
	$: {
		let multiplier = 0;
		switch (selected) {
			case "minutes":
				multiplier = 60;
				break;
			case "hours":
				multiplier = 60 * 60;
				break;
			case "days":
				multiplier = 60 * 60 * 24;
				break;
			case "months":
				multiplier = 60 * 60 * 24 * 30;
				break;
		}
		dispatch("time", multiplier * num);
	}
</script>

<div class="duration-picker">
	<div>Duration:</div>
	<input type="number" bind:value={num} />
	<select bind:value={selected}>
		<option value="months">Months</option>
		<option value="days">Days</option>
		<option value="hours">Hours</option>
		<option value="minutes">Minutes</option>
	</select>
</div>

<style lang="scss">
	.duration-picker {
		width: 100%;
		margin-top: 10px;
		margin-bottom: 10px;

		input[type="number"] {
			width: 120px;
			border: none;
			background: #242424;
			color: white;
			padding: 10px;
			border-radius: 10px;
			box-sizing: border-box;
			font-size: 20px;

			&:focus {
				background: #282828;
				outline: none;
			}
		}

		select {
			font-size: 20px;
			color: white;
			background: #282828;
			border: none;
			padding-left: 10px;
		}
	}
</style>
