<script lang="ts">
	import { stChannels, stLoggedUser } from "../../stores";

	import { onDestroy, onMount, tick } from "svelte";
	import BubbleSet from "./BubbleSet.svelte";
	import { api, APIStatus, loadNextPage } from "../../api";
	import Modal from "../Kit/Modal.svelte";
	import ChannelSettings from "./ChannelSettings.svelte";
	import ChatSkeleton from "./ChatSkeleton.svelte";
	import MuteBanModal from "./MuteBanModal.svelte";
	import ChannelAvatar from "./ChannelAvatar.svelte";
	import type {
		Channel,
		ChannelDictionary,
		ChatMessage,
	} from "../../channels";
	import { padIdentifier } from "../../utils";
	import SideBar from "../SideBar.svelte";
	import { replace } from "svelte-spa-router";

	let textArea: HTMLInputElement;
	let chatDiv: HTMLDivElement;

	let selectedId = -1;

	let selectedUser: string;

	export let params: { uuid: string };
	export let render: boolean = true;
	export let desktop = false;
	
	let innerWidth = 0;
	let oldInnerWidth = 0;
	
	$: {
		if (!desktop && innerWidth >= 1600 && innerWidth !== oldInnerWidth) {
			replace("/chat/" + params.uuid);
		}
		oldInnerWidth = innerWidth;
	}

	let channelID = "";

	$: channelID = padIdentifier(info?.id);

	async function loadPages(n: number) {
		await loadNextPage(params.uuid, n);
	}

	$: if (params.uuid) {
		loadPages(5);
	}

	let show_channel_settings_modal = false;
	let show_muteban_modal = false;
	let muteban_mode: "ban" | "mute";

	let joined: boolean;

	$: {
		joined = $stChannels[params.uuid]?.joined;
		if (!joined) {
			replace("/chat");
		}	
	}
	$: if (params.uuid) {
		info = l_channels[params.uuid];
		onInfoChange();
	}

	let old_length = 0;
	let old_channel_uuid: string;
	let info: Channel = null;

	const text_area_height = "80px";

	let last_message_id: number = 0;
	let last_message_id_offset = 1000;

	$: if (info?.loaded_messages.length > 0) {
		last_message_id =
			info?.loaded_messages[info.loaded_messages.length - 1].id;
	}

	// this handles the loading of previous messages on scroll
	// this might look messy (and in a way it is) but it's actually pretty straightforward
	let last_load = new Date();
	function onScroll() {
		const now = new Date();

		// If we reached the top of the scroll, don't wait
		if (
			chatDiv?.scrollHeight + chatDiv?.scrollTop ==
			chatDiv?.clientHeight
		) {
			last_load = now;
			loadNextPage(info?.uuid)
				.then(() => {})
				.catch((err) => {
					console.log("Critical error: ", err);
				});
			return;
		}

		// else, wait 500ms between each page load
		if (
			Math.abs(now.getMilliseconds() - last_load.getMilliseconds()) < 500
		) {
			return;
		}

		// Number of pixels to the top of the scroll area before loading a new page
		const sensitivity = 400;
		if (
			chatDiv?.scrollHeight + chatDiv?.scrollTop <=
			chatDiv?.clientHeight + sensitivity
		) {
			last_load = now;
			loadNextPage(info?.uuid)
				.then(() => {})
				.catch((err) => {
					console.log("Critical error: ", err);
				});
		}
	}

	interface MessageSet {
		side: "left" | "right";
		id: number;
		messages: Array<ChatMessage>;
	}

	function format_date(date: number) {
		const dt_format = new Intl.DateTimeFormat("en-GB", {
			timeStyle: "short",
		});

		return dt_format.format(new Date(date));
	}

	let messages: Array<ChatMessage> = [];
	let groups: Array<MessageSet> = [];
	let l_channels: ChannelDictionary;

	let groupsRev: Array<MessageSet>;
	$: groupsRev = [...groups].reverse();

	async function onInfoChange() {
		if (info == undefined) {
			return;
		}
		if (
			info.loaded_messages.length != old_length ||
			info.uuid != old_channel_uuid ||
			info.reload
		) {
			info.reload = undefined;
			old_length = info.loaded_messages.length;
			old_channel_uuid = info.uuid;
			const messagesBuffer = [];
			for (const message of info.loaded_messages) {
				let user = await api.getUserData(message.sender);
				if (user == APIStatus.NoResponse) {
					continue;
				}
				let identifier = "000" + user.identifier;
				messagesBuffer.push({
					sender: message.sender,
					value: message.value,
					date: format_date(message.date),
					username:
						user.username +
						"#" +
						identifier.substring(identifier.length - 4),
					confirmed: true,
					id: message.id,
				});
			}
			messages = messagesBuffer;
			updateMessages();
		}
	}

	stChannels.subscribe(async (channels) => {
		l_channels = channels;
		info = l_channels[params.uuid];
		if (info == undefined) {
			return;
		}
		await onInfoChange();
	});

	function updateMessages() {
		groups = [];
		let i = 0;
		let previous: ChatMessage | null = null;
		for (const message of messages) {
			if (previous?.sender == message.sender) {
				groups[groups.length - 1].messages.push({
					value: message.value,
					date: message.date,
					username: message.username,
					confirmed: message.confirmed,
					sender: message.sender,
					id: message.id,
				});
			} else {
				groups.push({
					side:
						message.sender == $stLoggedUser?.uuid
							? "right"
							: "left",
					messages: [
						{
							value: message.value,
							date: message.date,
							username: message.username,
							confirmed: message.confirmed,
							sender: message.sender,
							id: message.id,
						},
					],
					id: i,
				});
				i += 1;
			}
			previous = message;
		}
	}

	function sendMessage() {
		const value = textArea.value.trim();
		textArea.value = "";
		if (value == "") {
			return;
		}

		messages.push({
			sender: $stLoggedUser?.uuid,
			value,
			date: "Sending...",
			confirmed: false,
			username: "You",
			id: last_message_id + last_message_id_offset,
		});

		last_message_id_offset += 1;

		api.sendMessage(info.uuid, value);

		updateMessages();
	}

	onMount(async () => {
		updateMessages();
	});

	onDestroy(() => {
		messages = [];
	});

	function selectProfile(ev: CustomEvent<any>) {
		selectedId = ev.detail.id;
	}
</script>

<svelte:head>
	{#if !desktop}
		<title>{info?.name}#{channelID} - NEW SHINJI MEGA PONG ULTIMATE</title>
	{/if}
</svelte:head>
<svelte:window bind:innerWidth />
{#if innerWidth > 800 && !desktop}
	<SideBar active="chat" />
{/if}
{#await tick()}
	Loading..
{:then}
	{#if joined}
		<div class="chat" class:mobile={!desktop}>
			{#if show_channel_settings_modal}
				<Modal>
					<div class="channel-settings">
						<ChannelSettings
							channel={info}
							on:back={() => {
								show_channel_settings_modal = false;
							}}
						/>
					</div>
				</Modal>
			{:else if show_muteban_modal}
				<MuteBanModal
					on:back={() => (show_muteban_modal = false)}
					userUUID={selectedUser}
					channel={info}
					mode={muteban_mode}
				/>
			{/if}
			<div class="top">
				{#if !desktop}
					<div class="back" on:click={() => replace("/chat")} />
				{/if}
				<div class="profile-picture">
					<ChannelAvatar
						displayName={$stChannels[params.uuid]?.name}
						id={channelID}
					/>
				</div>
				<div class="name">{$stChannels[params.uuid]?.name}</div>
				<div
					class="settings-button"
					on:click={() => {
						show_channel_settings_modal = true;
					}}
				/>
			</div>

			<div
				class="bubbles"
				bind:this={chatDiv}
				on:scroll={onScroll}
				class:mobile={!desktop}
			>
				<div class="pad" />
				{#if render}
					{#each groupsRev as set (set.id)}
						<BubbleSet
							on:ban={(ev) => {
								selectedUser = ev.detail.uuid;
								muteban_mode = "ban";
								show_muteban_modal = true;
							}}
							side={set.side}
							messages={set.messages}
							channel={params.uuid}
							on:select={(ev) => selectProfile(ev)}
							selected={selectedId}
						/>
					{/each}
				{:else}
					<ChatSkeleton />
				{/if}
			</div>
			<div
				class="response-bar"
				style="height: {text_area_height}"
				class:mobile={!desktop}
			>
				<input
					placeholder="Start a message"
					class="input"
					tabindex="0"
					bind:this={textArea}
					on:keypress={(e) => {
						if (e.key == "Enter") {
							sendMessage();
						}
					}}
					disabled={!joined}
				/>
				<div
					class="send"
					class:disabled={!joined}
					on:click={sendMessage}
				/>
			</div>
		</div>
	{:else}
		<div class="not-joined">Join the channel to see its content</div>
	{/if}
{/await}

<style lang="scss">
	.back {
		position: absolute;
		left: 20px;
		cursor: pointer;
		background-image: url("/img/left.png");
		background-size: 20px;
		background-repeat: no-repeat;
		background-position: center;
		width: 40px;
		height: 40px;

		@media screen and (min-width: 800px) {
			left: 60px;
		}
	}
	.bubbles {
		//padding-top: 10px;
		overflow: auto;
		//height: calc(100% - var(--scrollbar-height) - 162px);
		height: 100vh;
		width: 100%;
		transform: translateX(-16px);
		padding-left: 16px;
		padding-right: 16px;
		display: flex;
		margin-bottom: 82px;
		padding-top: 82px;
		flex-direction: column-reverse;

		&::-webkit-scrollbar {
			display: none;
		}
	}

	.not-joined {
		display: grid;
		place-items: center;
		height: 100%;
	}

	.response-bar {
		position: absolute;
		border-top: 1px solid #232323;
		gap: 8px;
		padding: 16px;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		bottom: 0;
		left: 0;
		background-color: black;
		width: calc(100% + 1px);
		@media screen and (min-width: 800px) {
			&.mobile {
				padding-left: 68px;
			}
		}
	}

	.input {
		font-size: 14px;
		width: 100%;
		height: 40px;
		line-height: 40px;
		padding: 4px;
		padding-left: 14px;
		padding-right: 14px;
		background: #1b1b1b;
		border: none;
		color: #d8d7d2;
		resize: none;
		border-radius: 20px;

		&::placeholder {
			color: rgb(91, 91, 91);
		}

		&:focus {
			background: #282828;
			outline: none;
		}

		&:disabled {
			background: rgb(56, 56, 56);
			&::placeholder {
				color: rgb(117, 117, 117);
			}
		}
	}

	.pad {
		width: 100%;
		padding-bottom: 10px;
	}

	.send {
		cursor: pointer;
		background-color: #48a0db;
		height: 30px;
		padding: 4px;
		width: 40px;
		border-radius: 14px;
		background-position: center;
		background-repeat: no-repeat;
		background-size: 20px;
		background-image: url("/img/send.png");

		&.disabled {
			background-color: rgb(71, 71, 71);
			opacity: 0.5;
		}
	}

	.top {
		position: absolute;
		width: 100%;
		z-index: 2;
		justify-content: center;
		gap: 14px;
		align-items: center;
		display: flex;
		height: 60px;
		border-bottom: 1px solid #232323;
		backdrop-filter: blur(4px);
		background: rgba(0, 0, 0, 0.679);
		padding-bottom: 4px;
		padding-top: 4px;
	}

	.settings-button {
		width: 20px;
		height: 20px;
		background-image: url("/img/settings.png");
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center;
		cursor: pointer;
	}

	.profile-picture {
		flex-shrink: 0;
		width: 40px;
		height: 40px;
	}

	.chat {
		position: relative;
		display: flex;
		flex-direction: column;
		padding-left: 16px;
		padding-right: 16px;
		height: 100%;
	}

	.channel-settings {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
	}
</style>
