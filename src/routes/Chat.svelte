<script lang="ts">
	import { onMount } from "svelte";

	import ChatChannel, {
		ChannelType,
		type Channel,
	} from "../components/Kit/ChatChannel.svelte";

	import MainNav from "../components/Kit/MainNav.svelte";

	onMount(() => {
		setInterval(() => {
			for (let i = 0; i < channels.length; ++i) {
				channels[i].last_message.value = channels[i].last_message.value;
			}
		}, 15000);
	});

	//TODO: store
	let channels: Array<Channel> = [
		{
			type: ChannelType.Single,
			id: "55c4d182-af87-4166-a0a6-7909072a48f7",
			last_message: {
				sender: null,
				value: "Mec salu tu peut repondre a mon message stp stp meeeec",
				date: new Date(),
			},
		},
		{
			type: ChannelType.Group,
			id: "58cdfb48-43b7-4551-ba65-9f49aeb80e04",
			last_message: {
				sender: "Sample",
				value: "Lorem ipsum dolor sit amet",
				date: new Date(),
			},
		},
	];
</script>

<div class="chat-menu">
	{#each channels as channel}
		<ChatChannel info={channel} />
	{/each}
</div>

<MainNav current="chat" />

<style lang="scss">
	.chat-menu {
		width: 100%;
		height: 100%;
	}
</style>
