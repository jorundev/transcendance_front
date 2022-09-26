<script lang="ts">
	import ChatInside from "./Kit/ChatInside.svelte";

	export let channel: string;
</script>

<div class="chat-inside">
	{#if channel.length != 0}
		<ChatInside params={{ uuid: channel }} />
	{:else}
		<div class="select">Select a channel to begin chatting</div>
	{/if}
</div>

<style lang="scss">
	.chat-inside {
		flex-basis: 100%;
		border-left: 1px solid rgb(37, 37, 37);
	}

	.select {
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

	@media screen and (min-width: 1600px) {
		.chat-inside {
			border-right: 1px solid rgb(37, 37, 37);
		}
	}
</style>
