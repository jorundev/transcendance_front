<script lang="ts">
	import { stUsers, stLoggedUser } from "../../stores";
	import { api, APIStatus } from "../../api";
	import Button from "../Kit/Button.svelte";
	import { createEventDispatcher } from "svelte";
	import { ChannelType, type Channel } from "../../channels";
	import type { User } from "../../users";
	import ChannelAvatar from "./ChannelAvatar.svelte";
	import { padIdentifier } from "../../utils";

	export let info: Channel;
	export let current: string;
	export let joined: boolean;
	let time_since_lm: number = 0;
	let time_str: string = "";
	let truncated_msg: string = "";

	let channelID = "";
	$: channelID =
		info.id !== undefined
			? padIdentifier(info.id)
			: padIdentifier(getDirectMessageIdentifier());

	let directMessageUsername = getDirectMessageUser();
	$: if (info) directMessageUsername = getDirectMessageUser();

	let directMessageAvatar = getDirectMessageAvatar();
	$: if (info.avatar) directMessageAvatar = getDirectMessageAvatar();

	$: {
		truncated_msg = info?.last_message?.value;
		if (!info?.last_message?.value) {
			truncated_msg = "<Deleted message>";
		} else if (info?.last_message?.value.length > 20) {
			truncated_msg = truncated_msg.substring(0, 20) + "...";
		}
	}

	$: {
		if (info?.loaded_messages.length != 0) {
			info.last_message =
				info?.loaded_messages[info?.loaded_messages.length - 1];
		} else {
			info.last_message = null;
		}
	}

	function getTimeStr(ts: number): string {
		if (ts < 15) {
			return "now";
		}

		if (ts < 60) {
			let n_seconds = Math.floor(ts);
			return n_seconds + `s ago`;
		}

		if (ts < 3600) {
			let n_minutes = Math.floor(ts / 60);
			return n_minutes + `min ago`;
		}

		if (ts < 3600 * 24) {
			let n_hours = Math.floor(ts / 3600);
			return n_hours + `h ago`;
		}

		let n_days = Math.floor(ts / (3600 * 24));
		return n_days + `d ago`;
	}

	$: {
		if (info?.last_message != null) {
			time_since_lm =
				(new Date().valueOf() - info?.last_message?.date.valueOf()) /
				1000;
		}
	}

	$: time_str = getTimeStr(time_since_lm);

	let last_message_sender: User = null;

	$: {
		if (info?.last_message) {
			api.getUserData(info?.last_message.sender)
				.then((val) => {
					if (val != APIStatus.NoResponse) {
						last_message_sender = val;
					}
				})
				.catch((err) => {
					console.log("Critical error: ", err);
				});
		}
	}

	function goToMessages() {
		if (!joined) {
			return;
		}
		dispatch("click", {
			channel: info,
		});
	}

	function getDirectMessageUser() {
		const otherUserArray = info.users.filter((user) => {
			return user.uuid !== $stLoggedUser?.uuid;
		});

		return !!otherUserArray[0] ? otherUserArray[0].name : "Direct message";
	}

	function getDirectMessageAvatar() {
		const otherUserArray = info.users.filter((user) => {
			return user.uuid !== $stLoggedUser?.uuid;
		});

		return otherUserArray[0] ? otherUserArray[0].avatar : null;
	}

	function getDirectMessageIdentifier() {
		const otherUserArray = info.users.filter((user) => {
			return user.uuid !== $stLoggedUser?.uuid;
		});

		return otherUserArray[0] ? otherUserArray[0].id : null;
	}

	let dispatch = createEventDispatcher();
</script>

{#if $stUsers}
	<div
		class="channel"
		on:click|stopPropagation={goToMessages}
		class:current={current == info?.uuid}
	>
		<div class="profile-picture">
			<ChannelAvatar
				displayName={info?.name ? info.name : directMessageUsername}
				id={channelID}
				avatarLink={info.type === ChannelType.Direct
					? directMessageAvatar
					: info.avatar}
				direct={info.type === ChannelType.Direct}
			/>
		</div>
		<!--<div class="profile-picture" />-->
		<div class="data-line">
			<div class="username">
				{#if info?.type == ChannelType.Direct}
					{directMessageUsername}#{channelID}
				{:else}
					{info?.name}<span class="id">#{channelID}</span>
				{/if}
				{#if info?.last_message != null}
					· {time_str}
				{/if}
			</div>
			{#if info?.last_message != null}
				<div class="last-message">
					{#if info?.last_message.sender == $stLoggedUser?.uuid}
						You:
					{:else if last_message_sender != null}
						{last_message_sender.username}#{last_message_sender.identifier}:
					{:else}
						{"loading user:"}
					{/if}
					{truncated_msg}
				</div>
			{/if}
		</div>
		{#if !joined}
			<div class="join-button">
				<Button
					on:click={() =>
						dispatch("join", {
							channel: info,
						})}
					><div
						class="join-button-inner"
						class:password={info?.has_password}
					>
						Join
					</div></Button
				>
			</div>
		{/if}
	</div>
{/if}

<style lang="scss">
	.join-button-inner {
		flex-shrink: 0;
		flex-grow: 0;
		display: flex;
		gap: 10px;
		padding-left: 6px;
		padding-right: 6px;
		&.password {
			padding-left: 0;
			&::before {
				content: "";
				display: block;
				width: 20px;
				height: 20px;
				background-image: url("/img/lock.svg");
				background-size: cover;
			}
		}
	}
	.channel {
		user-select: none;
		-webkit-user-select: none;
		display: flex;
		gap: 18px;
		align-items: center;
		height: 80px;
		padding-bottom: 6px;
		padding-top: 6px;
		// margin-bottom: 6px;
		padding-left: 16px;

		&:hover {
			background: #141414;
			cursor: pointer;
		}
	}

	.join-button {
		margin-left: auto;
		margin-right: 16px;
		z-index: 1;
	}

	.profile-picture {
		flex-shrink: 0;
		width: 68px;
		height: 68px;
	}

	.data-line {
		display: flex;
		flex-direction: column;
		gap: 6px;
		overflow-wrap: break-word;
		max-width: 220px;
	}

	.last-message {
		color: #787771;
	}

	.id {
		color: #787771;
	}

	@media screen and (min-width: 801px) {
		.channel.current {
			background-color: #202327;
			border-right: 3px solid #0c82fa;
		}
	}
</style>
