<script lang="ts">
	import { api } from "../api";
	import { createEventDispatcher } from "svelte";
	import {
		ChannelType,
		stChannels,
		stLoggedUser,
		type Channel,
	} from "../stores";
	import ChannelSettingsProfile from "./ChannelSettingsProfile.svelte";
	import Button from "./Kit/Button.svelte";
	import Card from "./Kit/Card.svelte";

	export let channel: Channel;

	let require_password = channel.has_password;
	let password: string = "";

	$: if (!require_password) password = "";

	let dispatch = createEventDispatcher();
	let is_moderator = false;
	let is_administrator = false;

	$: is_moderator = channel.moderators.includes($stLoggedUser?.uuid);
	$: is_administrator = channel.administrator === $stLoggedUser?.uuid;

	function changePassword() {
		api.setChannelPassword(
			channel.uuid,
			password.length != 0 ? password : undefined
		);
		$stChannels[channel.uuid].has_password = password.length != 0;
		password = "";
	}
</script>

<Card>
	<div class="settings">
		<div class="title">Settings for {channel.name}</div>
		<div class="category">
			<div class="category-name">Members</div>
			<div class="members">
				{#each channel.users as user}
					<ChannelSettingsProfile
						{user}
						{is_moderator}
						{is_administrator}
					/>
				{/each}
			</div>
		</div>
		<div class="category">
			<div class="category-name">General</div>
			<Button
				red
				on:click={async () => {
					await api.leaveChannel(channel.uuid);
					dispatch("back");
				}}
			>
				{#if channel.users.length == 1}
					Leave and destroy channel
				{:else}
					Leave channel
				{/if}
			</Button>
		</div>
		{#if is_administrator}
			<div class="category">
				<div class="category-name">Password</div>
				<div class="require-password">
					<input
						bind:checked={require_password}
						type="checkbox"
						disabled={channel.type === ChannelType.Private}
					/>
					<label for="checkbox">Require password</label>
				</div>
				<input
					bind:value={password}
					type="password"
					disabled={!require_password}
					placeholder="Channel password"
				/>
				{#if password?.length != 0 || (!require_password && channel.has_password)}
					<Button on:click={changePassword}>Change password</Button>
				{/if}
			</div>
			<div class="category">
				<div class="category-name">Administrator</div>
				<Button red>Destroy channel</Button>
			</div>
		{/if}
		<Button
			on:click={() => {
				dispatch("back");
			}}>Back</Button
		>
	</div>
</Card>

<style lang="scss">
	.settings {
		min-width: 250px;
		display: inline-block;
	}

	.title {
		font-size: 22px;
		margin-bottom: 16px;
	}

	.category {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-bottom: 16px;
	}

	.members {
		max-height: 500px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		overflow-y: auto;

		@media screen and (max-height: 800px) {
			max-height: 300px;
		}

		@media screen and (max-height: 600px) {
			max-height: 100px;
		}
	}

	input[type="text"],
	input[type="password"] {
		font-size: 14px;
		width: calc(100% - 40px);
		height: 40px;
		line-height: 40px;
		background: #313131;
		border: none;

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
			cursor: not-allowed;
			opacity: 0.3;
			background: rgb(104, 104, 104);
			&::placeholder {
				color: rgb(117, 117, 117);
			}
		}
	}

	.require-password {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	input[type="checkbox"] {
		display: grid;
		place-content: center;
		-webkit-appearance: none;
		appearance: none;
		margin: 0;
		background-color: rgb(48, 48, 48);

		width: 20px;
		height: 20px;

		&:checked {
			background: #0d6ac7;

			&:before {
				content: "";
				width: 14px;
				height: 14px;
				background: #0b82fa;
			}
		}

		&:disabled,
		&:disabled + label {
			opacity: 0.5;
		}
	}
</style>
