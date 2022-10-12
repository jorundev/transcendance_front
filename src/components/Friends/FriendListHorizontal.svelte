<script lang="ts">
	import ChannelAvatar from "../Chat/ChannelAvatar.svelte";
</script>

<div class="friends cancelcard">
	{#each Array(10) as _, i}
		<div class="friend">
			<ChannelAvatar displayName={100 * i + ""} id={i + ""} />
		</div>
	{/each}
</div>

<style lang="scss">
	.cancelcard {
		display: flex;
		gap: 16px;
		align-items: center;
		transform: translateX(-20px);
		width: calc(100% + 40px);
		padding-left: 20px;
		padding-right: 20px;
		box-sizing: border-box;
		overflow-x: auto;
	}

	.friend {
		flex-shrink: 0;
		width: 60px;
		height: 60px;
	}
</style>
