<script lang="ts">
	import { stGameSettings, stLobby, stLoggedUser } from "../stores";
	import LobbyUser from "../components/Game/LobbyUser.svelte";
	import Button from "../components/Kit/Button.svelte";
	import { pop, replace } from "svelte-spa-router";
	import Modal from "../components/Kit/Modal.svelte";
	import InviteFriendModal from "../components/Game/InviteFriendModal.svelte";
	import { api } from "../api";
	import { LobbyPlayerReadyState } from "../lobbies";

	export let player1: string = "";
	export let player2: string = "";

	$: if ($stLobby === null) {
		replace("/play");
	}
	
	let color: string = "#000000";

	export let spectators: Array<string> = [];

	let maxSpectatorCount = 0;

	$: player1 = $stLobby?.players?.[0] ?? "";
	$: player2 = $stLobby?.players?.[1] ?? "";
	$: spectators = $stLobby?.spectators ?? [];
	$: maxSpectatorCount = $stLobby?.max_spectators ?? 0;

	$: {
		if (!player1) {
			pop();
		}
	}

	let isMaster = false;
	$: isMaster = player1 === $stLoggedUser.uuid;

	const maxPlayerCount = 2;

	let allPlayersInLobby = false;
	let allPlayersReady = false;

	$: allPlayersInLobby =
		($stLobby?.players_status?.[0] === LobbyPlayerReadyState.Ready ||
			$stLobby?.players_status?.[0] === LobbyPlayerReadyState.Joined) &&
		($stLobby?.players_status?.[1] === LobbyPlayerReadyState.Ready ||
			$stLobby?.players_status?.[1] === LobbyPlayerReadyState.Joined);

	$: allPlayersReady =
		$stLobby?.players_status?.[0] === LobbyPlayerReadyState.Ready &&
		$stLobby?.players_status?.[1] === LobbyPlayerReadyState.Ready;

	$: if (allPlayersReady) {
		replace("/game");
	}

	let playerCount = 0;
	$: playerCount = Number(!!player1) + Number(!!player2);

	let innerWidth = 0;

	let inviteFriendModal = false;

	async function invite(e: any) {
		player2 = e.detail;
		const inv = await api.invitePlayerToLobby(player2);
		inviteFriendModal = false;
	}

	async function ready(uuid: string) {
		if (!uuid) {
			return;
		}
		api.declareReady($stLobby.uuid);
	}
</script>

{#if inviteFriendModal}
	<Modal>
		<div class="modal">
			<InviteFriendModal
				on:back={() => (inviteFriendModal = false)}
				on:invite={invite}
			/>
		</div>
	</Modal>
{/if}

<svelte:head>
	<title>Casual Game - NEW SHINJI MEGA PONG ULTIMATE</title>
</svelte:head>
<svelte:window bind:innerWidth />
{#if $stLoggedUser}
	<div class="casual">
		<div class="title">Casual Game</div>
		<div class="grid">
			<div class="players" class:game={allPlayersReady}>
				<div class="desc">
					Players <div
						class="count"
						class:ok={playerCount === maxPlayerCount}
						class:toomany={playerCount > maxPlayerCount}
					>
						{playerCount} / {maxPlayerCount}
					</div>
				</div>
				<div class="content">
					<LobbyUser
						uuid={player1}
						player
						invited={$stLobby?.players_status?.[0] ===
							LobbyPlayerReadyState.Invited}
						ready={$stLobby?.players_status?.[0] ===
							LobbyPlayerReadyState.Ready}
						canBeReady={allPlayersInLobby}
						on:ready={() => ready(player1)}
					/>
					{#if isMaster && !player2}
						<div class="button">
							<Button on:click={() => (inviteFriendModal = true)}
								>Invite friend</Button
							>
						</div>
					{:else if player2}
						<LobbyUser
							uuid={player2}
							player
							invited={$stLobby?.players_status?.[1] ===
								LobbyPlayerReadyState.Invited}
							ready={$stLobby?.players_status?.[1] ===
								LobbyPlayerReadyState.Ready}
							canBeReady={allPlayersInLobby}
							on:ready={() => ready(player2)}
						/>
					{/if}
				</div>
			</div>
			<div class="spectators">
				<div class="desc">
					Spectators <div
						class="count"
						class:ok={spectators.length === maxSpectatorCount}
						class:toomany={spectators.length > maxSpectatorCount}
					>
						{spectators.length} / {maxSpectatorCount}
					</div>
				</div>
				<div class="content">
					{#each spectators as uuid}
						<LobbyUser {uuid} />
					{/each}
				</div>
			</div>
			<div class="game-look">
				<div class="desc">
					Game Options
				</div>
				<div class="inner">
					<div class="opt">Background</div>
					<div class="buttons">
						<Button highlight={$stGameSettings.background === "red"} padding="6px" on:click={() => $stGameSettings.background = "red"}>Red</Button>
						<Button highlight={$stGameSettings.background === "blue"} padding="6px" on:click={() => $stGameSettings.background = "blue"}>Blue</Button>
						<Button highlight={$stGameSettings.background === "green"} padding="6px" on:click={() => $stGameSettings.background = "green"}>Green</Button>
					</div>
					<div class="opt">Paddle color</div>
					<input type="color" bind:value={color}>
				</div>
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.casual {
		padding-top: 30px;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		padding-right: 20px;
	}

	.modal {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
	}
	
	.opt {
		padding-top: 10px;
		padding-bottom: 4px;
	}

	.title {
		font-size: 20px;
		padding-bottom: 30px;
	}

	.button {
		padding-left: 16px;
		padding-right: 16px;
		padding-bottom: 16px;
	}

	.content {
		display: flex;
		flex-direction: column;
		overflow-x: hidden;
		overflow-y: auto;
		max-height: 1600px;

		@media screen and (max-height: 1750px) {
			max-height: 900px;
		}
		@media screen and (max-height: 1330px) {
			max-height: 800px;
		}
		@media screen and (max-height: 1250px) {
			max-height: 700px;
		}
		@media screen and (max-height: 1130px) {
			max-height: 500px;
		}
		@media screen and (max-height: 950px) {
			max-height: 300px;
		}
		@media screen and (max-height: 800px) {
			max-height: 200px;
		}
	}

	.grid {
		display: flex;
		flex-wrap: wrap;
		width: 100%;
		height: auto;
		max-height: calc(100vh - 80px);
		gap: 10px;
		position: relative;

		> * {
			min-width: 300px;
			border: 1px solid rgb(60, 60, 60);
			border-radius: 6px;
			height: auto;
			flex-shrink: 0;
			flex-grow: 1;
			overflow: hidden;
			position: relative;
		}

		.game-look {
			min-width: 320px;
			
			.inner {
				display: flex;
				flex-direction: column;
				justify-content: center;
				padding: 10px;
				padding-top: 0;
				
				.buttons {
					padding-top: 6px;
					display: flex;
					gap: 10px;
				}
				
				input[type="color"] {
					cursor: pointer;
					width: 100%;
					border: none;
					height: 32px;
					margin: 0;
					padding: 0;
					position: relative;
					
					&:focus {
						outline: none;
					}
				}
			}
		}

		.desc {
			padding: 10px;
		}
	}

	.desc {
		display: flex;
		top: 0;
		width: auto;
		height: auto;
		align-items: center;
		gap: 10px;

		.count {
			padding: 6px 10px;
			background-color: rgb(32, 32, 32);
			border-radius: 10px;

			&.ok {
				color: green;
			}
			&.toomany {
				color: red;
			}
		}
	}

	.players {
		position: relative;
		overflow: hidden;

		&.game::after {
			display: grid;
			place-items: center;
			text-align: center;
			content: "Game started";
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.6);
		}
	}

	@media screen and (min-width: 800px) {
		.casual {
			padding-left: 72px;
		}
	}
	@media screen and (max-width: 799px) {
		.casual {
			padding-left: 20px;
		}
		.grid {
			> * {
				min-width: 300px;
			}
		}
	}
</style>
