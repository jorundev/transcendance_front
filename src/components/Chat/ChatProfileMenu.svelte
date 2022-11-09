<script lang="ts">
	import { ChannelType } from "../../channels";
	import { stChannels } from "../../stores";
	import { createEventDispatcher } from "svelte";
	import ClickOutside from "svelte-click-outside";
	import { api, APIStatus } from "../../api";
	import { push } from "svelte-spa-router";

	export let uuid: string;
	export let moderator: boolean;
	export let administrator: boolean;
	export let user: { is_moderator: boolean; is_administrator: boolean };
	export let offsetY: number;
	export let is_in_channel: boolean;
	export let banned: boolean;
	export let muted: boolean;

	let pxOffset = "0px";

	$: {
		if (offsetY + height + 68 > window.innerHeight) {
			pxOffset = window.innerHeight - (offsetY + height + 70) + "px";
		} else {
			pxOffset = "0px";
		}
	}

	$: if (user) {
		pxOffset = pxOffset;
	}

	let height = 0;

	let dispatch = createEventDispatcher();

	async function directMessage() {
		const channel = Object.entries($stChannels)
			.map(([_, channel]) => channel)
			.filter((channel) => channel.type === ChannelType.Direct)
			.filter((channel) =>
				channel.users.map((user) => user.uuid).includes(uuid)
			);
		if (channel.length === 1) {
			dispatch("direct", {
				uuid: channel[0].uuid,
			});
		} else if (channel.length === 0) {
			const resp = await api.createDirectMessage(uuid);
			if (resp !== null && resp !== APIStatus.NoResponse) {
				dispatch("direct", {
					uuid: resp.uuid,
				});
			}
		}
	}

	function goToProfile() {
		push("/profile/" + uuid);
	}
</script>

<ClickOutside on:clickoutside={() => dispatch("back")}>
	<div
		class="cpm"
		bind:clientHeight={height}
		style="transform: translateY({pxOffset});"
	>
		{#if administrator || moderator}
			<div class="title noselect">User options</div>
		{/if}
		<div class="entry" on:click={goToProfile}>Go to profile</div>
		<div class="entry" on:click={directMessage}>Send a direct message</div>
		<div class="entry">Invite to casual game</div>
		{#if (administrator || moderator) && !user?.is_administrator}
			<div class="title noselect">Moderator options</div>
			{#if muted}
				<div
					class="entry red"
					on:click={() => dispatch("unmute", { uuid })}
				>
					Unmute
				</div>
			{:else}
				<div
					class="entry red"
					on:click={() => dispatch("mute", { uuid })}
				>
					Mute
				</div>
			{/if}
			<div
				class="entry red"
				class:disabled={!is_in_channel}
				on:click={() => {
					if (is_in_channel) {
						dispatch("kick", { uuid });
					}
				}}
			>
				Kick
			</div>
			{#if banned}
				<div
					class="entry red"
					on:click={() => dispatch("unban", { uuid })}
				>
					Unban
				</div>
			{:else}
				<div
					class="entry red"
					on:click={() => dispatch("ban", { uuid })}
				>
					Ban
				</div>
			{/if}
		{/if}
		{#if administrator}
			<div class="title red noselect">Administrator options</div>
			{#if user?.is_moderator}
				<div
					class="entry yellow"
					on:click={() => {
						if (is_in_channel) {
							dispatch("demote", { uuid });
						}
					}}
				>
					Demote
				</div>
			{:else}
				<div
					class="entry yellow"
					class:disabled={!is_in_channel}
					on:click={() => dispatch("promote", { uuid })}
				>
					Promote
				</div>
			{/if}
		{/if}
	</div>
</ClickOutside>

<style lang="scss">
	.cpm {
		user-select: none;
		-webkit-user-select: none;
		position: absolute;
		display: flex;
		left: 50px;
		top: -8px;
		z-index: 1;
		gap: 10px;
		flex-direction: column;
		min-width: 200px;
		padding: 10px;
		background: rgb(34, 34, 34);
		border-radius: 18px;
		border: 1px solid rgb(61, 61, 61);
	}

	.title {
		color: rgb(89, 89, 89);
		text-align: center;
		padding-top: 10px;
		padding-bottom: 10px;
		border-bottom: 1px solid rgb(58, 58, 58);
	}

	.entry {
		padding: 10px;
		border-radius: 10px;
		cursor: pointer;

		&.red {
			color: red;
		}
		&.yellow {
			color: rgb(255, 198, 8);
		}

		&:hover {
			background: rgb(23, 23, 23);
		}

		&.disabled {
			color: gray;
			cursor: not-allowed;
		}

		&:active {
			background: rgb(15, 15, 15);
		}
	}

	.noselect {
		user-select: none;
		-webkit-user-select: none;
	}
</style>
