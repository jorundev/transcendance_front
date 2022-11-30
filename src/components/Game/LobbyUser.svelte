<script lang="ts">
	import { padIdentifier } from "../../utils";
	import { api, APIStatus } from "../../api";
	import type { User } from "../../users";
	import UserAvatar from "../Users/UserAvatar.svelte";
	import { createEventDispatcher } from "svelte";
	import Button from "../Kit/Button.svelte";
	import { stLobby, stLoggedUser, stToast } from "../../stores";

	export let uuid: string = "";
	export let player: boolean = false;
	export let canBeReady = false;

	export let invited = false;
	export let ready = false;
	export let player1 = false;

	let isPlayer: boolean;
	$: isPlayer = player && $stLoggedUser.uuid === uuid;

	let user: User;

	let dispatch = createEventDispatcher();

	$: {
		if (uuid) {
			api.getUserData(uuid).then((req) => {
				if (req !== null && req !== APIStatus.NoResponse) {
					user = req;
				}
			});
		}
	}

	let userID = "????";
	$: userID = padIdentifier(parseInt(user?.identifier));
</script>

<div
	class="luser"
	class:isplayer={isPlayer}
	class:invited={invited && player}
	on:click={async () => {
		if (!isPlayer && player1) {
			const res = await api.kickFromLobby($stLobby.uuid, uuid);
			if (res === null || res === APIStatus.NoResponse || res.statusCode === 404) {
				stToast.set("Error while kicking player from lobby");
				return ;
			}
		}
	}}
>
	<div class="avatar">
		<UserAvatar {uuid} />
	</div>
	<div class="info">
		<div class="username">{user?.username}</div>
		<div class="id">#{userID}</div>
	</div>
	{#if player}
		<div class="isplayer">
			{#if isPlayer && !invited}
				{#if !ready}
					{#if canBeReady}
						<div class="button">
							<Button
								timeout={600}
								on:click={() => dispatch("ready")}
								>I'm ready!</Button
							>
						</div>
					{:else}
						<div class="indicator waiting">Waiting for players</div>
					{/if}
				{:else}
					<div class="indicator ready">Ready</div>
				{/if}
			{:else}
				<div class="indicator" class:ready class:invited>
					{#if invited}
						Invited
					{:else if ready}
						Ready
					{:else}
						Not ready
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style lang="scss">
	.luser {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 16px 14px;
		box-sizing: border-box;

		&.invited {
			opacity: 0.3;
		}

		&:not(.isplayer):hover {
			background: #202327;
			cursor: pointer;
		}

		.avatar {
			flex-shrink: 0;
			width: 50px;
			height: 50px;
		}

		.info {
			display: flex;

			.id {
				color: rgb(107, 107, 107);
			}
		}

		.isplayer {
			display: flex;
			justify-content: flex-end;
			width: 100%;
		}

		.button {
			width: 160px;
		}

		.indicator {
			width: 160px;
			height: 43px;
			display: grid;
			place-items: center;

			&.ready {
				color: green;
			}
			&:not(.ready):not(.invited):not(.waiting) {
				color: red;
			}
			&.waiting {
				color: rgb(169, 101, 101);
			}
		}
	}
</style>
