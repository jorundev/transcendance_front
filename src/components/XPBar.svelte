<script lang="ts">
	import { onMount } from "svelte";
	import { PongRanking } from "../pong/ranking";

	const calculator = new PongRanking();

	export let xp: number;
	export let xp_end = xp;

	const data = calculator.getRank(xp);
	const data_next = calculator.getRank(xp_end);

	let rank = "";
	$: rank = data.rank;
	let level = 0;
	$: level = data.level;

	let currentPercentage: number = 0;
	let nextPercentage: number = 0;

	function firstAnim() {
		let nextLevel = data.level !== data_next.level;

		if (!nextLevel) {
			nextPercentage = (data_next.xp / data_next.xp_end) * 100;
		} else {
			nextPercentage = 100;
			setTimeout(() => {
				currentPercentage = 0;
				nextPercentage = 0;
				secondAnim();
			}, 1000);
		}
	}

	function secondAnim() {
		setTimeout(() => {
			rank = data_next.rank;
			level = data_next.level;
			nextPercentage = (data_next.xp / data_next.xp_end) * 100;
		}, 50);
	}

	onMount(() => {
		const relativeXp = data.xp / data.xp_end;
		currentPercentage = relativeXp * 100;
		if (xp !== xp_end) {
			setTimeout(firstAnim, 1000);
		}
	});
</script>

<div class="xp" class:glow={level === 18}>
	<div class="bar">
		<div
			class="future"
			class:noanim={nextPercentage === 0}
			style={"width: " + nextPercentage + "%"}
		/>
		<div class="actual" style={"width: " + currentPercentage + "%"} />
	</div>
	<div class="desc">
		Level {level} ({rank})
	</div>
</div>

<style lang="scss">
	.desc {
		font-size: 14px;
		flex-shrink: 0;
	}

	.xp {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 10px;
		align-items: center;
		background: rgb(10, 10, 10);
		padding: 10px 10px;
		border-radius: 6px;

		&.glow {
            border: 1px solid red;
    box-shadow:0 0 10px #ff0000;
    background: rgb(75,11,11);
background: linear-gradient(110deg, rgb(109, 28, 28) 0%, rgba(172,29,29,1) 35%, rgba(194,35,35,1) 100%);
		}
	}

	.bar {
		position: relative;
		overflow: hidden;
		width: 100%;
		height: 10px;
		background-color: rgb(50, 50, 50);
		border-radius: 50px;

		.future {
			&:not(.noanim) {
				transition: width 1s ease-in-out;
			}
			position: absolute;
			left: 0;
			height: 100%;
			background-color: rgb(29, 121, 170);
		}

		.actual {
			position: absolute;
			left: 0;
			height: 100%;
			background-color: rgb(170, 29, 142);
		}
	}
</style>
