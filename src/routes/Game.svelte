<script lang="ts">
	import { pop, replace } from "svelte-spa-router";
	import { GAME_HEIGHT, GAME_WIDTH } from "../pong/Pong";
	import { onDestroy } from "svelte";
	import type { PongClient } from "../pong/PongClient";
	import { stGameSettings, stLobby, stPongClient } from "../stores";
	import { api } from "../api";

	let canvas: HTMLCanvasElement;
	let game: HTMLDivElement;
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
		if ($stLobby) {
			console.log($stLobby);
			replace("/play/casual");
		} else {
			pop();
		}
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
		if (pong) {
			const rect = canvas.getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width;
			const y = (e.clientY - rect.top) / rect.height;
			pong.onMouseMove(x * GAME_WIDTH, y * GAME_HEIGHT);
		}
	}

	function onTouchMove(e: TouchEvent) {
		if (pong) {
			const rect = canvas.getBoundingClientRect();

			const x = (e.touches[0].clientX - rect.left) / rect.width;
			const y = (e.touches[0].clientY - rect.top) / rect.height;
			pong.onMouseMove(x * GAME_WIDTH, y * GAME_HEIGHT);
		}
	}

	function keyDown(event: KeyboardEvent) {
		if (pong) {
			if (event.key === "ArrowDown") {
				down = true;
			} else if (event.key === "ArrowUp") {
				up = true;
			} else if (event.key === "Shift") {
				shift = true;
			}
		}
	}

	function keyUp(event: KeyboardEvent) {
		if (pong) {
			if (event.key === "ArrowDown") {
				down = false;
			} else if (event.key === "ArrowUp") {
				up = false;
			} else if (event.key === "Shift") {
				shift = false;
			}
		}
	}

	async function setFullcreen() {
		await game.requestFullscreen().catch((e) => {
			/* Already in fullscreen mode */
		});
	}

	async function unsetFullcreen() {
		if (document.exitFullscreen) {
			await document.exitFullscreen().catch((e) => {
				/* Not in fullscreen mode */
			});
		}
	}

	async function setupAndPlay() {
		ctx = canvas.getContext("2d");
		pong = $stPongClient;
		play = true;
		console.log(pong);
		window.requestAnimationFrame(gameLoop);

		// set fullscreen and orientation
		if (
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
				navigator.userAgent
			)
		) {
			await setFullcreen();
			await screen.orientation
				.lock("landscape")
				.then(() => {})
				.catch((e) => {
					console.log("Could not go into landscape mode:", e);
				});
		}
	}

	$: {
		if (canvas) {
			if ($stPongClient && !pong) {
				setupAndPlay();
			} else {
				pong = null;
			}
		}
	}

	onDestroy(() => {
		pong = undefined;
		play = false;
		stPongClient.set(null);
		try {
			// This will throw an exception on desktop, so the fullscreen function will only
			// happen on mobile
			screen.orientation.unlock();
			unsetFullcreen();
		} catch (e) {
			// We are on desktop, do nothing
		}
	});
</script>

<svelte:head>
	<title>Game! - NEW SHINJI MEGA PONG ULTIMATE</title>
</svelte:head>
<svelte:window on:keydown={keyDown} on:keyup={keyUp} />
<div class="game" bind:this={game}>
	<div
		class="wrapper"
		class:blue={$stGameSettings.background === "blue"}
		class:red={$stGameSettings.background === "red"}
		class:green={$stGameSettings.background === "green"}
	>
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

		&:fullscreen {
			padding: 50px;
		}

		.wrapper {
			position: relative;
			&::before {
				content: "";
				position: absolute;
				width: 100%;
				height: 100%;
				left: 0;
				top: 0;
				z-index: 0;
			}

			&.blue::before {
				background-color: #21d4fd;
				background-image: linear-gradient(
					19deg,
					#21d4fd 0%,
					#b721ff 100%
				);
			}
			&.red::before {
				background-color: #fd2c21;
				background-image: linear-gradient(
					19deg,
					#fd3b21 0%,
					#940000 100%
				);
			}
			&.green::before {
				background-color: #21fd21;
				background-image: linear-gradient(
					19deg,
					#21fd21 0%,
					#007563 100%
				);
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
