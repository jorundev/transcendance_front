<script lang="ts">
	import { onDestroy, onMount } from "svelte";

	import ChatChannel from "../components/Chat/ChatChannel.svelte";
	import { stChannels } from "../stores";

	import DesktopChatInside from "../components/Chat/DesktopChatInside.svelte";
	import { push, replace } from "svelte-spa-router";
	import Modal from "../components/Kit/Modal.svelte";
	import JoinChannelPopup from "../components/Chat/JoinChannelPopup.svelte";
	import CreateChannelPopup from "../components/Chat/CreateChannelPopup.svelte";
	import ChannelSearch from "../components/Chat/ChannelSearch.svelte";
	import SideBar from "../components/SideBar.svelte";
	import { ChannelType, type Channel } from "../channels";
	import type { PrivateChannelData } from "../api";

	let join_channel_modal = false;
	let create_channel_modal = false;

	let interval;
	
	let render = true;
	
	let innerWidth = 0;
	let oldInnerWidth = 0;
	
	$: if (current_channel) {
		render = false;
		setTimeout(() => (render = true), 1);
	}

	let join_channel: Channel;
	
	let mounted = false;
	
	export let params: { uuid?: string };
	let current_channel = params?.uuid ? params.uuid : "";
	
	$: {
		current_channel = params?.uuid ? params.uuid : "";
		window.history.replaceState({}, null, "/#/chat/" + current_channel);
	}
	
	$: {
		if (innerWidth <= 800 && oldInnerWidth > 800 && current_channel.length !== 0) {
			replace("/chat/group/" + current_channel);
		}	
		oldInnerWidth = innerWidth;
	}

	function reRenderChannels() {
		for (const channel in $stChannels) {
			$stChannels[channel].last_message.value =
				$stChannels[channel].last_message.value;
		}
	}

	onMount(async () => {
		interval = setInterval(() => {
			reRenderChannels();
		}, 15000);

		mounted = true;
		reRenderChannels();
	});

	onDestroy(() => {
		clearInterval(interval);
	});

	function goToMessages(event: { detail: { channel: Channel } }) {
		params = { uuid: event.detail.channel.uuid }
		if (window.innerWidth <= 800) {
			push("/chat/group/" + params.uuid);
		}
	}

	function joinChannel(event: { detail: { channel: Channel } }) {
		join_channel = event.detail.channel;
		join_channel_modal = true;
	}

	async function joinPrivChannel(event: {
		detail: { channel: PrivateChannelData };
	}) {
		const tmpChannel: Channel = {
			type: ChannelType.Private,
			uuid: event.detail.channel.uuid,
			id: event.detail.channel.identifier,
			name: event.detail.channel.name,
			joined: false,
			has_password: true,
			users: [],
			administrator: "",
			moderators: [],
			loaded_messages: [],
			last_loaded_page: -1,
			last_message: null,
		};
		join_channel = tmpChannel;
		join_channel_modal = true;
	}

	function createChannel() {
		create_channel_modal = true;
	}
</script>

<svelte:window bind:innerWidth />
<svelte:head>
	<title>Chat - NEW SHINJI MEGA PONG ULTIMATE</title>
</svelte:head>
<SideBar active="chat"/>
<div class="chat">
	{#if join_channel_modal}
		<Modal>
			<div class="popup">
				<JoinChannelPopup
					channel={join_channel}
					on:back={() => {
						join_channel_modal = false;
					}}
					on:join={() => {
						params = {uuid: join_channel.uuid };
						join_channel_modal = false;
						if (window.innerWidth <= 800) {
							push("/chat/group/" + params.uuid);
						}
					}}
				/>
			</div>
		</Modal>
	{/if}
	{#if create_channel_modal}
		<Modal>
			<div class="popup">
				<CreateChannelPopup
					on:back={() => {
						create_channel_modal = false;
					}}
					on:create={(data) => {
						create_channel_modal = false;
						params = {uuid: data.detail.uuid};
						if (window.innerWidth <= 800) {
							push("/chat/group/" + params.uuid);
						}
					}}
				/>
			</div>
		</Modal>
	{/if}
	<div class="chat-menu">
		<div class="top">
			<div class="search">
				<ChannelSearch
					on:join={joinChannel}
					on:joinpriv={joinPrivChannel}
				/>
			</div>
			<div class="add" on:click={createChannel} />
		</div>
		<div class="channels">
			{#each Object.entries($stChannels) as [key, channel] (key)}
				{#if channel.joined}
					<ChatChannel
						info={channel}
						on:click={goToMessages}
						on:join={joinChannel}
						current={current_channel}
						joined={!mounted || $stChannels[channel.uuid]?.joined}
					/>
				{/if}
			{/each}
		</div>
	</div>
	<DesktopChatInside channel={current_channel} {render} />
</div>

<style lang="scss">
	.chat-menu {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}

	@media screen and (min-width: 801px) {
		.chat-menu {
			width: auto;
			min-width: 380px;
			max-width: 450px;
			flex-shrink: 0;
		}
	}

	.chat {
		display: flex;
		flex-direction: row;
		height: 100%;

		@media screen and (min-width: 800px) {
			margin-left: 52px;
		}
	}

	.popup {
		display: grid;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.top {
		margin-left: 16px;
		margin-right: 16px;
		display: flex;
		align-items: center;
	}

	.channels {
		height: auto;
		overflow-x: hidden;
		overflow-y: auto;
	}

	.add {
		flex-shrink: 0;
		background-image: url("/img/plus.png");
		background-repeat: no-repeat;
		background-position: center;
		background-size: 48%;
		width: 40px;
		height: 40px;
		margin-left: 10px;
		background-color: #1e1e1e;
		border-radius: 10px;
		cursor: pointer;

		&:hover {
			background-color: #262626;
		}
	}

	.search {
		width: 100%;
	}
</style>
