<script lang="ts">
	import { stChannels, stLoggedUser } from "../../stores";
	import { createEventDispatcher } from "svelte";
	import { api, getUserProfilePictureLink } from "../../api";
	import ChatProfileMenu from "./ChatProfileMenu.svelte";
	import Bubble from "../Kit/Bubble.svelte";
	import type { ChatMessage } from "../../channels";

	export let messages: Array<ChatMessage>;
	export let side: "left" | "right";
	export let channel: string;
	export let selected: number;

	let offsetY = 0;

	let messagesRev: Array<ChatMessage>;
	$: messagesRev = [...messages].reverse();

	let moderator = false;
	let administrator = false;

	$: moderator = $stChannels[channel]?.users.find(
		(usr) => usr.uuid == $stLoggedUser?.uuid
	)?.is_moderator;

	$: administrator = $stChannels[channel]?.users.find(
		(usr) => usr.uuid == $stLoggedUser?.uuid
	)?.is_administrator;

	let showProfileMenu = false;

	function profileMenu(e: MouseEvent, message: { id: number }) {
		offsetY = e.clientY;
		showProfileMenu = true;
		dispatch("select", { id: message.id });
	}

	let dispatch = createEventDispatcher();
</script>

{#each messagesRev as message, i (message.id)}
	<div
		class="bubble-wrapper {side}"
		class:last={i == 0}
		data-date={message.date}
		data-username={side == "left" ? message.username + " · " : ""}
	>
		{#if side == "left"}
			<div
				class="profile-picture"
				class:menu={showProfileMenu}
				on:contextmenu|preventDefault={(e) => profileMenu(e, message)}
				style={i == 0
					? `background-image: url("${getUserProfilePictureLink(
							message.sender
					  )}")`
					: ""}
			>
				{#if showProfileMenu && selected === message.id}
					<ChatProfileMenu
						{offsetY}
						uuid={message.sender}
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
							api.promoteUserInChannel(ev.detail.uuid, channel);
						}}
						on:demote={(ev) => {
							api.demoteUserInChannel(ev.detail.uuid, channel);
						}}
						on:ban
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
			last={i != 0}
			one_above={i + 1 != messages.length}
			{channel}
		/>
	</div>
{/each}

<style lang="scss">
	.bubble-wrapper {
		position: relative;
		display: flex;
		flex-wrap: nowrap;

		&.last {
			margin-bottom: 20px;
			&::after {
				position: absolute;
				bottom: -18px;
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
		bottom: 2px;
	}
</style>
