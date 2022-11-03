<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import ChannelAvatar from "./ChannelAvatar.svelte";

	export let pub = false;
	export let password = false;
	export let direct = false;
	export let displayName: string;
	export let channelID: string;
	export let avatarLink: string;

	let dispatch = createEventDispatcher();
</script>

<div class="entry" on:click={() => dispatch("click")}>
	<div class="title">
		<div class="avatar">
			<ChannelAvatar
				{displayName}
				id={channelID}
				{avatarLink}
				fontSize="14px"
			/>
		</div>
		<div class="display">
			<div class="name">{displayName}</div>
			<div class="id">#{channelID}</div>
		</div>
	</div>
	{#if direct}
		<div class="badge blue">direct</div>
	{:else if pub}
		{#if password}
			<div class="badge red">password</div>
		{/if}
		<div class="badge green">public</div>
	{:else}
		<div class="badge red">private</div>
	{/if}
</div>

<style lang="scss">
	.entry {
		display: flex;
		gap: 10px;
		align-items: center;
		justify-content: space-between;
		height: 30px;
		padding: 10px;
		background-color: #131314;
		border-bottom: 1px solid rgb(50, 50, 50);

		&:hover {
			cursor: pointer;
			background-color: #1c1c1e;
		}
	}

	.title {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-right: 10px;
	}

	.avatar {
		width: 30px;
		height: 30px;
	}

	.badge {
		font-size: 12px;
		padding-left: 8px;
		padding-right: 8px;
		padding-top: 6px;
		padding-bottom: 6px;
		border-radius: 100px;

		&.green {
			color: rgb(0, 234, 0);
			background-color: rgba(12, 169, 12, 0.514);
			border: 1px solid rgb(0, 167, 0);
		}

		&.red {
			color: rgb(234, 0, 0);
			background-color: rgba(169, 12, 12, 0.514);
			border: 1px solid rgb(167, 0, 0);
		}

		&.blue {
			color: rgb(43, 117, 255);
			background-color: rgba(12, 46, 169, 0.514);
			border: 1px solid rgb(16, 61, 177);
		}
	}

	.display {
		display: flex;

		.id {
			color: rgb(123, 123, 123);
		}
	}
</style>
