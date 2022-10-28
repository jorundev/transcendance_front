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
	<div class="duration">Duration:</div>
	<div class="selectors">
		<input type="number" bind:value={num} />
		<div class="selector">
			<select bind:value={selected}>
				<option value="months">Months</option>
				<option value="days">Days</option>
				<option value="hours">Hours</option>
				<option value="minutes">Minutes</option>
			</select>
		</div>
	</div>
</div>

<style lang="scss">
	.duration-picker {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		margin-top: 10px;
		margin-bottom: 10px;

		.duration {
			width: 100%;
			margin-bottom: 6px;
		}

		.selectors {
			display: flex;
			gap: 10px;
		}

		input[type="number"] {
			max-width: 48.5%;
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

		.selector {
			width: 100%;
		}

		select {
			width: 100%;
			font-size: 20px;
			color: white;
			background: #282828;
			border: none;
			padding-left: 10px;
			padding: 10px;
			border-radius: 10px;
		}
	}
</style>
