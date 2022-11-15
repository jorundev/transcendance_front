<script lang="ts">
	import { stLoggedUser } from "../stores";
	import LobbyUser from "../components/Game/LobbyUser.svelte";
	import SideBar from "../components/SideBar.svelte";
	import Button from "../components/Kit/Button.svelte";
	import { replace } from "svelte-spa-router";
	import Modal from "../components/Kit/Modal.svelte";
	import InviteFriendModal from "../components/Game/InviteFriendModal.svelte";

	export let params: { uuid: string };

	export let player1: string = $stLoggedUser.uuid;
	export let player2: string = "";
	let players: Array<string> = [];

	export let spectators: Array<string> = [
		$stLoggedUser.uuid,
		$stLoggedUser.uuid,
		$stLoggedUser.uuid,
	];

	$: {
		players = [];
		if (player1) {
			players.push(player1);
		}
		if (player2) {
			players.push(player2);
		}

		if (!player1) {
			replace("/play");
		}
	}

	let isMaster = false;
	$: isMaster = player1 === $stLoggedUser.uuid;

	const maxPlayerCount = 2;
	const maxSpectatorCount = 16;

	let innerWidth = 0;

	let inviteFriendModal = false;

	function invite(e: any) {
		inviteFriendModal = false;

		//TODO:

		player2 = e.detail;
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
<SideBar />
<svelte:head>
	<title>Casual Game - NEW SHINJI MEGA PONG ULTIMATE</title>
</svelte:head>
<svelte:window bind:innerWidth />
<div class="casual">
	<div class="title">Casual Game</div>
	<div class="grid">
		<div class="players">
			<div class="desc">
				Players <div
					class="count"
					class:ok={players.length === maxPlayerCount}
					class:toomany={players.length > maxPlayerCount}
				>
					{players.length} / {maxPlayerCount}
				</div>
			</div>
			<div class="content">
				{#each players as uuid}
					<LobbyUser {uuid} player />
				{/each}
				{#if isMaster && !player2}
					<div class="button">
						<Button on:click={() => (inviteFriendModal = true)}
							>Invite friend</Button
						>
					</div>
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
	</div>
</div>

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

	.title {
		font-size: 20px;
		padding-bottom: 30px;
	}

	.card {
		overflow-y: hidden;
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

	.box {
		overflow-y: hidden;
		border: 1px solid rgb(60, 60, 60);
		border-radius: 6px;
		padding: 10px;
		margin-top: 10px;
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
			border: 1px solid rgb(60, 60, 60);
			border-radius: 6px;
			height: auto;
			flex-shrink: 0;
			flex-grow: 1;
			overflow: hidden;
			position: relative;
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
