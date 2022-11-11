<script lang="ts">
	import ChatInside from "./ChatInside.svelte";

	export let channel: string;
	export let render: boolean;
</script>

<div class="chat-inside">
	{#if channel.length != 0}
		<ChatInside desktop {render} params={{ uuid: channel }} on:direct />
	{:else}
		<div class="select">Select a channel to begin chatting</div>
	{/if}
</div>

<style lang="scss">
	.chat-inside {
		width: auto;
		flex-basis: 100%;
		border-left: 1px solid rgb(37, 37, 37);
		border-right: 1px solid rgb(37, 37, 37);
	}

	.select {
		user-select: none;
		-webkit-user-select: none;
		height: 100%;
		display: grid;
		justify-content: center;
		align-items: center;
	}

	@media screen and (max-width: 800px) {
		.chat-inside {
			display: none;
		}
	}
</style>
