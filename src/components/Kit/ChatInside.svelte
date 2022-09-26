<script lang="ts">
	import {
		stChannels,
		stLoggedUser,
		type Channel,
		type ChannelDictionary,
	} from "../../stores";

	import { onMount } from "svelte";
	import BubbleSet from "./BubbleSet.svelte";
	import { api, APIStatus, loadNextPage } from "../../api";
	import Modal from "./Modal.svelte";
	import ChannelSettings from "../ChannelSettings.svelte";

	let textArea: HTMLInputElement;
	let chatDiv: HTMLDivElement;

	export let params: { uuid: string };

	async function loadPages(n: number) {
		/*while (n >= 0 && info?.last_loaded_page != 1) {
			n -= 1;*/
		await loadNextPage(params.uuid, n);
		//}
	}

	$: if (params.uuid) {
		loadPages(5);
	}

	let show_channel_settings_modal = false;

	let joined: boolean;

	$: joined = $stChannels[params.uuid]?.joined;
	$: if (params.uuid) {
		info = l_channels[params.uuid];
		onInfoChange();
	}

	let old_length = 0;
	let info: Channel = null;

	const text_area_height = "80px";

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

	interface ChatMessage {
		sender: string;
		value: string;
		date: string;
		username: string;
		confirmed: boolean;
	}

	interface MessageSet {
		side: "left" | "right";
		id: number;
		messages: Array<{
			value: string;
			date: string;
			username: string;
			confirmed: boolean;
			sender: string;
		}>;
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

	async function onInfoChange() {
		if (info == undefined) {
			return;
		}
		if (info.loaded_messages.length != old_length) {
			old_length = info.loaded_messages.length;
			messages = [];
			for (const message of info.loaded_messages) {
				let user = await api.getUserData(message.sender);
				if (user == APIStatus.NoResponse) {
					continue;
				}
				let identifier = "000" + user.identifier;
				messages.push({
					sender: message.sender,
					value: message.value,
					date: format_date(message.date),
					username:
						user.username +
						"#" +
						identifier.substring(identifier.length - 4),
					confirmed: true,
				});
			}
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
				});
			} else {
				groups.push({
					side:
						message.sender == $stLoggedUser.uuid ? "right" : "left",
					messages: [
						{
							value: message.value,
							date: message.date,
							username: message.username,
							confirmed: message.confirmed,
							sender: message.sender,
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
			sender: $stLoggedUser.uuid,
			value,
			date: "Sending...",
			confirmed: false,
			username: "You",
		});

		api.sendMessage(info.uuid, value);

		updateMessages();
	}

	onMount(async () => {
		updateMessages();
	});
</script>

<div class="chat">
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
	{/if}
	<div class="top">
		<div
			class="profile-picture"
			style="background-image: url('/img/default.jpg')"
		/>
		<div class="name">{$stChannels[params.uuid]?.name}</div>
		{#if joined}
			<div
				class="settings-button"
				on:click={() => {
					show_channel_settings_modal = true;
				}}
			/>
		{/if}
	</div>

	<div class="bubbles" bind:this={chatDiv} on:scroll={onScroll}>
		<div class="pad" />
		{#each [...groups].reverse() as set (set.id)}
			<BubbleSet side={set.side} messages={set.messages} />
		{/each}
	</div>
	<div class="response-bar" style="height: {text_area_height}">
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
		<div class="send" class:disabled={!joined} on:click={sendMessage} />
	</div>
</div>

<style lang="scss">
	.bubbles {
		position: relative;
		padding-top: 10px;
		overflow: auto;
		height: calc(100% - var(--scrollbar-height) - 162px);
		width: 100%;
		transform: translateX(-16px);
		padding-left: 16px;
		padding-right: 16px;
		display: flex;
		flex-direction: column-reverse;

		&::-webkit-scrollbar {
			background-color: black;
		}

		::-webkit-scrollbar-track {
			border-radius: 10px;
			width: 1px;
		}

		&::-webkit-scrollbar-thumb {
			background-color: rgb(59, 59, 59);
			border-radius: 10px;
		}
	}

	.response-bar {
		border-top: 1px solid #232323;
		gap: 8px;
		padding: 16px;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		bottom: 0;
		left: 0;
		background-color: black;
		width: 100%;
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
		justify-content: center;
		gap: 14px;
		align-items: center;
		display: flex;
		height: 60px;
		border-bottom: 1px solid #232323;
		background: black;
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
		border-radius: 100%;
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		width: 40px;
		height: 40px;
	}

	.chat {
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
