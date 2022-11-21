<script lang="ts">
	import { replace } from "svelte-spa-router";
	import { onMount } from "svelte";
	import { GAME_HEIGHT, GAME_WIDTH, Pong } from "../pong/Pong";
	import { onDestroy } from "svelte";

	// $: if ($stLobby === null) {
	//     replace("/play");
	// }

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let pong: Pong;

	let secs = 0;
	let oldTs = 0;
	let oldSecs = 0;

	let play = false;

	function gameLoop(ts: number) {
		if (!pong) {
			return;
		}

		secs = (ts - oldTs) / 1000;
		const dt = secs - oldSecs;
		oldSecs = secs;

		pong.update(dt);
		pong.draw(ctx);

		if (play) {
			window.requestAnimationFrame(gameLoop);
		}
	}

	function onMouseMove(e: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width;
		const y = (e.clientY - rect.top) / rect.height;
		pong.onMouseMove(x * GAME_WIDTH, y * GAME_HEIGHT);
	}
	function onTouchMove(e: TouchEvent) {
		const rect = canvas.getBoundingClientRect();

		const x = (e.touches[0].clientX - rect.left) / rect.width;
		const y = (e.touches[0].clientY - rect.top) / rect.height;
		pong.onMouseMove(x * GAME_WIDTH, y * GAME_HEIGHT);
	}

	onMount(() => {
		pong = new Pong();
		play = true;
		ctx = canvas.getContext("2d");
		window.requestAnimationFrame(gameLoop);
	});

	onDestroy(() => {
		pong = undefined;
		play = false;
	});
</script>

<div class="game">
	<canvas
		class="game-canvas"
		bind:this={canvas}
		on:mousemove={onMouseMove}
        on:touchmove={onTouchMove}
		width={GAME_WIDTH}
		height={GAME_HEIGHT}
	/>
</div>

<style lang="scss">
	.game {
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: 100%;
		height: 100%;
		padding: 20px;
		box-sizing: border-box;

		.game-canvas {
			background: rgb(53, 53, 53);
			width: 100%;
		}
	}
</style>
