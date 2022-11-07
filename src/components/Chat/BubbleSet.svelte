<script lang="ts">
	import { stChannels, stLoggedUser, stUsers } from "../../stores";
	import { createEventDispatcher } from "svelte";
	import { api, getUserProfilePictureLink } from "../../api";
	import ChatProfileMenu from "./ChatProfileMenu.svelte";
	import Bubble from "../Kit/Bubble.svelte";
	import type { ChatMessage } from "../../channels";

	export let messages: Array<ChatMessage>;
	export let side: "left" | "right";
	export let channel: string;
	export let selected: string;
	export let one_above: boolean;
	export let one_below: boolean;

	let offsetY = 0;

	let moderator = false;
	let administrator = false;

	$: moderator = $stChannels[channel]?.users.find(
		(usr) => usr.uuid == $stLoggedUser?.uuid
	)?.is_moderator;

	$: administrator = $stChannels[channel]?.users.find(
		(usr) => usr.uuid == $stLoggedUser?.uuid
	)?.is_administrator;

	let showProfileMenu = false;

	function profileMenu(e: MouseEvent, message: { uuid: string }) {
		offsetY = e.clientY;
		showProfileMenu = true;
		dispatch("select", { uuid: message.uuid });
	}

	let dispatch = createEventDispatcher();

	let sender = messages[0] ? messages[0].sender : null;
	$: sender = messages[0] ? messages[0].sender : null;

	let avatarLink = getUserProfilePictureLink(sender);
	$: if ($stUsers[sender].avatar)
		avatarLink = getUserProfilePictureLink(sender);
</script>

<div class="set">
	{#each messages as message, i (message.uuid)}
		<div
			class="bubble-wrapper {side}"
			class:last={i + 1 === messages.length && !one_below}
			data-date={message.date}
			data-username={side == "left" ? message.username + " · " : ""}
		>
			{#if side == "left"}
				<div
					class:profile-picture={true}
					class:menu={showProfileMenu}
					on:contextmenu|preventDefault={(e) =>
						profileMenu(e, message)}
					style={i + 1 === messages.length && !one_below
						? "background-image: url('" + avatarLink + "');"
						: ""}
				>
					{#if showProfileMenu && selected === message.uuid}
						<ChatProfileMenu
							{offsetY}
							uuid={message.sender}
							banned={$stChannels[channel].banned_users
								.map((u) => u.user.uuid)
								.includes(message.sender)}
							muted={$stChannels[channel].muted_users
								.map((u) => u.user.uuid)
								.includes(message.sender)}
							on:back={() => (showProfileMenu = false)}
							{moderator}
							{administrator}
							user={$stChannels[channel]?.users.find(
								(usr) => usr.uuid === message.sender
							)}
							on:kick={(ev) => {
								api.kickFromChannel(ev.detail.uuid, channel);
							}}
							on:promote={(ev) => {
								api.promoteUserInChannel(
									ev.detail.uuid,
									channel
								);
							}}
							on:demote={(ev) => {
								api.demoteUserInChannel(
									ev.detail.uuid,
									channel
								);
							}}
							on:ban
							on:unban
							on:mute
							on:unmute
							on:direct
							is_in_channel={$stChannels[channel]?.users
								.map((u) => u.uuid)
								.includes(message.sender)}
						/>
					{/if}
				</div>
			{/if}
			<Bubble
				{message}
				{side}
				last={i + 1 === messages.length && !one_below}
				one_above={i !== 0 || one_above}
				{channel}
			/>
		</div>
	{/each}
</div>

<style lang="scss">
	.bubble-wrapper {
		position: relative;
		display: flex;
		flex-wrap: nowrap;

		&.last {
			padding-bottom: 6px;
			&::after {
				position: absolute;
				bottom: -8px;
				content: attr(data-username) attr(data-date);
				color: gray;
				font-size: 14px;
			}
		}

		&.right {
			justify-content: right;
			&.last {
				&::after {
					right: 0;
				}
			}
		}

		&.left {
			&.last {
				margin-bottom: 20px;
				&::after {
					left: 50px;
				}
			}
		}
	}

	.profile-picture {
		background-position: center;
		position: absolute;
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		border-radius: 100%;
		background-size: cover;
		bottom: 10px;
	}
</style>
