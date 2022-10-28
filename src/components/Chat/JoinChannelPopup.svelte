<script lang="ts">
	import { api, APIStatus } from "../../api";
	import { createEventDispatcher, onMount } from "svelte";
	import Button from "../Kit/Button.svelte";
	import Card from "../Kit/Card.svelte";
	import type { Channel } from "../../channels";
	import ClickOutside from "svelte-click-outside";
	import { stChannels } from "../../stores";
	
	export let channel: Channel;

	let dispatch = createEventDispatcher();
	let password: string;

	let error = "";
	
	let canClickOutside = false;
	
	onMount(() => {
		setTimeout(() => canClickOutside = true, 200);
	});

	async function joinChannel(): Promise<boolean> {
		const resp = await api.joinChannel(
			channel.uuid,
			channel.has_password ? password : undefined
		);
		if (resp == APIStatus.NoResponse) {
			return false;
		}
		if (resp?.statusCode == 400 || resp?.statusCode == 404) {
			error = resp.message;
			return false;
		}
		for (let i = 0; i < 10; ++i) {
			await new Promise((resolve) => setTimeout(resolve, 150));
			if ($stChannels[channel.uuid] !== undefined && $stChannels[channel.uuid].joined) {
				break ;
			}
		}
		return true;
	}
</script>

<div class="jcp">
	<ClickOutside on:clickoutside={() => {
		if (canClickOutside) dispatch("back");
	}}>
	<Card>
		<div class="join">
			{#if channel}
				<p class="title">
					Join channel {channel.name}<b class="id">#{channel.id}</b>
					?
				</p>
				<p class="body">
					You will be able to leave the channel at any time
				</p>
				{#if channel.has_password}
					<div class="input">
						<input
							placeholder="Channel password"
							type="password"
							bind:value={password}
						/>
					</div>
				{/if}
				{#if error.length != 0}
					<div class="error">{error}</div>
				{/if}
				<div class="buttons">
					<Button
						highlight={false}
						text="Back"
						on:click={() => {
							dispatch("back");
						}}
					/>
					<Button
						text="Join"
						on:click={async () => {
							if (await joinChannel()) {
								dispatch("join");
							}
						}}
						timeoutVisible
						timeout={2000}
					/>
				</div>
			{/if}
		</div>
	</Card>
	</ClickOutside>
</div>

<style lang="scss">
	.join {
		min-width: 200px;
		padding: 4px;
		padding-left: 18px;
		padding-right: 18px;
		border-radius: 30px;

		.title {
			text-align: center;
			font-size: 18px;
			margin: 20px;
		}

		.body {
			padding-bottom: 18px;
		}

		b {
			font-weight: bold;
			&.id {
				color: rgb(185, 187, 190);
			}
		}

		.buttons {
			display: flex;
			gap: 12px;
			margin-bottom: 18px;
		}
	}

	input {
		font-size: 14px;
		width: calc(100% - 40px);
		height: 40px;
		line-height: 40px;
		background: #313131;
		border: none;
		margin-bottom: 16px;
		color: #d8d7d2;
		resize: none;
		border-radius: 20px;

		padding-right: 20px;
		padding-left: 20px;

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

	.error {
		color: red;
		padding-bottom: 16px;
	}

	@media screen and (max-width: 800px) {
		.jcp {
			margin: 10px;
		}
		.join {
			min-width: none;
			padding: 0;
			margin-left: 10px;
			margin-right: 10px;

			.title {
				margin: 16px;
			}
		}
	}
</style>
