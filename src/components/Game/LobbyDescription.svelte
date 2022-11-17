<script lang="ts">
	import { stLobbies, stLobby } from "../../stores";
	import { push } from "svelte-spa-router";
	import { api, APIStatus, type Lobby } from "../../api";
	import Button from "../Kit/Button.svelte";
	import UserAvatar from "../Users/UserAvatar.svelte";

	export let lobby: Lobby;

	let status = "";

	$: {
		if (!lobby.players?.[1]) {
			status = "Waiting for players";
		}
	}

	async function join() {
		const l = await api.joinLobby(lobby.uuid);
		if ((l as any).statusCode === 404) {
			stLobbies.update((old) => {
				delete old[lobby.uuid];
				return old;
			});
		}
		if (l !== null && l !== APIStatus.NoResponse) {
			$stLobby = l;
			$stLobbies[l.uuid] = l;
			setTimeout(() => push("/play/casual"));
		}
	}
</script>

<div class="lobby-desc">
	<div class="info">
		<div class="avatars">
			<div class="avatar">
				<UserAvatar uuid={lobby.players[0]} />
			</div>
			vs
			<div class="avatar" class:noplayer={!lobby.players[1]}>
				<UserAvatar uuid={lobby.players[1]} />
			</div>
		</div>
		<div class="status">{status}</div>
		<div class="spectator-count">
			{lobby.spectators.length} / {lobby.max_spectators} spectators
		</div>
	</div>
	<div class="spectate">
		<div class="button">
			<Button on:click={join}>Spectate</Button>
		</div>
	</div>
</div>

<style lang="scss">
	.lobby-desc {
		background: rgb(29, 29, 29);
		border-radius: 10px;
		padding: 10px;
		display: flex;

		.spectator-count {
			background: rgb(70, 70, 70);
			padding: 4px;
			border-radius: 4px;
		}

		.spectate {
			flex-grow: 1;

			display: flex;
			justify-content: flex-end;
			.button {
				display: grid;
				place-items: center;
				max-width: 100px;
			}
		}
	}
	.avatar {
		position: relative;
		flex-shrink: 0;
		width: 42px;
		height: 42px;
		border-radius: 100%;
		overflow: hidden;

		&.noplayer::after {
			content: "?";
			user-select: none;
			display: grid;
			place-items: center;
			font-size: 20px;
			font-weight: bold;
			position: absolute;
			width: 100%;
			height: 100%;
			left: 0;
			top: 0;
			background-color: rgba(0, 0, 0, 0.705);
		}
	}
	.info {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
		justify-content: center;
		min-width: 150px;
	}
	.avatars {
		display: flex;
		gap: 10px;
		align-items: center;
	}
	.status {
		font-size: 15px;
	}
</style>
