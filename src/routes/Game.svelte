<script lang="ts">
	import { location, pop, replace } from "svelte-spa-router";
	import { GAME_HEIGHT, GAME_WIDTH } from "../pong/Pong";
	import { onDestroy, onMount } from "svelte";
	import type { PongClient } from "../pong/PongClient";
	import { stGameSettings, stLobby, stPongClient } from "../stores";
	import type { User } from "../users";
	import { api, APIStatus } from "../api";
	import { padIdentifier } from "../utils";
	import UserAvatar from "../components/Users/UserAvatar.svelte";

	let canvas: HTMLCanvasElement;
	let game: HTMLDivElement;
	let ctx: CanvasRenderingContext2D;
	let pong: PongClient = null;

	let player1: User;
	let player2: User;

	onMount(async () => {
		const p1 = await api.getUserData($stLobby?.players[0]);
		const p2 = await api.getUserData($stLobby?.players[1]);

		if (p1 !== null && p1 !== APIStatus.NoResponse) {
			player1 = p1;
		}
		if (p2 !== null && p2 !== APIStatus.NoResponse) {
			player2 = p2;
		}
	});

	let displayOverlay = false;

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
			replace("/");
		} else {
			setTimeout(() => {
				if ($location !== "/") {
					pop();
				}
			}, 0);
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
		if (pong) {
			pong.setColors($stGameSettings.colors ?? ["white", "white"]);
		}
		play = true;
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
		<div
			class="overlay"
			class:active={displayOverlay}
			class:blur={displayOverlay}
		>
			{#if !displayOverlay}
				<div
					class="display-overlay-button"
					on:click={() => (displayOverlay = true)}
				>
					Menu
				</div>
			{:else}
				<div class="layout">
					<div class="players">
						<div class="player">
							<div class="avatar">
								<UserAvatar uuid={player1?.uuid}></UserAvatar>
							</div>
							<div class="info">
								{player1?.username}<div class="id">#{padIdentifier(parseInt(player1?.identifier))}</div>
							</div>
						</div>
						<div class="player">
							<div class="avatar">
								<UserAvatar uuid={player2?.uuid}></UserAvatar>
							</div>
							<div class="info">
								{player2?.username}<div class="id">#{padIdentifier(parseInt(player2?.identifier))}</div>
							</div>
						</div>
					</div>
					<div class="options">
						<div
							class="leave-overlay"
							on:click={() => (displayOverlay = false)}
						>
							Back to game
						</div>
						<div class="leave-game" on:click={() => replace("/")}>
							Leave game
						</div>
					</div>
				</div>
			{/if}
		</div>
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
		align-items: center;
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

			.overlay {
				//pointer-events: none;
				position: absolute;
				z-index: 1000;

				bottom: 0;
				left: 50%;

				&.active {
					left: 0;
					top: 0;
					width: 100%;
					height: 100%;
				}

				&.blur {
					background-color: rgba(0, 0, 0, 0.464);
					backdrop-filter: blur(6px);
				}

				.layout {
					position: relative;
					width: 100%;
					height: 100%;

					display: grid;
					place-items: center;

					.options {
						margin: 20px;

						width: 100%;
						max-width: 240px;
						> * {
							padding: 10px;
							border-bottom: 1px solid rgba(255, 255, 255, 0.212);
							background: rgba(0, 0, 0, 0.445);
							backdrop-filter: blur(6px);
							user-select: none;
							-webkit-user-select: none;

							&:hover {
								cursor: pointer;
								transform: scale(1.1);
							}
						}
					}
					
					.avatar {
						padding-right: 10px;
						width: 40px;
						height: 40px;
						flex-shrink: 0;
					}

					.players {
						display: flex;
						justify-content: space-between;
						position: absolute;
						top: 0;
						height: 60px;
						width: 100%;
						&:nth-child(1) {
							flex-direction: row;
						}
						&:nth-child(2) {
							flex-direction: row-reverse;
						}

						> * {
							display: flex;
							align-items: center;
							padding-left: 20px;
							padding-right: 20px;
							user-select: none;

							background: rgba(0, 0, 0, 0.445);
						}
					}
				}
				
				.info {
					display: flex;
					.id {
						color: rgba(255, 255, 255, 0.459);
					}
				}

				.display-overlay-button {
					cursor: pointer;
					border: max(1px, 0.1vw) solid white;
					background: rgba(0, 0, 0, 0.445);
					position: absolute;
					backdrop-filter: blur(6px);
					left: 50%;
					bottom: 4px;
					transform: translateX(-50%);
					padding: min(2vw, 20px);
					font-size: min(2vw, 20px);
				}
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
