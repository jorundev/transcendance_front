<script lang="ts">
	import { api } from "../../api";
	import { createEventDispatcher, onMount } from "svelte";
	import { stChannels, stLoggedUser } from "../../stores";
	import ChannelSettingsProfile from "./ChannelSettingsProfile.svelte";
	import Button from "../Kit/Button.svelte";
	import Card from "../Kit/Card.svelte";
	import { ChannelType, type Channel } from "../../channels";
	import { pop } from "svelte-spa-router";
	import ClickOutside from "svelte-click-outside";

	export let channel: Channel;

	let require_password = channel.has_password;
	let password: string = "";

	let blacklisted_users = [];

	$: blacklisted_users = [
		...new Set([...channel.banned_users, ...channel.muted_users]),
	];

	$: if (!require_password) password = "";

	let dispatch = createEventDispatcher();
	let is_moderator = false;
	let is_administrator = false;

	let canClickOutside = false;

	onMount(() => {
		setTimeout(() => (canClickOutside = true), 200);
	});

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

	function destroyChannel() {
		if (destroyChannelText === "Destroy channel") {
			destroyChannelText = "Are you sure ?";
			return;
		}
		api.deleteChannel(channel.uuid);
	}

	let destroyChannelText = "Destroy channel";
</script>

<ClickOutside
	on:clickoutside={() => {
		if (canClickOutside) dispatch("back");
	}}
>
	<div class="card">
		<Card>
			<div class="settings">
				<div class="title">Settings for {channel.name}</div>
				<div class="category">
					<div class="member-lists">
						<div class="members">
							<div class="category-name">Members</div>
							{#each channel.users as user}
								<ChannelSettingsProfile
									{user}
									channel={channel.uuid}
									is_in_channel={channel.users
										.map((u) => u.uuid)
										.includes(user.uuid)}
									{is_moderator}
									{is_administrator}
								/>
							{/each}
						</div>
						{#if is_moderator || is_administrator}
							<div class="members">
								<div class="category-name">Blacklist</div>
								{#if blacklisted_users?.length > 0}
									{#each channel.banned_users as blacklisted}
										<ChannelSettingsProfile
											user={blacklisted.user}
											blacklist
											channel={channel.uuid}
											is_in_channel={channel.users
												.map((u) => u.uuid)
												.includes(
													blacklisted.user.uuid
												)}
											{is_moderator}
											{is_administrator}
											banned={channel.banned_users
												.map((u) => u.user.uuid)
												.includes(
													blacklisted.user.uuid
												)}
											muted={channel.muted_users
												.map((u) => u.user.uuid)
												.includes(
													blacklisted.user.uuid
												)}
										/>
									{/each}
								{:else}
									<div class="no-blacklist">
										No users were banned or muted
									</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
				<div class="category">
					<div class="category-name">General</div>
					<Button
						red
						timeoutVisible
						timeout={2000}
						on:click={async () => {
							await api.leaveChannel(channel.uuid);
							if (channel.type === ChannelType.Private) {
								stChannels.update((channels) => {
									delete channels[channel.uuid];
									return channels;
								});
							}
							if (window.innerWidth <= 800) {
								pop();
								return;
							}
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
							<Button on:click={changePassword}
								>Change password</Button
							>
						{/if}
					</div>
					<div class="category">
						<div class="category-name">Administrator</div>
						<Button
							red
							timeoutVisible
							timeout={2000}
							on:click={destroyChannel}
							>{destroyChannelText}</Button
						>
					</div>
				{/if}
				<Button
					on:click={() => {
						dispatch("back");
					}}>Back</Button
				>
			</div>
		</Card>
	</div>
</ClickOutside>

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
		justify-content: left;
		gap: 10px;
		margin-bottom: 16px;
	}

	.no-blacklist {
		font-size: 14px;
		min-height: 60px;
		width: 100%;
		padding: 10px;
		padding-left: 20px;
		padding-right: 20px;
		display: grid;
		place-items: center;
		height: 100%;
		background: rgb(18, 18, 18);
		border-radius: 18px;
		box-sizing: border-box;
	}

	.members {
		width: auto;
		flex-shrink: 0;
		flex-grow: 1;
		max-height: 500px;
		display: flex;
		flex-direction: column;
		gap: 10px;

		@media screen and (max-height: 800px) {
			max-height: 300px;
		}

		@media screen and (max-height: 600px) {
			max-height: 100px;
		}
	}

	.card {
		margin: 20px;
	}

	.member-lists {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		justify-content: center;
	}

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
