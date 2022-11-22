<script lang="ts">
	import { pop, replace } from "svelte-spa-router";
	import { onMount } from "svelte";
	import { GAME_HEIGHT, GAME_WIDTH, PlayerRole, Pong } from "../pong/Pong";
	import { onDestroy } from "svelte";
	import type { PongClient } from "../pong/PongClient";
	import { stPongClient } from "../stores";

	// $: if ($stLobby === null) {
	//     replace("/play");
	// }

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let pong: PongClient = null;

	let secs = 0;
	let oldTs = 0;
	let oldSecs = 0;

	let play = false;
	let hidecursor = false;

	let down = false;
	let up = false;
	let shift = false;

	$: if (!$stPongClient) {
		pop();
	}

	function gameLoop(ts: number) {
		if (!pong) {
			return;
		}

		secs = (ts - oldTs) / 1000;
		const dt = secs - oldSecs;
		oldSecs = secs;

		pong.setShift(shift);
		if (up && !down) {
			pong.moveUp();
		}
		if (down && !up) {
			pong.moveDown();
		}

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

	function keyDown(event: KeyboardEvent) {
		if (event.key === "ArrowDown") {
			down = true;
		} else if (event.key === "ArrowUp") {
			up = true;
		} else if (event.key === "Shift") {
			shift = true;
		}
	}

	function keyUp(event: KeyboardEvent) {
		if (event.key === "ArrowDown") {
			down = false;
		} else if (event.key === "ArrowUp") {
			up = false;
		} else if (event.key === "Shift") {
			shift = false;
		}
	}

	$: {
		if (canvas) {
			if ($stPongClient && !pong) {
				pong = $stPongClient;
				play = true;
				ctx = canvas.getContext("2d");
				window.requestAnimationFrame(gameLoop);
			} else {
				pong = null;
			}
		}
	}

	onDestroy(() => {
		pong = undefined;
		play = false;
		stPongClient.set(null);
	});
</script>

<svelte:head>
	<title>Game! - NEW SHINJI MEGA PONG ULTIMATE</title>
</svelte:head>
<svelte:window on:keydown={keyDown} on:keyup={keyUp} />
<div class="game">
	<div class="wrapper">
		<canvas
			class="game-canvas"
			bind:this={canvas}
			on:mousemove={onMouseMove}
			on:touchmove={onTouchMove}
			on:mouseenter={() => (hidecursor = true)}
			on:mouseleave={() => (hidecursor = false)}
			class:hidecursor
			width={GAME_WIDTH}
			height={GAME_HEIGHT}
		/>
	</div>
</div>

<style lang="scss">
	.game {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: 100%;
		height: 100%;
		padding: 20px;
		box-sizing: border-box;

		.wrapper {
			position: relative;
			&::before {
				content: "";
				position: absolute;
				width: 100%;
				height: 100%;
				left: 0;
				top: 0;
				background-color: #21d4fd;
				background-image: linear-gradient(
					19deg,
					#21d4fd 0%,
					#b721ff 100%
				);

				z-index: 0;
			}
		}

		.game-canvas {
			position: relative;
			width: 100%;
			z-index: 1;

			&.hidecursor {
				cursor: crosshair;
			}
		}
	}
</style>
