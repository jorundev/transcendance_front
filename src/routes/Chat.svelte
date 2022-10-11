<script lang="ts">
	import { onDestroy, onMount } from "svelte";

	import ChatChannel from "../components/Kit/ChatChannel.svelte";
	import { stChannels, type Channel } from "../stores";

	import DesktopChatInside from "../components/DesktopChatInside.svelte";
	import { push } from "svelte-spa-router";
	import Modal from "../components/Kit/Modal.svelte";
	import JoinChannelPopup from "../components/JoinChannelPopup.svelte";
	import CreateChannelPopup from "../components/CreateChannelPopup.svelte";
	import ChannelSearch from "../components/ChannelSearch.svelte";

	let join_channel_modal = false;
	let create_channel_modal = false;

	let interval;
	let current_channel = "";

	let render = true;

	$: if (current_channel) {
		render = false;
		setTimeout(() => (render = true), 1);
	}

	let join_channel: Channel;

	let mounted = false;

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

	/*stChannels.subscribe((channels) => {
		console.log(
			channels["ef7c824d-4a78-4325-8447-79b708f286f6"].loaded_messages
				.length
		);
	});*/

	function goToMessages(event: { detail: { channel: Channel } }) {
		current_channel = event.detail.channel.uuid;
		if (window.innerWidth <= 800) {
			push("/chat/group/" + current_channel);
		}
	}

	function joinChannel(event: { detail: { channel: Channel } }) {
		join_channel = event.detail.channel;
		join_channel_modal = true;
	}

	function createChannel() {
		create_channel_modal = true;
	}
</script>

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
						current_channel = join_channel.uuid;
						join_channel_modal = false;
						if (window.innerWidth <= 800) {
							push("/chat/group/" + current_channel);
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
						current_channel = data.detail.uuid;
						if (window.innerWidth <= 800) {
							push("/chat/group/" + current_channel);
						}
					}}
				/>
			</div>
		</Modal>
	{/if}
	<div class="chat-menu">
		<div class="top">
			<div class="search">
				<ChannelSearch on:join={joinChannel} />
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

		@media screen and (min-width: 1600px) {
			border-left: 1px solid rgb(37, 37, 37);
		}
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
		margin: 10px;
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