<script lang="ts">
	import { LobbyWinner, type GameHistory } from "../lobbies";
	import { push } from "svelte-spa-router";
	import UserAvatar from "./Users/UserAvatar.svelte";
	import { api, APIStatus } from "../api";
	import type { User } from "../users";
	import { padIdentifier } from "../utils";

	export let user: string;
	export let data: GameHistory;

	let player1: User;
	let player2: User;

	$: {
		api.getUserData(data.players[0]).then((user) => {
			if (user !== null && user !== APIStatus.NoResponse) {
				player1 = user;
			}
		});
	}

	$: {
		api.getUserData(data.players[1]).then((user) => {
			if (user !== null && user !== APIStatus.NoResponse) {
				player2 = user;
			}
		});
	}

	let role =
		user === data.players[0] ? LobbyWinner.Player1 : LobbyWinner.Player2;

	function goToProfile(user_uuid: string) {
		if (user !== user_uuid) {
			push("/profile/" + user_uuid);
		}
	}
</script>

<div
	class="match"
	class:win={data.winner === role}
	class:lose={data.winner !== role && data.winner !== LobbyWinner.Tie}
>
	<div class="players">
		<div class="info">
			{player1?.username}
			<div class="id">
				#{padIdentifier(parseInt(player1?.identifier))}
			</div>
		</div>
		<div class="player">
			<div
				class="avatar"
				class:pointer={user !== data.players[0]}
				on:click={() => goToProfile(data.players[0])}
			>
				<UserAvatar uuid={data.players[0]} />
			</div>
		</div>
		<div class="score">
			{data.players_scores[0]}
		</div>
		<div class="sep">|</div>
		<div class="score">
			{data.players_scores[1]}
		</div>
		<div class="player">
			<div
				class="avatar"
				class:pointer={user !== data.players[1]}
				on:click={() => goToProfile(data.players[1])}
			>
				<UserAvatar uuid={data.players[1]} />
			</div>
		</div>
		<div class="info">
			{player2?.username}
			<div class="id">
				#{padIdentifier(parseInt(player2?.identifier))}
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.match {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
		min-height: 30px;
		border-radius: 10px;
		background: rgb(18, 18, 18);
		border: 1px solid rgb(50, 50, 51);
		padding: 10px;

		.score {
			font-size: 20px;
		}

		.sep {
			user-select: none;
			-webkit-user-select: none;
			color: rgba(255, 255, 255, 0.311);
		}

		.info {
			font-size: 14px;
			display: flex;
			.id {
				color: rgba(255, 255, 255, 0.471);
			}
		}

		&.win {
			border: 1px solid rgb(41, 193, 41);
			background: rgb(0, 71, 0);
		}
		&.lose {
			border: 1px solid rgb(193, 41, 41);
			background: rgb(71, 0, 0);
		}

		.avatar {
			flex-shrink: 0;
			width: 40px;
			height: 40px;
			position: relative;

			&.pointer {
				cursor: pointer;
			}
		}
	}

	.players {
		display: flex;
		align-items: center;
		gap: 10px;
	}
</style>
